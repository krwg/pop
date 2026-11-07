import type { Game } from '@/domain'
import { resolveGamePlatforms, type GamePlatform } from '@/client/platform'
import { Icon } from '@/components/ui/Icon'
import { useT } from '@/i18n/hooks'
import styles from './PlatformBadges.module.css'

const PLATFORM_ICON: Record<GamePlatform, string> = {
  web: 'language',
  pc: 'desktop_windows',
  mobile: 'smartphone',
}

type PlatformBadgesProps = {
  game: Pick<Game, 'platforms'>
  className?: string
}

export function PlatformBadges({ game, className }: PlatformBadgesProps) {
  const t = useT()
  const platforms = resolveGamePlatforms(game)

  return (
    <ul
      className={[styles.list, className].filter(Boolean).join(' ')}
      aria-label={t('platform.label')}
    >
      {platforms.map((platform) => (
        <li key={platform} className={styles.item} title={t(`platform.${platform}`)}>
          <Icon name={PLATFORM_ICON[platform]} size="sm" />
          <span className={styles.text}>{t(`platform.${platform}`)}</span>
        </li>
      ))}
    </ul>
  )
}
