import { Router } from 'express';
import exchangesFixture from '../fixtures/exchanges.json';

const router = Router();

// 인메모리 교환 이력 저장소
const exchangesStore: any[] = [...exchangesFixture];

// 교환 사유별 레이블 매핑
const reasonLabelMap: Record<string, string> = {
  contamination: '오염/훼손',
  damage: '파손',
  expiry: '유통기한 임박',
};

// 전체 교환 이력 조회 (patientId 필터 지원)
router.get('/', (req, res) => {
  const { patientId } = req.query;
  let result = [...exchangesStore];

  if (patientId) {
    result = result.filter(e => e.patientId === patientId);
  }

  // exchangeDate 내림차순 정렬
  result.sort((a, b) => new Date(b.exchangeDate).getTime() - new Date(a.exchangeDate).getTime());

  res.json({ success: true, data: result });
});

// 교환 이력 상세
router.get('/:id', (req, res) => {
  const exchange = exchangesStore.find(e => e.id === req.params.id);
  if (!exchange) {
    return res.status(404).json({ success: false, error: '교환 이력을 찾을 수 없습니다.' });
  }
  res.json({ success: true, data: exchange });
});

// 신규 교환 요청
router.post('/', (req, res) => {
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

  const newExchange = {
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
  };

  exchangesStore.push(newExchange);
  res.status(201).json({ success: true, data: newExchange });
});

export default router;
