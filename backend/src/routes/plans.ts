import { Router } from 'express';
import { plansStore, updatePlanStep } from '../store';

const router = Router();

// 전체 계획 목록 (patientId 쿼리 파라미터 지원)
router.get('/', (req, res) => {
  const { patientId } = req.query;
  const result = patientId
    ? plansStore.filter(p => p.patientId === patientId)
    : plansStore;

  // canDispense 필드 계산 후 반환
  const withCanDispense = result.map(plan => ({
    ...plan,
    steps: plan.steps.map((step: any, index: number) => ({
      ...step,
      canDispense: index === 0
        ? true
        : plan.steps[index - 1].visitId !== null,
    })),
  }));

  res.json({ success: true, data: withCanDispense });
});

// 복약 관리 계획 상세 (canDispense 필드 포함)
router.get('/:id', (req, res) => {
  const plan = plansStore.find(p => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, error: '복약 관리 계획을 찾을 수 없습니다.' });
  }

  // 각 단계의 canDispense 계산
  const planWithCanDispense = {
    ...plan,
    steps: plan.steps.map((step: any, index: number) => ({
      ...step,
      canDispense: index === 0
        ? true
        : plan.steps[index - 1].visitId !== null,
    })),
  };

  res.json({ success: true, data: planWithCanDispense });
});

// 신규 복약 관리 계획 생성
router.post('/', (req, res) => {
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
        canDispense: i === 0,
      };
    });

    const newPlan = {
      id: `PL_${Date.now()}`,
      prescriptionId: `RX_${Date.now()}`,
      patientId,
      totalVisits: visitCount,
      dispensingUnit,
      medications,
      steps,
      createdAt: today,
    };

    // 인메모리 저장소에 추가
    plansStore.push(newPlan);

    res.status(201).json({ success: true, data: newPlan });
  } catch (err) {
    console.error('POST /plans 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 복약 관리 계획 단계 목록 (canDispense 포함)
router.get('/:id/steps', (req, res) => {
  const plan = plansStore.find(p => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, error: '복약 관리 계획을 찾을 수 없습니다.' });
  }

  const stepsWithCanDispense = plan.steps.map((step: any, index: number) => ({
    ...step,
    canDispense: index === 0
      ? true
      : plan.steps[index - 1].visitId !== null,
  }));

  res.json({ success: true, data: stepsWithCanDispense });
});

export { updatePlanStep };
export default router;
