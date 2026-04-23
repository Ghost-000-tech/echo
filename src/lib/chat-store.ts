"use client"

import { create } from "zustand"

export interface ChatMessage {
  id: string
  from: "admin" | "user" | "system"
  text: string
  time: string
  sys?: boolean
}

export interface ConnectedUser {
  peerId: string
  name: string
  msgs: ChatMessage[]
  unread: number
  online: boolean
  color: string
}

export type AppScreen = "role" | "admin-login" | "user-login" | "admin-panel" | "user-chat"

interface ChatState {
  screen: AppScreen
  setScreen: (s: AppScreen) => void

  adminCode: string
  setAdminCode: (c: string) => void

  userName: string
  setUserName: (n: string) => void

  users: Record<string, ConnectedUser>
  activeUserId: string | null
  typingUsers: Record<string, boolean>
  setActiveUser: (id: string | null) => void
  addUser: (u: ConnectedUser) => void
  removeUser: (id: string) => void
  updateUserOnline: (id: string, online: boolean) => void
  addMessage: (userId: string, msg: ChatMessage) => void
  incrementUnread: (userId: string) => void
  clearUnread: (userId: string) => void
  addSystemMessage: (userId: string, text: string) => void
  setTyping: (userId: string, val: boolean) => void
  reset: () => void
}

const COLORS = [
  "#0ea5e9", "#a855f7", "#ec4899", "#10b981",
  "#f59e0b", "#ef4444", "#6366f1", "#14b8a6",
]

export function getColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

export function getTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function makePeerId(code: string) {
  return "ADS-" + code.toLowerCase().replace(/[^a-z0-9]/g, "")
}

export const useChatStore = create<ChatState>((set) => ({
  screen: "role",
  setScreen: (s) => set({ screen: s }),

  adminCode: "",
  setAdminCode: (c) => set({ adminCode: c }),

  userName: "",
  setUserName: (n) => set({ userName: n }),

  users: {},
  activeUserId: null,
  typingUsers: {},
  setActiveUser: (id) => set({ activeUserId: id }),
  addUser: (u) => set((s) => ({ users: { ...s.users, [u.peerId]: u } })),
  removeUser: (id) => set((s) => {
    const newUsers = { ...s.users }
    delete newUsers[id]
    return { users: newUsers, activeUserId: s.activeUserId === id ? null : s.activeUserId }
  }),
  updateUserOnline: (id, online) => set((s) => {
    const u = s.users[id]
    if (!u) return s
    return { users: { ...s.users, [id]: { ...u, online } } }
  }),
  addMessage: (userId, msg) => set((s) => {
    const u = s.users[userId]
    if (!u) return s
    return { users: { ...s.users, [userId]: { ...u, msgs: [...u.msgs, msg] } } }
  }),
  incrementUnread: (userId) => set((s) => {
    const u = s.users[userId]
    if (!u) return s
    return { users: { ...s.users, [userId]: { ...u, unread: u.unread + 1 } } }
  }),
  clearUnread: (userId) => set((s) => {
    const u = s.users[userId]
    if (!u) return s
    return { users: { ...s.users, [userId]: { ...u, unread: 0 } } }
  }),
  addSystemMessage: (userId, text) => set((s) => {
    const u = s.users[userId]
    if (!u) return s
    return {
      users: {
        ...s.users,
        [userId]: { ...u, msgs: [...u.msgs, { id: "s" + Date.now(), from: "system" as const, text, time: getTime(), sys: true }] },
      },
    }
  }),
  setTyping: (userId, val) => set((s) => ({ typingUsers: { ...s.typingUsers, [userId]: val } })),
  reset: () => set({ screen: "role", adminCode: "", userName: "", users: {}, activeUserId: null, typingUsers: {} }),
}))
