import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// 전체 알림 목록
router.get('/', async (req, res) => {
  try {
    const { patientId } = req.query;
    const result = await prisma.notification.findMany({
      where: patientId ? { patientId: patientId as string } : {},
      orderBy: { sentAt: 'desc' },
    });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('GET /notifications 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 특정 알림 읽음 처리
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification) {
      return res.status(404).json({ success: false, error: '알림을 찾을 수 없습니다.' });
    }

    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });

    const readAt = new Date().toISOString();
    res.json({
      success: true,
      data: {
        id: notification.id,
        isRead: true,
        readAt,
      },
    });
  } catch (err) {
    console.error('PATCH /notifications/:id/read 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 알림 발송
router.post('/send', async (req, res) => {
  try {
    const { patientId, type, message, daysUntilVisit, scheduledVisitDate } = req.body;

    const newNotification = await prisma.notification.create({
      data: {
        id: `N${Date.now()}`,
        patientId,
        type: type || 'visit_reminder',
        daysUntilVisit: daysUntilVisit ?? null,
        scheduledVisitDate: scheduledVisitDate ?? null,
        message: message || '알림이 발송되었습니다.',
        sentAt: new Date().toISOString(),
        isRead: false,
      },
    });

    res.status(201).json({ success: true, data: newNotification });
  } catch (err) {
    console.error('POST /notifications/send 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
