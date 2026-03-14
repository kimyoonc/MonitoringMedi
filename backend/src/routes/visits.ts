import { Router } from 'express';
import visits from '../fixtures/visits.json';
import exchanges from '../fixtures/exchanges.json';

const router = Router();

// 방문 기록 상세
router.get('/:id', (req, res) => {
  const visit = visits.find(v => v.id === req.params.id);
  if (!visit) return res.status(404).json({ success: false, error: '방문 기록을 찾을 수 없습니다.' });
  res.json({ success: true, data: visit });
});

// 신규 방문 기록 생성 (Mock: 고정 응답)
router.post('/', (req, res) => {
  const newVisit = {
    id: `V${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  res.status(201).json({ success: true, data: newVisit });
});

// 방문 기록 조제 처리 (Mock: 고정 응답)
router.post('/:id/dispense', (req, res) => {
  const visit = visits.find(v => v.id === req.params.id);
  if (!visit) return res.status(404).json({ success: false, error: '방문 기록을 찾을 수 없습니다.' });
  const result = {
    ...visit,
    dispensedAt: new Date().toISOString(),
    dispensedMedications: req.body.medications || visit.dispensedMedications,
  };
  res.json({ success: true, data: result });
});

// 방문 기록의 교환 이력
router.get('/:id/exchanges', (req, res) => {
  const visitExchanges = exchanges.filter(e => e.visitId === req.params.id);
  res.json({ success: true, data: visitExchanges });
});

export default router;
