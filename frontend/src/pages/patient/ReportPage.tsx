import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import styles from './ReportPage.module.css'

export default function ReportPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ symptom: '', severity: 'mild', note: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => navigate('/patient'), 2000)
  }

  if (submitted) {
    return (
      <div className={styles.submitted}>
        <div className={styles.checkIcon}>✅</div>
        <h2>신고가 접수되었습니다</h2>
        <p>약사에게 전달되었습니다.</p>
      </div>
    )
  }

  return (
    <div>
      <Header title="이상 반응 신고" showBack />
      <div className={styles.content}>
        <Card>
          <div className={styles.form}>
            <label className={styles.label}>
              증상
              <input className={styles.input} value={form.symptom} onChange={e => setForm({...form, symptom: e.target.value})} placeholder="예: 어지럼증, 구역감" />
            </label>
            <label className={styles.label}>
              증상 강도
              <select className={styles.select} value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                <option value="mild">경미</option>
                <option value="moderate">중간</option>
                <option value="severe">심각</option>
              </select>
            </label>
            <label className={styles.label}>
              추가 설명
              <textarea className={styles.textarea} value={form.note} onChange={e => setForm({...form, note: e.target.value})} rows={4} placeholder="증상 발생 시점, 상황 등 자세히 작성해주세요" />
            </label>
          </div>
        </Card>
        <Button fullWidth size="lg" onClick={handleSubmit} disabled={!form.symptom}>신고 접수</Button>
      </div>
    </div>
  )
}
