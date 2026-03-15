import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Loading from '@/components/common/Loading'
import EmptyState from '@/components/common/EmptyState'
import { api } from '@/api/client'
import { useDashboardStore } from '@/store'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { data, loading, setData, setLoading } = useDashboardStore()
  const navigate = useNavigate()

  useEffect(() => {
    // store에 이미 데이터가 있으면 API 호출 스킵 (캐싱 효과)
    if (data !== null) return
    setLoading(true)
    api.get('/dashboard').then(res => {
      setData(res.data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const handlePatientClick = (patientId: string) => {
    navigate(`/pharmacist/patients/${patientId}`)
  }

  return (
    <div>
      <Header title="대시보드" />
      <div className={styles.content}>
        {/* 요약 카드 */}
        <div className={styles.summaryGrid}>
          <Card className={`${styles.summaryCard} ${styles.summaryVisit}`}>
            <div className={`${styles.summaryNumber} ${styles.visitNumber}`}>{data?.summary.todayVisits ?? 0}</div>
            <div className={styles.summaryLabel}>오늘 방문 예정</div>
          </Card>
          <Card className={`${styles.summaryCard} ${styles.summaryPending}`}>
            <div className={`${styles.summaryNumber} ${styles.pendingNumber}`}>{data?.summary.pendingDispense ?? 0}</div>
            <div className={styles.summaryLabel}>조제 대기</div>
          </Card>
          <Card className={`${styles.summaryCard} ${data?.summary.adverseReactions ? styles.alert : ''}`}>
            <div className={styles.summaryNumber}>{data?.summary.adverseReactions ?? 0}</div>
            <div className={styles.summaryLabel}>이상 반응</div>
          </Card>
        </div>

        {/* PC 3컬럼 환자 목록 섹션 */}
        <div className={styles.patientsGrid}>
          {/* 오늘 방문 예정 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>오늘 방문 예정</h2>
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
            <h2 className={styles.sectionTitle}>조제 대기 환자</h2>
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
                      <div className={styles.nextVisitDate}>
                        방문 예정일: {p.nextVisitDate}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* 이상 반응 환자 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>이상 반응 환자</h2>
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
