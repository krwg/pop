;(() => {
  /* ═══════════════════════════════════════════
     Constants & DOM
     ═══════════════════════════════════════════ */
  const SAVE_KEY = 'pop-2048-save-v3'
  const BEST_KEY = 'pop-2048-best-v2'
  const STATS_KEY = 'pop-2048-stats-v1'
  const VOL_KEY = 'pop-2048-vol'
  const MUSIC_KEY = 'pop-2048-music-vol'
  const MOVE_MS = 160
  const INTRO_MS = 4200
  const STAGE_THRESHOLDS = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144]

  const els = {
    worldBg: document.getElementById('world-bg'),
    worldBgNext: document.getElementById('world-bg-next'),
    intro: document.getElementById('intro'),
    menu: document.getElementById('menu-screen'),
    pixelSlider: document.getElementById('pixel-slider'),
    pixelFill: document.getElementById('pixel-slider-fill'),
    musicSlider: document.getElementById('music-slider'),
    musicFill: document.getElementById('music-slider-fill'),
    mode: document.getElementById('mode-screen'),
    stats: document.getElementById('stats-screen'),
    settings: document.getElementById('settings-screen'),
    about: document.getElementById('about-screen'),
    play: document.getElementById('play'),
    continueBtn: document.getElementById('btn-continue'),
    gridBg: document.getElementById('grid-bg'),
    tilesLayer: document.getElementById('tiles'),
    score: document.getElementById('score'),
    best: document.getElementById('best'),
    modeLabel: document.getElementById('mode-label'),
    floatScore: document.getElementById('float-score'),
    toast: document.getElementById('toast'),
    pause: document.getElementById('pause-modal'),
    end: document.getElementById('end-modal'),
    endTitle: document.getElementById('end-title'),
    endScore: document.getElementById('end-score'),
    endContinue: document.getElementById('end-continue'),
    volume: document.getElementById('volume'),
    volValue: document.getElementById('vol-value'),
    musicVolume: document.getElementById('music-volume'),
    musicValue: document.getElementById('music-value'),
    statBestClassic: document.getElementById('stat-best-classic'),
    statBestMini: document.getElementById('stat-best-mini'),
    statGames: document.getElementById('stat-games'),
    statWins: document.getElementById('stat-wins'),
    statPeak: document.getElementById('stat-peak'),
    statTotal: document.getElementById('stat-total'),
  }

  /* ═══════════════════════════════════════════
     State
     ═══════════════════════════════════════════ */
  let tiles = []
  let size = 4
  let score = 0
  let best = loadBest()
  let stats = loadStats()
  let mode = 'classic'
  let won = false
  let over = false
  let keepPlaying = false
  let nextId = 1
  let busy = false
  let undoStack = null
  let padLatch = 0
  let padStartLatch = false
  let padALatch = false
  let padBLatch = false
  let toastTimer = 0
  let metrics = { cell: 80, gap: 8 }
  let stageIndex = 0
  let gameCounted = false
  let padItems = []
  let padIndex = 0
  let introDone = false
  let toastShown = false
  let settingsReturn = 'menu'
  let moveTimer = null

  /* ═══════════════════════════════════════════
     Persist
     ═══════════════════════════════════════════ */
  function loadBest() {
    try {
      return JSON.parse(localStorage.getItem(BEST_KEY) || '{"classic":0,"mini":0}')
    } catch {
      return { classic: 0, mini: 0 }
    }
  }

  function saveBest() {
    localStorage.setItem(BEST_KEY, JSON.stringify(best))
  }

  function loadStats() {
    try {
      return JSON.parse(
        localStorage.getItem(STATS_KEY) ||
          '{"games":0,"wins":0,"peak":2,"totalScore":0}',
      )
    } catch {
      return { games: 0, wins: 0, peak: 2, totalScore: 0 }
    }
  }

  function saveStats() {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  }

  function bestForMode() {
    return best[mode] || 0
  }

  function stageUrl(index) {
    const n = String(Math.max(1, Math.min(10, index + 1))).padStart(2, '0')
    return `./bg/stage-${n}.jpg`
  }

  /* ═══════════════════════════════════════════
     World & board chrome
     ═══════════════════════════════════════════ */
  function setWorldBg(url, { fade = true } = {}) {
    if (!fade) {
      els.worldBg.style.backgroundImage = `url('${url}')`
      els.worldBg.style.opacity = '1'
      els.worldBgNext.style.opacity = '0'
      return
    }
    els.worldBgNext.style.backgroundImage = `url('${url}')`
    els.worldBgNext.style.opacity = '1'
    window.setTimeout(() => {
      els.worldBg.style.backgroundImage = `url('${url}')`
      els.worldBgNext.style.opacity = '0'
    }, 900)
  }

  function syncStageFromPeak(peak, { force = false } = {}) {
    
    let idx = 0
    for (let i = 0; i < STAGE_THRESHOLDS.length; i += 1) {
      if (peak >= STAGE_THRESHOLDS[i]) idx = Math.min(i + 1, 9)
    }
    if (!force && idx === stageIndex) return
    stageIndex = idx
    setWorldBg(stageUrl(stageIndex), { fade: !force })
  }

  function setGlow() {
    const peak = Math.max(2, ...tiles.map((t) => t.value))
    const glow = Math.min(1, Math.log2(peak) / 12)
    document.documentElement.style.setProperty('--glow', String(0.28 + glow * 0.72))
    syncStageFromPeak(peak)
  }

  function measure() {
    const cell = els.gridBg.querySelector('.cell')
    if (!cell) return
    const cs = getComputedStyle(els.gridBg)
    metrics = {
      cell: cell.getBoundingClientRect().width,
      gap: parseFloat(cs.gap) || 8,
    }
  }

  function applyPos(tile) {
    const x = tile.c * (metrics.cell + metrics.gap)
    const y = tile.r * (metrics.cell + metrics.gap)
    tile.el.style.setProperty('--x', `${x}px`)
    tile.el.style.setProperty('--y', `${y}px`)
  }

  function tileClass(value) {
    if (value >= 4096) return 'tile vSuper pixelFrame'
    return `tile v${Math.min(value, 2048)} pixelFrame`
  }

  function paintTile(tile) {
    tile.el.className = tileClass(tile.value)
    tile.el.textContent = String(tile.value)
  }

  function createTileEl(value) {
    const el = document.createElement('div')
    el.className = tileClass(value)
    el.textContent = String(value)
    return el
  }

  function at(r, c) {
    return tiles.find((t) => t.r === r && t.c === c) || null
  }

  function emptyCells() {
    const out = []
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (!at(r, c)) out.push([r, c])
      }
    }
    return out
  }

  function spawn() {
    const free = emptyCells()
    if (!free.length) return null
    const [r, c] = free[Math.floor(Math.random() * free.length)]
    const value = Math.random() < 0.9 ? 2 : 4
    const el = createTileEl(value)
    const tile = { id: nextId++, value, r, c, el, merged: false }
    applyPos(tile)
    el.classList.add('spawn')
    els.tilesLayer.appendChild(el)
    tiles.push(tile)
    window.setTimeout(() => el.classList.remove('spawn'), 160)
    return tile
  }

  function snapshot() {
    return {
      mode,
      size,
      score,
      won,
      over,
      keepPlaying,
      nextId,
      tiles: tiles.map((t) => ({ id: t.id, value: t.value, r: t.r, c: t.c })),
    }
  }

  function autosave() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot()))
    refreshContinue()
  }

  function clearSave() {
    localStorage.removeItem(SAVE_KEY)
    refreshContinue()
  }

  function refreshContinue() {
    const has = Boolean(localStorage.getItem(SAVE_KEY))
    els.continueBtn.disabled = !has
  }

  function buildGridBg() {
    document.documentElement.style.setProperty('--size', String(size))
    els.gridBg.innerHTML = ''
    for (let i = 0; i < size * size; i += 1) {
      const cell = document.createElement('div')
      cell.className = 'cell pixelFrame'
      els.gridBg.appendChild(cell)
    }
    measure()
  }

  function syncBestLabel() {
    els.best.textContent = String(bestForMode())
  }

  function animateScoreTo(next) {
    const prev = Number(els.score.textContent) || 0
    els.score.textContent = String(next)
    if (next !== prev) {
      els.score.classList.remove('bump')
      void els.score.offsetWidth
      els.score.classList.add('bump')
    }
  }

  function showFloat(gain) {
    if (gain <= 0) return
    els.floatScore.hidden = false
    els.floatScore.textContent = `+${gain}`
    els.floatScore.classList.remove('floatScore')
    void els.floatScore.offsetWidth
    els.floatScore.classList.add('floatScore')
    window.setTimeout(() => {
      els.floatScore.hidden = true
    }, 700)
  }

  
  /* ═══════════════════════════════════════════
     Haptics & i18n helpers
     ═══════════════════════════════════════════ */
  function rumble(strong = 0.12, weak = 0.16, ms = 40) {
    const pads = navigator.getGamepads?.() || []
    for (const pad of pads) {
      if (!pad?.vibrationActuator?.playEffect) continue
      void pad.vibrationActuator
        .playEffect('dual-rumble', {
          startDelay: 0,
          duration: ms,
          strongMagnitude: Math.min(0.45, strong),
          weakMagnitude: Math.min(0.5, weak),
        })
        .catch(() => undefined)
    }
  }

  function rumbleMove() {
    rumble(0.05, 0.1, 22)
  }
  function rumbleMerge(gain) {
    if (gain >= 64) rumble(0.2, 0.28, 58)
    else if (gain >= 16) rumble(0.14, 0.2, 42)
    else rumble(0.1, 0.16, 32)
  }
  function rumbleWin() {
    rumble(0.22, 0.32, 160)
  }
  function rumbleLose() {
    rumble(0.16, 0.1, 110)
  }

  function tt(key) {
    return window.Pop2048I18n?.t?.(key) ?? key
  }

  function syncModeLabel() {
    els.modeLabel.textContent = mode === 'mini' ? tt('modeMini') : tt('modeClassic')
  }

  function showToast() {
    els.toast.hidden = false
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
      els.toast.hidden = true
    }, 4500)
  }

  function snapVol(v) {
    return Math.round(Math.max(0, Math.min(100, v)) / 5) * 5
  }

  function setVolumeUI(v) {
    const pct = snapVol(v)
    if (els.volume) els.volume.value = String(pct)
    document.querySelectorAll('[data-sync-sfx-val], #vol-value').forEach((el) => {
      el.textContent = `${pct}%`
    })
    document.querySelectorAll('[data-sync-sfx-fill], #pixel-slider-fill').forEach((el) => {
      el.style.width = `${pct}%`
    })
    document.querySelectorAll('[data-sync-sfx], #pixel-slider').forEach((el) => {
      el.setAttribute('aria-valuenow', String(pct))
    })
    window.Pop2048Audio?.setVolume(pct)
    localStorage.setItem(VOL_KEY, String(pct))
  }

  function setMusicUI(v) {
    const pct = snapVol(v)
    if (els.musicVolume) els.musicVolume.value = String(pct)
    document.querySelectorAll('[data-sync-music-val], #music-value').forEach((el) => {
      el.textContent = `${pct}%`
    })
    document.querySelectorAll('[data-sync-music-fill], #music-slider-fill').forEach((el) => {
      el.style.width = `${pct}%`
    })
    document.querySelectorAll('[data-sync-music], #music-slider').forEach((el) => {
      el.setAttribute('aria-valuenow', String(pct))
    })
    window.Pop2048Audio?.setMusicVolume(pct)
    localStorage.setItem(MUSIC_KEY, String(pct))
  }

  function bindSlider(slider, apply) {
    if (!slider) return
    const fromX = (clientX) => {
      const rect = slider.getBoundingClientRect()
      apply(((clientX - rect.left) / rect.width) * 100)
    }
    slider.addEventListener('pointerdown', (event) => {
      slider.setPointerCapture(event.pointerId)
      fromX(event.clientX)
    })
    slider.addEventListener('pointermove', (event) => {
      if (!slider.hasPointerCapture(event.pointerId)) return
      fromX(event.clientX)
    })
  }

  function initPixelSlider() {
    document.querySelectorAll('#pixel-slider, [data-sync-sfx]').forEach((el) => {
      bindSlider(el, setVolumeUI)
    })
    document.querySelectorAll('#music-slider, [data-sync-music]').forEach((el) => {
      bindSlider(el, setMusicUI)
    })
  }

  /* ═══════════════════════════════════════════
     Pad / keyboard focus
     ═══════════════════════════════════════════ */
  function activePadRoot() {
    if (!els.pause.hidden) return els.pause
    if (!els.end.hidden) return els.end
    if (!els.mode.hidden) return els.mode
    if (!els.stats.hidden) return els.stats
    if (!els.settings.hidden) return els.settings
    if (!els.about.hidden) return els.about
    if (!els.menu.hidden) return els.menu
    if (!els.play.hidden) return els.play
    return null
  }

  function refreshPadItems() {
    const root = activePadRoot()
    document.querySelectorAll('.is-pad-focus').forEach((el) => el.classList.remove('is-pad-focus'))
    if (!root) {
      padItems = []
      return
    }
    padItems = [...root.querySelectorAll('[data-pad-item]')].filter(
      (el) => !el.disabled && !el.hidden && el.getAttribute('hidden') == null,
    )
    if (!padItems.length) return
    padIndex = Math.min(padIndex, padItems.length - 1)
    padItems[padIndex].classList.add('is-pad-focus')
  }

  function movePadFocus(delta) {
    refreshPadItems()
    if (!padItems.length) return
    padItems[padIndex]?.classList.remove('is-pad-focus')
    padIndex = (padIndex + delta + padItems.length) % padItems.length
    const next = padItems[padIndex]
    
    next.classList.remove('is-pad-focus')
    void next.offsetWidth
    next.classList.add('is-pad-focus')
    next.scrollIntoView?.({ block: 'nearest' })
    window.Pop2048Audio?.ui()
  }

  function activatePadFocus() {
    refreshPadItems()
    const item = padItems[padIndex]
    if (!item) return
    if (item.hasAttribute('data-pad-sfx') || item.hasAttribute('data-pad-music')) return
    item.click()
  }

  function adjustFocusedVolume(dir) {
    const item = padItems[padIndex]
    if (!item) return false
    if (item.hasAttribute('data-pad-sfx')) {
      setVolumeUI(Number(els.volume.value) + dir * 5)
      return true
    }
    if (item.hasAttribute('data-pad-music')) {
      setMusicUI(Number(els.musicVolume.value) + dir * 5)
      return true
    }
    return false
  }

  function btnDown(button) {
    if (!button) return false
    return Boolean(button.pressed) || (typeof button.value === 'number' && button.value > 0.45)
  }

  function padBack() {
    window.Pop2048Audio?.uiBack()
    
    if (!els.settings.hidden) {
      document.getElementById('settings-back')?.click()
      return
    }
    if (!els.about.hidden) {
      showScreen('menu')
      return
    }
    if (!els.stats.hidden) {
      showScreen('menu')
      return
    }
    if (!els.mode.hidden) {
      showScreen('menu')
      return
    }
    if (!els.pause.hidden) {
      els.pause.hidden = true
      refreshPadItems()
      return
    }
    if (!els.end.hidden) {
      document.getElementById('end-menu')?.click()
      return
    }
    if (!els.menu.hidden) return
    if (!els.play.hidden) {
      els.pause.hidden = false
      refreshPadItems()
      return
    }
    showScreen('menu')
  }

  function canMove() {
    if (emptyCells().length) return true
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        const tile = at(r, c)
        if (!tile) continue
        const right = at(r, c + 1)
        const down = at(r + 1, c)
        if (right && right.value === tile.value) return true
        if (down && down.value === tile.value) return true
      }
    }
    return false
  }

  function slideLine(line, assignPos) {
    
    const result = []
    
    const removed = []
    
    const merged = []
    
    const mergeInto = new Map()
    let gained = 0
    let moved = false

    for (const tile of line) {
      const last = result[result.length - 1]
      if (last && !last.merged && last.value === tile.value) {
        last.value *= 2
        last.merged = true
        gained += last.value
        merged.push(last)
        removed.push(tile)
        mergeInto.set(tile.id, last)
      } else {
        result.push(tile)
      }
    }

    result.forEach((tile, i) => {
      const { r, c } = assignPos(i)
      if (tile.r !== r || tile.c !== c) moved = true
      tile.r = r
      tile.c = c
      applyPos(tile)
    })

    for (const tile of removed) {
      const target = mergeInto.get(tile.id)
      if (!target) continue
      if (tile.r !== target.r || tile.c !== target.c) moved = true
      tile.r = target.r
      tile.c = target.c
      applyPos(tile)
    }

    if (removed.length) moved = true
    return { moved, gained, removed, merged }
  }

  function vectors(dir) {
    if (dir === 'left') {
      return Array.from({ length: size }, (_, r) => ({
        line: () => tiles.filter((t) => t.r === r).sort((a, b) => a.c - b.c),
        assign: (i) => ({ r, c: i }),
      }))
    }
    if (dir === 'right') {
      return Array.from({ length: size }, (_, r) => ({
        line: () => tiles.filter((t) => t.r === r).sort((a, b) => b.c - a.c),
        assign: (i) => ({ r, c: size - 1 - i }),
      }))
    }
    if (dir === 'up') {
      return Array.from({ length: size }, (_, c) => ({
        line: () => tiles.filter((t) => t.c === c).sort((a, b) => a.r - b.r),
        assign: (i) => ({ r: i, c }),
      }))
    }
    return Array.from({ length: size }, (_, c) => ({
      line: () => tiles.filter((t) => t.c === c).sort((a, b) => b.r - a.r),
      assign: (i) => ({ r: size - 1 - i, c }),
    }))
  }

  function anyScreenOpen() {
    return (
      !els.menu.hidden ||
      !els.mode.hidden ||
      !els.stats.hidden ||
      !els.settings.hidden ||
      !els.about.hidden
    )
  }

  function playing() {
    return (
      !els.play.hidden &&
      els.pause.hidden &&
      els.end.hidden &&
      !anyScreenOpen()
    )
  }

  function noteGameStart() {
    if (gameCounted) return
    gameCounted = true
    stats.games += 1
    saveStats()
  }

  function noteProgress() {
    const peak = Math.max(2, ...tiles.map((t) => t.value), stats.peak || 2)
    if (peak > stats.peak) stats.peak = peak
    saveStats()
  }

  function noteWin() {
    stats.wins += 1
    saveStats()
  }

  function noteScoreDelta(delta) {
    if (delta <= 0) return
    stats.totalScore += delta
    saveStats()
  }

  /* ═══════════════════════════════════════════
     Gameplay
     ═══════════════════════════════════════════ */
  function move(dir) {
    if (busy || over || !playing()) return
    if (won && !keepPlaying) return

    measure()
    undoStack = snapshot()
    for (const t of tiles) t.merged = false

    let moved = false
    let gained = 0
    
    const removed = []
    
    const merged = []

    for (const row of vectors(dir)) {
      const res = slideLine(row.line(), row.assign)
      moved = moved || res.moved
      gained += res.gained
      removed.push(...res.removed)
      merged.push(...res.merged)
    }

    if (!moved) {
      undoStack = null
      return
    }

    busy = true
    noteGameStart()

    if (gained > 0) {
      score += gained
      noteScoreDelta(gained)
      showFloat(gained)
      window.Pop2048Audio?.merge(gained)
      rumbleMerge(gained)
    } else {
      window.Pop2048Audio?.move()
      rumbleMove()
    }

    animateScoreTo(score)
    if (score > bestForMode()) {
      best[mode] = score
      saveBest()
      syncBestLabel()
      window.Pop2048Audio?.record()
    }

    const removedIds = new Set(removed.map((t) => t.id))
    tiles = tiles.filter((t) => !removedIds.has(t.id))

    if (moveTimer != null) window.clearTimeout(moveTimer)
    moveTimer = window.setTimeout(() => {
      moveTimer = null
      for (const dead of removed) dead.el.remove()

      for (const m of merged) {
        if (!tiles.includes(m)) continue
        paintTile(m)
        m.el.classList.add('merge')
        window.setTimeout(() => m.el.classList.remove('merge'), 160)
        if (m.value === 2048) {
          m.el.classList.add('crystal')
          window.setTimeout(() => m.el.classList.remove('crystal'), 560)
        }
      }

      spawn()
      noteProgress()

      if (!won && tiles.some((t) => t.value >= 2048)) {
        won = true
        keepPlaying = false
        noteWin()
        window.Pop2048Audio?.win()
        rumbleWin()
        showEnd(tt('win'), true)
      } else if (!canMove()) {
        over = true
        window.Pop2048Audio?.lose()
        rumbleLose()
        showEnd(tt('lose'), false)
      }

      setGlow()
      autosave()
      busy = false
    }, MOVE_MS)
  }

  function showEnd(title, canContinue) {
    els.endTitle.textContent = title
    els.endScore.textContent = String(score)
    els.endContinue.hidden = !canContinue
    els.end.hidden = false
    padIndex = 0
    refreshPadItems()
  }

  function hideEnd() {
    els.end.hidden = true
  }

  function clearTiles() {
    tiles.forEach((t) => t.el.remove())
    tiles = []
  }

  function hideAllScreens() {
    els.menu.classList.remove('show')
    els.menu.hidden = true
    els.mode.hidden = true
    els.stats.hidden = true
    els.settings.hidden = true
    els.about.hidden = true
  }

  /* ═══════════════════════════════════════════
     Screens & transitions
     ═══════════════════════════════════════════ */
  function runBehindCurtain(work, holdMs = 700) {
    const curtain = document.getElementById('play-curtain')
    if (!curtain) {
      work()
      return
    }
    
    curtain.style.transition = 'none'
    curtain.classList.add('is-on')
    curtain.setAttribute('aria-hidden', 'false')
    void curtain.offsetWidth
    work()
    window.setTimeout(() => {
      curtain.style.transition = ''
      curtain.classList.remove('is-on')
      curtain.setAttribute('aria-hidden', 'true')
    }, holdMs)
  }

  function applyScreen(name) {
    hideAllScreens()
    els.play.hidden = true
    hideEnd()
    els.pause.hidden = true
    if (name === 'menu') {
      els.menu.hidden = false
      els.menu.classList.add('show')
      setWorldBg('./bg/menu.jpg', { fade: false })
      refreshContinue()
      if (introDone && !toastShown) {
        toastShown = true
        showToast()
      }
    } else if (name === 'mode') {
      els.mode.hidden = false
    } else if (name === 'stats') {
      renderStats()
      els.stats.hidden = false
    } else if (name === 'settings') {
      els.settings.hidden = false
    } else if (name === 'about') {
      els.about.hidden = false
    }
    padIndex = 0
    refreshPadItems()
    window.Pop2048Audio?.ui()
  }

  function showScreen(name) {
    const leavingPlay = !els.play.hidden && name !== 'play'
    if (leavingPlay) {
      runBehindCurtain(() => applyScreen(name), 700)
      return
    }
    applyScreen(name)
  }

  function renderStats() {
    els.statBestClassic.textContent = String(best.classic || 0)
    els.statBestMini.textContent = String(best.mini || 0)
    els.statGames.textContent = String(stats.games || 0)
    els.statWins.textContent = String(stats.wins || 0)
    els.statPeak.textContent = String(stats.peak || 2)
    els.statTotal.textContent = String(stats.totalScore || 0)
  }

  function resetBoard(nextMode) {
    mode = nextMode === 'mini' ? 'mini' : 'classic'
    size = mode === 'mini' ? 3 : 4
    score = 0
    won = false
    over = false
    keepPlaying = false
    nextId = 1
    undoStack = null
    gameCounted = false
    clearTiles()
    syncModeLabel()
    buildGridBg()
    syncBestLabel()
    animateScoreTo(0)
    spawn()
    spawn()
    stageIndex = -1
    setGlow()
    autosave()
  }

  function restore(data) {
    mode = data.mode === 'mini' ? 'mini' : 'classic'
    size = data.size || (mode === 'mini' ? 3 : 4)
    score = data.score || 0
    won = Boolean(data.won)
    over = Boolean(data.over)
    keepPlaying = Boolean(data.keepPlaying)
    nextId = data.nextId || 1
    undoStack = null
    gameCounted = true
    clearTiles()
    syncModeLabel()
    buildGridBg()
    syncBestLabel()
    animateScoreTo(score)
    for (const raw of data.tiles || []) {
      const el = createTileEl(raw.value)
      
      const tile = {
        id: raw.id,
        value: raw.value,
        r: raw.r,
        c: raw.c,
        el,
        merged: false,
      }
      applyPos(tile)
      els.tilesLayer.appendChild(el)
      tiles.push(tile)
      nextId = Math.max(nextId, raw.id + 1)
    }
    stageIndex = -1
    setGlow()
  }

  function openPlay() {
    runBehindCurtain(() => {
      hideAllScreens()
      els.play.hidden = false
      hideEnd()
      els.pause.hidden = true
      els.toast.hidden = true
      measure()
      for (const t of tiles) applyPos(t)
      const peak = Math.max(2, ...tiles.map((t) => t.value), 2)
      stageIndex = -1
      syncStageFromPeak(peak, { force: true })
      padIndex = 0
      refreshPadItems()
    }, 900)
  }

  function undo() {
    if (!undoStack) return
    if (moveTimer != null) {
      window.clearTimeout(moveTimer)
      moveTimer = null
    }
    busy = false
    const snap = undoStack
    
    restore(snap)
    undoStack = null
    hideEnd()
    measure()
    for (const t of tiles) applyPos(t)
    setGlow()
    autosave()
    refreshPadItems()
  }

  function goParent() {
    try {
      if (window.top && window.top !== window) {
        const topUrl = new URL(window.top.location.href)
        const prefix =
          topUrl.pathname === '/pop' || topUrl.pathname.startsWith('/pop/')
            ? '/pop/'
            : '/'
        window.top.location.href = `${topUrl.origin}${prefix}`
        return
      }
    } catch {}
    window.location.href = '../../'
  }

  function runIntro() {
    return new Promise((resolve) => {
      let finished = false
      const finish = () => {
        if (finished) return
        finished = true
        introDone = true
        els.intro.classList.add('is-done')
        resolve()
      }

      const playSting = () => {
        window.Pop2048Audio?.ensure?.()
        window.Pop2048Audio?.intro()
      }
      
      playSting()
      window.setTimeout(finish, INTRO_MS)
      els.intro.addEventListener(
        'click',
        () => {
          playSting()
          finish()
        },
        { once: true },
      )
    })
  }

  
  /* ═══════════════════════════════════════════
     UI bindings
     ═══════════════════════════════════════════ */
  document.getElementById('btn-new')?.addEventListener('click', () => showScreen('mode'))
  document.getElementById('btn-stats')?.addEventListener('click', () => showScreen('stats'))
  document.getElementById('btn-about')?.addEventListener('click', () => showScreen('about'))

  els.continueBtn.addEventListener('click', () => {
    if (els.continueBtn.disabled) return
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return
    try {
      restore(JSON.parse(raw))
      openPlay()
    } catch {
      clearSave()
    }
  })

  document.querySelectorAll('[data-start]').forEach((btn) => {
    btn.addEventListener('click', () => {
      clearSave()
      resetBoard(btn.getAttribute('data-start') || 'classic')
      openPlay()
    })
  })

  document.querySelectorAll('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => {
      showScreen(btn.getAttribute('data-back') || 'menu')
    })
  })

  document.getElementById('btn-undo')?.addEventListener('click', undo)
  document.getElementById('btn-exit')?.addEventListener('click', () => {
    goParent()
  })
  document.getElementById('pause-resume')?.addEventListener('click', () => {
    els.pause.hidden = true
    refreshPadItems()
  })
  document.getElementById('pause-settings')?.addEventListener('click', () => {
    settingsReturn = 'pause'
    els.pause.hidden = true
    els.settings.hidden = false
    padIndex = 0
    refreshPadItems()
    window.Pop2048Audio?.ui()
  })
  document.getElementById('lang-ru')?.addEventListener('click', () => {
    window.Pop2048I18n?.setLocale('ru')
    syncModeLabel()
    refreshPadItems()
    window.Pop2048Audio?.ui()
  })
  document.getElementById('lang-en')?.addEventListener('click', () => {
    window.Pop2048I18n?.setLocale('en')
    syncModeLabel()
    refreshPadItems()
    window.Pop2048Audio?.ui()
  })
  document.getElementById('settings-back')?.addEventListener('click', () => {
    els.settings.hidden = true
    if (settingsReturn === 'pause') {
      els.pause.hidden = false
    } else {
      showScreen('menu')
      return
    }
    padIndex = 0
    refreshPadItems()
  })
  document.getElementById('pause-menu')?.addEventListener('click', () => {
    showScreen('menu')
  })
  document.getElementById('pause-exit')?.addEventListener('click', () => {
    goParent()
  })
  document.getElementById('end-restart')?.addEventListener('click', () => {
    hideEnd()
    resetBoard(mode)
    refreshPadItems()
  })
  document.getElementById('end-menu')?.addEventListener('click', () => {
    clearSave()
    showScreen('menu')
  })
  document.getElementById('end-exit')?.addEventListener('click', () => {
    goParent()
  })
  els.endContinue.addEventListener('click', () => {
    keepPlaying = true
    hideEnd()
    refreshPadItems()
  })

  initPixelSlider()
  const savedVol = Number(localStorage.getItem(VOL_KEY) || 55)
  const savedMusic = Number(localStorage.getItem(MUSIC_KEY) || 40)
  setVolumeUI(Number.isFinite(savedVol) ? savedVol : 55)
  setMusicUI(Number.isFinite(savedMusic) ? savedMusic : 40)

  window.addEventListener('keydown', (event) => {
    if (!introDone && !els.intro.classList.contains('is-done')) return

    if (event.code === 'Escape') {
      event.preventDefault()
      padBack()
      refreshPadItems()
      return
    }

    const inMenuUi = !playing()
    if (inMenuUi) {
      if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault()
        movePadFocus(-1)
        return
      }
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        event.preventDefault()
        movePadFocus(1)
        return
      }
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault()
        activatePadFocus()
        return
      }
      if (event.code === 'Backspace') {
        event.preventDefault()
        padBack()
        refreshPadItems()
        return
      }
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        event.preventDefault()
        if (!adjustFocusedVolume(-1)) movePadFocus(-1)
        return
      }
      if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        event.preventDefault()
        if (!adjustFocusedVolume(1)) movePadFocus(1)
        return
      }
      return
    }

    const map = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
      KeyA: 'left',
      KeyD: 'right',
      KeyW: 'up',
      KeyS: 'down',
    }
    const dir = map[event.code]
    if (!dir) return
    event.preventDefault()
    move(dir)
  })

  function padDir(pad) {
    const ud = (btnDown(pad.buttons[12]) ? -1 : 0) + (btnDown(pad.buttons[13]) ? 1 : 0)
    const lr = (btnDown(pad.buttons[14]) ? -1 : 0) + (btnDown(pad.buttons[15]) ? 1 : 0)
    const axX = Math.abs(pad.axes[0] || 0) > 0.5 ? Math.sign(pad.axes[0]) : 0
    const axY = Math.abs(pad.axes[1] || 0) > 0.5 ? Math.sign(pad.axes[1]) : 0
    const x = lr || axX
    const y = ud || axY
    if (y < 0) return 3
    if (y > 0) return 4
    if (x < 0) return 1
    if (x > 0) return 2
    return 0
  }

  /* ═══════════════════════════════════════════
     Gamepad poll
     ═══════════════════════════════════════════ */
  function pollPad() {
    if (!introDone) {
      requestAnimationFrame(pollPad)
      return
    }
    const pads = navigator.getGamepads?.() || []
    for (const pad of pads) {
      if (!pad) continue

      const dirCode = padDir(pad)
      if (dirCode && dirCode !== padLatch) {
        padLatch = dirCode
        if (playing()) {
          const dirs = { 1: 'left', 2: 'right', 3: 'up', 4: 'down' }
          move(dirs[dirCode])
        } else if (dirCode === 1 || dirCode === 2) {
          if (!adjustFocusedVolume(dirCode === 2 ? 1 : -1)) {
            
            movePadFocus(dirCode === 2 ? 1 : -1)
          }
        } else if (dirCode === 3) movePadFocus(-1)
        else if (dirCode === 4) movePadFocus(1)
      } else if (!dirCode) {
        padLatch = 0
      }

      const start = btnDown(pad.buttons[9]) || btnDown(pad.buttons[8])
      if (start && !padStartLatch) {
        const overlayOpen =
          !els.settings.hidden ||
          !els.about.hidden ||
          !els.stats.hidden ||
          !els.mode.hidden
        if (!overlayOpen && !els.play.hidden && els.end.hidden) {
          els.pause.hidden = !els.pause.hidden
          refreshPadItems()
        }
      }
      padStartLatch = start

      const a = btnDown(pad.buttons[0])
      if (a && !padALatch) {
        if (!playing() || !els.pause.hidden || !els.end.hidden || !els.settings.hidden) {
          activatePadFocus()
        }
      }
      padALatch = a

      const b = btnDown(pad.buttons[1])
      if (b && !padBLatch) {
        if (
          playing() &&
          els.pause.hidden &&
          els.end.hidden &&
          els.settings.hidden
        ) {
          els.pause.hidden = false
          refreshPadItems()
        } else {
          padBack()
          refreshPadItems()
        }
      }
      padBLatch = b
    }
    requestAnimationFrame(pollPad)
  }
  requestAnimationFrame(pollPad)
  window.addEventListener('gamepadconnected', () => {
    refreshPadItems()
  })

  window.addEventListener('resize', () => {
    measure()
    for (const t of tiles) applyPos(t)
  })

  
  const unlock = () => {
    window.Pop2048Audio?.ensure?.()
    window.Pop2048Audio?.startAmbient?.()
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock)
  window.addEventListener('keydown', unlock)

  /* ═══════════════════════════════════════════
     Boot
     ═══════════════════════════════════════════ */
  window.Pop2048I18n?.init?.()
  window.Pop2048I18n?.onChange?.(() => {
    syncModeLabel()
  })
  setWorldBg('./bg/menu.jpg', { fade: false })
  refreshContinue()
  els.menu.hidden = true
  void runIntro().then(() => {
    window.Pop2048Audio?.startAmbient?.()
    if (els.play.hidden) showScreen('menu')
  })
})()
