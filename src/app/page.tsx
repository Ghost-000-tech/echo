"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useChatStore, makePeerId, getColor, getTime } from "@/lib/chat-store"
import Peer, { type DataConnection } from "peerjs"
import { RoleSelect } from "@/components/chat/role-select"
import { AdminLogin } from "@/components/chat/admin-login"
import { UserLogin } from "@/components/chat/user-login"
import { AdminPanel } from "@/components/chat/admin-panel"
import { UserChat } from "@/components/chat/user-chat"

export default function EchoPage() {
  const {
    screen, setScreen, adminCode, setAdminCode,
    userName, setUserName, users, addUser,
    updateUserOnline, addMessage, incrementUnread,
    addSystemMessage, reset,
  } = useChatStore()

  const [adminConnecting, setAdminConnecting] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [userConnecting, setUserConnecting] = useState(false)
  const [userError, setUserError] = useState<string | null>(null)

  const peerRef = useRef<Peer | null>(null)
  const adminConnectionsRef = useRef<Record<string, DataConnection>>({})
  const userConnectionRef = useRef<DataConnection | null>(null)
  const [adminConnections, setAdminConnections] = useState<Record<string, DataConnection>>({})
  const [userConnection, setUserConnection] = useState<DataConnection | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy()
        peerRef.current = null
      }
    }
  }, [])

  // ========== ADMIN LOGIC ==========

  const handleAdminConnect = useCallback((code: string) => {
    setAdminConnecting(true)
    setAdminError(null)
    setAdminCode(code)

    const peerId = makePeerId(code)
    const peer = new Peer(peerId, {
      debug: 0,
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
    })

    peerRef.current = peer

    peer.on("open", () => {
      setAdminConnecting(false)
      setScreen("admin-panel")
    })

    peer.on("connection", (conn: DataConnection) => {
      const cid = conn.peer

      conn.on("open", () => {
        conn.on("data", (rawData: unknown) => {
          const data = rawData as Record<string, unknown>

          if (data.type === "join") {
            const name = data.name as string
            addUser({
              peerId: cid,
              name,
              msgs: [],
              unread: 0,
              online: true,
              color: getColor(name),
            })
            adminConnectionsRef.current[cid] = conn
            setAdminConnections({ ...adminConnectionsRef.current })
            // Auto-select first user
            if (Object.keys(users).length === 0) {
              useChatStore.getState().setActiveUser(cid)
              useChatStore.getState().clearUnread(cid)
            }
          } else if (data.type === "message") {
            const store = useChatStore.getState()
            if (!store.users[cid]) return
            addMessage(cid, {
              id: data.id as string,
              from: "user",
              text: data.text as string,
              time: data.time as string,
            })
            // Only increment unread if not the active chat
            if (store.activeUserId !== cid) {
              incrementUnread(cid)
            }
          } else if (data.type === "typing") {
            useChatStore.getState().setTyping(cid, data.val as boolean)
          }
        })

        conn.on("close", () => {
          const store = useChatStore.getState()
          if (!store.users[cid]) return
          updateUserOnline(cid, false)
          addSystemMessage(cid, (store.users[cid]?.name || "Usuario") + " se desconectó")
        })
      })
    })

    peer.on("error", (err) => {
      setAdminConnecting(false)
      if (err.type === "unavailable-id") {
        setAdminError("Código en uso. Espera o usa otro.")
      } else {
        setAdminError("Error de conexión. Recarga la página.")
      }
    })
  }, [setAdminCode, setScreen, addUser, addMessage, incrementUnread, updateUserOnline, addSystemMessage, users])

  const handleAdminExit = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy()
      peerRef.current = null
    }
    adminConnectionsRef.current = {}
    setAdminConnections({})
    reset()
  }, [reset])

  // ========== USER LOGIC ==========

  const handleUserConnect = useCallback((code: string, name: string) => {
    setUserConnecting(true)
    setUserError(null)
    setUserName(name)

    const peer = new Peer(undefined, {
      debug: 0,
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
    })

    peerRef.current = peer

    peer.on("open", () => {
      const conn = peer.connect(makePeerId(code), { reliable: true })
      userConnectionRef.current = conn
      setUserConnection(conn)

      conn.on("open", () => {
        conn.send({ type: "join", name })
        setUserConnecting(false)
        setScreen("user-chat")
      })

      conn.on("error", () => {
        setUserConnecting(false)
        setUserError("No se pudo conectar con el admin.")
      })
    })

    peer.on("error", (err) => {
      setUserConnecting(false)
      if (err.type === "peer-unavailable") {
        setUserError("Admin no encontrado. Verifica el código.")
      } else {
        setUserError("Error de conexión. Recarga la página.")
      }
    })
  }, [setUserName, setScreen])

  const handleUserExit = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy()
      peerRef.current = null
    }
    userConnectionRef.current = null
    setUserConnection(null)
    reset()
  }, [reset])

  // ========== RENDER ==========

  return (
    <div className="h-screen overflow-hidden bg-[#0b0f19]">
      {screen === "role" && <RoleSelect />}
      {screen === "admin-login" && (
        <AdminLogin
          onConnect={handleAdminConnect}
          connecting={adminConnecting}
          error={adminError}
        />
      )}
      {screen === "user-login" && (
        <UserLogin
          onConnect={handleUserConnect}
          connecting={userConnecting}
          error={userError}
        />
      )}
      {screen === "admin-panel" && (
        <AdminPanel
          connections={adminConnections}
          onExit={handleAdminExit}
        />
      )}
      {screen === "user-chat" && (
        <UserChat
          connection={userConnection}
          onExit={handleUserExit}
        />
      )}
    </div>
  )
}
