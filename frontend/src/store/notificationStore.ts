import { create } from 'zustand'
import type { Notification } from '@/types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (notifications: Notification[]) => void
  markAsRead: (id: string) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
  }),
  markAsRead: (id) => set((state) => {
    const updated = state.notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    )
    return { notifications: updated, unreadCount: updated.filter(n => !n.isRead).length }
  }),
}))
