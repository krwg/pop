import { Outlet, useLocation } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { SkipLink } from './SkipLink'
import { TopRail } from './TopRail'
import styles from './AppShell.module.css'

export function AppShell() {
  const location = useLocation()

  return (
    <div className={styles.shell}>
      <SkipLink />
      <TopRail />
      <main className={styles.main} id="main" tabIndex={-1}>
        <div key={location.pathname} className={styles.outlet}>
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
