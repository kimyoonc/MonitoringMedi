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

// 교환 신청 폼
export interface ExchangeItem {
  name: string
  quantity: number
  unit: string
}

export interface ExchangeRecord {
  id: string
  patientId: string
  exchangeDate: string
  reason: string
  reasonLabel: string
  medications: ExchangeItem[]
  handlingMethod: string
  pharmacistNote: string
  createdAt: string
}

export interface ExchangeCreateForm {
  visitId?: string
  patientId: string
  exchangeDate: string
  reason: 'contamination' | 'damage' | 'expiry'
  medications: Array<{
    medicationId?: string
    name: string
    quantity: number
    unit: string
  }>
  handlingMethod: string
  pharmacistNote?: string
}

// 알림
export interface Notification {
  id: string
  patientId: string
  type: string
  daysUntilVisit: number | null
  scheduledVisitDate: string | null
  message: string
  sentAt: string
  isRead: boolean
}

// 이상반응 신고
export interface AdverseReactionReport {
  id: string
  patientId: string
  symptom: string
  severity: 'mild' | 'moderate' | 'severe'
  note: string
  reportedAt: string
  status: string
  message: string
}

// 약물 상호작용
export interface InteractionWarningItem {
  drug1: string
  drug2: string
  severity: 'high' | 'moderate' | 'low'
  description: string
  action: string
}

export interface InteractionResult {
  hasInteractions: boolean
  interactions: InteractionWarningItem[]
}

// 대시보드 데이터
export interface DashboardPatient {
  patientId: string
  name: string
  scheduledTime?: string
  stepNumber: number
  planId?: string
  conditions?: string[]
  reportedDate?: string
  symptom?: string
  nextVisitDate?: string
  daysOverdue?: number
}

export interface DashboardData {
  date: string
  generatedAt?: string
  summary: {
    todayVisits: number
    pendingDispense: number
    adverseReactions: number
  }
  todayVisitPatients: DashboardPatient[]
  adverseReactionPatients: DashboardPatient[]
  pendingDispensePatients: DashboardPatient[]
}

// API 공통 응답
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}
