export type LocaleCode = 'ru' | 'en'

export type MessageTree = {
  brand: {
    name: string
    short: string
  }
  nav: {
    home: string
    library: string
    store: string
    settings: string
    about: string
    primary: string
  }
  platform: {
    label: string
    web: string
    pc: string
    mobile: string
    blocked: string
    blockedShort: string
    device: {
      mobile: string
      tablet: string
      desktop: string
    }
    os: {
      windows: string
      macos: string
      linux: string
      android: string
      ios: string
      other: string
    }
  }
  settings: {
    navLabel: string
    home: {
      nav: string
      envTitle: string
      sectionsTitle: string
      device: string
      browser: string
      controlsText: string
      importText: string
    }
    controls: {
      nav: string
      title: string
      lead: string
      devices: string
      noDevices: string
      hint: string
      hotspotHint: string
      hotspotHintKey: string
      deviceTabs: string
      tabGamepad: string
      tabKeyboard: string
      keyboardTitle: string
      bindings: string
      reset: string
      rebind: string
      cancelListen: string
      listening: string
      listeningKey: string
      button: string
      vibrate: string
      vibrateOk: string
      vibrateFail: string
      vibrateNoApi: string
      vibrateNeedHid: string
      hidAuthorize: string
      hidOk: string
      hidFail: string
      hidCancel: string
      configure: string
      morePads: string
      bindOk: string
      resetOk: string
      actions: {
        moveUp: string
        moveDown: string
        moveLeft: string
        moveRight: string
        confirm: string
        cancel: string
        menu: string
        actionPrimary: string
        actionSecondary: string
      }
    }
    import: {
      nav: string
      title: string
      slugLabel: string
      pathLabel: string
      submit: string
      working: string
      imported: string
      replaced: string
    }
  }
  footer: {
    tagline: string
    aboutLink: string
    rights: string
  }
  lang: {
    ru: string
    en: string
    switcher: string
  }
  boot: {
    skipHint: string
    brandLine: string
  }
  a11y: {
    skipToContent: string
  }
  library: {
    openGame: string
    version: string
    count: string
    remove: string
    emptyLead: string
    emptyNote: string
  }
  store: {
    title: string
    lead: string
    emptyNote: string
    openTitle: string
    addToLibrary: string
    inLibrary: string
    version: string
  }
  game: {
    play: string
    unavailable: string
    backToLibrary: string
    backToGame: string
    libraryLabel: string
  }
  pages: {
    home: {
      lead: string
      cta: string
      anchorsLabel: string
      libraryTitle: string
      libraryText: string
      storeTitle: string
      storeText: string
      aboutTitle: string
      aboutText: string
    }
    library: {
      title: string
    }
    store: {
      title: string
    }
    about: {
      title: string
      p1: string
      p2: string
      p3: string
      p4: string
      p5: string
    }
    settings: {
      title: string
      lead: string
    }
  }
}

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never

type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string ? K : Join<K, Leaves<T[K]>>
}[keyof T & string]

export type MessageKey = Leaves<MessageTree>
