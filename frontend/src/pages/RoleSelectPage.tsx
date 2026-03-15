import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import styles from './RoleSelectPage.module.css'

interface PatientSummary {
  id: string
  name: string
}

export default function RoleSelectPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'role' | 'patient-select'>('role')
  const [patients, setPatients] = useState<PatientSummary[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)

  // 환자 역할 선택 시 환자 목록 API 호출
  const handlePatientRole = async () => {
    setLoadingPatients(true)
    setStep('patient-select')
    try {
      const res = await api.get('/patients')
      setPatients(res.data.data || [])
    } catch {
      setPatients([])
    } finally {
      setLoadingPatients(false)
    }
  }

  // 환자 선택 시 해당 환자 페이지로 이동
  const handleSelectPatient = (patientId: string) => {
    navigate(`/patient/${patientId}`)
  }

  // 환자 선택 단계 렌더링
  if (step === 'patient-select') {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.logoMark}>🏥</div>
          <h1 className={styles.title}>환자 선택</h1>
          <p className={styles.subtitle}>복약 일정을 확인할 환자를 선택해주세요</p>
        </div>
        <div className={styles.roles}>
          {loadingPatients ? (
            <p style={{ color: 'var(--label-secondary)', textAlign: 'center', fontSize: '15px' }}>불러오는 중…</p>
          ) : patients.length === 0 ? (
            <p style={{ color: 'var(--label-secondary)', textAlign: 'center', fontSize: '15px' }}>등록된 환자가 없습니다.</p>
          ) : (
            patients.map(patient => (
              <button
                key={patient.id}
                className={`${styles.roleCard} ${styles.patient}`}
                onClick={() => handleSelectPatient(patient.id)}
              >
                <div className={styles.roleIconWrap}>👤</div>
                <div className={styles.roleText}>
                  <div className={styles.roleName}>{patient.name}</div>
                  <div className={styles.roleDesc}>{patient.id}</div>
                </div>
                <span className={styles.roleArrow}>›</span>
              </button>
            ))
          )}
        </div>
        <button
          onClick={() => setStep('role')}
          style={{
            marginTop: 'var(--spacing-lg)',
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            fontSize: '15px',
            fontFamily: 'var(--font-family)',
            letterSpacing: '-0.015em',
          }}
        >
          ← 돌아가기
        </button>
      </div>
    )
  }

  // 역할 선택 단계 렌더링
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.logoMark}>💊</div>
        <h1 className={styles.title}>장기처방 의약품<br />분할조제 복약 관리</h1>
        <p className={styles.subtitle}>장기 처방 의약품의 단계적 조제와 복약 관리</p>
      </div>
      <div className={styles.roles}>
        <button className={`${styles.roleCard} ${styles.pharmacist}`} onClick={() => navigate('/pharmacist')}>
          <div className={styles.roleIconWrap}>💊</div>
          <div className={styles.roleText}>
            <div className={styles.roleName}>약사</div>
            <div className={styles.roleDesc}>환자 관리 및 조제</div>
          </div>
          <span className={styles.roleArrow}>›</span>
        </button>
        <button className={`${styles.roleCard} ${styles.patient}`} onClick={handlePatientRole}>
          <div className={styles.roleIconWrap}>🏥</div>
          <div className={styles.roleText}>
            <div className={styles.roleName}>환자</div>
            <div className={styles.roleDesc}>일정 확인 및 신고</div>
          </div>
          <span className={styles.roleArrow}>›</span>
        </button>
      </div>
    </div>
  )
}
