"use client"

import { motion, AnimatePresence } from "framer-motion"

const EMOJIS = [
  "😀","😂","🥰","😎","🤔","👍","👎","❤️","🔥","🎉",
  "😢","😡","🤣","😍","🥳","💀","👀","🙏","💪","✨",
  "🚀","💯","⭐","☕","🍕","💻","📱","🎯","✅","❌",
]

interface EmojiPickerProps {
  open: boolean
  onSelect: (emoji: string) => void
}

export function EmojiPicker({ open, onSelect }: EmojiPickerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="mt-2 p-3 bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/[0.06]"
        >
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => onSelect(e)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 hover:scale-110 active:scale-95 transition-all"
              >
                {e}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
