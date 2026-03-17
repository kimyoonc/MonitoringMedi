import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// UTC 기반 날짜 덧셈
function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().split('T')[0];
}

// 대시보드 현황 조회
router.get('/', async (req, res) => {
  try {
    // KST 기준 오늘 날짜 (UTC+9), query param으로 날짜 지정 가능
    const kstToday = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = (req.query.date as string) || kstToday;

    // 해당 날짜 plan step 전체 조회 (상태 무관 — 과거: completed, 오늘: scheduled, 미래: pending)
    const todaySteps = await prisma.planStep.findMany({
      where: { scheduledDate: today },
      include: {
        plan: {
          include: { patient: true },
        },
      },
    });

    const todayVisits = todaySteps.length;

    // 조제 미완료 수 (scheduled 또는 pending — 아직 방문하지 않은 step)
    const pendingDispense = todaySteps.filter(s => s.status !== 'completed').length;

    // 이상반응 환자 수: 해당 날짜 방문 기록 중 이상반응 건수
    const adverseReactions = await prisma.visit.count({
      where: { adverseReaction: true, visitDate: today },
    });

    // 방문 환자 목록 (해당 날짜 전체)
    const todayVisitPatients = todaySteps.map(step => ({
      patientId: step.plan.patientId,
      name: step.plan.patient.name,
      stepNumber: step.stepNumber,
      planId: step.planId,
      status: step.status,
      conditions: step.plan.patient.conditions,
    }));

    // 조제 미완료 환자 목록 (scheduled / pending)
    const pendingSteps = todaySteps.filter(s => s.status !== 'completed');

    const pendingDispensePatients = pendingSteps.map(step => ({
      patientId: step.plan.patientId,
      name: step.plan.patient.name,
      nextVisitDate: step.scheduledDate,
      stepNumber: step.stepNumber,
      daysOverdue: 0,
    }));

    // 이상반응 환자 목록 (해당 날짜 방문 기록 기준)
    const adverseVisits = await prisma.visit.findMany({
      where: { adverseReaction: true, visitDate: today },
      include: { patient: true },
      orderBy: { visitDate: 'desc' },
    });

    const adverseReactionPatients = adverseVisits.map(visit => ({
      patientId: visit.patientId,
      name: visit.patient.name,
      reportedDate: visit.visitDate,
      symptom: visit.adverseReactionNote || '이상 반응',
    }));

    // 주간 방문 추이 (선택 날짜 기준 최근 7일)
    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
    const weeklySteps = await prisma.planStep.groupBy({
      by: ['scheduledDate'],
      where: { scheduledDate: { in: weekDates } },
      _count: { id: true },
    });
    const weeklyVisits = weekDates.map(date => ({
      date,
      count: weeklySteps.find(s => s.scheduledDate === date)?._count.id ?? 0,
    }));

    // 질환별 환자 수
    const allPatients = await prisma.patient.findMany({ select: { conditions: true } });
    const conditionMap = new Map<string, number>();
    allPatients.forEach(p => {
      p.conditions.forEach(c => conditionMap.set(c, (conditionMap.get(c) ?? 0) + 1));
    });
    const conditionStats = Array.from(conditionMap.entries())
      .map(([condition, count]) => ({ condition, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

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
        weeklyVisits,
        conditionStats,
      },
    });
  } catch (err) {
    console.error('GET /dashboard 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
