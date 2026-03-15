import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// 방문 기록 상세
router.get('/:id', async (req, res) => {
  try {
    const visit = await prisma.visit.findUnique({ where: { id: req.params.id } });
    if (!visit) {
      return res.status(404).json({ success: false, error: '방문 기록을 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: visit });
  } catch (err) {
    console.error('GET /visits/:id 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 신규 방문 기록 생성
router.post('/', async (req, res) => {
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

    const newVisit = await prisma.visit.create({
      data: {
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
      },
    });

    res.status(201).json({ success: true, data: newVisit });
  } catch (err) {
    console.error('POST /visits 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 단계별 조제 처리
router.post('/:id/dispense', async (req, res) => {
  try {
    const visit = await prisma.visit.findUnique({ where: { id: req.params.id } });
    if (!visit) {
      return res.status(404).json({ success: false, error: '방문 기록을 찾을 수 없습니다.' });
    }

    // stepNumber > 1 인 경우 이전 단계 방문 기록 확인
    if (visit.stepNumber > 1) {
      const prevStep = await prisma.planStep.findUnique({
        where: {
          planId_stepNumber: {
            planId: visit.planId,
            stepNumber: visit.stepNumber - 1,
          },
        },
      });

      if (!prevStep || prevStep.visitId === null) {
        return res.status(400).json({
          success: false,
          error: '이전 방문 기록이 확인되지 않아 조제를 진행할 수 없습니다.',
          code: 'PREVIOUS_VISIT_REQUIRED',
        });
      }
    }

    const dispensedAt = new Date().toISOString();

    // plan step 업데이트 (visitId 기록 및 completed 처리)
    await prisma.planStep.update({
      where: {
        planId_stepNumber: {
          planId: visit.planId,
          stepNumber: visit.stepNumber,
        },
      },
      data: {
        visitId: visit.id,
        status: 'completed',
      },
    });

    // 조제된 의약품 목록 및 dispensedAt 업데이트
    const updatedVisit = await prisma.visit.update({
      where: { id: visit.id },
      data: {
        dispensedAt,
        ...(req.body.medications && req.body.medications.length > 0
          ? { dispensedMedications: req.body.medications }
          : {}),
      },
    });

    const result = {
      id: updatedVisit.id,
      planId: updatedVisit.planId,
      patientId: updatedVisit.patientId,
      visitDate: updatedVisit.visitDate,
      stepNumber: updatedVisit.stepNumber,
      dispensedAt: updatedVisit.dispensedAt,
      dispensedMedications: updatedVisit.dispensedMedications,
    };

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('POST /visits/:id/dispense 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 방문 기록의 교환 이력
router.get('/:id/exchanges', async (req, res) => {
  try {
    const visitExchanges = await prisma.exchange.findMany({
      where: { visitId: req.params.id },
    });
    res.json({ success: true, data: visitExchanges });
  } catch (err) {
    console.error('GET /visits/:id/exchanges 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
