import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>페이지를 찾을 수 없습니다</p>
      <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
    </div>
  )
}
