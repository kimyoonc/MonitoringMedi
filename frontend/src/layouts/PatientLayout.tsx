import { Outlet, useParams } from 'react-router-dom'
import BottomNav from '@/components/common/BottomNav'
import styles from './PatientLayout.module.css'

export default function PatientLayout() {
  const { patientId } = useParams<{ patientId: string }>()

  // patientId를 사용해 동적으로 네비게이션 경로 생성
  const patientNavItems = [
    { path: `/patient/${patientId}`, label: '방문 일정', icon: '📅', exact: true },
    { path: `/patient/${patientId}/report`, label: '이상 반응 신고', icon: '⚠️' },
  ]

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav items={patientNavItems} />
    </div>
  )
}
