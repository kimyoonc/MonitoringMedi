import { create } from 'zustand'
import type { Patient } from '@/types'

interface PatientState {
  patients: Patient[]
  selectedPatient: Patient | null
  loading: boolean
  setPatients: (patients: Patient[]) => void
  setSelectedPatient: (patient: Patient | null) => void
  setLoading: (loading: boolean) => void
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  selectedPatient: null,
  loading: false,
  setPatients: (patients) => set({ patients }),
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
  setLoading: (loading) => set({ loading }),
}))
