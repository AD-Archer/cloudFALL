<script>
  // Cumulus drifting inside the sky band. This used to be a fixed canvas
  // behind the entire page, which meant every paragraph on the site had
  // weather happening underneath it. Now it only exists where there is
  // actually sky, and it carries clouds only: the rising bubbles and the
  // sparkles it used to draw as well were decoration with no argument
  // behind them.
  //
  //   <Drift />   inside a position:relative sky
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
    const stamp = document.createElement('canvas')
    stamp.width = stamp.height = 256
    const sctx = stamp.getContext('2d')
    const grad = sctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    // a defined edge, not a smudge: a blurry blob behind a headline reads as
    // a rendering fault, a painted cumulus reads as sky
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.86, 'rgba(255,255,255,1)')
    grad.addColorStop(0.95, 'rgba(255,255,255,0.5)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    sctx.fillStyle = grad
    sctx.fillRect(0, 0, 256, 256)

    let clouds = []

    function build() {
      // two depths, so the band has somewhere to be. Small and faint on
      // purpose: this is weather at the back of the frame, and every word on
      // the page has to stay readable across it.
      const layers = [
        { n: 5, y: [0.05, 0.55], scale: [70, 120], speed: [0.1, 0.2], a: [0.07, 0.12] },
        { n: 4, y: [0.25, 0.92], scale: [110, 175], speed: [0.26, 0.45], a: [0.09, 0.15] }
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
              r: rnd(0.3, 0.5) * (1.2 - Math.abs(dx) * 0.45)
            })
          }
          clouds.push({
            x: Math.random(),
            y: rnd(L.y[0], L.y[1]),
            scale,
            speed: rnd(L.speed[0], L.speed[1]),
            alpha: rnd(L.a[0], L.a[1]),
            // Each cloud is flattened to one silhouette up front and then
            // drawn once per frame. Stamping the lumps individually at a
            // fractional alpha made every overlap a brighter disc, which is
            // why the sky used to read as bokeh rather than as weather.
            art: bake(lumps, scale)
          })
        }
      }
    }

    function bake(lumps, scale) {
      const w = Math.ceil(scale * 2.6)
      const h = Math.ceil(scale * 1.9)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const cx = c.getContext('2d')
      for (const p of lumps) {
        const size = scale * p.r * 2
        cx.drawImage(
          stamp,
          w / 2 + p.dx * scale - size / 2,
          h / 2 + p.dy * scale - size / 2,
          size,
          size
        )
      }
      return c
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = canvas.clientWidth
      h = canvas.clientHeight
      if (!w || !h) return
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function render() {
      ctx.clearRect(0, 0, w, h)
      for (const c of clouds) {
        const x = c.x * (w + c.scale * 2.6) - c.scale * 1.3
        ctx.globalAlpha = c.alpha
        ctx.drawImage(c.art, x, c.y * h - c.art.height / 2)
      }
      ctx.globalAlpha = 1
    }

    function step() {
      for (const c of clouds) {
        c.x += c.speed * 0.00005
        if (c.x > 1.2) c.x = -0.2
      }
      render()
      raf = requestAnimationFrame(step)
    }

    const onResize = () => {
      resize()
      render()
    }

    build()
    resize()
    render()
    if (!reduce) raf = requestAnimationFrame(step)

    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  })
</script>

<canvas class="drift" bind:this={canvas} aria-hidden="true"></canvas>

<style>
  .drift {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
