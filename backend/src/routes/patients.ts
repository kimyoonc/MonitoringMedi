import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// 전체 환자 목록
router.get('/', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany();
    res.json({ success: true, data: patients });
  } catch (err) {
    console.error('GET /patients 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 환자 상세
router.get('/:id', async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
    if (!patient) {
      return res.status(404).json({ success: false, error: '환자를 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    console.error('GET /patients/:id 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 신규 환자 등록
router.post('/', async (req, res) => {
  try {
    const newPatient = await prisma.patient.create({
      data: {
        id: `P${Date.now()}`,
        name: req.body.name,
        birthDate: req.body.birthDate,
        phone: req.body.phone,
        address: req.body.address,
        conditions: req.body.conditions ?? [],
        registeredAt: new Date().toISOString().split('T')[0],
        status: 'active',
      },
    });
    res.status(201).json({ success: true, data: newPatient });
  } catch (err) {
    console.error('POST /patients 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 환자 방문 이력 (visitDate 내림차순 정렬)
router.get('/:id/visits', async (req, res) => {
  try {
    const patientVisits = await prisma.visit.findMany({
      where: { patientId: req.params.id },
      orderBy: { visitDate: 'desc' },
    });
    res.json({ success: true, data: patientVisits });
  } catch (err) {
    console.error('GET /patients/:id/visits 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 환자 알림 목록 (sentAt 내림차순 정렬)
router.get('/:id/notifications', async (req, res) => {
  try {
    const { type } = req.query;
    const patientNotifications = await prisma.notification.findMany({
      where: {
        patientId: req.params.id,
        ...(type ? { type: type as string } : {}),
      },
      orderBy: { sentAt: 'desc' },
    });
    res.json({ success: true, data: patientNotifications });
  } catch (err) {
    console.error('GET /patients/:id/notifications 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 환자 알림 읽음 처리
router.post('/:id/notifications/read', async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.status(400).json({ success: false, error: 'notificationId가 필요합니다.' });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.patientId !== req.params.id) {
      return res.status(404).json({ success: false, error: '알림을 찾을 수 없습니다.' });
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    const readAt = new Date().toISOString();
    res.json({
      success: true,
      data: {
        id: notificationId,
        isRead: true,
        readAt,
      },
    });
  } catch (err) {
    console.error('POST /patients/:id/notifications/read 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

// 이상 반응 신고 (TC-04)
router.post('/:id/adverse-reactions', async (req, res) => {
  try {
    const { symptom, severity, note, reportedAt } = req.body;
    const patientId = req.params.id;

    if (!symptom) {
      return res.status(400).json({ success: false, error: '증상을 입력해주세요.' });
    }

    if (!severity) {
      return res.status(400).json({ success: false, error: '증상 강도를 선택해주세요.' });
    }

    const id = `AR_${Date.now()}`;
    const adverseReaction = await prisma.adverseReaction.create({
      data: {
        id,
        patientId,
        symptom,
        severity,
        note: note || '',
        reportedAt: reportedAt || new Date().toISOString(),
        status: 'received',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...adverseReaction,
        message: '이상 반응 신고가 접수되었습니다. 담당 약사에게 전달되었습니다.',
      },
    });
  } catch (err) {
    console.error('POST /patients/:id/adverse-reactions 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
