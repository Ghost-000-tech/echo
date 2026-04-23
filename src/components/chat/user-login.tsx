"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChatStore } from "@/lib/chat-store"

interface UserLoginProps {
  onConnect: (code: string, name: string) => void
  connecting: boolean
  error: string | null
}

export function UserLogin({ onConnect, connecting, error }: UserLoginProps) {
  const setScreen = useChatStore((s) => s.setScreen)
  const [code, setCode] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = () => {
    if (!code.trim() || name.trim().length < 2) return
    onConnect(code.trim(), name.trim())
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-7"
      >
        <button
          onClick={() => setScreen("role")}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-semibold text-white mb-1">Conectar con Admin</h2>
        <p className="text-slate-500 text-xs mb-6">Ingresa el código que te dio el administrador</p>

        <div className="space-y-4 mb-5">
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Código del admin</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-white/[0.05] border-white/[0.06] text-white font-mono placeholder:text-slate-600 focus-visible:border-violet-500/40 focus-visible:ring-violet-500/20"
              placeholder="ej: jose2026"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Tu nombre</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-white/[0.05] border-white/[0.06] text-white placeholder:text-slate-600 focus-visible:border-violet-500/40 focus-visible:ring-violet-500/20"
              placeholder="ej: María"
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 mb-4"
          >
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={connecting || !code.trim() || name.trim().length < 2}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white font-semibold shadow-lg shadow-violet-500/20 border-0"
        >
          {connecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Conectando...
            </>
          ) : (
            "Conectar"
          )}
        </Button>
      </motion.div>
    </div>
  )
}
