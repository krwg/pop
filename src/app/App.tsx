import { useCallback, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ClientStoreProvider } from '@/client/store/ClientStoreContext'
import { BootSequence } from '@/components/motion/BootSequence'
import { ContextMenuBusProvider } from '@/components/shell/ContextMenuBus'
import { DocumentTitle } from '@/components/shell/DocumentTitle'
import { I18nProvider } from '@/i18n/context'
import { AppRouter } from './router'
import styles from './App.module.css'

export function App() {
  const [bootDone, setBootDone] = useState(false)

  const handleBootComplete = useCallback(() => {
    setBootDone(true)
  }, [])

  return (
    <I18nProvider>
      <ClientStoreProvider>
        <div className={styles.root}>
          <BootSequence onComplete={handleBootComplete} />
          <div
            className={[styles.shellLayer, bootDone ? styles.ready : styles.booting]
              .filter(Boolean)
              .join(' ')}
            aria-hidden={bootDone ? undefined : true}
            inert={bootDone ? undefined : true}
          >
            <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <ContextMenuBusProvider>
                <DocumentTitle />
                <AppRouter />
              </ContextMenuBusProvider>
            </BrowserRouter>
          </div>
        </div>
      </ClientStoreProvider>
    </I18nProvider>
  )
}
