/** Resolve a site-root path against Vite `base` (GitHub Pages `/pop/`). */
export function publicUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.BASE_URL || '/'
  if (base !== '/' && (path === base.slice(0, -1) || path.startsWith(base))) {
    return path
  }
  const normalized = path.replace(/^\/+/, '')
  return `${base}${normalized}`
}
