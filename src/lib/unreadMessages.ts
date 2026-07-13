const STORAGE_KEY = 'katt-unread-count'

export function getUnreadCount(): number {
  return Number(localStorage.getItem(STORAGE_KEY) || '3')
}

export function clearUnread(): void {
  localStorage.setItem(STORAGE_KEY, '0')
}
