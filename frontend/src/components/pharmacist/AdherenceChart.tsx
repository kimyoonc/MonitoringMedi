import type { Visit } from '@/types'
import styles from './AdherenceChart.module.css'

interface Props {
  visits: Visit[]
}

const ADHERENCE_HEIGHT: Record<string, number> = { good: 100, fair: 55, poor: 18 }
const ADHERENCE_LABEL: Record<string, string> = { good: '양호', fair: '보통', poor: '불량' }
const ADHERENCE_COLOR: Record<string, string> = {
  good: 'var(--color-success)',
  fair: 'var(--color-warning)',
  poor: 'var(--color-error)',
}

const CHART_H = 80   // 막대 최대 높이 px
const BAR_W = 28     // 막대 너비 px
const GAP = 16       // 막대 간격 px
const RADIUS = 6     // 모서리 반경

export default function AdherenceChart({ visits }: Props) {
  if (visits.length === 0) return null

  const sorted = [...visits].sort((a, b) => a.stepNumber - b.stepNumber)
  const svgW = sorted.length * (BAR_W + GAP) - GAP + 40  // 여백 포함

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>복약 순응도 추이</span>
        <div className={styles.legend}>
          {(['good', 'fair', 'poor'] as const).map(k => (
            <span key={k} className={styles.legendItem}>
              <span className={styles.dot} style={{ background: ADHERENCE_COLOR[k] }} />
              {ADHERENCE_LABEL[k]}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.chart}>
        <svg
          width="100%"
          viewBox={`0 0 ${svgW} ${CHART_H + 32}`}
          preserveAspectRatio="xMidYMid meet"
          overflow="visible"
        >
          {sorted.map((v, i) => {
            const pct = ADHERENCE_HEIGHT[v.adherence] ?? 50
            const barH = Math.round((pct / 100) * CHART_H)
            const x = i * (BAR_W + GAP) + 20
            const y = CHART_H - barH
            const color = ADHERENCE_COLOR[v.adherence] ?? '#ccc'

            return (
              <g key={v.id}>
                {/* 배경 트랙 */}
                <rect
                  x={x} y={0} width={BAR_W} height={CHART_H}
                  rx={RADIUS} fill="var(--fill-quaternary)"
                />
                {/* 순응도 막대 */}
                <rect
                  x={x} y={y} width={BAR_W} height={barH}
                  rx={RADIUS} fill={color} opacity="0.85"
                />
                {/* 상단 라벨 */}
                <text
                  x={x + BAR_W / 2} y={y - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill={color}
                  fontWeight="600"
                >
                  {ADHERENCE_LABEL[v.adherence]?.[0] ?? ''}
                </text>
                {/* 하단 차수 레이블 */}
                <text
                  x={x + BAR_W / 2} y={CHART_H + 16}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--label-secondary)"
                >
                  {v.stepNumber}차
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* 요약 통계 */}
      <div className={styles.stats}>
        {(['good', 'fair', 'poor'] as const).map(k => {
          const cnt = sorted.filter(v => v.adherence === k).length
          const pct = sorted.length ? Math.round((cnt / sorted.length) * 100) : 0
          return (
            <div key={k} className={styles.statItem}>
              <span className={styles.statDot} style={{ background: ADHERENCE_COLOR[k] }} />
              <span className={styles.statLabel}>{ADHERENCE_LABEL[k]}</span>
              <span className={styles.statVal}>{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
