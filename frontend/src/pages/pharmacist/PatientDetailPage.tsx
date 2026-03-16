import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import { api } from '@/api/client'
import type { Plan, Visit } from '@/types'
import AdherenceChart from '@/components/pharmacist/AdherenceChart'
import styles from './PatientDetailPage.module.css'

interface PatientData {
  id: string
  name: string
  phone: string
  address: string
  conditions: string[]
  registeredAt: string
  status: string
}

// 상태 뱃지 variant 매핑
const stepStatusVariant = (status: string) => {
  if (status === 'completed') return 'success' as const
  if (status === 'scheduled') return 'info' as const
  return 'neutral' as const
}

const stepStatusLabel = (status: string) => {
  if (status === 'completed') return '완료'
  if (status === 'scheduled') return '예정'
  return '대기'
}

const adherenceLabel = (val: string) => ({ good: '양호', fair: '보통', poor: '불량' }[val] || val)
const storageLabel = (val: string) => ({ good: '양호', poor: '불량', damaged: '훼손' }[val] || val)

export default function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [patient, setPatient] = useState<PatientData | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/patients/${id}`),
      api.get(`/patients/${id}/visits`),
      api.get(`/plans?patientId=${id}`),
    ]).then(([pRes, vRes, plRes]) => {
      setPatient(pRes.data.data)
      setVisits(vRes.data.data || [])
      setPlans(plRes.data.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <Loading />

  // 활성 계획 (완료되지 않은 단계가 있는 계획)
  const activePlan = plans.find(p =>
    p.steps.some(s => s.status !== 'completed')
  )

  return (
    <div>
      <Header title={patient?.name || '환자 상세'} showBack />
      <div className={styles.content}>

        {/* 기본 정보 */}
        <Card>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          <dl className={styles.info}>
            <dt>연락처</dt><dd>{patient?.phone}</dd>
            <dt>주소</dt><dd>{patient?.address}</dd>
            <dt>주요 질환</dt><dd>{patient?.conditions?.join(', ')}</dd>
          </dl>
        </Card>

        {/* 복약 관리 계획 섹션 */}
        {activePlan ? (
          <section>
            <h2 className={styles.sectionTitle}>복약 관리 계획</h2>
            <Card>
              <div className={styles.planMeta}>
                <span className={styles.planId}>계획 ID: {activePlan.id}</span>
                <span className={styles.planUnit}>기본 조제단위: {activePlan.dispensingUnit}일</span>
              </div>

              {/* 의약품 목록 */}
              {activePlan.medications && activePlan.medications.length > 0 && (
                <div className={styles.medicationList}>
                  {activePlan.medications.map((med, idx) => (
                    <span key={idx} className={styles.medicationBadge}>
                      {med.name}
                    </span>
                  ))}
                </div>
              )}

              {/* 단계 타임라인 */}
              <ul className={styles.timeline}>
                {activePlan.steps.map(step => {
                  const canDispense = step.canDispense !== false
                    ? (step.stepNumber === 1 || activePlan.steps[step.stepNumber - 2]?.visitId !== null)
                    : false

                  return (
                    <li key={step.stepNumber} className={styles.timelineItem}>
                      <div className={styles.timelineLeft}>
                        <span className={styles.timelineStep}>{step.stepNumber}차</span>
                        <div className={styles.timelineConnector} />
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineHeader}>
                          <span className={styles.timelineDate}>{step.scheduledDate}</span>
                          <Badge variant={stepStatusVariant(step.status)}>
                            {stepStatusLabel(step.status)}
                          </Badge>
                        </div>
                        <p className={styles.timelineDays}>{step.dispenseDays}일분</p>

                        {step.status === 'completed' && step.visitId && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/pharmacist/visits/${step.visitId}`)}
                          >
                            방문 기록 보기
                          </Button>
                        )}

                        {step.status !== 'completed' && (
                          canDispense ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/pharmacist/patients/${id}/visits/new?planId=${activePlan.id}&step=${step.stepNumber}`
                                )
                              }
                            >
                              방문 기록 작성
                            </Button>
                          ) : (
                            <span className={styles.disabledHint}>이전 방문 기록 필요</span>
                          )
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Card>
          </section>
        ) : (
          <div className={styles.actions}>
            <Button
              fullWidth
              onClick={() => navigate(`/pharmacist/patients/${id}/plans/new`)}
            >
              복약 관리 계획 수립
            </Button>
          </div>
        )}

        {/* 교환 이력 조회 */}
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => navigate(`/pharmacist/patients/${id}/exchanges`)}
          >
            교환 이력 조회
          </Button>
        </div>

        {/* 복약 순응도 차트 */}
        {visits.length > 0 && (
          <Card>
            <AdherenceChart visits={visits} />
          </Card>
        )}

        {/* 방문 이력 */}
        <section>
          <h2 className={styles.sectionTitle}>방문 이력</h2>
          {visits.length === 0 ? (
            <p className={styles.empty}>방문 이력이 없습니다.</p>
          ) : (
            visits.map(v => (
              <Card
                key={v.id}
                className={styles.visitCard}
                onClick={() => navigate(`/pharmacist/visits/${v.id}`)}
              >
                <div className={styles.visitHeader}>
                  <span className={styles.visitDate}>{v.visitDate}</span>
                  <div className={styles.visitBadges}>
                    <Badge variant={v.adverseReaction ? 'error' : 'success'}>
                      {v.adverseReaction ? '이상반응' : '정상'}
                    </Badge>
                    {v.storageCondition && (
                      <Badge variant={v.storageCondition === 'good' ? 'success' : 'error'}>
                        보관: {storageLabel(v.storageCondition)}
                      </Badge>
                    )}
                    {v.adherence && (
                      <Badge variant={v.adherence === 'good' ? 'success' : v.adherence === 'poor' ? 'error' : 'warning'}>
                        순응도: {adherenceLabel(v.adherence)}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className={styles.visitStep}>{v.stepNumber}차 방문</p>
                {v.pharmacistNote && <p className={styles.note}>{v.pharmacistNote}</p>}
              </Card>
            ))
          )}
        </section>
      </div>
    </div>
  )
}
