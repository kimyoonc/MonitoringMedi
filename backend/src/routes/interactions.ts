import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// 약물 상호작용 확인
// 요청 body: { medications: string[] } — 의약품 이름 배열
router.post('/check', async (req, res) => {
  try {
    const { medications } = req.body as { medications: string[] };

    if (!medications || !Array.isArray(medications)) {
      return res.status(400).json({ success: false, error: '의약품 목록이 필요합니다.' });
    }

    // 모든 상호작용 데이터 조회 후 약물 이름 매칭
    const allInteractions = await prisma.interaction.findMany();

    const foundInteractions = allInteractions.filter(pair => {
      const hasDrug1 = medications.some(m =>
        m.includes(pair.drug1) || pair.drug1.includes(m)
      );
      const hasDrug2 = medications.some(m =>
        m.includes(pair.drug2) || pair.drug2.includes(m)
      );
      return hasDrug1 && hasDrug2;
    });

    res.json({
      success: true,
      data: {
        hasInteractions: foundInteractions.length > 0,
        interactions: foundInteractions,
      },
    });
  } catch (err) {
    console.error('POST /interactions/check 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
