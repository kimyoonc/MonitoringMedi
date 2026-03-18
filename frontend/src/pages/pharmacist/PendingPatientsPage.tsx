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

function getKstToday() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
}

export default function PendingPatientsPage() {
  const { data, loading, setData, setLoading } = useDashboardStore()
  const navigate = useNavigate()
  const today = getKstToday()

  useEffect(() => {
    if (data?.date === today) return
    setLoading(true)
    api.get(`/dashboard?date=${today}`).then(res => {
      setData(res.data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [today])

  const patients = data?.pendingDispensePatients ?? []

  return (
    <div>
      <Header title="조제 대기" />
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💊</span>
            조제 미완료 · {patients.length}명
          </div>

          {loading && <Loading />}

          {!loading && patients.length === 0 && (
            <EmptyState title="조제 대기 환자가 없습니다." />
          )}

          {patients.length > 0 && (
            <div className={styles.list}>
              {patients.map(p => (
                <Card
                  key={p.patientId}
                  className={`${styles.patientCard} ${styles.clickable} ${p.daysOverdue && p.daysOverdue > 0 ? styles.overdueCard : ''}`}
                  onClick={() => navigate(`/pharmacist/patients/${p.patientId}`)}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
