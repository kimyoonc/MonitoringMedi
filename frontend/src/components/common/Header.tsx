import { useNavigate } from 'react-router-dom'
import styles from './Header.module.css'

interface HeaderProps {
  title: React.ReactNode
  showBack?: boolean
  rightAction?: React.ReactNode
}

export default function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const navigate = useNavigate()
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBack && (
          <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="뒤로가기">
            ←
          </button>
        )}
      </div>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>{rightAction}</div>
    </header>
  )
}
