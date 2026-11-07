import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useT } from '@/i18n/hooks'
import { GamepadArt } from './GamepadArt'
import {
  authorizeHidRumble,
  hidRumbleSupported,
  listAuthorizedHidPads,
  rumbleAnyAuthorizedHid,
  rumbleHidDevice,
} from './hidRumble'
import {
  buttonCaption,
  identifyGamepad,
} from './identifyGamepad'
import { KeyboardArt } from './KeyboardArt'
import { loadControlsConfig, saveControlsConfig } from './storage'
import {
  CONTROL_ACTIONS,
  DEFAULT_CONTROLS,
  formatKeyCode,
  type ControlAction,
  type ControlsConfig,
} from './types'
import {
  padHasHapticActuator,
  testGamepadVibration,
  useGamepadInput,
} from './useGamepadInput'
import { listenNextGamepadButton, useGamepads } from './useGamepads'
import styles from './ControlsPanel.module.css'

type DeviceTab = 'gamepad' | 'keyboard'

export function ControlsPanel() {
  const t = useT()
  const gamepads = useGamepads(250)
  const activePad = gamepads[0] ?? null
  const live = useGamepadInput(activePad)
  const [tab, setTab] = useState<DeviceTab>('gamepad')
  const [config, setConfig] = useState<ControlsConfig>(() => loadControlsConfig())
  const [listening, setListening] = useState<ControlAction | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [hidAuthorized, setHidAuthorized] = useState(false)
  const hidOk = hidRumbleSupported()
  const hasActuator = activePad ? padHasHapticActuator(activePad.index) : false
  /** Show only when Gamepad rumble is missing and HID is not authorized yet. */
  const showHidAccess = Boolean(
    tab === 'gamepad' && activePad && hidOk && !hasActuator && !hidAuthorized,
  )

  const identity = activePad ? identifyGamepad(activePad.id) : null

  useEffect(() => {
    if (!hidOk) {
      setHidAuthorized(false)
      return
    }
    let cancelled = false
    void listAuthorizedHidPads().then((devices) => {
      if (!cancelled) setHidAuthorized(devices.length > 0)
    })
    return () => {
      cancelled = true
    }
  }, [hidOk, activePad?.index])

  useEffect(() => {
    if (!listening) return
    if (tab !== 'gamepad') return

    const stop = listenNextGamepadButton((button) => {
      setConfig((prev) => {
        const next: ControlsConfig = {
          ...prev,
          bindings: {
            ...prev.bindings,
            [listening]: { kind: 'gamepadButton', button },
          },
        }
        saveControlsConfig(next)
        return next
      })
      setListening(null)
      setStatus(t('settings.controls.bindOk'))
    })

    return stop
  }, [listening, t, tab])

  useEffect(() => {
    if (!listening) return
    if (tab !== 'keyboard') return

    const onKey = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setConfig((prev) => {
        const next: ControlsConfig = {
          ...prev,
          keyboard: {
            ...prev.keyboard,
            [listening]: { kind: 'key', code: event.code },
          },
        }
        saveControlsConfig(next)
        return next
      })
      setListening(null)
      setStatus(t('settings.controls.bindOk'))
    }

    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [listening, t, tab])

  const selectAction = (action: ControlAction) => {
    setStatus(null)
    setListening((current) => (current === action ? null : action))
  }

  const runVibrate = async () => {
    if (!activePad) return
    const result = testGamepadVibration(activePad.index)
    if (result.ok) {
      setStatus(t('settings.controls.vibrateOk'))
      return
    }
    if (await rumbleAnyAuthorizedHid()) {
      setStatus(t('settings.controls.vibrateOk'))
      return
    }
    if (result.reason === 'no-actuator' && hidOk) {
      setStatus(t('settings.controls.vibrateNeedHid'))
      return
    }
    setStatus(
      result.reason === 'no-actuator'
        ? t('settings.controls.vibrateNoApi')
        : t('settings.controls.vibrateFail'),
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.tabs} role="tablist" aria-label={t('settings.controls.deviceTabs')}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'gamepad'}
          className={[styles.tab, tab === 'gamepad' ? styles.tabActive : '']
            .filter(Boolean)
            .join(' ')}
          onClick={() => {
            setTab('gamepad')
            setListening(null)
            setStatus(null)
          }}
        >
          {t('settings.controls.tabGamepad')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'keyboard'}
          className={[styles.tab, tab === 'keyboard' ? styles.tabActive : '']
            .filter(Boolean)
            .join(' ')}
          onClick={() => {
            setTab('keyboard')
            setListening(null)
            setStatus(null)
          }}
        >
          {t('settings.controls.tabKeyboard')}
        </button>
      </div>

      {tab === 'gamepad' && !activePad ? (
        <div className={styles.emptyStage}>
          <h2 className={styles.title}>{t('settings.controls.title')}</h2>
          <p className={styles.empty}>{t('settings.controls.noDevices')}</p>
          <p className={styles.hint}>{t('settings.controls.hint')}</p>
        </div>
      ) : (
        <div className={styles.stage}>
          <div className={styles.visualCol}>
            {tab === 'gamepad' ? (
              <>
                <div className={styles.deviceBar}>
                  <p className={styles.deviceName}>{identity?.name}</p>
                  {gamepads.length > 1 ? (
                    <p className={styles.deviceExtra}>
                      {t('settings.controls.morePads').replace(
                        '{count}',
                        String(gamepads.length - 1),
                      )}
                    </p>
                  ) : null}
                </div>
                <GamepadArt
                  family={identity?.family ?? 'xbox'}
                  live={live}
                  listening={listening}
                  onSelectAction={selectAction}
                />
              </>
            ) : (
              <>
                <div className={styles.deviceBar}>
                  <p className={styles.deviceName}>
                    {t('settings.controls.keyboardTitle')}
                  </p>
                </div>
                <KeyboardArt
                  config={config}
                  listening={listening}
                  onSelectAction={selectAction}
                />
              </>
            )}

            <p className={styles.listenHint} role="status">
              {listening
                ? tab === 'keyboard'
                  ? t('settings.controls.listeningKey')
                  : t('settings.controls.listening')
                : tab === 'keyboard'
                  ? t('settings.controls.hotspotHintKey')
                  : t('settings.controls.hotspotHint')}
            </p>
          </div>

          <div className={styles.sideCol}>
            <div className={styles.toolbar}>
              {tab === 'gamepad' ? (
                <>
                  <Button type="button" variant="ghost" onClick={() => void runVibrate()}>
                    {t('settings.controls.vibrate')}
                  </Button>
                  {showHidAccess ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        void (async () => {
                          try {
                            const device = await authorizeHidRumble()
                            if (!device) {
                              setStatus(t('settings.controls.hidCancel'))
                              return
                            }
                            setHidAuthorized(true)
                            const ok = await rumbleHidDevice(device)
                            setStatus(
                              ok
                                ? t('settings.controls.hidOk')
                                : t('settings.controls.hidFail'),
                            )
                          } catch {
                            setStatus(t('settings.controls.hidFail'))
                          }
                        })()
                      }}
                    >
                      {t('settings.controls.hidAuthorize')}
                    </Button>
                  ) : null}
                </>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  const next = structuredClone(DEFAULT_CONTROLS)
                  setConfig(next)
                  saveControlsConfig(next)
                  setListening(null)
                  setStatus(t('settings.controls.resetOk'))
                }}
              >
                {t('settings.controls.reset')}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => selectAction(listening ? listening : 'confirm')}
              >
                {listening
                  ? t('settings.controls.cancelListen')
                  : t('settings.controls.configure')}
              </Button>
            </div>

            {status ? (
              <p className={styles.status} role="status">
                {status}
              </p>
            ) : null}

            <ul className={styles.bindList}>
              {CONTROL_ACTIONS.map((action) => {
                const active = listening === action
                const value =
                  tab === 'keyboard'
                    ? formatKeyCode(config.keyboard[action].code)
                    : buttonCaption(
                        identity?.family ?? 'xbox',
                        config.bindings[action].button,
                        t('settings.controls.button'),
                      )
                return (
                  <li key={action}>
                    <button
                      type="button"
                      className={[styles.bindRow, active ? styles.bindActive : '']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => selectAction(action)}
                    >
                      <span className={styles.bindAction}>
                        {t(`settings.controls.actions.${action}`)}
                      </span>
                      <span className={styles.bindValue}>{value}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
