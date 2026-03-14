import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Loading from '@/components/common/Loading'
import { api } from '@/api/client'
import styles from './DashboardPage.module.css'

interface DashboardData {
  summary: { todayVisits: number; pendingDispense: number; adverseReactions: number }
  todayVisitPatients: Array<{ patientId: string; name: string; scheduledTime: string; stepNumber: number; conditions: string[] }>
  adverseReactionPatients: Array<{ patientId: string; name: string; reportedDate: string; symptom: string }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(res => {
      setData(res.data.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <Header title="대시보드" />
      <div className={styles.content}>
        {/* 요약 카드 */}
        <div className={styles.summaryGrid}>
          <Card className={styles.summaryCard}>
            <div className={styles.summaryNumber}>{data?.summary.todayVisits}</div>
            <div className={styles.summaryLabel}>오늘 방문 예정</div>
          </Card>
          <Card className={styles.summaryCard}>
            <div className={styles.summaryNumber}>{data?.summary.pendingDispense}</div>
            <div className={styles.summaryLabel}>조제 대기</div>
          </Card>
          <Card className={`${styles.summaryCard} ${data?.summary.adverseReactions ? styles.alert : ''}`}>
            <div className={styles.summaryNumber}>{data?.summary.adverseReactions}</div>
            <div className={styles.summaryLabel}>이상 반응</div>
          </Card>
        </div>

        {/* 오늘 방문 예정 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>오늘 방문 예정</h2>
          <div className={styles.list}>
            {data?.todayVisitPatients.map(p => (
              <Card key={p.patientId} className={styles.patientCard}>
                <div className={styles.patientInfo}>
                  <div className={styles.patientName}>{p.name}</div>
                  <div className={styles.patientMeta}>
                    <span>{p.scheduledTime}</span>
                    <Badge variant="info">{p.stepNumber}차 조제</Badge>
                  </div>
                </div>
                <div className={styles.conditions}>
                  {p.conditions.map(c => <Badge key={c} variant="neutral">{c}</Badge>)}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 이상 반응 환자 */}
        {(data?.adverseReactionPatients.length ?? 0) > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>⚠️ 이상 반응 환자</h2>
            <div className={styles.list}>
              {data?.adverseReactionPatients.map(p => (
                <Card key={p.patientId} className={styles.alertCard}>
                  <div className={styles.patientName}>{p.name}</div>
                  <div className={styles.symptom}>{p.symptom}</div>
                  <div className={styles.reportDate}>신고일: {p.reportedDate}</div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
