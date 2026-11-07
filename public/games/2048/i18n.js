;(() => {
  /* ═══════════════════════════════════════════
     Locale dictionaries
     ═══════════════════════════════════════════ */
  const LAUNCHER_LOCALE_KEY = 'pop:locale'
  const GAME_LOCALE_KEY = 'pop-2048-locale'

  const dict = {
    ru: {
      toastPad: 'Для этой игры лучше использовать геймпад',
      newGame: 'Новая игра',
      continue: 'Продолжить',
      stats: 'Статистика',
      about: 'Об игре',
      exit: 'Выйти',
      modeTitle: 'Новая игра',
      classic: 'Classic · 4×4',
      mini: 'Mini · 3×3',
      back: 'Назад',
      statsTitle: 'Статистика',
      statBestClassic: 'Рекорд Classic',
      statBestMini: 'Рекорд Mini',
      statGames: 'Игр сыграно',
      statWins: 'Побед (2048+)',
      statPeak: 'Лучшая плитка',
      statTotal: 'Всего очков',
      settingsTitle: 'Настройки',
      sfx: 'Звук',
      music: 'Музыка',
      language: 'Язык',
      langRu: 'Русский',
      langEn: 'English',
      aboutTitle: 'Об игре',
      aboutMeta: '[0.4.1]',
      score: 'Счёт',
      best: 'Рекорд',
      undo: 'Отмена хода',
      pause: 'Пауза',
      resume: 'Продолжить',
      settings: 'Настройки',
      toMenu: 'В главное меню',
      win: 'Победа',
      lose: 'Конец игры',
      endScore: 'Счёт:',
      playOn: 'Играть дальше',
      restart: 'Заново',
      modeClassic: 'Classic · 4×4',
      modeMini: 'Mini · 3×3',
    },
    en: {
      toastPad: 'A gamepad works best for this game',
      newGame: 'New Game',
      continue: 'Continue',
      stats: 'Statistics',
      about: 'About',
      exit: 'Exit',
      modeTitle: 'New Game',
      classic: 'Classic · 4×4',
      mini: 'Mini · 3×3',
      back: 'Back',
      statsTitle: 'Statistics',
      statBestClassic: 'Classic best',
      statBestMini: 'Mini best',
      statGames: 'Games played',
      statWins: 'Wins (2048+)',
      statPeak: 'Best tile',
      statTotal: 'Total score',
      settingsTitle: 'Settings',
      sfx: 'Sound',
      music: 'Music',
      language: 'Language',
      langRu: 'Русский',
      langEn: 'English',
      aboutTitle: 'About',
      aboutMeta: '[0.4.1]',
      score: 'Score',
      best: 'Best',
      undo: 'Undo',
      pause: 'Paused',
      resume: 'Resume',
      settings: 'Settings',
      toMenu: 'Main Menu',
      win: 'You Win',
      lose: 'Game Over',
      endScore: 'Score:',
      playOn: 'Keep Going',
      restart: 'Restart',
      modeClassic: 'Classic · 4×4',
      modeMini: 'Mini · 3×3',
    },
  }

  /* ═══════════════════════════════════════════
     Runtime
     ═══════════════════════════════════════════ */
  let locale = 'ru'
  const listeners = []

  function readLauncherLocale() {
    try {
      const v = localStorage.getItem(LAUNCHER_LOCALE_KEY)
      if (v === 'ru' || v === 'en') return v
    } catch {}
    return null
  }

  function readGameOverride() {
    try {
      const v = localStorage.getItem(GAME_LOCALE_KEY)
      if (v === 'ru' || v === 'en') return v
    } catch {}
    return null
  }

  function detect() {
    return readGameOverride() || readLauncherLocale() || 'ru'
  }

  function t(key) {
    const table = dict[locale] || dict.ru
    return table[key] ?? dict.ru[key] ?? key
  }

  function applyDom(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n')
      if (!key) return
      const value = t(key)
      if (el.hasAttribute('data-i18n-html')) el.innerHTML = value
      else el.textContent = value
    })
    root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const raw = el.getAttribute('data-i18n-attr')
      if (!raw) return
      raw.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim())
        if (attr && key) el.setAttribute(attr, t(key))
      })
    })
    document.documentElement.lang = locale
    document.querySelectorAll('[data-lang-option]').forEach((el) => {
      const code = el.getAttribute('data-lang-option')
      el.classList.toggle('is-lang-active', code === locale)
    })
  }

  function setLocale(next, { persist = true } = {}) {
    if (next !== 'ru' && next !== 'en') return
    locale = next
    if (persist) {
      try {
        localStorage.setItem(GAME_LOCALE_KEY, next)
      } catch {}
    }
    applyDom()
    listeners.forEach((fn) => fn(locale))
  }

  function init() {
    locale = detect()
    applyDom()
  }

  function onChange(fn) {
    listeners.push(fn)
    return () => {
      const i = listeners.indexOf(fn)
      if (i >= 0) listeners.splice(i, 1)
    }
  }

  window.Pop2048I18n = {
    init,
    t,
    applyDom,
    setLocale,
    getLocale: () => locale,
    onChange,
    LAUNCHER_LOCALE_KEY,
    GAME_LOCALE_KEY,
  }
})()
