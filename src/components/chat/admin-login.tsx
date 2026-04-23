"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChatStore, makePeerId } from "@/lib/chat-store"

interface AdminLoginProps {
  onConnect: (code: string) => void
  connecting: boolean
  error: string | null
}

export function AdminLogin({ onConnect, connecting, error }: AdminLoginProps) {
  const setScreen = useChatStore((s) => s.setScreen)
  const [code, setCode] = useState("jose2026")
  const [copied, setCopied] = useState(false)

  const handleSubmit = () => {
    if (code.trim().length < 4) return
    onConnect(code.trim())
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

        <h2 className="text-lg font-semibold text-white mb-1">Modo Administrador</h2>
        <p className="text-slate-500 text-xs mb-6">Los usuarios usarán este código para escribirte</p>

        <div className="space-y-3 mb-5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest">Código de admin</label>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-white/[0.05] border-white/[0.06] text-white font-mono placeholder:text-slate-600 focus-visible:border-sky-500/40 focus-visible:ring-sky-500/20"
              placeholder="ej: jose2026"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="shrink-0 text-slate-400 hover:text-white hover:bg-white/5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </Button>
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
          disabled={connecting || code.trim().length < 4}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-sky-500/20 border-0"
        >
          {connecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Conectando...
            </>
          ) : (
            "Iniciar como Admin"
          )}
        </Button>
      </motion.div>
    </div>
  )
}
