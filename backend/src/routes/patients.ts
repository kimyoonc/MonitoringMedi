import { Router } from 'express';
import patients from '../fixtures/patients.json';
import notificationsFixture from '../fixtures/notifications.json';
import { visitsStore } from '../store';

const router = Router();

// 인메모리 알림 저장소 (notifications.ts와 공유되지 않으므로 별도로 관리)
// 실제 환경에서는 공유 store로 분리 필요
const notificationsStore: any[] = [...notificationsFixture];

// 전체 환자 목록
router.get('/', (req, res) => {
  res.json({ success: true, data: patients });
});

// 환자 상세
router.get('/:id', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, error: '환자를 찾을 수 없습니다.' });
  }
  res.json({ success: true, data: patient });
});

// 신규 환자 등록 (Mock: 고정 응답)
router.post('/', (req, res) => {
  const newPatient = {
    id: `P${Date.now()}`,
    ...req.body,
    registeredAt: new Date().toISOString().split('T')[0],
    status: 'active',
  };
  res.status(201).json({ success: true, data: newPatient });
});

// 환자 방문 이력 (visitDate 내림차순 정렬)
router.get('/:id/visits', (req, res) => {
  const patientVisits = visitsStore
    .filter(v => v.patientId === req.params.id)
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  res.json({ success: true, data: patientVisits });
});

// 환자 알림 목록 (sentAt 내림차순 정렬)
router.get('/:id/notifications', (req, res) => {
  const { type } = req.query;
  let patientNotifications = notificationsStore.filter(n => n.patientId === req.params.id);

  if (type) {
    patientNotifications = patientNotifications.filter(n => n.type === type);
  }

  patientNotifications.sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );

  res.json({ success: true, data: patientNotifications });
});

// 환자 알림 읽음 처리
router.post('/:id/notifications/read', (req, res) => {
  const { notificationId } = req.body;

  if (!notificationId) {
    return res.status(400).json({ success: false, error: 'notificationId가 필요합니다.' });
  }

  const notification = notificationsStore.find(
    n => n.id === notificationId && n.patientId === req.params.id
  );

  if (!notification) {
    return res.status(404).json({ success: false, error: '알림을 찾을 수 없습니다.' });
  }

  notification.isRead = true;
  const readAt = new Date().toISOString();

  res.json({
    success: true,
    data: {
      id: notification.id,
      isRead: true,
      readAt,
    },
  });
});

// 이상 반응 신고 (TC-04)
router.post('/:id/adverse-reactions', (req, res) => {
  const { symptom, severity, note, reportedAt } = req.body;
  const patientId = req.params.id;

  if (!symptom) {
    return res.status(400).json({ success: false, error: '증상을 입력해주세요.' });
  }

  if (!severity) {
    return res.status(400).json({ success: false, error: '증상 강도를 선택해주세요.' });
  }

  const id = `AR_${Date.now()}`;
  const adverseReaction = {
    id,
    patientId,
    symptom,
    severity,
    note: note || '',
    reportedAt: reportedAt || new Date().toISOString(),
    status: 'received',
    message: '이상 반응 신고가 접수되었습니다. 담당 약사에게 전달되었습니다.',
  };

  res.status(201).json({ success: true, data: adverseReaction });
});

export default router;
