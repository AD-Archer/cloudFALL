<script>
  // The wallpaper: soft cumulus drifting across the sky, bubbles rising
  // through it, and the odd sparkle catching the light. Fixed behind
  // everything, and deliberately low contrast so no text ever has to fight it.
  //
  //   <Sky />

  let canvas = $state()

  const rnd = (a, b) => a + Math.random() * (b - a)

  $effect(() => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let raf = 0

    // a soft round puff, drawn once and stamped many times
    const puff = document.createElement('canvas')
    puff.width = puff.height = 256
    const pctx = puff.getContext('2d')
    const grad = pctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.45, 'rgba(255,255,255,0.93)')
    grad.addColorStop(0.72, 'rgba(255,255,255,0.4)')
    grad.addColorStop(0.9, 'rgba(255,255,255,0.09)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    pctx.fillStyle = grad
    pctx.fillRect(0, 0, 256, 256)

    let clouds = []
    let bubbles = []
    let sparks = []

    function build() {
      // three depths, so the sky has somewhere to be
      const layers = [
        { n: 5, depth: 0.3, y: [0.02, 0.4], scale: [130, 200], speed: [0.1, 0.2], a: [0.3, 0.5] },
        { n: 4, depth: 0.62, y: [0.2, 0.72], scale: [190, 300], speed: [0.24, 0.42], a: [0.42, 0.66] },
        { n: 3, depth: 1, y: [0.55, 1.02], scale: [260, 400], speed: [0.5, 0.8], a: [0.3, 0.5] }
      ]

      clouds = []
      for (const L of layers) {
        for (let i = 0; i < L.n; i++) {
          const scale = rnd(L.scale[0], L.scale[1])
          const lumps = []
          const count = 6 + ((Math.random() * 4) | 0)
          for (let p = 0; p < count; p++) {
            const dx = rnd(-0.6, 0.6)
            lumps.push({
              dx,
              // wide and low, taller in the middle: a cumulus profile
              dy: rnd(-0.04, 0.12) - 0.2 * (1 - Math.abs(dx) / 0.6),
              r: rnd(0.26, 0.46) * (1.2 - Math.abs(dx) * 0.45),
              a: rnd(0.7, 1)
            })
          }
          clouds.push({
            x: Math.random(),
            y: rnd(L.y[0], L.y[1]),
            scale,
            speed: rnd(L.speed[0], L.speed[1]),
            depth: L.depth,
            alpha: rnd(L.a[0], L.a[1]),
            bob: Math.random() * Math.PI * 2,
            lumps
          })
        }
      }

      bubbles = Array.from({ length: 18 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: rnd(4, 13),
        vy: rnd(0.014, 0.05),
        wob: Math.random() * Math.PI * 2,
        wobs: rnd(0.4, 1.1),
        a: rnd(0.2, 0.5),
        tint: Math.random() < 0.3
      }))

      sparks = Array.from({ length: 14 }, () => ({
        x: Math.random(),
        y: Math.random() * 0.85,
        r: rnd(3, 7),
        phase: Math.random() * Math.PI * 2,
        speed: rnd(0.4, 1),
        warm: Math.random() < 0.5
      }))
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // a four-pointed twinkle, the one bit of sparkle the page allows itself
    function star(x, y, r, alpha, warm) {
      ctx.globalAlpha = alpha
      ctx.fillStyle = warm ? '#ffd9a8' : '#ffd4ec'
      ctx.beginPath()
      ctx.moveTo(x, y - r)
      ctx.quadraticCurveTo(x + r * 0.16, y - r * 0.16, x + r, y)
      ctx.quadraticCurveTo(x + r * 0.16, y + r * 0.16, x, y + r)
      ctx.quadraticCurveTo(x - r * 0.16, y + r * 0.16, x - r, y)
      ctx.quadraticCurveTo(x - r * 0.16, y - r * 0.16, x, y - r)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    function render(t) {
      ctx.clearRect(0, 0, w, h)

      for (const c of clouds) {
        const bob = reduce ? 0 : Math.sin(t * 0.00018 + c.bob) * 9
        const x = c.x * (w + c.scale * 2) - c.scale
        const y = c.y * h + bob
        for (const p of c.lumps) {
          const size = c.scale * p.r * 2
          const cx = x + p.dx * c.scale
          const cy = y + p.dy * c.scale
          ctx.globalAlpha = c.alpha * p.a * 0.62
          ctx.drawImage(puff, cx - size / 2, cy - size / 2, size, size)
          ctx.globalAlpha = c.alpha * p.a * 0.85
          ctx.drawImage(puff, cx - size * 0.3, cy - size * 0.33, size * 0.6, size * 0.6)
        }
      }
      ctx.globalAlpha = 1

      for (const b of bubbles) {
        const wob = reduce ? 0 : Math.sin(t * 0.0007 * b.wobs + b.wob) * 10
        const x = b.x * w + wob
        const y = b.y * h
        const fill = ctx.createRadialGradient(x - b.r * 0.3, y - b.r * 0.4, 0, x, y, b.r)
        fill.addColorStop(0, `rgba(255,255,255,${b.a * 0.85})`)
        fill.addColorStop(1, b.tint ? `rgba(255,190,225,0)` : `rgba(255,255,255,0)`)
        ctx.fillStyle = fill
        ctx.beginPath()
        ctx.arc(x, y, b.r, 0, 7)
        ctx.fill()
        ctx.strokeStyle = `rgba(255,255,255,${b.a * 0.7})`
        ctx.lineWidth = 1.2
        ctx.stroke()
        // the specular pin-prick that makes a circle read as a bubble
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, b.a * 1.8)})`
        ctx.beginPath()
        ctx.arc(x - b.r * 0.33, y - b.r * 0.36, Math.max(0.8, b.r * 0.18), 0, 7)
        ctx.fill()
      }

      for (const s of sparks) {
        const pulse = reduce ? 0.6 : 0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase)
        star(s.x * w, s.y * h, s.r * (0.7 + pulse * 0.5), 0.2 + pulse * 0.45, s.warm)
      }
    }

    function step(t) {
      for (const c of clouds) {
        c.x += c.speed * 0.00005
        if (c.x > 1.2) c.x = -0.2
      }
      for (const b of bubbles) {
        b.y -= b.vy * 0.0018
        if (b.y < -0.06) {
          b.y = 1.06
          b.x = Math.random()
        }
      }
      render(t)
      raf = requestAnimationFrame(step)
    }

    const onResize = () => {
      resize()
      if (reduce) render(0)
    }

    build()
    resize()

    if (reduce) render(0)
    else raf = requestAnimationFrame(step)

    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  })
</script>

<canvas class="sky" bind:this={canvas} aria-hidden="true"></canvas>

<style>
  .sky {
    position: fixed;
    inset: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
  }
</style>
