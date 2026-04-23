"use client"

import { motion } from "framer-motion"
import { Shield, MessageCircle } from "lucide-react"
import { useChatStore } from "@/lib/chat-store"

export function RoleSelect() {
  const setScreen = useChatStore((s) => s.setScreen)

  return (
    <div className="flex items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full text-center relative z-10"
      >
        {/* Logo Section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative inline-block mb-8"
        >
          <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full" />
          <div className="relative w-20 h-20 rounded-[28px] bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 flex items-center justify-center shadow-2xl shadow-sky-500/40">
            <img 
              src="/logo.png" 
              alt="Echo Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
        </motion.div>

        <h1 className="text-5xl font-black text-white mb-3 tracking-tighter">
          Echo<span className="text-sky-500">.</span>
        </h1>
        <p className="text-slate-400 text-lg font-medium mb-12 tracking-tight">
          Mensajería privada <span className="text-white/80">punto a punto</span>
        </p>

        {/* Cards Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <motion.button
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen("admin-login")}
            className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl p-8 text-left transition-all hover:border-sky-500/30 hover:bg-sky-500/[0.05] shadow-xl hover:shadow-sky-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-6 h-6 text-sky-400" />
              </div>
              <div className="text-white font-bold text-lg leading-tight mb-1">Administrador</div>
              <div className="text-slate-500 text-sm font-medium">Recibir mensajes y gestionar chats</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen("user-login")}
            className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl p-8 text-left transition-all hover:border-violet-500/30 hover:bg-violet-500/[0.05] shadow-xl hover:shadow-violet-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                <MessageCircle className="w-6 h-6 text-violet-400" />
              </div>
              <div className="text-white font-bold text-lg leading-tight mb-1">Usuario</div>
              <div className="text-slate-500 text-sm font-medium">Conectar y escribir al administrador</div>
            </div>
          </motion.button>
        </div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md"
        >
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-emerald-400/90 text-xs font-bold uppercase tracking-widest">
            Conexión P2P Cifrada de Extremo a Extremo
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}
