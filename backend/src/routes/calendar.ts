import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// 월별 방문 일정 조회 — ?year=2026&month=3
router.get('/', async (req, res) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear()
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1

    // 해당 월 시작/끝 날짜 (YYYY-MM-DD 문자열 비교)
    const monthStr = String(month).padStart(2, '0')
    const startDate = `${year}-${monthStr}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`

    const steps = await prisma.planStep.findMany({
      where: {
        scheduledDate: { gte: startDate, lte: endDate },
      },
      include: {
        plan: {
          include: {
            patient: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    })

    const data = steps.map(step => ({
      date: step.scheduledDate,
      stepNumber: step.stepNumber,
      status: step.status,
      planId: step.planId,
      patientId: step.plan.patient.id,
      patientName: step.plan.patient.name,
    }))

    res.json({ success: true, data })
  } catch (err) {
    console.error('GET /calendar 오류:', err)
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' })
  }
})

export default router
