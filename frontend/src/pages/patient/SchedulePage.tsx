import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Loading from '@/components/common/Loading'
import EmptyState from '@/components/common/EmptyState'
import { api } from '@/api/client'
import type { Notification } from '@/types'
import styles from './SchedulePage.module.css'

interface PlanStep {
  stepNumber: number
  scheduledDate: string
  dispenseDays: number
  status: string
  visitId: string | null
}

interface Plan {
  id: string
  totalVisits: number
  steps: PlanStep[]
}

// 다음 방문일까지 남은 일수 계산
function calcDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default function SchedulePage() {
  const { patientId } = useParams<{ patientId: string }>()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patientId) {
      setLoading(false)
      return
    }
    Promise.all([
      api.get(`/patients/${patientId}/notifications`),
      api.get(`/plans?patientId=${patientId}`),
    ]).then(([nRes, pRes]) => {
      setNotifications(nRes.data.data || [])
      // API가 배열 또는 단일 객체를 반환할 수 있으므로 처리
      const planData = pRes.data.data
      setPlans(Array.isArray(planData) ? planData : planData ? [planData] : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [patientId])

  // 알림 읽음 처리
  const handleMarkRead = async (notification: Notification) => {
    if (notification.isRead) return

    try {
      await api.post(`/patients/${patientId}/notifications/read`, {
        notificationId: notification.id,
      })
      // 로컬 상태 업데이트
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      )
    } catch {
      // 읽음 처리 실패 시 조용히 무시 (UX 방해 없도록)
    }
  }

  if (loading) return <Loading />

  // 다음 예정 방문일 계산
  const nextScheduledStep = plans[0]?.steps
    ?.filter(s => s.status === 'scheduled')
    ?.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0]

  const daysUntilNext = nextScheduledStep ? calcDaysUntil(nextScheduledStep.scheduledDate) : null

  return (
    <div>
      <Header title="방문 일정" />
      <div className={styles.content}>

        {/* 다음 방문일 강조 표시 */}
        {nextScheduledStep && daysUntilNext !== null && (
          <div className={`${styles.nextVisitBanner} ${daysUntilNext <= 1 ? styles.urgent : daysUntilNext <= 3 ? styles.soon : ''}`}>
            <span className={styles.nextVisitLabel}>다음 방문</span>
            <span className={styles.nextVisitDate}>{nextScheduledStep.scheduledDate}</span>
            <Badge variant={daysUntilNext <= 1 ? 'warning' : daysUntilNext <= 3 ? 'info' : 'neutral'}>
              {daysUntilNext === 0 ? '오늘' : daysUntilNext < 0 ? `D+${Math.abs(daysUntilNext)}` : `D-${daysUntilNext}`}
            </Badge>
          </div>
        )}

        {/* 알림 섹션 */}
        <section>
          <h2 className={styles.sectionTitle}>알림</h2>
          {notifications.length === 0 ? (
            <EmptyState title="새 알림이 없습니다." />
          ) : (
            <div className={styles.notificationList}>
              {notifications.map(n => (
                <Card
                  key={n.id}
                  className={`${styles.notificationCard} ${n.isRead ? styles.read : ''} ${
                    n.daysUntilVisit === 1 ? styles.cardWarning : n.daysUntilVisit === 3 ? styles.cardInfo : ''
                  }`}
                  onClick={() => handleMarkRead(n)}
                >
                  <div className={styles.notificationHeader}>
                    {n.daysUntilVisit !== null && (
                      <Badge variant={n.daysUntilVisit === 1 ? 'warning' : 'info'}>
                        D-{n.daysUntilVisit}
                      </Badge>
                    )}
                    {n.type === 'adverse_reaction' && (
                      <Badge variant="error">이상반응</Badge>
                    )}
                    {!n.isRead && <span className={styles.unreadDot} />}
                  </div>
                  <p className={`${styles.message} ${n.daysUntilVisit === 1 ? styles.urgent : ''}`}>
                    {n.message}
                  </p>
                  <span className={styles.sentAt}>
                    {new Date(n.sentAt).toLocaleDateString('ko-KR')}
                    {n.isRead && <span className={styles.readLabel}> · 읽음</span>}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 복약 일정 섹션 */}
        <section>
          <h2 className={styles.sectionTitle}>복약 일정</h2>
          {plans.map(plan => (
            <Card key={plan?.id}>
              <h3 className={styles.planTitle}>{plan?.totalVisits}회 방문 계획</h3>
              <div className={styles.steps}>
                {plan?.steps?.map((step: PlanStep) => (
                  <div key={step.stepNumber} className={`${styles.step} ${styles[step.status]}`}>
                    <span className={styles.stepNum}>{step.stepNumber}차</span>
                    <span className={styles.stepDate}>{step.scheduledDate}</span>
                    <Badge variant={step.status === 'completed' ? 'success' : step.status === 'scheduled' ? 'info' : 'neutral'}>
                      {step.status === 'completed' ? '완료' : step.status === 'scheduled' ? '예정' : '대기'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </section>
      </div>
    </div>
  )
}
