export type GamepadFamily = 'xbox' | 'playstation' | 'generic'

export type GamepadIdentity = {
  family: GamepadFamily
  /** Short UI name, e.g. "Xbox Controller" */
  name: string
  /** Vendor hint for sublabel */
  vendor?: string
}

export function identifyGamepad(rawId: string): GamepadIdentity {
  const id = rawId.toLowerCase()

  if (
    /dualshock|dualsense|playstation|sony|054c|ps[345]|wireless controller/.test(
      id,
    )
  ) {
    const name = /dualsense|ps5/.test(id)
      ? 'PlayStation DualSense'
      : /dualshock|ps4/.test(id)
        ? 'PlayStation DualShock'
        : 'PlayStation Controller'
    return { family: 'playstation', name, vendor: 'Sony' }
  }

  if (/8bitdo|2dc8/.test(id)) {
    return { family: 'xbox', name: '8BitDo Controller', vendor: '8BitDo' }
  }

  if (
    /xbox|xinput|microsoft|045e|xbox 360|xbox one|xbox series|gamepad/.test(id)
  ) {
    return { family: 'xbox', name: 'Xbox Controller', vendor: 'Microsoft' }
  }

  if (/xinput/i.test(rawId) || rawId.trim().toLowerCase() === 'xinput') {
    return { family: 'xbox', name: 'Xbox Controller', vendor: 'XInput' }
  }

  // Many PC pads expose as "xinput" or generic standard mapping — treat as Xbox layout.
  const short = rawId.split('(')[0]?.trim() || rawId
  const cleaned = short.replace(/\s+/g, ' ').slice(0, 42)
  return {
    family: 'xbox',
    name: cleaned || 'Gamepad',
  }
}

export type FaceLabels = {
  a: string
  b: string
  x: string
  y: string
  view: string
  menu: string
}

export function faceLabelsFor(family: GamepadFamily): FaceLabels {
  if (family === 'playstation') {
    return {
      a: '✕',
      b: '○',
      x: '□',
      y: '△',
      view: 'Share',
      menu: 'Options',
    }
  }
  return {
    a: 'A',
    b: 'B',
    x: 'X',
    y: 'Y',
    view: 'View',
    menu: 'Menu',
  }
}

export function buttonCaption(
  family: GamepadFamily,
  buttonIndex: number,
  fallback: string,
): string {
  const labels = faceLabelsFor(family)
  const map: Record<number, string> = {
    0: labels.a,
    1: labels.b,
    2: labels.x,
    3: labels.y,
    4: family === 'playstation' ? 'L1' : 'LB',
    5: family === 'playstation' ? 'R1' : 'RB',
    6: family === 'playstation' ? 'L2' : 'LT',
    7: family === 'playstation' ? 'R2' : 'RT',
    8: labels.view,
    9: labels.menu,
    10: 'L3',
    11: 'R3',
    12: '↑',
    13: '↓',
    14: '←',
    15: '→',
  }
  return map[buttonIndex] ?? `${fallback} ${buttonIndex}`
}
