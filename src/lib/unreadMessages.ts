import { getConfig, saveConfig, getCached } from './configApi'

export async function fetchUnreadCount(): Promise<number> {
  return getConfig<number>('unread-count', 0)
}

export function getUnreadCount(): number {
  return getCached<number>('unread-count', 0)
}

export async function clearUnread(): Promise<void> {
  await saveConfig('unread-count', 0)
}
