import { asGameId, type Game } from '@/domain'
import type { WebGameManifest } from './webGameManifest'

function resolveAsset(rootUrl: string, relative?: string) {
  if (!relative) return undefined
  const base = rootUrl.endsWith('/') ? rootUrl : `${rootUrl}/`
  const rel = relative.replace(/^\.\//, '')
  if (/^https?:\/\//i.test(base)) {
    return new URL(rel, base).pathname
  }
  return `${base}${rel}`.replace(/\/{2,}/g, '/')
}

export function manifestToGame(rootUrl: string, manifest: WebGameManifest): Game {
  const entry = resolveAsset(rootUrl, manifest.entry)
  if (!entry) {
    throw new Error('manifestToGame requires entry')
  }

  const coverSrc = resolveAsset(rootUrl, manifest.cover)
  const heroSrc = resolveAsset(rootUrl, manifest.libraryHero)

  return {
    id: asGameId(manifest.id),
    slug: manifest.slug,
    title: manifest.title,
    summary: manifest.summary,
    version: manifest.version,
    platforms: manifest.platforms?.length ? [...manifest.platforms] : ['web'],
    cover: coverSrc
      ? {
          src: coverSrc,
          alt: manifest.title,
        }
      : undefined,
    libraryHero: heroSrc
      ? {
          src: heroSrc,
          alt: '',
        }
      : undefined,
    runtime: {
      kind: 'web',
      entry,
    },
  }
}
