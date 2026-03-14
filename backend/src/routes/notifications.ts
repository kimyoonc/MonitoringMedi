import { Router } from 'express';
import notifications from '../fixtures/notifications.json';

const router = Router();

// 전체 알림 목록
router.get('/', (req, res) => {
  res.json({ success: true, data: notifications });
});

// 알림 발송 (Mock: 고정 응답)
router.post('/send', (req, res) => {
  const { patientId, type, message } = req.body;
  const newNotification = {
    id: `N${Date.now()}`,
    patientId,
    type: type || 'visit_reminder',
    message: message || '알림이 발송되었습니다.',
    sentAt: new Date().toISOString(),
    isRead: false,
  };
  res.status(201).json({ success: true, data: newNotification });
});

export default router;
