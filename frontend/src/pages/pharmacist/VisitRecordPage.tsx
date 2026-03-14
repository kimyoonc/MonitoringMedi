import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import { api } from '@/api/client'
import styles from './VisitRecordPage.module.css'

interface VisitData {
  id: string
  patientId: string
  visitDate: string
  stepNumber: number
  adherence: string
  adverseReaction: boolean
  adverseReactionNote: string | null
  pharmacistNote: string
}

export default function VisitRecordPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [visit, setVisit] = useState<VisitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ adherence: 'good', adverseReaction: false, adverseReactionNote: '', pharmacistNote: '' })

  useEffect(() => {
    api.get(`/visits/${id}`).then(res => {
      setVisit(res.data.data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <Loading />

  return (
    <div>
      <Header title="방문 기록" showBack />
      <div className={styles.content}>
        <Card>
          <h2 className={styles.sectionTitle}>복약 상태 기록</h2>
          <div className={styles.form}>
            <label className={styles.label}>
              복약 순응도
              <select className={styles.select} value={form.adherence} onChange={e => setForm({...form, adherence: e.target.value})}>
                <option value="good">양호</option>
                <option value="fair">보통</option>
                <option value="poor">불량</option>
              </select>
            </label>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={form.adverseReaction} onChange={e => setForm({...form, adverseReaction: e.target.checked})} />
              이상 반응 발생
            </label>
            {form.adverseReaction && (
              <textarea className={styles.textarea} placeholder="이상 반응 내용 입력" value={form.adverseReactionNote} onChange={e => setForm({...form, adverseReactionNote: e.target.value})} rows={3} />
            )}
            <label className={styles.label}>
              약사 메모
              <textarea className={styles.textarea} value={form.pharmacistNote} onChange={e => setForm({...form, pharmacistNote: e.target.value})} rows={3} placeholder="상담 내용 기록" />
            </label>
          </div>
        </Card>
        {visit && (
          <Card>
            <h2 className={styles.sectionTitle}>방문 정보</h2>
            <p className={styles.visitInfo}>방문일: {visit.visitDate}</p>
            <p className={styles.visitInfo}>{visit.stepNumber}차 방문</p>
          </Card>
        )}
        <Button fullWidth size="lg" onClick={() => navigate(-1)}>방문 기록 저장</Button>
      </div>
    </div>
  )
}
