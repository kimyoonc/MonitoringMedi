import { create } from 'zustand'
import type { DashboardData } from '@/types'

const CACHE_KEY = 'dashboard_cache'

function loadCache(): DashboardData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveCache(data: DashboardData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // localStorage 용량 초과 등 무시
  }
}

interface DashboardState {
  data: DashboardData | null
  loading: boolean
  setData: (data: DashboardData) => void
  setLoading: (loading: boolean) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: loadCache(),   // 캐시가 있으면 즉시 표시
  loading: false,
  setData: (data) => {
    saveCache(data)
    set({ data })
  },
  setLoading: (loading) => set({ loading }),
}))
