import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import Badge from '@/components/common/Badge'
import Toast from '@/components/common/Toast'
import { useToast } from '@/hooks/useToast'
import { api } from '@/api/client'
import type { Plan, Visit } from '@/types'
import styles from './VisitRecordPage.module.css'

interface DispensedMed {
  medicationId: string
  name: string
  quantity: number
  unit: string
}

type ExchangeReason = 'contamination' | 'damage' | 'expiry'

interface ExchangeMed {
  name: string
  quantity: number
  unit: string
}

const EXCHANGE_REASON_OPTIONS: { value: ExchangeReason; label: string }[] = [
  { value: 'contamination', label: '오염/훼손' },
  { value: 'damage', label: '파손' },
  { value: 'expiry', label: '유통기한 임박' },
]

const HANDLING_OPTIONS = ['폐기 후 신규 조제', '부분 교환 후 재지급', '전량 교환']

export default function VisitRecordPage() {
  const { id, patientId: patientIdFromPath } = useParams<{ id?: string; patientId?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const planId = searchParams.get('planId')
  const stepParam = searchParams.get('step') || searchParams.get('stepNumber')
  const isNewMode = !!patientIdFromPath || (!id && !!planId)

  const [visit, setVisit] = useState<Visit | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [prevVisit, setPrevVisit] = useState<Visit | null>(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorModal, setErrorModal] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const { toast, showToast, hideToast } = useToast()

  const kstToday = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
  const [visitDate, setVisitDate] = useState(kstToday)
  const [nextStepDate, setNextStepDate] = useState<string | null>(null)

  const [form, setForm] = useState({
    adherence: 'good' as 'good' | 'fair' | 'poor',
    adverseReaction: false,
    adverseReactionNote: '',
    storageCondition: 'good' as 'good' | 'poor' | 'damaged',
    pharmacistNote: '',
  })

  const [dispensedMeds, setDispensedMeds] = useState<DispensedMed[]>([])

  // 교환 신청 상태
  const [includeExchange, setIncludeExchange] = useState(false)
  const [exchangeReason, setExchangeReason] = useState<ExchangeReason>('contamination')
  const [exchangeMeds, setExchangeMeds] = useState<ExchangeMed[]>([{ name: '', quantity: 1, unit: '정' }])
  const [handlingMethod, setHandlingMethod] = useState(HANDLING_OPTIONS[0])
  const [exchangeNote, setExchangeNote] = useState('')

  const stepNumber = stepParam ? parseInt(stepParam, 10) : undefined

  useEffect(() => {
    if (isNewMode && planId) {
      api.get(`/plans/${planId}`)
        .then(async res => {
          const planData: Plan = res.data.data
          setPlan(planData)
          if (planData.medications) {
            const unit = planData.dispensingUnit
            const currentStep = planData.steps.find(s => s.stepNumber === stepNumber)
            const dispenseDays = currentStep?.dispenseDays || unit
            setDispensedMeds(
              planData.medications.map((med, idx) => ({
                medicationId: `M_${idx + 1}`,
                name: med.name,
                quantity: med.dailyDose * dispenseDays,
                unit: med.unit,
              }))
            )
          }
          // 다음 방문 예정일
          if (stepNumber) {
            const nextStep = planData.steps.find(s => s.stepNumber === stepNumber + 1)
            if (nextStep) setNextStepDate(nextStep.scheduledDate)
          }
          // 이전 방문 기록 로드
          if (stepNumber && stepNumber > 1) {
            const prevStep = planData.steps.find(s => s.stepNumber === stepNumber - 1)
            if (prevStep?.visitId) {
              try {
                const vRes = await api.get(`/visits/${prevStep.visitId}`)
                setPrevVisit(vRes.data.data)
              } catch { /* 이전 방문 없으면 무시 */ }
            }
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else if (id) {
      api.get(`/visits/${id}`)
        .then(res => {
          setVisit(res.data.data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [id, planId, isNewMode, stepNumber])

  if (loading) return <Loading />

  // 조회 모드
  if (!isNewMode && visit) {
    const adherenceLabel = { good: '양호', fair: '보통', poor: '불량' }
    const storageLabel = { good: '양호', poor: '불량', damaged: '훼손' }

    return (
      <div>
        <Header title="방문 기록 상세" showBack />
        <div className={styles.content}>
          <Card>
            <h2 className={styles.sectionTitle}>방문 정보</h2>
            <dl className={styles.infoGrid}>
              <dt>방문일</dt><dd>{visit.visitDate}</dd>
              <dt>방문 차수</dt><dd>{visit.stepNumber}차</dd>
            </dl>
          </Card>
          <Card>
            <h2 className={styles.sectionTitle}>복약 상태</h2>
            <dl className={styles.infoGrid}>
              <dt>복약 순응도</dt>
              <dd>
                <Badge variant={visit.adherence === 'good' ? 'success' : visit.adherence === 'poor' ? 'error' : 'warning'}>
                  {adherenceLabel[visit.adherence] || visit.adherence}
                </Badge>
              </dd>
              <dt>이상 반응</dt>
              <dd>
                <Badge variant={visit.adverseReaction ? 'error' : 'success'}>
                  {visit.adverseReaction ? '발생' : '없음'}
                </Badge>
              </dd>
              {visit.adverseReaction && visit.adverseReactionNote && (
                <>
                  <dt>이상반응 내용</dt>
                  <dd>{visit.adverseReactionNote}</dd>
                </>
              )}
              <dt>보관 상태</dt>
              <dd>
                <Badge variant={visit.storageCondition === 'good' ? 'success' : 'error'}>
                  {storageLabel[visit.storageCondition as keyof typeof storageLabel] || visit.storageCondition}
                </Badge>
              </dd>
              <dt>약사 메모</dt>
              <dd>{visit.pharmacistNote || '-'}</dd>
            </dl>
          </Card>
          {visit.dispensedMedications && visit.dispensedMedications.length > 0 && (
            <Card>
              <h2 className={styles.sectionTitle}>조제 의약품</h2>
              <ul className={styles.medList}>
                {visit.dispensedMedications.map((med, idx) => (
                  <li key={idx} className={styles.medItem}>
                    <span>{med.medicationId}</span>
                    <span>{med.quantity}{med.unit}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // 신규 생성 모드
  const currentStep = plan?.steps.find(s => s.stepNumber === stepNumber)

  const handleSave = async () => {
    if (!plan || !stepNumber) return
    setSubmitting(true)
    setErrorModal('')

    const patientId = plan.patientId

    try {
      const visitRes = await api.post('/visits', {
        planId: plan.id,
        patientId,
        visitDate,
        stepNumber,
        adherence: form.adherence,
        adverseReaction: form.adverseReaction,
        adverseReactionNote: form.adverseReaction ? form.adverseReactionNote : null,
        storageCondition: form.storageCondition,
        pharmacistNote: form.pharmacistNote,
        dispensedMedications: dispensedMeds,
      })

      const newVisitId: string = visitRes.data.data.id

      const dispenseRes = await api.post(`/visits/${newVisitId}/dispense`, {
        medications: dispensedMeds,
      })

      if (!dispenseRes.data.success) {
        const errCode = dispenseRes.data.code
        if (errCode === 'PREVIOUS_VISIT_REQUIRED') {
          showToast('이전 방문 기록을 먼저 완료해주세요.', 'error')
          setErrorModal('이전 방문 기록이 확인되지 않아 조제를 진행할 수 없습니다.\n복약 기록은 저장되었습니다.')
        } else {
          setErrorModal(dispenseRes.data.error || '조제 처리 중 오류가 발생했습니다.')
        }
        setSubmitting(false)
        return
      }

      // Step 3: 교환 신청 (선택)
      if (includeExchange) {
        const validMeds = exchangeMeds.filter(m => m.name.trim())
        if (validMeds.length > 0) {
          await api.post('/exchanges', {
            visitId: newVisitId,
            patientId,
            exchangeDate: visitDate,
            reason: exchangeReason,
            medications: validMeds,
            handlingMethod,
            pharmacistNote: exchangeNote,
          })
        }
      }

      showToast('방문 기록이 저장되었습니다.', 'success')
      if (includeExchange) setTimeout(() => showToast('교환 신청이 접수되었습니다.', 'success'), 400)
      else setTimeout(() => showToast('조제가 완료되었습니다.', 'success'), 400)
      setSuccessMsg('방문 기록이 저장되고 조제가 완료되었습니다.')
      setTimeout(() => navigate(`/pharmacist/patients/${patientId}`), 1600)
    } catch (err: any) {
      const data = err.response?.data
      if (data?.code === 'PREVIOUS_VISIT_REQUIRED') {
        showToast('이전 방문 기록을 먼저 완료해주세요.', 'error')
        setErrorModal('이전 방문 기록이 확인되지 않아 조제를 진행할 수 없습니다.\n복약 기록은 저장되었습니다.')
      } else {
        setErrorModal(data?.error || '저장 중 오류가 발생했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Header title={`방문 기록 작성 — ${stepNumber}차`} showBack />
      <div className={styles.content}>

        {plan && currentStep && (
          <Card>
            <h2 className={styles.sectionTitle}>조제 단계 정보</h2>
            <dl className={styles.infoGrid}>
              <dt>방문 차수</dt><dd>{stepNumber}차 / {plan.totalVisits}차</dd>
              <dt>예정일</dt><dd>{currentStep.scheduledDate}</dd>
              <dt>조제일수</dt><dd>{currentStep.dispenseDays}일분</dd>
            </dl>
          </Card>
        )}

        {prevVisit && (
          <Card>
            <h2 className={styles.sectionTitle}>이전 방문 요약 ({stepNumber! - 1}차)</h2>
            <dl className={styles.infoGrid}>
              <dt>방문일</dt><dd>{prevVisit.visitDate}</dd>
              <dt>복약 순응도</dt>
              <dd>
                <Badge variant={prevVisit.adherence === 'good' ? 'success' : prevVisit.adherence === 'poor' ? 'error' : 'warning'}>
                  {{ good: '양호', fair: '보통', poor: '불량' }[prevVisit.adherence]}
                </Badge>
              </dd>
              <dt>이상 반응</dt>
              <dd>
                <Badge variant={prevVisit.adverseReaction ? 'error' : 'success'}>
                  {prevVisit.adverseReaction ? '발생' : '없음'}
                </Badge>
              </dd>
              {prevVisit.adverseReaction && prevVisit.adverseReactionNote && (
                <>
                  <dt>내용</dt><dd>{prevVisit.adverseReactionNote}</dd>
                </>
              )}
              {prevVisit.pharmacistNote && (
                <>
                  <dt>약사 메모</dt><dd>{prevVisit.pharmacistNote}</dd>
                </>
              )}
            </dl>
          </Card>
        )}

        <Card>
          <h2 className={styles.sectionTitle}>복약 상태 기록</h2>
          <div className={styles.form}>
            <label className={styles.label}>
              방문일
              <input
                type="date"
                className={styles.select}
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
              />
            </label>
            <label className={styles.label}>
              복약 순응도
              <select
                className={styles.select}
                value={form.adherence}
                onChange={e => setForm({ ...form, adherence: e.target.value as 'good' | 'fair' | 'poor' })}
              >
                <option value="good">양호</option>
                <option value="fair">보통</option>
                <option value="poor">불량</option>
              </select>
            </label>

            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={form.adverseReaction}
                onChange={e => setForm({ ...form, adverseReaction: e.target.checked })}
              />
              이상 반응 발생
            </label>

            {form.adverseReaction && (
              <label className={styles.label}>
                이상 반응 내용
                <textarea
                  className={styles.textarea}
                  placeholder="이상 반응 내용을 입력해주세요"
                  value={form.adverseReactionNote}
                  onChange={e => setForm({ ...form, adverseReactionNote: e.target.value })}
                  rows={3}
                />
              </label>
            )}

            <label className={styles.label}>
              약사 메모
              <textarea
                className={styles.textarea}
                value={form.pharmacistNote}
                onChange={e => setForm({ ...form, pharmacistNote: e.target.value })}
                rows={3}
                placeholder="상담 내용 또는 특이사항 기록"
              />
            </label>
          </div>
        </Card>

        {dispensedMeds.length > 0 && (
          <Card>
            <h2 className={styles.sectionTitle}>조제 의약품 확인</h2>
            <ul className={styles.medList}>
              {dispensedMeds.map((med, idx) => (
                <li key={idx} className={styles.medItemEditable}>
                  <span className={styles.medName}>{med.name}</span>
                  <div className={styles.medQty}>
                    <input
                      className={styles.qtyInput}
                      type="number"
                      value={med.quantity}
                      min={1}
                      onChange={e => {
                        const next = [...dispensedMeds]
                        next[idx] = { ...next[idx], quantity: +e.target.value }
                        setDispensedMeds(next)
                      }}
                    />
                    <span>{med.unit}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* 의약품 보관 상태 + 교환 신청 */}
        <Card>
          <label className={styles.label}>
            의약품 보관 상태
            <select
              className={styles.select}
              value={form.storageCondition}
              onChange={e => {
                const val = e.target.value as 'good' | 'poor' | 'damaged'
                setForm({ ...form, storageCondition: val })
                setIncludeExchange(val === 'poor' || val === 'damaged')
              }}
            >
              <option value="good">양호</option>
              <option value="poor">불량</option>
              <option value="damaged">훼손</option>
            </select>
          </label>

          {includeExchange && (
            <div className={styles.exchangeSection}>
              {/* 교환 사유 */}
              <p className={styles.exchangeLabel}>교환 사유</p>
              <div className={styles.exchangeReasons}>
                {EXCHANGE_REASON_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    className={`${styles.reasonChip} ${exchangeReason === opt.value ? styles.reasonChipActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="exchangeReason"
                      value={opt.value}
                      checked={exchangeReason === opt.value}
                      onChange={() => setExchangeReason(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              {/* 교환 의약품 */}
              <p className={styles.exchangeLabel}>교환 의약품</p>
              {exchangeMeds.map((med, idx) => (
                <div key={idx} className={styles.exchangeMedRow}>
                  <input
                    className={styles.exchangeInput}
                    value={med.name}
                    onChange={e => {
                      const next = [...exchangeMeds]
                      next[idx] = { ...next[idx], name: e.target.value }
                      setExchangeMeds(next)
                    }}
                    placeholder="의약품명"
                  />
                  <input
                    className={`${styles.exchangeInput} ${styles.exchangeQty}`}
                    type="number"
                    value={med.quantity}
                    min={1}
                    onChange={e => {
                      const next = [...exchangeMeds]
                      next[idx] = { ...next[idx], quantity: +e.target.value }
                      setExchangeMeds(next)
                    }}
                  />
                  <select
                    className={styles.exchangeSelect}
                    value={med.unit}
                    onChange={e => {
                      const next = [...exchangeMeds]
                      next[idx] = { ...next[idx], unit: e.target.value }
                      setExchangeMeds(next)
                    }}
                  >
                    <option value="정">정</option>
                    <option value="캡슐">캡슐</option>
                    <option value="ml">ml</option>
                    <option value="포">포</option>
                  </select>
                  {exchangeMeds.length > 1 && (
                    <button
                      className={styles.exchangeRemove}
                      onClick={() => setExchangeMeds(prev => prev.filter((_, i) => i !== idx))}
                    >✕</button>
                  )}
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExchangeMeds(prev => [...prev, { name: '', quantity: 1, unit: '정' }])}
              >+ 의약품 추가</Button>

              {/* 처리 방법 */}
              <p className={styles.exchangeLabel}>처리 방법</p>
              <div className={styles.exchangeReasons}>
                {HANDLING_OPTIONS.map(opt => (
                  <label
                    key={opt}
                    className={`${styles.reasonChip} ${handlingMethod === opt ? styles.reasonChipActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="handlingMethod"
                      value={opt}
                      checked={handlingMethod === opt}
                      onChange={() => setHandlingMethod(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {/* 메모 */}
              <p className={styles.exchangeLabel}>메모 (선택)</p>
              <textarea
                className={styles.textarea}
                rows={2}
                value={exchangeNote}
                onChange={e => setExchangeNote(e.target.value)}
                placeholder="교환 사유 및 처리 내용"
              />
            </div>
          )}
        </Card>

        {successMsg && (
          <div className={styles.successBox}>
            <p className={styles.success}>{successMsg}</p>
            {nextStepDate && (
              <p className={styles.nextVisit}>다음 방문 예정일 · {nextStepDate}</p>
            )}
          </div>
        )}

        <Button fullWidth size="lg" onClick={handleSave} disabled={submitting}>
          {submitting ? '저장 중...' : '방문 기록 저장'}
        </Button>
      </div>

      {errorModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>조제 불가</h3>
            <p className={styles.modalBody}>{errorModal}</p>
            <Button onClick={() => setErrorModal('')} fullWidth>확인</Button>
          </div>
        </div>
      )}

      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  )
}
