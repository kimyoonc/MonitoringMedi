import type { InteractionWarningItem } from '@/types'
import styles from './InteractionWarning.module.css'

interface Props {
  interactions: InteractionWarningItem[]
  onConfirm: () => void
  onCancel: () => void
}

export default function InteractionWarning({ interactions, onConfirm, onCancel }: Props) {
  if (interactions.length === 0) return null

  // 가장 심각한 severity 결정
  const hasHigh = interactions.some(i => i.severity === 'high')
  const isHigh = hasHigh

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className={`${styles.modal} ${isHigh ? styles.high : styles.moderate}`}>
        <div className={styles.header}>
          <span className={styles.icon}>{isHigh ? '⛔' : '⚠️'}</span>
          <h3 className={styles.title}>
            {isHigh ? '심각한 약물 상호작용 발견' : '주의: 약물 상호작용 가능'}
          </h3>
        </div>

        <div className={styles.list}>
          {interactions.map((item, idx) => (
            <div key={idx} className={`${styles.interactionItem} ${styles[item.severity]}`}>
              <div className={styles.drugs}>
                <span className={styles.drug}>{item.drug1}</span>
                <span className={styles.plus}>+</span>
                <span className={styles.drug}>{item.drug2}</span>
                <span className={`${styles.severityBadge} ${styles[`badge_${item.severity}`]}`}>
                  {item.severity === 'high' ? '심각' : item.severity === 'moderate' ? '주의' : '낮음'}
                </span>
              </div>
              <p className={styles.description}>{item.description}</p>
              <p className={styles.action}>권고 조치: {item.action}</p>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.cancelBtn}`}
            onClick={onCancel}
          >
            의약품 변경
          </button>
          <button
            className={`${styles.btn} ${isHigh ? styles.confirmHighBtn : styles.confirmBtn}`}
            onClick={onConfirm}
          >
            확인하고 계속 진행
          </button>
        </div>
      </div>
    </div>
  )
}
