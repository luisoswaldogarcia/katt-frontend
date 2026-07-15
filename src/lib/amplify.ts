import { Amplify } from 'aws-amplify'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_c8xciL4eU',
      userPoolClientId: 'emb55652ka1dnci3o3112h0bl',
    }
  }
})
