import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import { api } from '@/api/client'
import styles from './PlanCreatePage.module.css'

export default function PlanCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    patientName: '',
    totalDays: 90,
    visitCount: 3,
  })
  const [preview, setPreview] = useState<string[]>([])

  const calcSchedule = () => {
    const today = new Date()
    const unit = Math.floor(form.totalDays / form.visitCount)
    const dates = Array.from({ length: form.visitCount }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() + unit * i)
      return `${i + 1}차: ${d.toISOString().split('T')[0]} (${unit}일분)`
    })
    setPreview(dates)
  }

  const handleSubmit = async () => {
    await api.post('/plans', { ...form, patientId: 'P001' })
    navigate('/pharmacist/patients')
  }

  return (
    <div>
      <Header title="복약 관리 계획 수립" showBack />
      <div className={styles.content}>
        <Card>
          <h2 className={styles.sectionTitle}>처방 정보 입력</h2>
          <div className={styles.form}>
            <label className={styles.label}>
              환자명
              <input className={styles.input} value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} placeholder="환자 이름 입력" />
            </label>
            <label className={styles.label}>
              총 처방 기간 (일)
              <input className={styles.input} type="number" value={form.totalDays} onChange={e => setForm({...form, totalDays: +e.target.value})} min={1} />
            </label>
            <label className={styles.label}>
              방문 횟수
              <input className={styles.input} type="number" value={form.visitCount} onChange={e => setForm({...form, visitCount: +e.target.value})} min={1} />
            </label>
            <Button variant="secondary" onClick={calcSchedule} fullWidth>일정 미리보기</Button>
          </div>
        </Card>

        {preview.length > 0 && (
          <Card>
            <h2 className={styles.sectionTitle}>방문 일정 미리보기</h2>
            <ul className={styles.schedule}>
              {preview.map((s, i) => <li key={i} className={styles.scheduleItem}>{s}</li>)}
            </ul>
          </Card>
        )}

        <Button fullWidth size="lg" onClick={handleSubmit} disabled={!form.patientName}>계획 확정 및 저장</Button>
      </div>
    </div>
  )
}
