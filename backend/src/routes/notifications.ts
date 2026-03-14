import { Router } from 'express';
import notificationsFixture from '../fixtures/notifications.json';

const router = Router();

// 인메모리 알림 저장소
const notificationsStore: any[] = [...notificationsFixture];

// 전체 알림 목록
router.get('/', (req, res) => {
  const { patientId } = req.query;
  let result = [...notificationsStore];

  if (patientId) {
    result = result.filter(n => n.patientId === patientId);
  }

  // sentAt 내림차순 정렬
  result.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  res.json({ success: true, data: result });
});

// 특정 알림 읽음 처리
router.patch('/:id/read', (req, res) => {
  const notification = notificationsStore.find(n => n.id === req.params.id);
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

// 알림 발송 (Mock: 고정 응답)
router.post('/send', (req, res) => {
  const { patientId, type, message, daysUntilVisit, scheduledVisitDate } = req.body;
  const newNotification = {
    id: `N${Date.now()}`,
    patientId,
    type: type || 'visit_reminder',
    daysUntilVisit: daysUntilVisit ?? null,
    scheduledVisitDate: scheduledVisitDate ?? null,
    message: message || '알림이 발송되었습니다.',
    sentAt: new Date().toISOString(),
    isRead: false,
  };
  notificationsStore.push(newNotification);
  res.status(201).json({ success: true, data: newNotification });
});

export default router;
