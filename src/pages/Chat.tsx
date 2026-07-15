import { useState, useEffect, useRef } from 'react'
import { getSession } from '../lib/auth'
import { connectWs, disconnectWs, onWsEvent, wsSend, fetchChats, fetchMessages, createChat } from '../lib/chat'
import type { ChatRoom, ChatMessage } from '../lib/chat'
import { doctorStore } from '../lib/demoStore'

const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-900 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

export default function Chat() {
  const [userId, setUserId] = useState('')
  const [chats, setChats] = useState<ChatRoom[]>([])
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [texto, setTexto] = useState('')
  const [typing, setTyping] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [showNuevo, setShowNuevo] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    getSession().then(s => { if (s) setUserId(s.userId) })
    connectWs()
    fetchChats().then(setChats).catch(() => {})
    return () => { disconnectWs() }
  }, [])

  useEffect(() => {
    const offMsg = onWsEvent('chat.message', (msg: ChatMessage) => {
      if (msg.chatId === activeChat?.id) {
        setMessages(prev => [...prev, msg])
      }
      setChats(prev => prev.map(c => c.id === msg.chatId ? { ...c, lastMessage: msg.content?.slice(0, 100), lastMessageAt: msg.createdAt, lastSenderId: msg.senderId } : c))
    })
    const offTyping = onWsEvent('typing', (data: any) => {
      if (data.chatId === activeChat?.id && data.userId !== userId) {
        setTyping(data.userId)
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => setTyping(null), 2000)
      }
    })
    return () => { offMsg(); offTyping() }
  }, [activeChat?.id, userId])

  useEffect(() => {
    if (!activeChat) return
    fetchMessages(activeChat.id).then(setMessages).catch(() => {})
    wsSend({ action: 'chat.read', chatId: activeChat.id, userId })
  }, [activeChat?.id, userId])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!texto.trim() || !activeChat) return
    wsSend({ action: 'chat.send', chatId: activeChat.id, userId, content: texto, type: 'text' })
    const local: ChatMessage = { id: crypto.randomUUID(), chatId: activeChat.id, senderId: userId, content: texto, type: 'text', createdAt: Date.now() }
    setMessages(prev => [...prev, local])
    setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, lastMessage: texto.slice(0, 100), lastMessageAt: local.createdAt, lastSenderId: userId } : c))
    setTexto('')
  }

  const handleTyping = () => {
    if (activeChat) wsSend({ action: 'typing', chatId: activeChat.id, userId })
  }

  const getNombre = (uid: string) => {
    const u = doctorStore.getAll().find(d => d.id === uid)
    return u?.nombre || uid.slice(0, 8)
  }

  const chatName = (c: ChatRoom) => {
    if (c.name) return c.name
    const other = c.members.find(m => m !== userId)
    return other ? getNombre(other) : 'Chat'
  }

  const filteredChats = chats.filter(c => chatName(c).toLowerCase().includes(busqueda.toLowerCase())).sort((a, b) => (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt))

  const formatHora = (ts: number) => {
    const d = new Date(ts)
    const hoy = new Date()
    if (d.toDateString() === hoy.toDateString()) return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="flex h-full">
      {/* Lista de chats */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 border-r border-katt-200 dark:border-katt-800`}>
        <div className="p-3 flex gap-2">
          <input placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className={inputClass} />
          <button onClick={() => setShowNuevo(true)} className="p-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white transition-colors" aria-label="Nuevo chat">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(c => (
            <button key={c.id} onClick={() => setActiveChat(c)} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeChat?.id === c.id ? 'bg-katt-100 dark:bg-katt-800' : 'hover:bg-katt-50 dark:hover:bg-katt-800/50'}`}>
              <div className="w-10 h-10 rounded-full bg-katt-200 dark:bg-katt-700 flex items-center justify-center text-sm font-medium">
                {chatName(c)[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium truncate">{chatName(c)}</span>
                  {c.lastMessageAt && <span className="text-xs text-gray-500">{formatHora(c.lastMessageAt)}</span>}
                </div>
                {c.lastMessage && <span className="text-xs text-gray-500 truncate block">{c.lastMessage}</span>}
              </div>
            </button>
          ))}
          {filteredChats.length === 0 && <p className="text-center text-sm text-gray-500 py-8">Sin conversaciones</p>}
        </div>
      </div>

      {/* Área de chat */}
      {activeChat ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-katt-200 dark:border-katt-800">
            <button onClick={() => setActiveChat(null)} className="md:hidden p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-katt-200 dark:bg-katt-700 flex items-center justify-center text-sm font-medium">
              {chatName(activeChat)[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{chatName(activeChat)}</p>
              {typing && <p className="text-xs text-katt-500">{getNombre(typing)} escribiendo...</p>}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${m.senderId === userId ? 'bg-katt-500 text-white rounded-br-sm' : 'bg-katt-100 dark:bg-katt-800 rounded-bl-sm'}`}>
                  {activeChat.type === 'group' && m.senderId !== userId && <p className="text-xs font-medium text-katt-600 dark:text-katt-300 mb-1">{getNombre(m.senderId)}</p>}
                  <p>{m.content}</p>
                  <p className={`text-xs mt-1 ${m.senderId === userId ? 'text-white/70' : 'text-gray-500'}`}>{formatHora(m.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          <footer className="p-4 border-t border-katt-200 dark:border-katt-800">
            <form onSubmit={handleSend} className="flex gap-2">
              <input type="text" value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={handleTyping} placeholder="Escribe un mensaje..." className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-katt-900 border border-katt-200 dark:border-katt-700 focus:outline-none focus:ring-2 focus:ring-katt-500 text-sm" />
              <button type="submit" className="px-4 py-2 rounded-full bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">Enviar</button>
            </form>
          </footer>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm">Selecciona una conversación</div>
      )}

      {/* Modal nuevo chat */}
      {showNuevo && <NuevoChatModal userId={userId} onClose={() => setShowNuevo(false)} onCreate={(chat) => { setChats(prev => [chat, ...prev]); setActiveChat(chat); setShowNuevo(false) }} />}
    </div>
  )
}

function NuevoChatModal({ userId, onClose, onCreate }: { userId: string; onClose: () => void; onCreate: (c: ChatRoom) => void }) {
  const [nombre, setNombre] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const usuarios = doctorStore.getAll().filter(u => u.id !== userId)

  const handleCrear = async () => {
    if (selected.length === 0) return
    const members = [userId, ...selected]
    const chat = await createChat({ name: selected.length > 1 ? nombre || undefined : undefined, type: selected.length > 1 ? 'group' : 'direct', members })
    onCreate(chat)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-katt-900 rounded-xl p-5 space-y-4 border border-katt-200 dark:border-katt-800">
        <h3 className="font-bold text-sm">Nueva conversación</h3>
        {selected.length > 1 && (
          <input placeholder="Nombre del grupo (opcional)" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500" />
        )}
        <div className="max-h-48 overflow-y-auto space-y-1">
          {usuarios.map(u => (
            <label key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-katt-50 dark:hover:bg-katt-800 cursor-pointer text-sm">
              <input type="checkbox" checked={selected.includes(u.id)} onChange={() => setSelected(prev => prev.includes(u.id) ? prev.filter(x => x !== u.id) : [...prev, u.id])} className="accent-katt-500" />
              {u.nombre}
            </label>
          ))}
          {usuarios.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No hay usuarios disponibles</p>}
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">Cancelar</button>
          <button onClick={handleCrear} disabled={selected.length === 0} className="px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">Crear</button>
        </div>
      </div>
    </div>
  )
}
