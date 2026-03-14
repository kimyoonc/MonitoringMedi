import { Router } from 'express';
import patients from '../fixtures/patients.json';
import notifications from '../fixtures/notifications.json';
import { visitsStore } from '../store';

const router = Router();

// 전체 환자 목록
router.get('/', (req, res) => {
  res.json({ success: true, data: patients });
});

// 환자 상세
router.get('/:id', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ success: false, error: '환자를 찾을 수 없습니다.' });
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

// 환자 알림 목록
router.get('/:id/notifications', (req, res) => {
  const patientNotifications = notifications.filter(n => n.patientId === req.params.id);
  res.json({ success: true, data: patientNotifications });
});

export default router;
