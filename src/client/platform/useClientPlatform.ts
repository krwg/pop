import { useEffect, useState } from 'react'
import { detectClientPlatform } from './detect'
import type { ClientPlatform } from './types'

export function useClientPlatform(): ClientPlatform {
  const [platform, setPlatform] = useState<ClientPlatform>(() => detectClientPlatform())

  useEffect(() => {
    const sync = () => setPlatform(detectClientPlatform())
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  return platform
}
