"use client"

import { motion } from "framer-motion"
import { Shield, MessageCircle } from "lucide-react"
import { useChatStore } from "@/lib/chat-store"

export function RoleSelect() {
  const setScreen = useChatStore((s) => s.setScreen)

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-sky-500/25"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </motion.div>

        <h1 className="text-2xl font-bold text-white mb-1">ChatADS</h1>
        <p className="text-slate-400 text-sm mb-8">Sistema de mensajería P2P de José</p>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen("admin-login")}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-7 text-left transition-colors hover:border-sky-500/20 hover:bg-sky-500/[0.04]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/15 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-sky-400" />
              </div>
              <div className="text-white font-semibold text-sm">Administrador</div>
              <div className="text-slate-500 text-xs mt-1">Recibir mensajes</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen("user-login")}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-7 text-left transition-colors hover:border-violet-500/20 hover:bg-violet-500/[0.04]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 text-violet-400" />
              </div>
              <div className="text-white font-semibold text-sm">Usuario</div>
              <div className="text-slate-500 text-xs mt-1">Escribir al admin</div>
            </div>
          </motion.button>
        </div>

        {/* P2P Badge */}
        <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Conexión P2P cifrada</span>
        </div>
      </motion.div>
    </div>
  )
}
