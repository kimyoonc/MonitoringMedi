import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// 대시보드 현황 조회
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 오늘 방문 예정: scheduled 상태이면서 scheduledDate가 오늘인 step
    const todaySteps = await prisma.planStep.findMany({
      where: {
        scheduledDate: today,
        status: 'scheduled',
      },
      include: {
        plan: {
          include: {
            patient: true,
          },
        },
      },
    });

    const todayVisits = todaySteps.length;

    // 조제 대기 중: scheduled 상태인 step 수
    const pendingDispense = await prisma.planStep.count({
      where: { status: 'scheduled' },
    });

    // 이상반응 환자 수
    const adverseReactions = await prisma.visit.count({
      where: { adverseReaction: true },
    });

    // 오늘 방문 예정 환자 목록
    const todayVisitPatients = todaySteps.map(step => ({
      patientId: step.plan.patientId,
      name: step.plan.patient.name,
      stepNumber: step.stepNumber,
      planId: step.planId,
      conditions: step.plan.patient.conditions,
    }));

    // 조제 대기 환자 목록 (scheduled 상태 step이 있는 plan)
    const pendingSteps = await prisma.planStep.findMany({
      where: { status: 'scheduled' },
      include: {
        plan: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    const pendingDispensePatients = pendingSteps.map(step => {
      const scheduledDate = new Date(step.scheduledDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - scheduledDate.getTime();
      const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      return {
        patientId: step.plan.patientId,
        name: step.plan.patient.name,
        nextVisitDate: step.scheduledDate,
        stepNumber: step.stepNumber,
        daysOverdue,
      };
    });

    // 이상반응 환자 목록
    const adverseVisits = await prisma.visit.findMany({
      where: { adverseReaction: true },
      include: { patient: true },
      orderBy: { visitDate: 'desc' },
    });

    const adverseReactionPatients = adverseVisits.map(visit => ({
      patientId: visit.patientId,
      name: visit.patient.name,
      reportedDate: visit.visitDate,
      symptom: visit.adverseReactionNote || '이상 반응',
    }));

    res.json({
      success: true,
      data: {
        date: today,
        generatedAt: new Date().toISOString(),
        summary: {
          todayVisits,
          pendingDispense,
          adverseReactions,
        },
        todayVisitPatients,
        adverseReactionPatients,
        pendingDispensePatients,
      },
    });
  } catch (err) {
    console.error('GET /dashboard 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
