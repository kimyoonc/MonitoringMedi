import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

// fixtures 파일을 읽어오는 헬퍼
function loadFixture<T>(filename: string): T {
  const filePath = join(__dirname, '../src/fixtures', filename)
  return JSON.parse(readFileSync(filePath, 'utf-8')) as T
}

async function main() {
  console.log('시드 데이터 삽입 시작...')

  // 기존 데이터 삭제 (외래키 순서에 맞게 역순으로)
  await prisma.adverseReaction.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.exchange.deleteMany()
  await prisma.visit.deleteMany()
  await prisma.planStep.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.interaction.deleteMany()

  // 1. 환자 데이터 삽입
  interface PatientFixture {
    id: string
    name: string
    birthDate: string
    phone: string
    address: string
    conditions: string[]
    registeredAt: string
    status: string
  }
  const patients = loadFixture<PatientFixture[]>('patients.json')
  for (const patient of patients) {
    await prisma.patient.create({
      data: {
        id: patient.id,
        name: patient.name,
        birthDate: patient.birthDate,
        phone: patient.phone,
        address: patient.address,
        conditions: patient.conditions,
        registeredAt: patient.registeredAt,
        status: patient.status,
      },
    })
  }
  console.log(`환자 ${patients.length}명 삽입 완료`)

  // 2. 복약 관리 계획 + 단계 삽입
  interface PlanStepFixture {
    stepNumber: number
    scheduledDate: string
    dispenseDays: number
    status: string
    visitId: string | null
  }
  interface PlanFixture {
    id: string
    prescriptionId: string
    patientId: string
    totalVisits: number
    dispensingUnit: number
    medications: unknown[]
    steps: PlanStepFixture[]
    createdAt: string
  }
  const plans = loadFixture<PlanFixture[]>('plans.json')
  for (const plan of plans) {
    const { steps, ...planData } = plan
    await prisma.plan.create({
      data: {
        id: planData.id,
        prescriptionId: planData.prescriptionId,
        patientId: planData.patientId,
        totalVisits: planData.totalVisits,
        dispensingUnit: planData.dispensingUnit,
        medications: planData.medications,
        createdAt: planData.createdAt,
        steps: {
          create: steps.map((step) => ({
            stepNumber: step.stepNumber,
            scheduledDate: step.scheduledDate,
            dispenseDays: step.dispenseDays,
            status: step.status,
            visitId: step.visitId ?? null,
          })),
        },
      },
    })
  }
  console.log(`복약 계획 ${plans.length}개 삽입 완료`)

  // 3. 방문 기록 삽입
  interface VisitFixture {
    id: string
    planId: string
    patientId: string
    visitDate: string
    stepNumber: number
    adherence: string
    adverseReaction: boolean
    adverseReactionNote: string | null
    storageCondition: string
    pharmacistNote: string
    dispensedMedications: unknown[]
    dispensedAt?: string | null
    createdAt: string
  }
  const visits = loadFixture<VisitFixture[]>('visits.json')
  for (const visit of visits) {
    await prisma.visit.create({
      data: {
        id: visit.id,
        planId: visit.planId,
        patientId: visit.patientId,
        visitDate: visit.visitDate,
        stepNumber: visit.stepNumber,
        adherence: visit.adherence,
        adverseReaction: visit.adverseReaction,
        adverseReactionNote: visit.adverseReactionNote ?? null,
        storageCondition: visit.storageCondition,
        pharmacistNote: visit.pharmacistNote,
        dispensedMedications: visit.dispensedMedications,
        dispensedAt: visit.dispensedAt ?? null,
        createdAt: visit.createdAt,
      },
    })
  }
  console.log(`방문 기록 ${visits.length}건 삽입 완료`)

  // 4. 교환 이력 삽입
  interface ExchangeFixture {
    id: string
    visitId: string | null
    patientId: string
    exchangeDate: string
    reason: string
    reasonLabel: string
    medications: unknown[]
    handlingMethod: string
    pharmacistNote: string
    createdAt: string
  }
  const exchanges = loadFixture<ExchangeFixture[]>('exchanges.json')
  for (const exchange of exchanges) {
    await prisma.exchange.create({
      data: {
        id: exchange.id,
        visitId: exchange.visitId ?? null,
        patientId: exchange.patientId,
        exchangeDate: exchange.exchangeDate,
        reason: exchange.reason,
        reasonLabel: exchange.reasonLabel,
        medications: exchange.medications,
        handlingMethod: exchange.handlingMethod,
        pharmacistNote: exchange.pharmacistNote,
        createdAt: exchange.createdAt,
      },
    })
  }
  console.log(`교환 이력 ${exchanges.length}건 삽입 완료`)

  // 5. 알림 삽입
  interface NotificationFixture {
    id: string
    patientId: string
    type: string
    daysUntilVisit: number | null
    scheduledVisitDate: string | null
    message: string
    sentAt: string
    isRead: boolean
  }
  const notifications = loadFixture<NotificationFixture[]>('notifications.json')
  for (const notification of notifications) {
    await prisma.notification.create({
      data: {
        id: notification.id,
        patientId: notification.patientId,
        type: notification.type,
        daysUntilVisit: notification.daysUntilVisit ?? null,
        scheduledVisitDate: notification.scheduledVisitDate ?? null,
        message: notification.message,
        sentAt: notification.sentAt,
        isRead: notification.isRead,
      },
    })
  }
  console.log(`알림 ${notifications.length}건 삽입 완료`)

  // 6. 약물 상호작용 삽입
  interface InteractionFixture {
    drug1: string
    drug2: string
    severity: string
    description: string
    action: string
  }
  interface InteractionsFile {
    pairs: InteractionFixture[]
  }
  const interactionsData = loadFixture<InteractionsFile>('interactions.json')
  for (const interaction of interactionsData.pairs) {
    await prisma.interaction.create({
      data: {
        drug1: interaction.drug1,
        drug2: interaction.drug2,
        severity: interaction.severity,
        description: interaction.description,
        action: interaction.action,
      },
    })
  }
  console.log(`약물 상호작용 ${interactionsData.pairs.length}건 삽입 완료`)

  console.log('시드 데이터 삽입 완료!')
}

main()
  .catch((e) => {
    console.error('시드 오류:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
