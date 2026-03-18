import { Outlet } from 'react-router-dom'
import SideNav from '@/components/common/SideNav'
import BottomNav from '@/components/common/BottomNav'
import styles from './PharmacistLayout.module.css'

const pharmacistNavItems = [
  { path: '/pharmacist', label: '대시보드', icon: '📊', exact: true },
  {
    path: '/pharmacist/patients',
    label: '환자 관리',
    icon: '👥',
    children: [
      { path: '/pharmacist/patients/scheduled', label: '오늘 방문 예정' },
      { path: '/pharmacist/patients/pending', label: '조제 대기' },
    ],
  },
  { path: '/pharmacist/calendar', label: '캘린더', icon: '📅' },
]

export default function PharmacistLayout() {
  return (
    <div className={styles.layout}>
      <SideNav items={pharmacistNavItems} title="분할조제 복약관리" />
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav items={pharmacistNavItems} />
    </div>
  )
}
