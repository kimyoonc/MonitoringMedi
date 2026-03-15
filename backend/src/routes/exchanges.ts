import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// 교환 사유별 레이블 매핑
const reasonLabelMap: Record<string, string> = {
  contamination: '오염/훼손',
  damage: '파손',
  expiry: '유통기한 임박',
};

// 전체 교환 이력 조회 (patientId 필터 지원)
router.get('/', async (req, res) => {
  try {
    const { patientId } = req.query;
    const result = await prisma.exchange.findMany({
      where: patientId ? { patientId: patientId as string } : {},
      orderBy: { exchangeDate: 'desc' },
    });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('GET /exchanges 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 교환 이력 상세
router.get('/:id', async (req, res) => {
  try {
    const exchange = await prisma.exchange.findUnique({ where: { id: req.params.id } });
    if (!exchange) {
      return res.status(404).json({ success: false, error: '교환 이력을 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: exchange });
  } catch (err) {
    console.error('GET /exchanges/:id 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 신규 교환 요청
router.post('/', async (req, res) => {
  try {
    const { visitId, patientId, exchangeDate, reason, medications, handlingMethod, pharmacistNote } = req.body;

    // 필수 필드 검증
    if (!patientId || !exchangeDate || !reason || !medications || !handlingMethod) {
      return res.status(400).json({
        success: false,
        error: '필수 항목이 누락되었습니다. (patientId, exchangeDate, reason, medications, handlingMethod)',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    // 교환 사유 유효성 검증
    const validReasons = ['contamination', 'damage', 'expiry'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        error: '교환 사유가 유효하지 않습니다. (contamination / damage / expiry 중 선택)',
        code: 'INVALID_EXCHANGE_REASON',
      });
    }

    // 의약품 목록 검증
    if (!Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        success: false,
        error: '교환 의약품 목록은 1개 이상이어야 합니다.',
        code: 'INVALID_MEDICATIONS',
      });
    }

    const newExchange = await prisma.exchange.create({
      data: {
        id: `EX_${Date.now()}`,
        visitId: visitId || null,
        patientId,
        exchangeDate,
        reason,
        reasonLabel: reasonLabelMap[reason] || reason,
        medications,
        handlingMethod,
        pharmacistNote: pharmacistNote || '',
        createdAt: new Date().toISOString(),
      },
    });

    res.status(201).json({ success: true, data: newExchange });
  } catch (err) {
    console.error('POST /exchanges 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
