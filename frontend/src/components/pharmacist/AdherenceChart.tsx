import type { Visit } from '@/types'
import styles from './AdherenceChart.module.css'

interface Props {
  visits: Visit[]
}

const ADHERENCE_LABEL: Record<string, string> = { good: '양호', fair: '보통', poor: '불량' }
const ADHERENCE_ICON: Record<string, string> = { good: '✓', fair: '△', poor: '✕' }
const ADHERENCE_COLOR: Record<string, string> = {
  good: 'var(--color-success)',
  fair: 'var(--color-warning)',
  poor: 'var(--color-error)',
}
const ADHERENCE_DESC: Record<string, string> = {
  good: '처방대로 복용',
  fair: '가끔 누락',
  poor: '자주 누락',
}

export default function AdherenceChart({ visits }: Props) {
  if (visits.length === 0) return null

  const sorted = [...visits].sort((a, b) => a.stepNumber - b.stepNumber)

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <span className={styles.title}>복약 순응도 추이</span>
        <div className={styles.track}>
          {sorted.map(v => (
            <div
              key={v.id}
              className={styles.chip}
              style={{ '--chip-color': ADHERENCE_COLOR[v.adherence] } as React.CSSProperties}
            >
              <span className={styles.chipIcon}>{ADHERENCE_ICON[v.adherence]}</span>
              <span className={styles.chipStep}>{v.stepNumber}차</span>
              <span className={styles.chipLabel}>{ADHERENCE_LABEL[v.adherence]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.legend}>
        {(['good', 'fair', 'poor'] as const).map(k => (
          <div
            key={k}
            className={styles.legendItem}
            style={{ '--chip-color': ADHERENCE_COLOR[k] } as React.CSSProperties}
          >
            <span className={styles.legendIcon}>{ADHERENCE_ICON[k]}</span>
            <span className={styles.legendText}>
              <b>{ADHERENCE_LABEL[k]}</b> {ADHERENCE_DESC[k]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
