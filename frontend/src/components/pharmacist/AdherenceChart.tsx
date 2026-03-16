import type { Visit } from '@/types'
import styles from './AdherenceChart.module.css'

interface Props {
  visits: Visit[]
}

const ADHERENCE_LABEL: Record<string, string> = { good: '양호', fair: '보통', poor: '불량' }
const ADHERENCE_COLOR: Record<string, string> = {
  good: 'var(--color-success)',
  fair: 'var(--color-warning)',
  poor: 'var(--color-error)',
}

export default function AdherenceChart({ visits }: Props) {
  if (visits.length === 0) return null

  const sorted = [...visits].sort((a, b) => a.stepNumber - b.stepNumber)

  return (
    <div className={styles.wrap}>
      <span className={styles.title}>복약 순응도 추이</span>
      <div className={styles.track}>
        {sorted.map(v => (
          <div
            key={v.id}
            className={styles.chip}
            style={{ '--chip-color': ADHERENCE_COLOR[v.adherence] } as React.CSSProperties}
          >
            <span className={styles.chipStep}>{v.stepNumber}차</span>
            <span className={styles.chipLabel}>{ADHERENCE_LABEL[v.adherence]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
