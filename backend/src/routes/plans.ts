import { Router } from 'express';
import plans from '../fixtures/plans.json';

const router = Router();

// 전체 계획 목록
router.get('/', (req, res) => {
  res.json({ success: true, data: plans });
});

// 복약 관리 계획 상세
router.get('/:id', (req, res) => {
  const plan = plans.find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ success: false, error: '복약 관리 계획을 찾을 수 없습니다.' });
  res.json({ success: true, data: plan });
});

// 신규 복약 관리 계획 생성 (Mock: 고정 응답)
router.post('/', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const { patientId, totalDays = 90, visitCount = 3, patientName } = req.body;
  const dispensingUnit = Math.floor(totalDays / visitCount);

  const steps = Array.from({ length: visitCount }, (_, i) => {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + dispensingUnit * i);
    return {
      stepNumber: i + 1,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      dispenseDays: dispensingUnit,
      status: i === 0 ? 'scheduled' : 'pending',
      visitId: null,
    };
  });

  const newPlan = {
    id: `PL${Date.now()}`,
    prescriptionId: `RX${Date.now()}`,
    patientId: patientId || 'P001',
    patientName: patientName || '',
    totalVisits: visitCount,
    dispensingUnit,
    steps,
    createdAt: today,
  };

  res.status(201).json({ success: true, data: newPlan });
});

// 복약 관리 계획 단계 목록
router.get('/:id/steps', (req, res) => {
  const plan = plans.find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ success: false, error: '복약 관리 계획을 찾을 수 없습니다.' });
  res.json({ success: true, data: plan.steps });
});

export default router;
