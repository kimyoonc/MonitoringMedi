import { Router } from 'express';
import prisma from '../lib/prisma';
import type { PlanStep } from '@prisma/client';

const router = Router();

// canDispense 계산 헬퍼 함수
function computeCanDispense(steps: PlanStep[]): (PlanStep & { canDispense: boolean })[] {
  return steps.map((step, index) => ({
    ...step,
    canDispense: index === 0 ? true : steps[index - 1].visitId !== null,
  }));
}

// 전체 계획 목록 (patientId 쿼리 파라미터 지원)
router.get('/', async (req, res) => {
  try {
    const { patientId } = req.query;
    const plans = await prisma.plan.findMany({
      where: patientId ? { patientId: patientId as string } : {},
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    const withCanDispense = plans.map(plan => ({
      ...plan,
      steps: computeCanDispense(plan.steps),
    }));

    res.json({ success: true, data: withCanDispense });
  } catch (err) {
    console.error('GET /plans 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 복약 관리 계획 상세 (canDispense 필드 포함)
router.get('/:id', async (req, res) => {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: req.params.id },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    if (!plan) {
      return res.status(404).json({ success: false, error: '복약 관리 계획을 찾을 수 없습니다.' });
    }

    const planWithCanDispense = {
      ...plan,
      steps: computeCanDispense(plan.steps),
    };

    res.json({ success: true, data: planWithCanDispense });
  } catch (err) {
    console.error('GET /plans/:id 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 신규 복약 관리 계획 생성
router.post('/', async (req, res) => {
  try {
    const { patientId, totalDays, visitCount, startDate, medications = [] } = req.body;

    // 유효성 검사
    if (!patientId) {
      return res.status(400).json({ success: false, error: '환자를 선택해주세요.', code: 'PATIENT_REQUIRED' });
    }
    if (!totalDays || totalDays <= 0) {
      return res.status(400).json({ success: false, error: '총 처방 기간을 올바르게 입력해주세요.', code: 'INVALID_TOTAL_DAYS' });
    }
    if (!visitCount || visitCount < 1) {
      return res.status(400).json({ success: false, error: '방문 횟수를 1회 이상 입력해주세요.', code: 'INVALID_VISIT_COUNT' });
    }
    if (visitCount > totalDays) {
      return res.status(400).json({ success: false, error: '방문 횟수는 총 처방 기간보다 클 수 없습니다.', code: 'INVALID_VISIT_COUNT' });
    }

    // 시작일 계산 (없으면 오늘)
    const baseDate = startDate ? new Date(startDate) : new Date();
    const today = baseDate.toISOString().split('T')[0];

    // 조제 단위 계산
    const dispensingUnit = Math.floor(totalDays / visitCount);
    const remainder = totalDays % visitCount;

    // 방문 단계 생성
    const steps = Array.from({ length: visitCount }, (_, i) => {
      const scheduledDate = new Date(baseDate);
      scheduledDate.setDate(scheduledDate.getDate() + dispensingUnit * i);
      const dispenseDays = i === visitCount - 1
        ? dispensingUnit + remainder
        : dispensingUnit;

      return {
        stepNumber: i + 1,
        scheduledDate: scheduledDate.toISOString().split('T')[0],
        dispenseDays,
        status: i === 0 ? 'scheduled' : 'pending',
        visitId: null,
      };
    });

    const newPlan = await prisma.plan.create({
      data: {
        id: `PL_${Date.now()}`,
        prescriptionId: `RX_${Date.now()}`,
        patientId,
        totalVisits: visitCount,
        dispensingUnit,
        medications,
        createdAt: today,
        steps: {
          create: steps,
        },
      },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    const responseData = {
      ...newPlan,
      steps: computeCanDispense(newPlan.steps),
    };

    res.status(201).json({ success: true, data: responseData });
  } catch (err) {
    console.error('POST /plans 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 복약 관리 계획 단계 목록 (canDispense 포함)
router.get('/:id/steps', async (req, res) => {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: req.params.id },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    if (!plan) {
      return res.status(404).json({ success: false, error: '복약 관리 계획을 찾을 수 없습니다.' });
    }

    const stepsWithCanDispense = computeCanDispense(plan.steps);
    res.json({ success: true, data: stepsWithCanDispense });
  } catch (err) {
    console.error('GET /plans/:id/steps 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
