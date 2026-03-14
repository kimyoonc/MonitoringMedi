// 환자
export interface Patient {
  id: string
  name: string
  birthDate: string
  phone: string
  address: string
  conditions: string[]
  registeredAt: string
  status: 'active' | 'adverse_reaction' | 'inactive'
}

// 처방
export interface Medication {
  id: string
  name: string
  category: string
  dailyDose: number
  unit: string
  instructions: string
}

export interface Prescription {
  id: string
  patientId: string
  issuedDate: string
  totalDays: number
  medications: Medication[]
  status: string
}

// 복약 관리 계획
export interface PlanStep {
  stepNumber: number
  scheduledDate: string
  dispenseDays: number
  status: 'scheduled' | 'completed' | 'pending'
  visitId: string | null
  canDispense?: boolean
}

export interface Plan {
  id: string
  prescriptionId: string
  patientId: string
  patientName?: string
  prescriptionInfo?: string
  totalVisits: number
  dispensingUnit: number
  medications?: Array<{
    name: string
    category: string
    dailyDose: number
    unit: string
    instructions: string
  }>
  steps: PlanStep[]
  createdAt: string
}

// 복약 관리 계획 생성 폼
export interface MedicationInput {
  name: string
  category: string
  dailyDose: number
  unit: string
  instructions: string
}

export interface PlanCreateForm {
  patientId: string
  totalDays: number
  visitCount: number
  startDate: string
  medications: MedicationInput[]
}

// 방문 기록 생성 폼
export interface VisitCreateForm {
  planId: string
  patientId: string
  visitDate: string
  stepNumber: number
  adherence: 'good' | 'fair' | 'poor'
  adverseReaction: boolean
  adverseReactionNote: string | null
  storageCondition: 'good' | 'poor' | 'damaged'
  pharmacistNote: string
  dispensedMedications: Array<{
    medicationId: string
    name: string
    quantity: number
    unit: string
  }>
}

// 조제 요청/결과
export interface DispenseRequest {
  medications: Array<{
    medicationId: string
    name: string
    quantity: number
    unit: string
  }>
}

export interface DispenseResult {
  id: string
  planId: string
  patientId: string
  visitDate: string
  stepNumber: number
  dispensedAt: string
  dispensedMedications: Array<{
    medicationId: string
    name: string
    quantity: number
    unit: string
  }>
}

// 방문 기록
export interface Visit {
  id: string
  planId: string
  patientId: string
  visitDate: string
  stepNumber: number
  adherence: 'good' | 'fair' | 'poor'
  adverseReaction: boolean
  adverseReactionNote: string | null
  storageCondition: string
  pharmacistNote: string
  dispensedMedications: Array<{ medicationId: string; quantity: number; unit: string }>
  createdAt: string
}

// 교환 이력
export interface Exchange {
  id: string
  visitId: string
  patientId: string
  exchangeDate: string
  reason: string
  reasonLabel: string
  medications: Array<{ medicationId: string; name: string; quantity: number; unit: string }>
  handlingMethod: string
  pharmacistNote: string
  createdAt: string
}

// API 공통 응답
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}
