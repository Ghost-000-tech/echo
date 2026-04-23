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
    adminCode, users, activeUserId,
    setActiveUser, clearUnread, addMessage,
  } = useChatStore()

  const [input, setInput] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({})
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
  }, [activeUser?.msgs.length])

  // Listen for typing events from users
  useEffect(() => {
    // This is handled in the parent component via PeerJS data events
  }, [])

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

    // Auto-grow textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + "px"
    }

    // Typing indicator
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
      try { connections[activeUserId!].send({ type: "typing", val: false }) } catch {}
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji)
    if (textareaRef.current) textareaRef.current.focus()
  }

  // Public method to set typing from external peer events
  const setUserTyping = (peerId: string, val: boolean) => {
    setTypingUsers((prev) => ({ ...prev, [peerId]: val }))
  }

  // Expose setUserTyping for parent component
  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__adminSetTyping = setUserTyping
  }, [])

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`w-72 shrink-0 border-r border-white/[0.05] bg-[#0d1220] flex flex-col transition-all duration-300 ${
          mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-sm font-semibold">ChatADS</span>
            </div>
            <span className="text-[9px] bg-sky-500/15 text-sky-400 px-2 py-0.5 rounded-full font-semibold">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
            <span className="text-[10px] text-slate-500 shrink-0">Código:</span>
            <span className="text-[11px] text-sky-400 font-mono font-semibold truncate flex-1">
              {adminCode}
            </span>
            <button
              onClick={handleCopy}
              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="px-3 pt-3 pb-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Conversaciones</span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {userList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-xs text-slate-500">Esperando usuarios...</p>
              <p className="text-[10px] text-slate-700 mt-1">Comparte tu código</p>
            </div>
          ) : (
            userList.map((u) => (
              <motion.button
                key={u.peerId}
                whileHover={{ x: 2 }}
                onClick={() => handleSelectUser(u.peerId)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition-colors text-left ${
                  activeUserId === u.peerId
                    ? "bg-sky-500/10 border-r-2 border-sky-500"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: getColor(u.name) }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d1220] ${
                      u.online ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                    style={u.online ? { boxShadow: "0 0 0 0 rgba(34,197,94,0.4)", animation: "pulse 2s infinite" } : {}}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white truncate">{u.name}</span>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                      {u.msgs.length > 0 && !u.msgs[u.msgs.length - 1].sys
                        ? u.msgs[u.msgs.length - 1].time
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-slate-500 truncate pr-2">
                      {(() => {
                        const last = [...u.msgs].reverse().find((m) => !m.sys)
                        return last ? (last.from === "admin" ? "Tú: " : "") + last.text : ""
                      })()}
                    </span>
                    {u.unread > 0 && (
                      <span className="min-w-[18px] h-[18px] bg-sky-500 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                        {u.unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Admin Footer */}
        <div className="p-3 border-t border-white/[0.05] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-500/15 flex items-center justify-center text-xs font-bold text-sky-400">
            J
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white">José (Admin)</div>
            <div className="text-[10px] text-emerald-400">En línea</div>
          </div>
          <button
            onClick={onExit}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0b0f19]">
        {!activeUser ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">Selecciona una conversación</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-3">
              <button
                onClick={() => setMobileShowChat(false)}
                className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: getColor(activeUser.name) }}
              >
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{activeUser.name}</div>
                <div
                  className={`text-[11px] ${
                    typingUsers[activeUserId!]
                      ? "text-sky-400"
                      : activeUser.online
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {typingUsers[activeUserId!]
                    ? "escribiendo..."
                    : activeUser.online
                    ? "En línea"
                    : "Desconectado"}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-semibold">P2P</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={msgsRef} className="flex-1 overflow-y-auto p-4 space-y-0.5">
              <AnimatePresence>
                {activeUser.msgs.map((m) => (
                  <MessageBubble key={m.id} msg={m} />
                ))}
              </AnimatePresence>
              {typingUsers[activeUserId!] && <TypingIndicator />}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/[0.05] bg-[#0d1220]/30">
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setEmojiOpen(!emojiOpen)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
                >
                  <Smile className="w-[18px] h-[18px]" />
                </button>
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
                  className="flex-1 bg-white/[0.05] border-white/[0.06] text-white placeholder:text-slate-600 rounded-2xl resize-none max-h-32 focus-visible:border-sky-500/30 focus-visible:ring-sky-500/20 text-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white shadow-lg shadow-sky-500/20 shrink-0 border-0 disabled:opacity-30"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <EmojiPicker open={emojiOpen} onSelect={handleEmojiSelect} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
