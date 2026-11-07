import type { BrowserId, ClientPlatform, DeviceClass, OsId } from './types'

function detectOs(ua: string): OsId {
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/mac os x|macintosh/i.test(ua)) return 'macos'
  if (/windows/i.test(ua)) return 'windows'
  if (/linux/i.test(ua)) return 'linux'
  return 'other'
}

function detectBrowser(ua: string): { id: BrowserId; label: string } {
  if (/edg\//i.test(ua)) return { id: 'edge', label: 'Edge' }
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return { id: 'opera', label: 'Opera' }
  if (/firefox\//i.test(ua)) return { id: 'firefox', label: 'Firefox' }
  if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) return { id: 'chrome', label: 'Chrome' }
  if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return { id: 'safari', label: 'Safari' }
  return { id: 'other', label: 'Browser' }
}

function detectDevice(ua: string, os: OsId): DeviceClass {
  const coarse =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches

  const narrow =
    typeof window !== 'undefined' && window.innerWidth > 0 && window.innerWidth < 820

  if (os === 'android' || os === 'ios') {
    if (/ipad|tablet|sm-t|tab/i.test(ua) || (narrow === false && coarse)) {
      return /ipad|tablet|sm-t/i.test(ua) ? 'tablet' : coarse && !narrow ? 'tablet' : 'mobile'
    }
    return 'mobile'
  }

  if (coarse && narrow) return 'mobile'
  if (coarse) return 'tablet'
  return 'desktop'
}

export function detectClientPlatform(
  userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '',
): ClientPlatform {
  const os = detectOs(userAgent)
  const browser = detectBrowser(userAgent)
  const device = detectDevice(userAgent, os)
  const isTouch =
    typeof navigator !== 'undefined' &&
    (navigator.maxTouchPoints > 0 || /mobile|android|iphone|ipad/i.test(userAgent))

  return {
    device,
    browser: browser.id,
    browserLabel: browser.label,
    os,
    isTouch,
    userAgent,
  }
}
