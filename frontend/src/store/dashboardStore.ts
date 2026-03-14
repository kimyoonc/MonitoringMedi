import { create } from 'zustand'

interface DashboardSummary {
  todayVisits: number
  pendingDispense: number
  adverseReactions: number
}

interface DashboardState {
  summary: DashboardSummary | null
  lastUpdated: string | null
  setSummary: (summary: DashboardSummary) => void
  setLastUpdated: (date: string) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: null,
  lastUpdated: null,
  setSummary: (summary) => set({ summary }),
  setLastUpdated: (date) => set({ lastUpdated: date }),
}))
