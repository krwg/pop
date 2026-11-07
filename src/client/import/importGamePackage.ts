import type { Game } from '@/domain'
import { manifestToGame } from './manifestToGame'
import {
  validateGamePackage,
  type ImportIssue,
  type ValidatedPackage,
} from './validatePackage'

export type ImportResult =
  | {
      ok: true
      game: Game
      warnings: ImportIssue[]
      package: ValidatedPackage
      replaced: boolean
    }
  | {
      ok: false
      issues: ImportIssue[]
    }

/**
 * Package → Validation → Game
 * Caller decides Store upsert / LibraryEntry / WebRuntime launch.
 */
export async function importGamePackage(
  rootUrl: string,
  options?: {
    existingIds?: Set<string>
    runtimeVersion?: string
    /** Allow re-import of the same id (updates catalog entry). */
    allowReplace?: boolean
  },
): Promise<ImportResult> {
  const existingIds =
    options?.allowReplace === true ? undefined : options?.existingIds

  const validated = await validateGamePackage(rootUrl, {
    existingIds,
    runtimeVersion: options?.runtimeVersion,
  })

  if ('ok' in validated && validated.ok === false) {
    return { ok: false, issues: validated.issues }
  }

  const pkg = validated as ValidatedPackage
  const replaced = Boolean(options?.existingIds?.has(pkg.manifest.id))
  const warnings = pkg.issues.filter((issue) => issue.code === 'duplicate_import')
  const soft = pkg.issues.filter((issue) => issue.code !== 'duplicate_import')

  try {
    const game = manifestToGame(pkg.rootUrl, pkg.manifest)
    return {
      ok: true,
      game,
      warnings: [...warnings, ...soft],
      package: pkg,
      replaced,
    }
  } catch (error) {
    return {
      ok: false,
      issues: [
        {
          code: 'manifest_invalid',
          message: error instanceof Error ? error.message : 'Failed to map manifest',
        },
      ],
    }
  }
}
