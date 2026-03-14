import { useEffect } from 'react'
import styles from './Toast.module.css'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <span className={styles.icon}>
        {type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span className={styles.message}>{message}</span>
      <button className={styles.close} onClick={onClose} aria-label="닫기">×</button>
    </div>
  )
}
