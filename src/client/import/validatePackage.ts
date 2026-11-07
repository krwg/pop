import { isWebGameManifest, type WebGameManifest } from './webGameManifest'

export type ImportIssueCode =
  | 'manifest_missing'
  | 'manifest_invalid'
  | 'manifest_fetch_failed'
  | 'entry_missing'
  | 'cover_missing'
  | 'hero_missing'
  | 'runtime_incompatible'
  | 'duplicate_import'

export type ImportIssue = {
  code: ImportIssueCode
  message: string
  path?: string
}

export type ValidatedPackage = {
  rootUrl: string
  manifest: WebGameManifest
  issues: ImportIssue[]
}

function joinRoot(rootUrl: string, relative: string) {
  const base = rootUrl.endsWith('/') ? rootUrl : `${rootUrl}/`
  return new URL(relative.replace(/^\.\//, ''), base).pathname
}

async function resourceExists(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, { method: 'HEAD' })
    if (head.ok) return true
    if (head.status === 405 || head.status === 501) {
      const get = await fetch(url, { method: 'GET' })
      return get.ok
    }
    return false
  } catch {
    return false
  }
}

export async function validateGamePackage(
  rootUrl: string,
  options?: { existingIds?: Set<string>; runtimeVersion?: string },
): Promise<ValidatedPackage | { ok: false; issues: ImportIssue[] }> {
  const base = rootUrl.endsWith('/') ? rootUrl : `${rootUrl}/`
  const manifestUrl = `${base}manifest.json`
  const issues: ImportIssue[] = []

  let raw: unknown
  try {
    const response = await fetch(manifestUrl)
    if (!response.ok) {
      return {
        ok: false,
        issues: [
          {
            code: 'manifest_missing',
            message: `Manifest not found at ${manifestUrl}`,
            path: manifestUrl,
          },
        ],
      }
    }
    raw = await response.json()
  } catch {
    return {
      ok: false,
      issues: [
        {
          code: 'manifest_fetch_failed',
          message: `Failed to fetch or parse ${manifestUrl}`,
          path: manifestUrl,
        },
      ],
    }
  }

  if (!isWebGameManifest(raw)) {
    return {
      ok: false,
      issues: [
        {
          code: 'manifest_invalid',
          message: 'manifest.json failed contract validation',
          path: manifestUrl,
        },
      ],
    }
  }

  const manifest = raw
  const entryPath = joinRoot(base, manifest.entry)
  if (!(await resourceExists(entryPath))) {
    issues.push({
      code: 'entry_missing',
      message: `Entry file missing: ${manifest.entry}`,
      path: entryPath,
    })
  }

  if (manifest.cover) {
    const coverPath = joinRoot(base, manifest.cover)
    if (!(await resourceExists(coverPath))) {
      issues.push({
        code: 'cover_missing',
        message: `Cover missing: ${manifest.cover}`,
        path: coverPath,
      })
    }
  }

  if (manifest.libraryHero) {
    const heroPath = joinRoot(base, manifest.libraryHero)
    if (!(await resourceExists(heroPath))) {
      issues.push({
        code: 'hero_missing',
        message: `Library hero missing: ${manifest.libraryHero}`,
        path: heroPath,
      })
    }
  }

  if (
    manifest.minRuntime &&
    options?.runtimeVersion &&
    manifest.minRuntime !== options.runtimeVersion
  ) {
    // Soft check for now — only warn when versions are unequal strings.
    // Strict semver can land with a real runtime shell.
    issues.push({
      code: 'runtime_incompatible',
      message: `Package requires runtime ${manifest.minRuntime}, client is ${options.runtimeVersion}`,
    })
  }

  if (options?.existingIds?.has(manifest.id)) {
    issues.push({
      code: 'duplicate_import',
      message: `Game id already in catalog: ${manifest.id}`,
    })
  }

  const fatal = issues.some(
    (issue) =>
      issue.code === 'entry_missing' || issue.code === 'runtime_incompatible',
  )
  if (fatal) {
    return { ok: false, issues }
  }

  return { rootUrl: base, manifest, issues }
}
