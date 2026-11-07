/** Display game/app versions as [X.Y.Z]. */
export function formatVersion(version: string | undefined | null): string {
  if (!version) return ''
  const trimmed = version.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed
  return `[${trimmed}]`
}
