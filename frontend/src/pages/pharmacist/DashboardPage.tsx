import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Loading from '@/components/common/Loading'
import EmptyState from '@/components/common/EmptyState'
import { api } from '@/api/client'
import { useDashboardStore } from '@/store'
import styles from './DashboardPage.module.css'

const IconCalendar = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="24" height="21" rx="5" fill="currentColor" fillOpacity="0.15"/>
    <rect x="2" y="5" width="24" height="21" rx="5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M2 12h24" stroke="currentColor" strokeWidth="1.8"/>
    <rect x="8" y="16" width="3" height="3" rx="1" fill="currentColor"/>
    <rect x="12.5" y="16" width="3" height="3" rx="1" fill="currentColor"/>
    <rect x="17" y="16" width="3" height="3" rx="1" fill="currentColor"/>
    <path d="M9 2v5M19 2v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconPill = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="10" width="22" height="8" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M14 10v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="8" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="20" cy="14" r="1.5" fill="currentColor"/>
  </svg>
)

const IconHeart = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 24s-11-6.5-11-13a6 6 0 0 1 11-3.354A6 6 0 0 1 25 11c0 6.5-11 13-11 13z"
      fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M9 14h2l2-3 2 5 2-2h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// KST 기준 오늘 날짜
function getKstToday() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
}

export default function DashboardPage() {
  const { data, loading, setData, setLoading } = useDashboardStore()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(getKstToday)

  useEffect(() => {
    setLoading(true)
    api.get(`/dashboard?date=${selectedDate}`).then(res => {
      setData(res.data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [selectedDate])

  if (loading) return <Loading />

  const handlePatientClick = (patientId: string) => {
    navigate(`/pharmacist/patients/${patientId}`)
  }

  return (
    <div>
      <Header title="대시보드" />
      <div className={styles.content}>
        {/* 날짜 선택 */}
        <div className={styles.dateBar}>
          <button
            className={styles.dateNavBtn}
            onClick={() => setSelectedDate(d => {
              const prev = new Date(d); prev.setDate(prev.getDate() - 1); return prev.toISOString().split('T')[0]
            })}
          >‹</button>
          <input
            type="date"
            className={styles.dateInput}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
          <button
            className={`${styles.dateNavBtn} ${selectedDate === getKstToday() ? styles.dateNavDisabled : ''}`}
            onClick={() => setSelectedDate(d => {
              const next = new Date(d); next.setDate(next.getDate() + 1); return next.toISOString().split('T')[0]
            })}
            disabled={selectedDate === getKstToday()}
          >›</button>
        </div>

        {/* 요약 카드 */}
        <div className={styles.summaryGrid}>
          <Card className={`${styles.summaryCard} ${styles.summaryVisit}`}>
            <div className={`${styles.summaryIcon} ${styles.iconVisit}`}>
              <IconCalendar />
            </div>
            <div className={`${styles.summaryNumber} ${styles.visitNumber}`}>
              {data?.summary.todayVisits ?? 0}
            </div>
            <div className={styles.summaryLabel}>오늘 방문</div>
          </Card>

          <Card className={`${styles.summaryCard} ${styles.summaryPending}`}>
            <div className={`${styles.summaryIcon} ${styles.iconPending}`}>
              <IconPill />
            </div>
            <div className={`${styles.summaryNumber} ${styles.pendingNumber}`}>
              {data?.summary.pendingDispense ?? 0}
            </div>
            <div className={styles.summaryLabel}>조제 대기</div>
          </Card>

          <Card className={`${styles.summaryCard} ${data?.summary.adverseReactions ? styles.alert : styles.summaryAlert}`}>
            <div className={`${styles.summaryIcon} ${styles.iconAlert}`}>
              <IconHeart />
            </div>
            <div className={`${styles.summaryNumber} ${data?.summary.adverseReactions ? styles.alertNumber : ''}`}>
              {data?.summary.adverseReactions ?? 0}
            </div>
            <div className={styles.summaryLabel}>이상 반응</div>
          </Card>
        </div>

        {/* PC 3컬럼 환자 목록 섹션 */}
        <div className={styles.patientsGrid}>
          {/* 오늘 방문 예정 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📅</span>
              오늘 방문 예정
            </h2>
            <div className={styles.list}>
              {(data?.todayVisitPatients?.length ?? 0) === 0 ? (
                <EmptyState title="오늘 방문 예정 환자가 없습니다." />
              ) : (
                data?.todayVisitPatients.map(p => (
                  <Card
                    key={p.patientId}
                    className={`${styles.patientCard} ${styles.clickable}`}
                    onClick={() => handlePatientClick(p.patientId)}
                  >
                    <div className={styles.patientInfo}>
                      <div className={styles.patientName}>{p.name}</div>
                      <div className={styles.patientMeta}>
                        <span>{p.scheduledTime}</span>
                        <Badge variant="info">{p.stepNumber}차 조제</Badge>
                      </div>
                    </div>
                    {p.conditions && (
                      <div className={styles.conditions}>
                        {p.conditions.map(c => <Badge key={c} variant="neutral">{c}</Badge>)}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* 조제 대기 환자 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💊</span>
              조제 대기 환자
            </h2>
            <div className={styles.list}>
              {(data?.pendingDispensePatients?.length ?? 0) === 0 ? (
                <EmptyState title="조제 대기 환자가 없습니다." />
              ) : (
                data?.pendingDispensePatients.map(p => (
                  <Card
                    key={p.patientId}
                    className={`${styles.patientCard} ${styles.clickable} ${p.daysOverdue && p.daysOverdue > 0 ? styles.overdueCard : ''}`}
                    onClick={() => handlePatientClick(p.patientId)}
                  >
                    <div className={styles.patientInfo}>
                      <div className={styles.patientName}>{p.name}</div>
                      <div className={styles.patientMeta}>
                        {p.daysOverdue !== undefined && p.daysOverdue > 0 ? (
                          <Badge variant="error">기간 초과 {p.daysOverdue}일</Badge>
                        ) : (
                          <Badge variant="warning">{p.stepNumber}차 대기</Badge>
                        )}
                      </div>
                    </div>
                    {p.nextVisitDate && (
                      <div className={styles.nextVisitDate}>방문 예정일: {p.nextVisitDate}</div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* 이상 반응 환자 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🚨</span>
              이상 반응 환자
            </h2>
            <div className={styles.list}>
              {(data?.adverseReactionPatients?.length ?? 0) === 0 ? (
                <EmptyState title="이상 반응 환자가 없습니다." />
              ) : (
                data?.adverseReactionPatients.map(p => (
                  <Card
                    key={p.patientId}
                    className={`${styles.alertCard} ${styles.clickable}`}
                    onClick={() => handlePatientClick(p.patientId)}
                  >
                    <div className={styles.patientName}>{p.name}</div>
                    {p.symptom && <div className={styles.symptom}>{p.symptom}</div>}
                    {p.reportedDate && <div className={styles.reportDate}>신고일: {p.reportedDate}</div>}
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
