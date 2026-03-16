import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Loading from '@/components/common/Loading'
import EmptyState from '@/components/common/EmptyState'
import { api } from '@/api/client'
import type { ExchangeRecord, Patient } from '@/types'
import styles from './ExchangePage.module.css'

function reasonVariant(reason: string): 'error' | 'warning' | 'neutral' {
  if (reason === 'contamination' || reason === 'damage') return 'error'
  if (reason === 'expiry') return 'warning'
  return 'neutral'
}

export default function ExchangePage() {
  const { patientId } = useParams<{ patientId: string }>()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [exchanges, setExchanges] = useState<ExchangeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patientId) return
    Promise.all([
      api.get(`/patients/${patientId}`),
      api.get(`/exchanges?patientId=${patientId}`),
    ]).then(([pRes, eRes]) => {
      setPatient(pRes.data.data)
      setExchanges(eRes.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [patientId])

  return (
    <div>
      <Header title={`교환 이력${patient ? ` — ${patient.name}` : ''}`} showBack />
      <div className={styles.content}>
        {loading ? (
          <Loading />
        ) : exchanges.length === 0 ? (
          <EmptyState title="교환 이력이 없습니다." />
        ) : (
          exchanges.map(ex => (
            <Card key={ex.id} className={styles.historyCard}>
              <div className={styles.historyHeader}>
                <span className={styles.historyDate}>{ex.exchangeDate}</span>
                <Badge variant={reasonVariant(ex.reason)}>{ex.reasonLabel}</Badge>
              </div>
              <div className={styles.historyMeds}>
                {ex.medications.map((med, idx) => (
                  <span key={idx} className={styles.medBadge}>
                    {med.name} {med.quantity}{med.unit}
                  </span>
                ))}
              </div>
              <div className={styles.historyMethod}>처리: {ex.handlingMethod}</div>
              {ex.pharmacistNote && (
                <p className={styles.historyNote}>{ex.pharmacistNote}</p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
