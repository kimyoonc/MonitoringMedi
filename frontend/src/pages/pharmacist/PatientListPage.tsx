import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Loading from '@/components/common/Loading'
import EmptyState from '@/components/common/EmptyState'
import Button from '@/components/common/Button'
import { api } from '@/api/client'
import { usePatientStore } from '@/store'
import styles from './PatientListPage.module.css'

const statusMap: Record<string, { label: string; variant: 'success' | 'error' | 'neutral' }> = {
  active: { label: '정상', variant: 'success' },
  adverse_reaction: { label: '이상반응', variant: 'error' },
  inactive: { label: '비활성', variant: 'neutral' },
}

export default function PatientListPage() {
  const { patients, loading, setPatients, setLoading } = usePatientStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? patients.filter(p =>
        p.name.includes(query.trim()) ||
        p.conditions?.some(c => c.includes(query.trim()))
      )
    : patients

  useEffect(() => {
    // store에 이미 환자 목록이 있으면 API 호출 스킵 (캐싱 효과)
    if (patients.length > 0) return
    setLoading(true)
    api.get('/patients').then(res => {
      setPatients(res.data.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <Header title="환자 관리" rightAction={<Button size="sm" onClick={() => navigate('/pharmacist/plans/new')}>+ 등록</Button>} />
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="이름 또는 질환으로 검색"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className={styles.content}>
        {filtered.length === 0
          ? <EmptyState title={query ? '검색 결과가 없습니다' : '등록된 환자가 없습니다'} description={query ? '' : '새 환자를 등록해주세요'} action={!query ? <Button onClick={() => navigate('/pharmacist/plans/new')}>환자 등록</Button> : undefined} />
          : filtered.map(p => {
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
