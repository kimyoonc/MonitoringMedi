import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import EmptyState from '@/components/common/EmptyState'
import Toast from '@/components/common/Toast'
import { useToast } from '@/hooks/useToast'
import { api } from '@/api/client'
import type { ExchangeRecord, Patient } from '@/types'
import styles from './ExchangePage.module.css'

type ExchangeReason = 'contamination' | 'damage' | 'expiry'

interface MedicationRow {
  name: string
  quantity: number
  unit: string
}

const reasonOptions: { value: ExchangeReason; label: string }[] = [
  { value: 'contamination', label: '오염/훼손' },
  { value: 'damage', label: '파손' },
  { value: 'expiry', label: '유통기한 임박' },
]

const handlingOptions = ['폐기 후 신규 조제', '부분 교환 후 재지급', '전량 교환']

// 교환 사유별 배지 색상
function reasonVariant(reason: string): 'error' | 'warning' | 'neutral' {
  if (reason === 'contamination' || reason === 'damage') return 'error'
  if (reason === 'expiry') return 'warning'
  return 'neutral'
}

export default function ExchangePage() {
  const { patientId } = useParams<{ patientId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const visitId = searchParams.get('visitId') || undefined

  // 탭: 'new' | 'history'
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new')

  // 교환 신청 폼 상태
  const [patient, setPatient] = useState<Patient | null>(null)
  const [reason, setReason] = useState<ExchangeReason>('contamination')
  const [exchangeDate, setExchangeDate] = useState(new Date().toISOString().split('T')[0])
  const [medications, setMedications] = useState<MedicationRow[]>([
    { name: '', quantity: 1, unit: '정' },
  ])
  const [handlingMethod, setHandlingMethod] = useState(handlingOptions[0])
  const [pharmacistNote, setPharmacistNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Toast 알림 훅
  const { toast, showToast, hideToast } = useToast()

  // 교환 이력 상태
  const [exchanges, setExchanges] = useState<ExchangeRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // 환자 정보 로드
  useEffect(() => {
    if (!patientId) return
    api.get(`/patients/${patientId}`)
      .then(res => setPatient(res.data.data))
      .catch(() => {})
  }, [patientId])

  // 이력 탭 활성화 시 데이터 로드
  useEffect(() => {
    if (activeTab !== 'history' || !patientId) return
    setHistoryLoading(true)
    api.get(`/exchanges?patientId=${patientId}`)
      .then(res => {
        setExchanges(res.data.data || [])
      })
      .catch(() => setExchanges([]))
      .finally(() => setHistoryLoading(false))
  }, [activeTab, patientId])

  // 의약품 행 추가
  const addMedRow = () => {
    setMedications(prev => [...prev, { name: '', quantity: 1, unit: '정' }])
  }

  // 의약품 행 삭제
  const removeMedRow = (idx: number) => {
    setMedications(prev => prev.filter((_, i) => i !== idx))
  }

  // 의약품 필드 변경
  const updateMedRow = (idx: number, field: keyof MedicationRow, value: string | number) => {
    setMedications(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  // 교환 신청 제출
  const handleSubmit = async () => {
    const validMeds = medications.filter(m => m.name.trim())
    if (!validMeds.length) {
      setFormError('교환 의약품을 1개 이상 입력해주세요.')
      return
    }

    setFormError('')
    setSubmitting(true)

    try {
      await api.post('/exchanges', {
        visitId,
        patientId,
        exchangeDate,
        reason,
        medications: validMeds,
        handlingMethod,
        pharmacistNote,
      })
      showToast('교환 신청이 접수되었습니다.', 'success')
      setTimeout(() => navigate(`/pharmacist/patients/${patientId}`), 1200)
    } catch (err: any) {
      const msg = err.response?.data?.error || '교환 신청 중 오류가 발생했습니다.'
      setFormError(msg)
      showToast('교환 신청 중 오류가 발생했습니다.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Header title={`의약품 교환 관리${patient ? ` — ${patient.name}` : ''}`} showBack />
      <div className={styles.content}>

        {/* 탭 */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'new' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('new')}
          >
            교환 신청
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            교환 이력
          </button>
        </div>

        {/* 교환 신청 탭 */}
        {activeTab === 'new' && (
          <div className={styles.formSection}>
            {/* 환자 정보 표시 */}
            {patient && (
              <Card className={styles.patientCard}>
                <div className={styles.patientInfo}>
                  <span className={styles.patientName}>{patient.name}</span>
                  <span className={styles.patientId}>{patient.id}</span>
                </div>
                {visitId && (
                  <span className={styles.visitRef}>방문 ID: {visitId}</span>
                )}
              </Card>
            )}

            {/* 교환 사유 */}
            <Card>
              <h3 className={styles.fieldTitle}>교환 사유 <span className={styles.required}>*</span></h3>
              <div className={styles.radioGroup}>
                {reasonOptions.map(opt => (
                  <label key={opt.value} className={`${styles.radioLabel} ${reason === opt.value ? styles.radioSelected : ''}`}>
                    <input
                      type="radio"
                      name="reason"
                      value={opt.value}
                      checked={reason === opt.value}
                      onChange={() => setReason(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* 교환 날짜 */}
            <Card>
              <h3 className={styles.fieldTitle}>교환 처리일 <span className={styles.required}>*</span></h3>
              <input
                className={styles.input}
                type="date"
                value={exchangeDate}
                onChange={e => setExchangeDate(e.target.value)}
              />
            </Card>

            {/* 교환 의약품 목록 */}
            <Card>
              <div className={styles.medicationHeader}>
                <h3 className={styles.fieldTitle}>교환 의약품 <span className={styles.required}>*</span></h3>
                <Button variant="secondary" size="sm" onClick={addMedRow}>+ 추가</Button>
              </div>
              {medications.map((med, idx) => (
                <div key={idx} className={styles.medicationRow}>
                  <input
                    className={styles.input}
                    value={med.name}
                    onChange={e => updateMedRow(idx, 'name', e.target.value)}
                    placeholder="의약품명 (예: 암로디핀 5mg)"
                  />
                  <input
                    className={`${styles.input} ${styles.qtyInput}`}
                    type="number"
                    value={med.quantity}
                    onChange={e => updateMedRow(idx, 'quantity', +e.target.value)}
                    min={1}
                    placeholder="수량"
                  />
                  <select
                    className={styles.select}
                    value={med.unit}
                    onChange={e => updateMedRow(idx, 'unit', e.target.value)}
                  >
                    <option value="정">정</option>
                    <option value="캡슐">캡슐</option>
                    <option value="ml">ml</option>
                    <option value="포">포</option>
                  </select>
                  {medications.length > 1 && (
                    <Button variant="danger" size="sm" onClick={() => removeMedRow(idx)}>삭제</Button>
                  )}
                </div>
              ))}
            </Card>

            {/* 처리 방법 */}
            <Card>
              <h3 className={styles.fieldTitle}>처리 방법 <span className={styles.required}>*</span></h3>
              <div className={styles.radioGroup}>
                {handlingOptions.map(opt => (
                  <label key={opt} className={`${styles.radioLabel} ${handlingMethod === opt ? styles.radioSelected : ''}`}>
                    <input
                      type="radio"
                      name="handlingMethod"
                      value={opt}
                      checked={handlingMethod === opt}
                      onChange={() => setHandlingMethod(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* 약사 메모 */}
            <Card>
              <h3 className={styles.fieldTitle}>약사 메모</h3>
              <textarea
                className={styles.textarea}
                value={pharmacistNote}
                onChange={e => setPharmacistNote(e.target.value)}
                rows={3}
                placeholder="교환 사유 및 처리 내용을 자세히 기록해주세요"
              />
            </Card>

            {formError && <p className={styles.error}>{formError}</p>}

            <Button fullWidth size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '처리 중...' : '교환 신청 완료'}
            </Button>
          </div>
        )}

        {/* 교환 이력 탭 */}
        {activeTab === 'history' && (
          <div className={styles.historySection}>
            {historyLoading ? (
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
        )}
      </div>

      {/* Toast 알림 */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  )
}
