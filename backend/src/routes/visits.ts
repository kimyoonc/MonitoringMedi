import { Router } from 'express';
import exchanges from '../fixtures/exchanges.json';
import { visitsStore, plansStore, updatePlanStep } from '../store';

const router = Router();

// 방문 기록 상세
router.get('/:id', (req, res) => {
  const visit = visitsStore.find(v => v.id === req.params.id);
  if (!visit) {
    return res.status(404).json({ success: false, error: '방문 기록을 찾을 수 없습니다.' });
  }
  res.json({ success: true, data: visit });
});

// 신규 방문 기록 생성
router.post('/', (req, res) => {
  try {
    const {
      planId,
      patientId,
      visitDate,
      stepNumber,
      adherence,
      adverseReaction,
      adverseReactionNote,
      storageCondition,
      pharmacistNote,
      dispensedMedications = [],
    } = req.body;

    const newVisit = {
      id: `V_${Date.now()}`,
      planId,
      patientId,
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      stepNumber,
      adherence: adherence || 'good',
      adverseReaction: adverseReaction || false,
      adverseReactionNote: adverseReactionNote || null,
      storageCondition: storageCondition || 'good',
      pharmacistNote: pharmacistNote || '',
      dispensedMedications,
      createdAt: new Date().toISOString(),
    };

    // 인메모리 저장소에 추가
    visitsStore.push(newVisit);

    res.status(201).json({ success: true, data: newVisit });
  } catch (err) {
    console.error('POST /visits 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 단계별 조제 처리
router.post('/:id/dispense', (req, res) => {
  try {
    const visit = visitsStore.find(v => v.id === req.params.id);
    if (!visit) {
      return res.status(404).json({ success: false, error: '방문 기록을 찾을 수 없습니다.' });
    }

    // stepNumber > 1 인 경우 이전 단계 방문 기록 확인
    if (visit.stepNumber > 1) {
      const plan = plansStore.find(p => p.id === visit.planId);
      if (plan) {
        const prevStep = plan.steps.find((s: any) => s.stepNumber === visit.stepNumber - 1);
        if (!prevStep || prevStep.visitId === null) {
          return res.status(400).json({
            success: false,
            error: '이전 방문 기록이 확인되지 않아 조제를 진행할 수 없습니다.',
            code: 'PREVIOUS_VISIT_REQUIRED',
          });
        }
      }
    }

    // 조제 처리 — plan의 step.visitId 업데이트
    if (visit.planId && visit.stepNumber) {
      updatePlanStep(visit.planId, visit.stepNumber, visit.id);
    }

    // visit 데이터에 dispensedAt 기록
    visit.dispensedAt = new Date().toISOString();
    if (req.body.medications && req.body.medications.length > 0) {
      visit.dispensedMedications = req.body.medications;
    }

    const result = {
      id: visit.id,
      planId: visit.planId,
      patientId: visit.patientId,
      visitDate: visit.visitDate,
      stepNumber: visit.stepNumber,
      dispensedAt: visit.dispensedAt,
      dispensedMedications: visit.dispensedMedications,
    };

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('POST /visits/:id/dispense 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 방문 기록의 교환 이력
router.get('/:id/exchanges', (req, res) => {
  const visitExchanges = exchanges.filter(e => e.visitId === req.params.id);
  res.json({ success: true, data: visitExchanges });
});

export default router;
