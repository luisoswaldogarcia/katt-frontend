import { getToken } from './auth'
import { getEmpresaId } from './api'
import { getSession } from './auth'

const WS_URL = 'wss://b76owlak02.execute-api.us-east-1.amazonaws.com/dev'
const API_URL = 'https://b76owlak02.execute-api.us-east-1.amazonaws.com/dev/api/v1/chat'

export interface ChatRoom {
  id: string
  name: string | null
  type: 'direct' | 'group'
  members: string[]
  lastMessage?: string
  lastMessageAt?: number
  lastSenderId?: string
  createdAt: number
}

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  content: string
  type: string
  createdAt: number
}

type WsHandler = (data: any) => void

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
const listeners = new Map<string, Set<WsHandler>>()

export function onWsEvent(action: string, handler: WsHandler) {
  if (!listeners.has(action)) listeners.set(action, new Set())
  listeners.get(action)!.add(handler)
  return () => { listeners.get(action)?.delete(handler) }
}

function dispatch(action: string, data: any) {
  listeners.get(action)?.forEach(fn => fn(data))
}

export async function connectWs() {
  if (ws?.readyState === WebSocket.OPEN) return
  const session = await getSession()
  if (!session) return
  const url = `${WS_URL}?empresaId=${getEmpresaId()}&userId=${session.userId}`
  ws = new WebSocket(url)
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.action) dispatch(data.action, data)
  }
  ws.onclose = () => {
    ws = null
    reconnectTimer = setTimeout(connectWs, 3000)
  }
  ws.onerror = () => ws?.close()
}

export function disconnectWs() {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  reconnectTimer = null
  ws?.close()
  ws = null
}

export function wsSend(payload: Record<string, unknown>) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ ...payload, empresaId: getEmpresaId() }))
  }
}

async function chatHeaders(): Promise<Record<string, string>> {
  const token = await getToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-empresa-id': getEmpresaId(),
  }
}

export async function fetchChats(): Promise<ChatRoom[]> {
  const res = await fetch(API_URL, { headers: await chatHeaders() })
  const { items } = await res.json()
  return items
}

export async function fetchMessages(chatId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_URL}/${chatId}/messages`, { headers: await chatHeaders() })
  const { items } = await res.json()
  return items
}

export async function createChat(data: { name?: string; type?: string; members: string[] }): Promise<ChatRoom> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: await chatHeaders(),
    body: JSON.stringify(data),
  })
  return res.json()
}
