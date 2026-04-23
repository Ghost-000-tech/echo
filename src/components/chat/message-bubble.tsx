"use client"

import { motion } from "framer-motion"
import type { ChatMessage } from "@/lib/chat-store"

interface MessageBubbleProps {
  msg: ChatMessage
}

export function MessageBubble({ msg }: MessageBubbleProps) {
  if (msg.sys) {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[11px] text-slate-500 bg-white/[0.02] px-3 py-1 rounded-full">
          {msg.text}
        </span>
      </div>
    )
  }

  const isSent = msg.from === "admin"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isSent ? "justify-end" : "justify-start"} mb-1`}
    >
      <div className="max-w-[70%]">
        <div
          className={`px-4 py-2.5 ${
            isSent
              ? "bg-gradient-to-br from-sky-600 to-cyan-500 text-white rounded-2xl rounded-br-sm shadow-lg shadow-sky-500/10"
              : "bg-white/[0.05] border border-white/[0.06] text-slate-200 rounded-2xl rounded-bl-sm"
          }`}
        >
          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
          <div className={`mt-1 ${isSent ? "text-right" : "text-left"}`}>
            <span
              className={`text-[10px] ${
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
