import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/common/Header'
import Loading from '@/components/common/Loading'
import { api } from '@/api/client'
import styles from './CalendarPage.module.css'

interface CalendarStep {
  date: string
  stepNumber: number
  status: string
  planId: string
  patientId: string
  patientName: string
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [steps, setSteps] = useState<CalendarStep[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/calendar?year=${year}&month=${month}`)
      .then(res => { setSteps(res.data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [year, month])

  // 날짜 -> 방문 목록 맵
  const stepMap = new Map<string, CalendarStep[]>()
  steps.forEach(s => {
    const arr = stepMap.get(s.date) || []
    arr.push(s)
    stepMap.set(s.date, arr)
  })

  // 달력 그리드 생성
  const firstDay = new Date(year, month - 1, 1).getDay()   // 0=일
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // 6행 맞추기
  while (cells.length % 7 !== 0) cells.push(null)

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const todayStr = toYMD(today)
  const selectedSteps = selectedDate ? (stepMap.get(selectedDate) || []) : []

  return (
    <div>
      <Header title="방문 캘린더" />
      <div className={styles.content}>

        {/* 월 네비게이션 */}
        <div className={styles.monthNav}>
          <button className={styles.navBtn} onClick={prevMonth}>‹</button>
          <span className={styles.monthTitle}>{year}년 {MONTHS[month - 1]}</span>
          <button className={styles.navBtn} onClick={nextMonth}>›</button>
        </div>

        {loading ? <Loading /> : (
          <>
            {/* 요일 헤더 */}
            <div className={styles.grid}>
              {WEEKDAYS.map(d => (
                <div key={d} className={styles.weekday}>{d}</div>
              ))}

              {/* 날짜 셀 */}
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className={styles.emptyCell} />
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const daySteps = stepMap.get(dateStr) || []
                const isToday = dateStr === todayStr
                const isSelected = dateStr === selectedDate
                const isSun = idx % 7 === 0
                const isSat = idx % 7 === 6

                return (
                  <div
                    key={dateStr}
                    className={[
                      styles.cell,
                      isToday ? styles.today : '',
                      isSelected ? styles.selected : '',
                      daySteps.length > 0 ? styles.hasEvent : '',
                    ].join(' ')}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  >
                    <span className={[
                      styles.dayNum,
                      isSun ? styles.sun : '',
                      isSat ? styles.sat : '',
                    ].join(' ')}>
                      {day}
                    </span>
                    <div className={styles.dots}>
                      {daySteps.slice(0, 3).map((s, i) => (
                        <span
                          key={i}
                          className={styles.dot}
                          style={{ background: statusColor(s.status) }}
                        />
                      ))}
                      {daySteps.length > 3 && (
                        <span className={styles.dotMore}>+{daySteps.length - 3}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 선택 날짜 상세 */}
            {selectedDate && (
              <div className={styles.detail}>
                <div className={styles.detailHeader}>
                  <span className={styles.detailDate}>{formatDate(selectedDate)}</span>
                  <span className={styles.detailCount}>{selectedSteps.length}명 방문 예정</span>
                </div>
                {selectedSteps.length === 0 ? (
                  <p className={styles.noEvent}>방문 일정이 없습니다.</p>
                ) : (
                  <div className={styles.eventList}>
                    {selectedSteps.map((s, i) => (
                      <button
                        key={i}
                        className={styles.eventItem}
                        onClick={() => navigate(`/pharmacist/patients/${s.patientId}`)}
                      >
                        <span
                          className={styles.statusDot}
                          style={{ background: statusColor(s.status) }}
                        />
                        <span className={styles.eventName}>{s.patientName}</span>
                        <span className={styles.eventStep}>{s.stepNumber}차 조제</span>
                        <span className={[
                          styles.statusBadge,
                          s.status === 'completed' ? styles.badgeCompleted :
                          s.status === 'scheduled' ? styles.badgeScheduled : styles.badgePending
                        ].join(' ')}>
                          {statusLabel(s.status)}
                        </span>
                        <span className={styles.eventArrow}>›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 범례 */}
            <div className={styles.legend}>
              {[
                { status: 'completed', label: '완료' },
                { status: 'scheduled', label: '예정' },
                { status: 'pending', label: '대기' },
              ].map(({ status, label }) => (
                <span key={status} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: statusColor(status) }} />
                  {label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function statusColor(status: string) {
  if (status === 'completed') return 'var(--color-success)'
  if (status === 'scheduled') return 'var(--color-primary)'
  return 'var(--color-warning)'
}

function statusLabel(status: string) {
  if (status === 'completed') return '완료'
  if (status === 'scheduled') return '예정'
  return '대기'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`
}
