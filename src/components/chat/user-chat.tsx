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
    <div className="flex flex-col h-screen bg-[#0b0f19]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-3 shrink-0">
        <button
          onClick={onExit}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-full bg-sky-500/15 flex items-center justify-center">
          <Shield className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">Administrador</div>
          <div className={`text-[11px] ${adminTyping ? "text-sky-400" : adminOnline ? "text-emerald-400" : "text-red-400"}`}>
            {adminTyping ? "escribiendo..." : adminOnline ? "Conectado" : "Desconectado"}
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-semibold">P2P</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={msgsRef} className="flex-1 overflow-y-auto p-4">
        {/* Welcome */}
        <div className="flex justify-center my-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/15 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-5 h-5 text-sky-400" />
            </div>
            <p className="text-xs text-slate-500">
              Conectado como <span className="text-slate-300 font-medium">{userName}</span>
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">Los mensajes son P2P y cifrados</p>
          </div>
        </div>

        <div className="space-y-0.5">
          <AnimatePresence>
            {messages.map((m) => {
              if (m.sys) {
                return (
                  <div key={m.id} className="flex justify-center my-3">
                    <span className="text-[11px] text-slate-500 bg-white/[0.02] px-3 py-1 rounded-full">
                      {m.text}
                    </span>
                  </div>
                )
              }

              const isSent = m.from === "user"
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isSent ? "justify-end" : "justify-start"} mb-1`}
                >
                  <div className="max-w-[70%]">
                    <div
                      className={`px-4 py-2.5 ${
                        isSent
                          ? "bg-gradient-to-br from-violet-600 to-purple-500 text-white rounded-2xl rounded-br-sm shadow-lg shadow-violet-500/10"
                          : "bg-white/[0.05] border border-white/[0.06] text-slate-200 rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">{m.text}</p>
                      <div className={`mt-1 ${isSent ? "text-right" : "text-left"}`}>
                        <span className={`text-[10px] ${isSent ? "text-white/40" : "text-slate-500"}`}>
                          {m.time}
                        </span>
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

      {/* Input */}
      <div className="p-3 border-t border-white/[0.05] bg-[#0d1220]/30 shrink-0">
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
            className="flex-1 bg-white/[0.05] border-white/[0.06] text-white placeholder:text-slate-600 rounded-2xl resize-none max-h-32 focus-visible:border-violet-500/30 focus-visible:ring-violet-500/20 text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || !adminOnline}
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white shadow-lg shadow-violet-500/20 shrink-0 border-0 disabled:opacity-30"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <EmojiPicker open={emojiOpen} onSelect={handleEmojiSelect} />
      </div>
    </div>
  )
}
