# 2048 — PILLARS OF PIXELS (Warm Ember)

**Version 0.4.1** · **PC** · web runtime (iframe inside GameHub) · locales **RU / EN**

---

## Store / library blurb

2048 это простая, но затягивающая головоломка в тёплом пиксельном оформлении Warm Ember. Передвигай плитки по полю, объединяй одинаковые числа и постарайся добраться до 2048. А если получится, продолжай играть и побей собственный рекорд.

Выбирай классическое поле 4×4 или попробуй Mini 3×3, где каждый ход на счету. Играй с клавиатуры или геймпада, отменяй неудачные ходы и возвращайся к своей партии, когда захочешь. Прогресс сохраняется автоматически.

### Art

- Cover: `cover.png` — **600×900**
- Library hero: `library-hero.png` — **1920×620**

## Player guide

### What it is

Warm Ember pixel puzzle: slide tiles, merge equals, reach **2048**, then chase a personal best. Classic 4×4 or Mini 3×3; keyboard or gamepad; undo and autosave.

### Modes

| Mode | Board | Feel |
| --- | --- | --- |
| **Classic** | 4×4 | Standard 2048 pacing and space |
| **Mini** | 3×3 | Tighter board, faster pressure, same rules |

Choose the mode when you start a **New Game**. High scores are tracked separately for Classic and Mini.

### Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move tiles | Arrow keys / WASD | D-pad or left stick |
| Pause | Esc | Start / Select; B while playing |
| Confirm menu item | Enter / Space | A |
| Move menu focus | ↑↓ (←→ also steps) | D-pad / stick |
| Adjust volume (focused slider) | ←→ | ←→ |
| Back / close overlay | Esc, Backspace, B | B |
| Undo last move | Undo button (side panel) | Focus Undo + A |

Menus highlight **only the focused row**. Opening a screen puts focus on the top enabled item (for example **New Game**). Hover and pad focus use the same accent treatment; idle items share one ghost style — nothing stays permanently yellow.

### Pause & settings

- **Pause** is available during a run (Esc / Start / B).
- **Settings** open only from Pause (sound + language).
- While Settings is open, Esc / B / Start **do not** reopen Pause — they leave Settings first.
- Leaving Settings from a paused run returns you to the Pause menu.

### Persistence & stats

Everything is stored in the browser (`localStorage`):

- Autosaved mid-run so **Continue** can resume
- Best score per mode
- Lifetime stats: games played, wins (reached 2048+), peak tile, total score
- SFX / music volumes
- Optional game language override (`pop-2048-locale`); if unset, the game follows the launcher locale (`pop:locale`)

### Backdrops & staging

- **Menu** uses a dedicated pixel plate (`bg/menu.jpg`).
- **Play** uses a separate set (`bg/stage-01.jpg` … `stage-10.jpg`), never the menu art.
- All plates are **2560×1440** chunky pixel JPEG.
- Stage index advances with peak tile: base plate until **1024**, then swaps at **1024 → 2048 → 4096 → 8192 → …**
- Starting a run holds a **dark curtain ~1.6s**, then fades in over ~1.2s (about **2.5–3s** total).

### Haptics

When the browser exposes `vibrationActuator`, rumble is soft and tiered:

| Event | Feel |
| --- | --- |
| Move without merge | Very light short tick |
| Small merge | Soft pulse |
| Larger merge | Slightly stronger / longer |
| Win (2048) | Gentle celebration pulse |
| Game over | Soft thud |

Launcher **Controls → Vibration** test uses the same gentle magnitudes. The **HID access** button appears **only** when WebHID exists, the connected pad has **no** Gamepad haptic actuator, and HID rumble has **not** been authorized yet.

### Language

Open **Settings** (from Pause) and pick **Русский** / **English**. Default on first launch matches the GameHub launcher language.

---

## Technical description

### Placement in GameHub

| Piece | Path / role |
| --- | --- |
| Catalog seed | `src/client/seed/g2048.ts` — id `2048`, `runtime.entry = /games/2048/index.html`, PC-only |
| Static game | `public/games/2048/` |
| Play shell | `src/pages/PlayPage.tsx` iframe with `allow="fullscreen; gamepad; autoplay"` |
| Manifest | `public/games/2048/manifest.json` |
| Long-form docs | `public/games/2048/DESCRIPTION.md` (this file) |

Exit to the hub uses parent navigation / messaging from the iframe.

### Runtime stack (inside the iframe)

| Layer | Implementation |
| --- | --- |
| UI | Single-page HTML + CSS (`index.html`, `style.css`) |
| Logic | `game.js` IIFE |
| Audio | `audio.js` — Web Audio SFX + ambient, separate gains |
| i18n | `i18n.js` — RU/EN dictionaries, `data-i18n` DOM apply |
| Input | Keyboard + Gamepad API (`requestAnimationFrame` poll) |
| Focus | `[data-pad-item]` + `.is-pad-focus`; lists dim non-focused siblings via `:has()` |
| Persist | `pop-2048-save-v3`, `pop-2048-best-v2`, `pop-2048-stats-v1`, volume keys, `pop-2048-locale` |

### Core gameplay (`game.js`)

- Board as tile objects `{ id, value, r, c, el }`.
- Moves compress and merge along lines; one undo snapshot per successful move.
- `MOVE_MS` (~160) matches CSS `--move-ms`.
- Win when any tile ≥ 2048; optional continue; lose when no moves remain.
- `settingsReturn ∈ {'menu','pause'}` restores the correct screen after Settings.
- `padBack()` prioritizes Settings / overlays before toggling Pause.
- Stage sync: `STAGE_THRESHOLDS = [1024,2048,4096,…]`; index `0` is play base, then `min(i+1, 9)`.

### Visual pipeline

1. Generate muted Warm Ember **pixel-art** sources.
2. ffmpeg: `scale=320:180:flags=area` → `scale=2560:1440:flags=neighbor` → mild `eq` mute.
3. CSS: `image-rendering: pixelated` + dark veil so UI stays readable.

### Launcher controls integration

- `src/settings/controls/useGamepadInput.ts` — gentle `testGamepadVibration`, `padHasHapticActuator`.
- `src/settings/controls/hidRumble.ts` — WebHID fallback with reduced motor strengths.
- `ControlsPanel` shows **HID access** only when `hidOk && !hasActuator && !hidAuthorized`.

### Versioning

Bump game `version` in seed + manifest together with About / DESCRIPTION when shipping playable changes.
