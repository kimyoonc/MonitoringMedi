import { Router } from 'express';
import dashboard from '../fixtures/dashboard.json';

const router = Router();

// 대시보드 현황 조회
router.get('/', (req, res) => {
  res.json({ success: true, data: dashboard });
});

export default router;
