"use client"

import { motion } from "framer-motion"
import type { ChatMessage } from "@/lib/chat-store"

interface MessageBubbleProps {
  msg: ChatMessage
}

export function MessageBubble({ msg }: MessageBubbleProps) {
  if (msg.sys) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center my-4"
      >
        <span className="text-[11px] font-bold text-slate-500 bg-white/[0.03] border border-white/[0.05] px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
          {msg.text}
        </span>
      </motion.div>
    )
  }

  const isSent = msg.from === "admin"

  return (
    <motion.div
      initial={{ opacity: 0, x: isSent ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isSent ? "justify-end" : "justify-start"} mb-1`}
    >
      <div className="max-w-[85%] sm:max-w-[70%] group">
        <div
          className={`px-5 py-3.5 shadow-2xl transition-all ${
            isSent
              ? "bg-gradient-to-br from-sky-600 to-cyan-500 text-white rounded-[22px] rounded-br-sm shadow-sky-500/10"
              : "bg-white/[0.05] border border-white/[0.08] text-slate-200 rounded-[22px] rounded-bl-sm backdrop-blur-sm"
          }`}
        >
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words font-medium">{msg.text}</p>
          <div className={`mt-1.5 ${isSent ? "text-right" : "text-left"}`}>
            <span
              className={`text-[10px] font-bold uppercase tracking-tighter ${
                isSent ? "text-white/40" : "text-slate-500"
              }`}
            >
              {msg.time}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
