import { Router } from 'express';
import interactionsData from '../fixtures/interactions.json';

const router = Router();

// 약물 상호작용 확인
// 요청 body: { medications: string[] } — 의약품 이름 배열
router.post('/check', (req, res) => {
  const { medications } = req.body as { medications: string[] };

  if (!medications || !Array.isArray(medications)) {
    return res.status(400).json({ success: false, error: '의약품 목록이 필요합니다.' });
  }

  const foundInteractions: typeof interactionsData.pairs = [];

  // 요청된 의약품 목록에서 두 약물 조합을 모두 확인
  for (const pair of interactionsData.pairs) {
    const hasDrug1 = medications.some(m =>
      m.includes(pair.drug1) || pair.drug1.includes(m)
    );
    const hasDrug2 = medications.some(m =>
      m.includes(pair.drug2) || pair.drug2.includes(m)
    );

    if (hasDrug1 && hasDrug2) {
      foundInteractions.push(pair);
    }
  }

  res.json({
    success: true,
    data: {
      hasInteractions: foundInteractions.length > 0,
      interactions: foundInteractions,
    },
  });
});

export default router;
