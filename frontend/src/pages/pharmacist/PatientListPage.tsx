import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Loading from '@/components/common/Loading'
import EmptyState from '@/components/common/EmptyState'
import Button from '@/components/common/Button'
import { api } from '@/api/client'
import styles from './PatientListPage.module.css'

interface Patient {
  id: string
  name: string
  conditions: string[]
  status: string
  registeredAt: string
}

const statusMap: Record<string, { label: string; variant: 'success' | 'error' | 'neutral' }> = {
  active: { label: '정상', variant: 'success' },
  adverse_reaction: { label: '이상반응', variant: 'error' },
  inactive: { label: '비활성', variant: 'neutral' },
}

export default function PatientListPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/patients').then(res => {
      setPatients(res.data.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <Header title="환자 관리" rightAction={<Button size="sm" onClick={() => navigate('/pharmacist/plans/new')}>+ 등록</Button>} />
      <div className={styles.content}>
        {patients.length === 0
          ? <EmptyState title="등록된 환자가 없습니다" description="새 환자를 등록해주세요" action={<Button onClick={() => navigate('/pharmacist/plans/new')}>환자 등록</Button>} />
          : patients.map(p => {
              const s = statusMap[p.status] || statusMap.inactive
              return (
                <Card key={p.id} onClick={() => navigate(`/pharmacist/patients/${p.id}`)} className={styles.patientCard}>
                  <div className={styles.row}>
                    <span className={styles.name}>{p.name}</span>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </div>
                  <div className={styles.conditions}>
                    {p.conditions.map(c => <Badge key={c} variant="neutral">{c}</Badge>)}
                  </div>
                  <div className={styles.date}>등록일: {p.registeredAt}</div>
                </Card>
              )
            })
        }
      </div>
    </div>
  )
}
