import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import { api } from '@/api/client'
import type { Patient, MedicationInput } from '@/types'
import styles from './PlanCreatePage.module.css'

interface StepPreview {
  stepNumber: number
  date: string
  days: number
}

export default function PlanCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { id: patientIdFromPath } = useParams<{ id: string }>()
  // 라우트 파라미터 우선, 없으면 쿼리스트링 확인
  const patientIdFromQuery = patientIdFromPath || searchParams.get('patientId') || ''

  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState(patientIdFromQuery)
  const [totalDays, setTotalDays] = useState(90)
  const [visitCount, setVisitCount] = useState(3)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [medications, setMedications] = useState<MedicationInput[]>([
    { name: '', category: '', dailyDose: 1, unit: '정', instructions: '' },
  ])
  const [preview, setPreview] = useState<StepPreview[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 환자 목록 로드
  useEffect(() => {
    api.get('/patients').then(res => {
      setPatients(res.data.data || [])
    })
  }, [])

  // 일정 미리보기 계산
  const calcSchedule = () => {
    if (!totalDays || !visitCount) return
    if (visitCount > totalDays) {
      setError('방문 횟수는 총 처방 기간보다 클 수 없습니다.')
      setPreview([])
      return
    }
    setError('')

    const unit = Math.floor(totalDays / visitCount)
    const remainder = totalDays % visitCount
    const base = new Date(startDate)

    const steps: StepPreview[] = Array.from({ length: visitCount }, (_, i) => {
      const date = new Date(base)
      date.setDate(date.getDate() + unit * i)
      const days = i === visitCount - 1 ? unit + remainder : unit
      return {
        stepNumber: i + 1,
        date: date.toISOString().split('T')[0],
        days,
      }
    })
    setPreview(steps)
  }

  // 의약품 항목 추가
  const addMedication = () => {
    setMedications(prev => [
      ...prev,
      { name: '', category: '', dailyDose: 1, unit: '정', instructions: '' },
    ])
  }

  // 의약품 항목 삭제
  const removeMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index))
  }

  // 의약품 필드 변경
  const updateMedication = (index: number, field: keyof MedicationInput, value: string | number) => {
    setMedications(prev =>
      prev.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    )
  }

  // 유효성 검사
  const validate = (): boolean => {
    if (!selectedPatientId) {
      setError('환자를 선택해주세요.')
      return false
    }
    if (totalDays <= 0) {
      setError('총 처방 기간은 1일 이상이어야 합니다.')
      return false
    }
    if (visitCount < 1) {
      setError('방문 횟수는 1회 이상이어야 합니다.')
      return false
    }
    if (visitCount > totalDays) {
      setError('방문 횟수는 총 처방 기간보다 클 수 없습니다.')
      return false
    }
    return true
  }

  // 계획 저장
  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setError('')

    try {
      await api.post('/plans', {
        patientId: selectedPatientId,
        totalDays,
        visitCount,
        startDate,
        medications: medications.filter(m => m.name.trim() !== ''),
      })
      navigate(`/pharmacist/patients/${selectedPatientId}`)
    } catch (err: any) {
      const msg = err.response?.data?.error || '계획 저장 중 오류가 발생했습니다.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedPatient = patients.find(p => p.id === selectedPatientId)

  return (
    <div>
      <Header title="복약 관리 계획 수립" showBack />
      <div className={styles.content}>

        {/* 환자 선택 */}
        <Card>
          <h2 className={styles.sectionTitle}>환자 선택</h2>
          <div className={styles.form}>
            <label className={styles.label}>
              환자
              <select
                className={styles.select}
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
              >
                <option value="">-- 환자 선택 --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </label>
            {selectedPatient && (
              <div className={styles.patientInfo}>
                <span className={styles.patientInfoItem}>연락처: {selectedPatient.phone}</span>
                <span className={styles.patientInfoItem}>질환: {selectedPatient.conditions?.join(', ')}</span>
              </div>
            )}
          </div>
        </Card>

        {/* 처방 정보 입력 */}
        <Card>
          <h2 className={styles.sectionTitle}>처방 정보 입력</h2>
          <div className={styles.form}>
            <label className={styles.label}>
              총 처방 기간 (일)
              <input
                className={styles.input}
                type="number"
                value={totalDays}
                onChange={e => setTotalDays(+e.target.value)}
                min={1}
              />
            </label>
            <label className={styles.label}>
              방문 횟수
              <input
                className={styles.input}
                type="number"
                value={visitCount}
                onChange={e => setVisitCount(+e.target.value)}
                min={1}
              />
            </label>
            <label className={styles.label}>
              시작일
              <input
                className={styles.input}
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </label>
          </div>
        </Card>

        {/* 의약품 목록 */}
        <Card>
          <div className={styles.medicationHeader}>
            <h2 className={styles.sectionTitle}>의약품 목록</h2>
            <Button variant="secondary" size="sm" onClick={addMedication}>+ 추가</Button>
          </div>
          {medications.map((med, idx) => (
            <div key={idx} className={styles.medicationItem}>
              <div className={styles.medicationRow}>
                <label className={styles.label}>
                  의약품명
                  <input
                    className={styles.input}
                    value={med.name}
                    onChange={e => updateMedication(idx, 'name', e.target.value)}
                    placeholder="예: 암로디핀 5mg"
                  />
                </label>
                <label className={styles.label}>
                  분류
                  <input
                    className={styles.input}
                    value={med.category}
                    onChange={e => updateMedication(idx, 'category', e.target.value)}
                    placeholder="예: 고혈압"
                  />
                </label>
              </div>
              <div className={styles.medicationRow}>
                <label className={styles.label}>
                  1일 복용량
                  <input
                    className={styles.input}
                    type="number"
                    value={med.dailyDose}
                    onChange={e => updateMedication(idx, 'dailyDose', +e.target.value)}
                    min={1}
                  />
                </label>
                <label className={styles.label}>
                  단위
                  <select
                    className={styles.select}
                    value={med.unit}
                    onChange={e => updateMedication(idx, 'unit', e.target.value)}
                  >
                    <option value="정">정</option>
                    <option value="캡슐">캡슐</option>
                    <option value="ml">ml</option>
                    <option value="포">포</option>
                  </select>
                </label>
              </div>
              <label className={styles.label}>
                복용 지시사항
                <input
                  className={styles.input}
                  value={med.instructions}
                  onChange={e => updateMedication(idx, 'instructions', e.target.value)}
                  placeholder="예: 아침 식후 복용"
                />
              </label>
              {medications.length > 1 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeMedication(idx)}
                  className={styles.removeBtn}
                >
                  삭제
                </Button>
              )}
            </div>
          ))}
        </Card>

        {/* 일정 미리보기 버튼 */}
        <Button variant="secondary" onClick={calcSchedule} fullWidth>
          일정 미리보기
        </Button>

        {/* 미리보기 결과 */}
        {preview.length > 0 && (
          <Card>
            <h2 className={styles.sectionTitle}>방문 일정 미리보기</h2>
            <ul className={styles.schedule}>
              {preview.map(step => (
                <li key={step.stepNumber} className={styles.scheduleItem}>
                  <span className={styles.stepBadge}>{step.stepNumber}차</span>
                  <span className={styles.stepDate}>{step.date}</span>
                  <span className={styles.stepDays}>{step.days}일분</span>
                  {step.stepNumber === preview.length && totalDays % visitCount > 0 && (
                    <span className={styles.remainder}>+{totalDays % visitCount}일 잔여</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* 오류 메시지 */}
        {error && <p className={styles.error}>{error}</p>}

        {/* 저장 버튼 */}
        <Button
          fullWidth
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedPatientId || submitting}
        >
          {submitting ? '저장 중...' : '계획 확정 및 저장'}
        </Button>
      </div>
    </div>
  )
}
