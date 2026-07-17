import { signIn as ampSignIn, signOut as ampSignOut, getCurrentUser, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth'

export interface Session {
  email: string
  userId: string
  groups: string[]
  token: string
}

export async function signIn(email: string, password: string): Promise<Session> {
  const { isSignedIn, nextStep } = await ampSignIn({ username: email, password })
  if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
    throw new Error('NEW_PASSWORD_REQUIRED')
  }
  if (!isSignedIn) throw new Error('Login failed')
  return getSession() as Promise<Session>
}

export async function confirmNewPassword(newPassword: string): Promise<Session> {
  await confirmSignIn({ challengeResponse: newPassword })
  return getSession() as Promise<Session>
}

export async function signOut() {
  await ampSignOut()
}

export async function getSession(): Promise<Session | null> {
  try {
    const user = await getCurrentUser()
    const { tokens } = await fetchAuthSession()
    const idToken = tokens?.idToken
    if (!idToken) return null
    const claims = idToken.payload
    return {
      email: claims.email as string,
      userId: user.userId,
      groups: (claims['cognito:groups'] as string[]) || [],
      token: idToken.toString(),
    }
  } catch {
    return null
  }
}

export async function getToken(): Promise<string | null> {
  const session = await getSession()
  return session?.token || null
}

