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
  const [code, setCode] = useState("GT2511")
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
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-sm w-full rounded-[24px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <button
          onClick={() => setScreen("role")}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-90 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Modo Administrador</h2>
        <p className="text-slate-500 text-sm mb-8 font-medium">Los usuarios usarán este código para escribirte de forma directa.</p>

        <div className="space-y-4 mb-8">
          <label className="text-[11px] text-slate-500 uppercase tracking-[0.15em] font-bold">Código de Identificación</label>
          <div className="flex gap-2.5">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="h-12 bg-white/[0.04] border-white/[0.08] text-white font-mono text-base placeholder:text-slate-600 focus-visible:border-sky-500/40 focus-visible:ring-sky-500/10 rounded-xl transition-all"
              placeholder="ej: GT2511"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-12 w-12 shrink-0 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl active:scale-90 transition-all"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 mb-6"
          >
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </motion.div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={connecting || code.trim().length < 4}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold shadow-xl shadow-sky-500/20 border-0 transition-all active:scale-[0.98] disabled:opacity-20"
        >
          {connecting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Conectando...</span>
            </div>
          ) : (
            "Iniciar Servidor Admin"
          )}
        </Button>
      </motion.div>
    </div>
  )
}
