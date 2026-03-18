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

  const handlePatientRole = async () => {
    setLoadingPatients(true)
    setStep('patient-select')
    try {
      const res = await api.get('/patients')
      const all: PatientSummary[] = res.data.data || []
      setPatients(all.filter(p => p.name === '이나영'))
    } catch {
      setPatients([])
    } finally {
      setLoadingPatients(false)
    }
  }

  const handleSelectPatient = (patientId: string) => {
    navigate(`/patient/${patientId}`)
  }

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

  return (
    <div className={styles.page} onClick={() => navigate('/pharmacist')}>
      {/* ── 인트로 섹션 ── */}
      <div className={styles.introSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>분할조제 시스템</div>
          <h2 className={styles.introTitle}>하나의 처방전을<br /><em className={styles.em}>나눠서</em> 조제합니다</h2>
          <p className={styles.introSub}>장기 처방 의약품의 단계적 조제와 복약 관리</p>
        </div>

        {/* 알약 비주얼 */}
        <div className={styles.pillVisual}>
          <div className={styles.pillWrap}>
            <div className={`${styles.pillHalf} ${styles.pillLeft}`}>1차 조제</div>
            <div className={styles.pillDivider} />
            <div className={`${styles.pillHalf} ${styles.pillRight}`}>2차 조제</div>
          </div>
          <div className={styles.pillArrow} />
          <div className={styles.pillWrap}>
            <div className={`${styles.pillHalf} ${styles.pillLeft}`} style={{ background: 'linear-gradient(135deg,#f39c12,#e67e22)' }}>2차 조제</div>
            <div className={styles.pillDivider} />
            <div className={`${styles.pillHalf} ${styles.pillRight}`} style={{ background: 'linear-gradient(135deg,#34a853,#00bcd4)' }}>3차 조제</div>
          </div>
        </div>

        {/* 3단계 */}
        <div className={styles.steps}>
          <div className={styles.stepCard}>
            <div className={`${styles.stepNum} ${styles.stepNum1}`}>1</div>
            <span className={styles.stepIcon}>📋</span>
            <div className={styles.stepTitle}>처방 접수</div>
            <div className={styles.stepDesc}>180일 장기처방전<br />분할 계획 수립</div>
          </div>
          <div className={styles.stepCard}>
            <div className={`${styles.stepNum} ${styles.stepNum2}`}>2</div>
            <span className={styles.stepIcon}>💊</span>
            <div className={styles.stepTitle}>단계적 조제</div>
            <div className={styles.stepDesc}>60일씩 나눠<br />단계별 조제 진행</div>
          </div>
          <div className={styles.stepCard}>
            <div className={`${styles.stepNum} ${styles.stepNum3}`}>3</div>
            <span className={styles.stepIcon}>✅</span>
            <div className={styles.stepTitle}>복약 완료</div>
            <div className={styles.stepDesc}>복약 이력 기록<br />다음 조제 알림</div>
          </div>
        </div>

        {/* 진행 현황 바 */}
        <div className={styles.splitBarSection}>
          <div className={styles.splitBarHeader}>
            <span className={styles.splitBarTitle}>아토르바스타틴 180일 분할조제 현황</span>
            <span className={styles.splitBadge}>진행중</span>
          </div>
          <div className={styles.splitBars}>
            <div className={styles.barRow}>
              <span className={styles.barLabel}>1차 조제</span>
              <div className={styles.barTrack}><div className={`${styles.barFill} ${styles.barFill1}`} /></div>
              <span className={styles.barValue}>60일</span>
              <span className={`${styles.barStatus} ${styles.barStatus1}`}>완료</span>
            </div>
            <div className={styles.barRow}>
              <span className={styles.barLabel}>2차 조제</span>
              <div className={styles.barTrack}><div className={`${styles.barFill} ${styles.barFill2}`} /></div>
              <span className={styles.barValue}>60일</span>
              <span className={`${styles.barStatus} ${styles.barStatus2}`}>완료</span>
            </div>
            <div className={styles.barRow}>
              <span className={styles.barLabel}>3차 조제</span>
              <div className={styles.barTrack}><div className={`${styles.barFill} ${styles.barFill3}`} /></div>
              <span className={styles.barValue}>60일</span>
              <span className={`${styles.barStatus} ${styles.barStatus3}`}>진행중</span>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className={styles.statRow}>
          <div className={styles.statCard}>
            <div className={`${styles.statNum} ${styles.statNum1}`}>180일</div>
            <div className={styles.statLabel}>총 처방일수</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statNum} ${styles.statNum2}`}>3회</div>
            <div className={styles.statLabel}>분할 조제 횟수</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statNum} ${styles.statNum3}`}>67%</div>
            <div className={styles.statLabel}>복약 진행률</div>
          </div>
        </div>
      </div>

      {/* ── 역할 선택 ── */}
      <div className={styles.hero}>
        <div className={styles.logoMark}>💊</div>
        <h1 className={styles.title}>장기처방 의약품<br />분할조제 복약 관리</h1>
        <p className={styles.subtitle}>역할을 선택해주세요</p>
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
        <button className={`${styles.roleCard} ${styles.patient}`} onClick={e => { e.stopPropagation(); handlePatientRole() }}>
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
