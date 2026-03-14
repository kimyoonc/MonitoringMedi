import { NavLink } from 'react-router-dom'
import styles from './SideNav.module.css'

interface NavItem {
  path: string
  label: string
  icon: string
  exact?: boolean
}

interface SideNavProps {
  items: NavItem[]
  title: string
}

export default function SideNav({ items, title }: SideNavProps) {
  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>{title}</div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
