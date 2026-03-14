import { Router } from 'express';
import exchanges from '../fixtures/exchanges.json';

const router = Router();

// 교환 이력 상세
router.get('/:id', (req, res) => {
  const exchange = exchanges.find(e => e.id === req.params.id);
  if (!exchange) return res.status(404).json({ success: false, error: '교환 이력을 찾을 수 없습니다.' });
  res.json({ success: true, data: exchange });
});

// 신규 교환 요청 (Mock: 고정 응답)
router.post('/', (req, res) => {
  const newExchange = {
    id: `EX${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  res.status(201).json({ success: true, data: newExchange });
});

export default router;
