"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle, Copy, Check, LogOut, Smile,
  Send, ArrowLeft, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChatStore, getColor } from "@/lib/chat-store"
import type { DataConnection } from "peerjs"
import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"
import { EmojiPicker } from "./emoji-picker"

interface AdminPanelProps {
  connections: Record<string, DataConnection>
  onExit: () => void
}

export function AdminPanel({ connections, onExit }: AdminPanelProps) {
  const {
    adminCode, users, activeUserId, typingUsers,
    setActiveUser, clearUnread, addMessage,
  } = useChatStore()

  const [input, setInput] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const [copied, setCopied] = useState(false)
  const msgsRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  const activeUser = activeUserId ? users[activeUserId] : null
  const userList = Object.values(users).sort((a, b) => b.unread - a.unread)

  // Auto-scroll
  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }
  }, [activeUser?.msgs.length, typingUsers[activeUserId || ""]])

  const handleSelectUser = (peerId: string) => {
    setActiveUser(peerId)
    clearUnread(peerId)
    setMobileShowChat(true)
    if (textareaRef.current) textareaRef.current.focus()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(adminCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = useCallback(() => {
    if (!input.trim() || !activeUserId || !connections[activeUserId]) return

    const conn = connections[activeUserId]
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const msgData = { type: "message", id: "m" + Date.now(), text: input.trim(), time }

    try { conn.send(msgData) } catch {}

    addMessage(activeUserId, { ...msgData, from: "admin" })
    setInput("")
    setEmojiOpen(false)

    if (isTyping) {
      setIsTyping(false)
      try { conn.send({ type: "typing", val: false }) } catch {}
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [input, activeUserId, connections, addMessage, isTyping])

  const handleInput = (val: string) => {
    setInput(val)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + "px"
    }

    if (!activeUserId || !connections[activeUserId]) return
    if (val.trim() && !isTyping) {
      setIsTyping(true)
      try { connections[activeUserId].send({ type: "typing", val: true }) } catch {}
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      if (isTyping && activeUserId && connections[activeUserId]) {
        setIsTyping(false)
        try { connections[activeUserId].send({ type: "typing", val: false }) } catch {}
      }
    }, 2000)

    if (!val.trim() && isTyping) {
      setIsTyping(false)
      try { connections[activeUserId].send({ type: "typing", val: false }) } catch {}
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji)
    if (textareaRef.current) textareaRef.current.focus()
  }

  return (
    <div className="flex h-screen bg-[#0b0f19] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />

      {/* Sidebar */}
      <div
        className={`w-80 shrink-0 border-r border-white/[0.05] bg-[#0d1220]/80 backdrop-blur-xl flex flex-col transition-all duration-300 relative z-10 ${
          mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-base font-bold tracking-tight">Echo</span>
            </div>
            <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-full font-bold border border-sky-500/20">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Código</span>
            <span className="text-xs text-sky-400 font-mono font-bold truncate flex-1">
              {adminCode}
            </span>
            <button
              onClick={handleCopy}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em]">Conversaciones</span>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-1">
          {userList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500 font-medium">Esperando usuarios...</p>
              <p className="text-[11px] text-slate-700 mt-1.5">Comparte tu código para empezar</p>
            </div>
          ) : (
            userList.map((u) => (
              <motion.button
                key={u.peerId}
                whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectUser(u.peerId)}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all text-left group ${
                  activeUserId === u.peerId
                    ? "bg-sky-500/10 border-l-4 border-sky-500"
                    : "bg-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shadow-inner"
                    style={{ background: `linear-gradient(135deg, ${getColor(u.name)}, ${getColor(u.name)}dd)` }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0d1220] ${
                      u.online ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                    style={u.online ? { boxShadow: "0 0 10px rgba(16,185,129,0.4)", animation: "pulse-ring 2s infinite" } : {}}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[14px] font-bold text-white truncate group-hover:text-sky-400 transition-colors">{u.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-2">
                      {u.msgs.length > 0 && !u.msgs[u.msgs.length - 1].sys
                        ? u.msgs[u.msgs.length - 1].time
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-400 truncate pr-3">
                      {(() => {
                        const last = [...u.msgs].reverse().find((m) => !m.sys)
                        return last ? (last.from === "admin" ? "Tú: " : "") + last.text : "Inicia la conversación..."
                      })()}
                    </span>
                    {u.unread > 0 && (
                      <span className="min-w-[20px] h-[20px] bg-sky-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-sky-500/30">
                        {u.unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/[0.05] bg-white/[0.01] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-sky-500/15 flex items-center justify-center text-sm font-bold text-sky-400 border border-sky-500/20">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-white">Administrador</div>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En línea
            </div>
          </div>
          <button
            onClick={onExit}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-90"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0b0f19]/50 relative z-10">
        {!activeUser ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-700">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6 shadow-2xl">
              <MessageCircle className="w-10 h-10 text-slate-700" />
            </div>
            <p className="text-slate-500 text-base font-medium">Selecciona una conversación</p>
            <p className="text-slate-600 text-sm mt-1">Tus chats aparecerán aquí</p>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-white/[0.05] bg-[#0d1220]/40 backdrop-blur-md flex items-center gap-4">
              <button
                onClick={() => setMobileShowChat(false)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white bg-white/5"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${getColor(activeUser.name)}, ${getColor(activeUser.name)}dd)` }}
              >
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-white tracking-tight">{activeUser.name}</div>
                <div
                  className={`text-[12px] font-medium transition-colors ${
                    typingUsers[activeUserId!]
                      ? "text-sky-400"
                      : activeUser.online
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  {typingUsers[activeUserId!]
                    ? "escribiendo..."
                    : activeUser.online
                    ? "En línea"
                    : "Desconectado"}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Conexión P2P</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={msgsRef} className="flex-1 overflow-y-auto p-6 space-y-1.5 scroll-smooth">
              <AnimatePresence initial={false}>
                {activeUser.msgs.map((m) => (
                  <MessageBubble key={m.id} msg={m} />
                ))}
              </AnimatePresence>
              {typingUsers[activeUserId!] && <TypingIndicator />}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/[0.05] bg-[#0d1220]/60 backdrop-blur-xl">
              <div className="max-w-4xl mx-auto flex items-end gap-3">
                <button
                  onClick={() => setEmojiOpen(!emojiOpen)}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                    emojiOpen ? "bg-sky-500/20 text-sky-400" : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Smile className="w-5 h-5" />
                </button>
                <div className="relative flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => handleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Escribe un mensaje..."
                    rows={1}
                    className="w-full bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 rounded-2xl px-5 py-3 resize-none max-h-32 focus-visible:border-sky-500/40 focus-visible:ring-sky-500/10 transition-all text-[14px] leading-relaxed"
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white shadow-xl shadow-sky-500/20 shrink-0 border-0 disabled:opacity-20 transition-all active:scale-90"
                  size="icon"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <EmojiPicker open={emojiOpen} onSelect={handleEmojiSelect} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
