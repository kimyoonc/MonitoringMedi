import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

interface NavItem {
  path: string
  label: string
  icon: string
  exact?: boolean
}

interface BottomNavProps {
  items: NavItem[]
}

export default function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className={styles.nav}>
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
