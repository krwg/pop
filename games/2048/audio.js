;(() => {
  /* ═══════════════════════════════════════════
     Warm Ember audio bus
     ═══════════════════════════════════════════ */
  const AudioBus = {
    volume: 0.55,
    musicVolume: 0.4,
    ctx: null,
    master: null,
    musicGain: null,
    ambientNodes: null,
    ambientStarted: false,

    ensure() {
      if (!this.ctx) {
        const Ctx = window.AudioContext || window.webkitAudioContext
        if (!Ctx) return null
        this.ctx = new Ctx()
        this.master = this.ctx.createGain()
        this.master.gain.value = this.volume
        this.master.connect(this.ctx.destination)
        this.musicGain = this.ctx.createGain()
        this.musicGain.gain.value = this.musicVolume * 0.22
        this.musicGain.connect(this.ctx.destination)
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return this.ctx
    },

    setVolume(pct) {
      this.volume = Math.max(0, Math.min(1, pct / 100))
      if (this.master) this.master.gain.value = this.volume
    },

    setMusicVolume(pct) {
      this.musicVolume = Math.max(0, Math.min(1, pct / 100))
      if (this.musicGain) this.musicGain.gain.value = this.musicVolume * 0.22
    },

    startAmbient() {
      const ctx = this.ensure()
      if (!ctx || !this.musicGain || this.ambientStarted) return
      this.ambientStarted = true

      const freqs = [110, 164.81, 196, 246.94]
      const nodes = []
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        const filter = ctx.createBiquadFilter()
        osc.type = i % 2 ? 'triangle' : 'sine'
        osc.frequency.value = freq
        filter.type = 'lowpass'
        filter.frequency.value = 900
        g.gain.value = 0.012 + i * 0.004
        
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.value = 0.05 + i * 0.015
        lfoGain.gain.value = 0.006
        lfo.connect(lfoGain)
        lfoGain.connect(g.gain)
        osc.connect(filter)
        filter.connect(g)
        g.connect(this.musicGain)
        osc.start()
        lfo.start()
        nodes.push(osc, lfo)
      })
      this.ambientNodes = nodes
    },

    stopAmbient() {
      if (!this.ambientNodes) return
      for (const node of this.ambientNodes) {
        try {
          node.stop()
        } catch {}
      }
      this.ambientNodes = null
      this.ambientStarted = false
    },

    /* ─── SFX ─── */
    tone({
      freq = 440,
      dur = 0.12,
      type = 'sine',
      gain = 0.05,
      slide = 0,
      attack = 0.008,
      filterFreq = 4200,
    }) {
      const ctx = this.ensure()
      if (!ctx || !this.master || this.volume <= 0.001) return
      const t0 = ctx.currentTime
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      osc.type = type
      osc.frequency.setValueAtTime(freq, t0)
      if (slide) osc.frequency.linearRampToValueAtTime(Math.max(40, freq + slide), t0 + dur)
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(filterFreq, t0)
      filter.Q.value = 0.7
      g.gain.setValueAtTime(0.0001, t0)
      g.gain.exponentialRampToValueAtTime(gain, t0 + attack)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
      osc.connect(filter)
      filter.connect(g)
      g.connect(this.master)
      osc.start(t0)
      osc.stop(t0 + dur + 0.04)
    },

    noiseBurst({ dur = 0.06, gain = 0.02, filterFreq = 1800 }) {
      const ctx = this.ensure()
      if (!ctx || !this.master || this.volume <= 0.001) return
      const len = Math.floor(ctx.sampleRate * dur)
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
      const src = ctx.createBufferSource()
      src.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = filterFreq
      filter.Q.value = 0.8
      const g = ctx.createGain()
      const t0 = ctx.currentTime
      g.gain.setValueAtTime(gain, t0)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
      src.connect(filter)
      filter.connect(g)
      g.connect(this.master)
      src.start(t0)
    },

    move() {
      this.tone({
        freq: 210,
        dur: 0.07,
        type: 'triangle',
        gain: 0.028,
        slide: 40,
        filterFreq: 2400,
      })
      this.tone({
        freq: 420,
        dur: 0.05,
        type: 'sine',
        gain: 0.012,
        slide: 60,
        filterFreq: 3200,
      })
    },

    merge(value = 4) {
      const n = Math.min(12, Math.log2(value))
      const base = 180 + n * 28
      this.tone({
        freq: base,
        dur: 0.14,
        type: 'sine',
        gain: 0.045,
        slide: 90,
        filterFreq: 3600,
      })
      this.tone({
        freq: base * 1.5,
        dur: 0.12,
        type: 'triangle',
        gain: 0.022,
        slide: 50,
        filterFreq: 2800,
      })
      this.noiseBurst({ dur: 0.05, gain: 0.012, filterFreq: 1400 + n * 80 })
    },

    record() {
      ;[392, 494, 587].forEach((freq, i) => {
        setTimeout(
          () =>
            this.tone({
              freq,
              dur: 0.16,
              type: 'sine',
              gain: 0.035,
              slide: 20,
              filterFreq: 4000,
            }),
          i * 90,
        )
      })
    },

    win() {
      ;[262, 330, 392, 523, 659].forEach((freq, i) => {
        setTimeout(
          () =>
            this.tone({
              freq,
              dur: 0.22,
              type: i % 2 ? 'triangle' : 'sine',
              gain: 0.04,
              filterFreq: 3800,
            }),
          i * 110,
        )
      })
    },

    lose() {
      this.tone({
        freq: 220,
        dur: 0.28,
        type: 'sine',
        gain: 0.04,
        slide: -90,
        filterFreq: 1600,
      })
      this.tone({
        freq: 165,
        dur: 0.32,
        type: 'triangle',
        gain: 0.022,
        slide: -50,
        filterFreq: 1200,
      })
    },

    blade() {
      this.noiseBurst({ dur: 0.09, gain: 0.018, filterFreq: 2200 })
      this.tone({
        freq: 720,
        dur: 0.12,
        type: 'sine',
        gain: 0.03,
        slide: -280,
        filterFreq: 3600,
      })
    },

    swipe() {
      this.noiseBurst({ dur: 0.12, gain: 0.016, filterFreq: 900 })
      this.tone({
        freq: 180,
        dur: 0.18,
        type: 'triangle',
        gain: 0.028,
        slide: 220,
        attack: 0.02,
        filterFreq: 2400,
      })
    },

    click() {
      this.tone({
        freq: 880,
        dur: 0.04,
        type: 'sine',
        gain: 0.03,
        filterFreq: 5000,
      })
      this.noiseBurst({ dur: 0.03, gain: 0.01, filterFreq: 2800 })
    },

    intro() {
      this.ensure()
      setTimeout(() => this.blade(), 200)
      setTimeout(() => this.blade(), 340)
      setTimeout(() => this.blade(), 480)
      setTimeout(() => this.swipe(), 920)
      setTimeout(() => this.click(), 1600)
      setTimeout(() => {
        this.tone({
          freq: 392,
          dur: 0.7,
          type: 'sine',
          gain: 0.025,
          attack: 0.15,
          filterFreq: 2600,
        })
      }, 1700)
    },

    ui() {
      this.click()
    },

    uiBack() {
      this.tone({
        freq: 320,
        dur: 0.05,
        type: 'triangle',
        gain: 0.02,
        slide: -40,
        filterFreq: 2200,
      })
    },
  }

  window.Pop2048Audio = AudioBus
})()
