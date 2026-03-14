import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Loading from '@/components/common/Loading'
import { api } from '@/api/client'
import styles from './SchedulePage.module.css'

interface Notification {
  id: string
  patientId: string
  type: string
  daysUntilVisit: number
  scheduledVisitDate: string
  message: string
  sentAt: string
  isRead: boolean
}

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

export default function SchedulePage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const PATIENT_ID = 'P001'

  useEffect(() => {
    Promise.all([
      api.get(`/patients/${PATIENT_ID}/notifications`),
      api.get('/plans/PL001'),
    ]).then(([nRes, pRes]) => {
      setNotifications(nRes.data.data)
      setPlans([pRes.data.data])
      setLoading(false)
    })
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <Header title="방문 일정" />
      <div className={styles.content}>
        {notifications.length > 0 && (
          <section>
            <h2 className={styles.sectionTitle}>📬 알림</h2>
            {notifications.map(n => (
              <Card key={n.id} className={styles.notificationCard}>
                <Badge variant={n.daysUntilVisit === 1 ? 'warning' : 'info'}>D-{n.daysUntilVisit}</Badge>
                <p className={styles.message}>{n.message}</p>
              </Card>
            ))}
          </section>
        )}
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
