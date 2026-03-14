import { Outlet } from 'react-router-dom'
import BottomNav from '@/components/common/BottomNav'
import styles from './PatientLayout.module.css'

const patientNavItems = [
  { path: '/patient', label: '방문 일정', icon: '📅', exact: true },
  { path: '/patient/report', label: '이상 반응 신고', icon: '⚠️' },
]

export default function PatientLayout() {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav items={patientNavItems} />
    </div>
  )
}
