import { useNavigate } from 'react-router-dom'
import styles from './RoleSelectPage.module.css'

export default function RoleSelectPage() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>복약 관리 시스템</h1>
        <p className={styles.subtitle}>장기 처방 의약품 복약 관리</p>
      </div>
      <div className={styles.roles}>
        <button className={`${styles.roleCard} ${styles.pharmacist}`} onClick={() => navigate('/pharmacist')}>
          <span className={styles.roleIcon}>💊</span>
          <span className={styles.roleName}>약사</span>
          <span className={styles.roleDesc}>환자 관리 및 조제</span>
        </button>
        <button className={`${styles.roleCard} ${styles.patient}`} onClick={() => navigate('/patient')}>
          <span className={styles.roleIcon}>🏥</span>
          <span className={styles.roleName}>환자</span>
          <span className={styles.roleDesc}>일정 확인 및 신고</span>
        </button>
      </div>
    </div>
  )
}
