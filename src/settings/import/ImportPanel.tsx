import { useState } from 'react'
import { importGamePackage } from '@/client/import/importGamePackage'
import { useClientStore } from '@/client/store/hooks'
import { Button } from '@/components/ui/Button'
import { useT } from '@/i18n/hooks'
import { publicUrl } from '@/lib/publicUrl'
import styles from './ImportPanel.module.css'

export function ImportPanel() {
  const t = useT()
  const { state, dispatch } = useClientStore()
  const [slug, setSlug] = useState('2048')
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<string[]>([])

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('settings.import.title')}</h2>
      </header>

      <form
        className={styles.form}
        onSubmit={async (event) => {
          event.preventDefault()
          const trimmed = slug.trim().replace(/^\/+|\/+$/g, '')
          if (!trimmed) return

          setBusy(true)
          setLog([])
          const rootUrl = publicUrl(`games/${trimmed}/`)
          const result = await importGamePackage(rootUrl, {
            existingIds: new Set(Object.keys(state.games)),
            allowReplace: true,
            runtimeVersion: 'web-1',
          })

          if (!result.ok) {
            setLog(result.issues.map((issue) => `${issue.code}: ${issue.message}`))
            setBusy(false)
            return
          }

          dispatch({ type: 'games/upsert', game: result.game })
          const lines = [
            result.replaced
              ? t('settings.import.replaced')
              : t('settings.import.imported'),
            `${result.game.title} (${result.game.id})`,
            ...result.warnings.map((issue) => `${issue.code}: ${issue.message}`),
          ]
          setLog(lines)
          setBusy(false)
        }}
      >
        <label className={styles.label} htmlFor="import-slug">
          {t('settings.import.slugLabel')}
        </label>
        <input
          id="import-slug"
          className={styles.input}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          disabled={busy}
          placeholder="2048"
        />
        <p className={styles.pathHint}>
          {t('settings.import.pathLabel')}: {publicUrl(`games/${slug.trim() || '…'}/`)}
        </p>
        <Button type="submit" disabled={busy}>
          {busy ? t('settings.import.working') : t('settings.import.submit')}
        </Button>
      </form>

      {log.length > 0 ? (
        <ul className={styles.log}>
          {log.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
