import { NavLink, useLocation } from 'react-router-dom'
import styles from './SideNav.module.css'

interface SubNavItem {
  path: string
  label: string
}

interface NavItem {
  path: string
  label: string
  icon: string
  exact?: boolean
  children?: SubNavItem[]
}

interface SideNavProps {
  items: NavItem[]
  title: string
}

export default function SideNav({ items, title }: SideNavProps) {
  const location = useLocation()

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>{title}</div>
      <ul className={styles.list}>
        {items.map((item) => {
          const isExpanded = item.children && location.pathname.startsWith(item.path)
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
                {item.children && (
                  <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>›</span>
                )}
              </NavLink>
              {item.children && isExpanded && (
                <ul className={styles.subList}>
                  {item.children.map(child => (
                    <li key={child.path}>
                      <NavLink
                        to={child.path}
                        className={({ isActive }) => `${styles.subItem} ${isActive ? styles.subItemActive : ''}`}
                      >
                        {child.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
