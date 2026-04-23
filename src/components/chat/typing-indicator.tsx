"use client"

import { motion } from "framer-motion"

export function TypingIndicator() {
  return (
    <div className="px-4 pb-2">
      <div className="inline-flex gap-1.5 bg-white/[0.05] rounded-2xl px-4 py-2.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  )
}
