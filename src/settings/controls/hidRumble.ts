/**
 * Expensive rumble path for pads where GamepadHapticActuator is missing
 * (common with Windows XInput / some 8BitDo modes).
 *
 * Uses WebHID output reports for Sony DualSense/DualShock and 8BitDo / Xbox-like HID.
 * Requires a one-time user gesture via navigator.hid.requestDevice.
 */

const SONY = 0x054c
const EIGHTBITDO = 0x2dc8
const MICROSOFT = 0x045e

let authorized: HIDDevice[] = []

function canUseHid(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.hid)
}

export async function listAuthorizedHidPads(): Promise<HIDDevice[]> {
  if (!canUseHid() || !navigator.hid) return []
  const devices = await navigator.hid.getDevices()
  authorized = devices.filter((device: HIDDevice) =>
    [SONY, EIGHTBITDO, MICROSOFT].includes(device.vendorId),
  )
  return authorized
}

export async function authorizeHidRumble(): Promise<HIDDevice | null> {
  if (!canUseHid() || !navigator.hid) return null

  const devices = await navigator.hid.requestDevice({
    filters: [
      { vendorId: SONY },
      { vendorId: EIGHTBITDO },
      { vendorId: MICROSOFT },
    ],
  })

  const device = devices[0]
  if (!device) return null
  if (!device.opened) await device.open()
  authorized = [...authorized.filter((item) => item !== device), device]
  return device
}

async function ensureOpen(device: HIDDevice) {
  if (!device.opened) await device.open()
}

/** DualSense (PS5) output report 0x02 rumble — gentle pulse. */
async function rumbleDualSense(device: HIDDevice, ms = 380) {
  await ensureOpen(device)
  const report = new Uint8Array(48)
  report[0] = 0x02
  report[1] = 0xff
  report[2] = 0xf7
  report[5] = 0x48
  report[6] = 0x38
  await device.sendReport(0x02, report.subarray(1))
  window.setTimeout(() => {
    const stop = new Uint8Array(48)
    stop[0] = 0x02
    stop[1] = 0xff
    stop[2] = 0xf7
    void device.sendReport(0x02, stop.subarray(1)).catch(() => undefined)
  }, ms)
}

/** DualShock 4 USB output report 0x05 — gentle pulse. */
async function rumbleDualShock4(device: HIDDevice, ms = 380) {
  await ensureOpen(device)
  const report = new Uint8Array(32)
  report[0] = 0x05
  report[1] = 0xff
  report[4] = 0x48
  report[5] = 0x38
  await device.sendReport(0x05, report.subarray(1))
  window.setTimeout(() => {
    const stop = new Uint8Array(32)
    stop[0] = 0x05
    stop[1] = 0xff
    void device.sendReport(0x05, stop.subarray(1)).catch(() => undefined)
  }, ms)
}

async function rumbleGenericMotors(device: HIDDevice, ms = 380) {
  await ensureOpen(device)
  const collections = device.collections ?? []
  const outputs = collections.flatMap(
    (collection: HIDCollectionInfo) => collection.outputReports ?? [],
  )
  const output =
    outputs.sort(
      (a: HIDReportInfo, b: HIDReportInfo) =>
        (b.items?.length ?? 0) - (a.items?.length ?? 0),
    )[0] ?? null

  const reportId = output?.reportId ?? 0
  const bitSize =
    output?.items?.reduce(
      (sum: number, item: HIDReportItem) =>
        sum + (item.reportSize ?? 0) * (item.reportCount ?? 0),
      0,
    ) ?? 64
  const bytes = Math.max(8, Math.ceil(bitSize / 8))
  const payload = new Uint8Array(bytes)
  payload[0] = 0x55
  payload[1] = 0x40
  payload[2] = 0x40
  payload[3] = 0x40
  await device.sendReport(reportId, payload)

  window.setTimeout(() => {
    const stop = new Uint8Array(payload.length)
    void device.sendReport(reportId, stop).catch(() => undefined)
  }, ms)
}

export async function rumbleHidDevice(device: HIDDevice): Promise<boolean> {
  try {
    if (device.vendorId === SONY) {
      if (device.productId === 0x0ce6 || device.productId === 0x0df2) {
        await rumbleDualSense(device)
        return true
      }
      await rumbleDualShock4(device)
      return true
    }

    await rumbleGenericMotors(device)
    return true
  } catch {
    return false
  }
}

export async function rumbleAnyAuthorizedHid(): Promise<boolean> {
  const devices = authorized.length ? authorized : await listAuthorizedHidPads()
  for (const device of devices) {
    if (await rumbleHidDevice(device)) return true
  }
  return false
}

export function hidRumbleSupported(): boolean {
  return canUseHid()
}
