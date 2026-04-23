"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Smile, Send, Shield, Wifi,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChatStore, getTime, type ChatMessage } from "@/lib/chat-store"
import type { DataConnection } from "peerjs"
import { TypingIndicator } from "./typing-indicator"
import { EmojiPicker } from "./emoji-picker"

interface UserChatProps {
  connection: DataConnection | null
  onExit: () => void
}

export function UserChat({ connection, onExit }: UserChatProps) {
  const { userName } = useChatStore()
  const [input, setInput] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [adminTyping, setAdminTyping] = useState(false)
  const [adminOnline, setAdminOnline] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const msgsRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Listen for incoming messages
  useEffect(() => {
    if (!connection) return

    const handleData = (data: Record<string, unknown>) => {
      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id as string,
            from: "admin" as const,
            text: data.text as string,
            time: data.time as string,
          },
        ])
        // Notification sound
        try {
          const ctx = new AudioContext()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = 880
          gain.gain.value = 0.05
          osc.start()
          osc.stop(ctx.currentTime + 0.1)
        } catch {}
      } else if (data.type === "typing") {
        setAdminTyping(data.val as boolean)
      }
    }

    const handleClose = () => {
      setAdminOnline(false)
      setMessages((prev) => [
        ...prev,
        { id: "s" + Date.now(), from: "system" as const, text: "El admin se desconectó", time: getTime(), sys: true },
      ])
    }

    connection.on("data", handleData)
    connection.on("close", handleClose)

    return () => {
      connection.off("data", handleData)
      connection.off("close", handleClose)
    }
  }, [connection])

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }
  }, [messages.length, adminTyping])

  const handleSend = useCallback(() => {
    if (!input.trim() || !connection?.open) return
    const time = getTime()
    const msgData = { type: "message", id: "m" + Date.now(), text: input.trim(), time }

    connection.send(msgData)
    setMessages((prev) => [...prev, { ...msgData, from: "user" as const }])
    setInput("")
    setEmojiOpen(false)

    if (isTyping) {
      setIsTyping(false)
      try { connection.send({ type: "typing", val: false }) } catch {}
    }
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }, [input, connection, isTyping])

  const handleInput = (val: string) => {
    setInput(val)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + "px"
    }
    if (!connection?.open) return
    if (val.trim() && !isTyping) {
      setIsTyping(true)
      try { connection.send({ type: "typing", val: true }) } catch {}
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      if (isTyping && connection?.open) {
        setIsTyping(false)
        try { connection.send({ type: "typing", val: false }) } catch {}
      }
    }, 2000)
    if (!val.trim() && isTyping) {
      setIsTyping(false)
      try { connection.send({ type: "typing", val: false }) } catch {}
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji)
    if (textareaRef.current) textareaRef.current.focus()
  }

  return (
    <div className="flex flex-col h-screen bg-[#0b0f19] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full" />

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.05] bg-[#0d1220]/60 backdrop-blur-xl flex items-center gap-4 shrink-0 z-10">
        <button
          onClick={onExit}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-bold text-white tracking-tight">Administrador</div>
          <div className={`text-[12px] font-medium transition-colors ${adminTyping ? "text-sky-400" : adminOnline ? "text-emerald-400" : "text-red-400"}`}>
            {adminTyping ? "escribiendo..." : adminOnline ? "Conectado" : "Desconectado"}
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">P2P Seguro</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={msgsRef} className="flex-1 overflow-y-auto p-6 scroll-smooth z-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center my-8"
        >
          <div className="text-center max-w-xs">
            <div className="w-14 h-14 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Shield className="w-6 h-6 text-violet-400" />
            </div>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Conectado como <span className="text-violet-400 font-bold">{userName}</span>
            </p>
            <p className="text-[11px] text-slate-600 mt-2">
              Esta es una conexión directa P2P. Tus mensajes están cifrados de extremo a extremo.
            </p>
          </div>
        </motion.div>

        <div className="space-y-1.5 max-w-4xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              if (m.sys) {
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center my-4"
                  >
                    <span className="text-[11px] font-bold text-slate-500 bg-white/[0.03] border border-white/[0.05] px-4 py-1.5 rounded-full uppercase tracking-widest">
                      {m.text}
                    </span>
                  </motion.div>
                )
              }

              const isSent = m.from === "user"
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: isSent ? 20 : -20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[70%] group relative`}>
                    <div
                      className={`px-5 py-3.5 shadow-2xl transition-all ${
                        isSent
                          ? "bg-gradient-to-br from-violet-600 to-purple-500 text-white rounded-[22px] rounded-tr-sm"
                          : "bg-white/[0.05] border border-white/[0.08] text-slate-200 rounded-[22px] rounded-tl-sm backdrop-blur-sm"
                      }`}
                    >
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words font-medium">{m.text}</p>
                      <div className={`mt-1.5 flex items-center gap-1.5 ${isSent ? "justify-end" : "justify-start"}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${isSent ? "text-white/40" : "text-slate-500"}`}>
                          {m.time}
                        </span>
                        {isSent && <Wifi className="w-2.5 h-2.5 text-white/20" />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {adminTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/[0.05] bg-[#0d1220]/80 backdrop-blur-2xl shrink-0 z-10">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <button
            onClick={() => setEmojiOpen(!emojiOpen)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
              emojiOpen ? "bg-violet-500/20 text-violet-400" : "text-slate-400 hover:text-white hover:bg-white/5"
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
              className="w-full bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 rounded-2xl px-5 py-3 resize-none max-h-32 focus-visible:border-violet-500/40 focus-visible:ring-violet-500/10 transition-all text-[14px] leading-relaxed"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || !adminOnline}
            className="w-11 h-11 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white shadow-xl shadow-violet-500/20 shrink-0 border-0 disabled:opacity-10 transition-all active:scale-90"
            size="icon"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <EmojiPicker open={emojiOpen} onSelect={handleEmojiSelect} />
      </div>
    </div>
  )
}
