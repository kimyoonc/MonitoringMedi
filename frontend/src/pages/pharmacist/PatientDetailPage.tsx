import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import { api } from '@/api/client'
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

interface VisitData {
  id: string
  visitDate: string
  stepNumber: number
  adherence: string
  adverseReaction: boolean
  pharmacistNote: string
}

export default function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [visits, setVisits] = useState<VisitData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/patients/${id}`),
      api.get(`/patients/${id}/visits`),
    ]).then(([pRes, vRes]) => {
      setPatient(pRes.data.data)
      setVisits(vRes.data.data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <Loading />

  return (
    <div>
      <Header title={patient?.name || '환자 상세'} showBack />
      <div className={styles.content}>
        <Card>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          <dl className={styles.info}>
            <dt>연락처</dt><dd>{patient?.phone}</dd>
            <dt>주소</dt><dd>{patient?.address}</dd>
            <dt>주요 질환</dt><dd>{patient?.conditions?.join(', ')}</dd>
          </dl>
        </Card>
        <div className={styles.actions}>
          <Button fullWidth onClick={() => navigate('/pharmacist/plans/new')}>복약 관리 계획 수립</Button>
        </div>
        <section>
          <h2 className={styles.sectionTitle}>방문 이력</h2>
          {visits.length === 0
            ? <p className={styles.empty}>방문 이력이 없습니다.</p>
            : visits.map(v => (
                <Card key={v.id} className={styles.visitCard}>
                  <div className={styles.visitHeader}>
                    <span className={styles.visitDate}>{v.visitDate}</span>
                    <Badge variant={v.adverseReaction ? 'error' : 'success'}>{v.adverseReaction ? '이상반응' : '정상'}</Badge>
                  </div>
                  <p className={styles.note}>{v.pharmacistNote}</p>
                </Card>
              ))
          }
        </section>
      </div>
    </div>
  )
}
