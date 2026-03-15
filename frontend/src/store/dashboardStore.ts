import { create } from 'zustand'
import type { DashboardData } from '@/types'

interface DashboardState {
  data: DashboardData | null
  loading: boolean
  setData: (data: DashboardData) => void
  setLoading: (loading: boolean) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  loading: false,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
}))
