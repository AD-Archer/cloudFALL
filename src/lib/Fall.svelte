<script>
  // THE SIGNATURE. The program's own logo, a spiked cloud with one eye, drawn
  // as a mass of soft bubbles that keeps coming apart. Puffs drift off the
  // underside, fall, and pile into a warm heap at the bottom of the frame.
  //
  // The colour carries the argument: the cloud is white (theirs), a puff in
  // flight is pale blue (in transit), and a puff that has landed is ember
  // (yours). Fill the frame and it writes itself out as a volume.
  //
  //   <Fall height={400} />
  let { height = 400 } = $props()

  let wrap = $state()
  let canvas = $state()

  // world space; everything is authored in these units and scaled to fit
  const W = 110
  const H = 98
  const CELL = 4.1
  const FLOOR = 88

  // the logo's cloud: a flat-ish underside under four fat lobes
  const LUMPS = [
    [25, 45, 11], [35, 47, 13], [49, 48, 14], [64, 46, 13], [76, 44, 11],
    [31, 37, 12], [43, 31, 15], [58, 29, 16], [71, 34, 13], [80, 40, 10]
  ]
  const EYE = [71, 35, 7.4]

  // flames, not spikes: same silhouette as the logo, softer edges
  const FLAMES = [
    -172, -146, -124, -102, -80, -58, -34, -10, 12, 34, 58, 82, 108, 136
  ]

  const inCloud = (x, y) =>
    LUMPS.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 < r * r)

  $effect(() => {
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let scale = 1
    let ox = 0
    let oy = 0
    let raf = 0
    let last = 0
    let acc = 0

    // ── the cloud, as puffs ──────────────────────────────────────────
    // `t` is a regrow timer: a puff that drifts off fades back in later, so
    // the cloud is always coming apart and never actually runs out.
    const puffs = []
    for (let x = CELL; x < W; x += CELL) {
      for (let y = CELL; y < FLOOR - 10; y += CELL) {
        if (!inCloud(x, y)) continue
        puffs.push({
          x,
          y,
          on: 1,
          t: 0,
          // a puff on the underside goes first
          edge: !inCloud(x, y + CELL * 1.6),
          r: CELL * (0.56 + ((x * 7 + y * 13) % 10) / 40)
        })
      }
    }

    const COLS = Math.floor((W - 14) / CELL)
    const colX = (i) => 7 + i * CELL + CELL / 2
    let stack = new Array(COLS).fill(0)
    let flush = 0

    let falling = []
    let shed = 0

    function detach() {
      const live = puffs.filter((p) => p.on > 0.9)
      if (!live.length) return
      const pool = live.filter((p) => p.edge)
      const from = pool.length ? pool : live
      const p = from[Math.floor(Math.random() * from.length)]
      p.on = 0
      p.t = 3 + Math.random() * 5
      falling.push({
        x: p.x,
        y: p.y,
        r: p.r * 0.86,
        vx: (Math.random() - 0.5) * 3,
        vy: 1 + Math.random() * 5,
        wob: Math.random() * 6
      })
    }

    function land(x) {
      const i = Math.max(0, Math.min(COLS - 1, Math.round((x - 7) / CELL)))
      stack[i] += 1
      // a column that towers over its neighbours rolls off the side, so the
      // heap settles flat instead of growing towers
      for (const j of [i - 1, i + 1]) {
        if (stack[j] !== undefined && stack[i] - stack[j] > 2) {
          stack[i] -= 1
          stack[j] += 1
          break
        }
      }
    }

    function tick(dt) {
      for (const p of puffs) {
        if (p.on >= 1) continue
        p.t -= dt
        if (p.t <= 0) p.on = Math.min(1, p.on + dt * 0.8)
      }

      shed += dt * 5.5
      while (shed >= 1) {
        shed -= 1
        detach()
      }

      const next = []
      for (const b of falling) {
        b.vy += 48 * dt
        b.y += b.vy * dt
        b.x += b.vx * dt
        b.wob += dt * 3
        const col = Math.max(0, Math.min(COLS - 1, Math.round((b.x - 7) / CELL)))
        if (b.y >= FLOOR - stack[col] * CELL * 0.8 - CELL * 0.5) land(b.x)
        else next.push(b)
      }
      falling = next

      if (flush > 0) {
        flush -= dt * 1.4
        if (flush <= 0) {
          flush = 0
          stack = new Array(COLS).fill(0)
        }
      } else if (stack.every((s) => s >= 4)) {
        // the heap is full: it settles out and starts again, so the pile is
        // always growing back the way a monthly bill does
        flush = 1
      }
    }

    // ── paint ────────────────────────────────────────────────────────
    const px = (v) => ox + v * scale
    const py = (v) => oy + v * scale

    // every round thing on this canvas is the same object: a lit sphere
    function bubble(x, y, r, top, bottom, alpha = 1) {
      const cx = px(x)
      const cy = py(y)
      const rr = r * scale
      ctx.globalAlpha = alpha
      const g = ctx.createRadialGradient(cx - rr * 0.35, cy - rr * 0.4, rr * 0.1, cx, cy, rr)
      g.addColorStop(0, top)
      g.addColorStop(1, bottom)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, rr, 0, 7)
      ctx.fill()
      ctx.globalAlpha = alpha * 0.85
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.beginPath()
      ctx.arc(cx - rr * 0.34, cy - rr * 0.38, rr * 0.22, 0, 7)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    function paint() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // flames behind the body, drawn as curves so nothing on this canvas has
      // a sharp corner
      ctx.save()
      ctx.translate(px(52), py(39))
      for (const deg of FLAMES) {
        const a = (deg * Math.PI) / 180
        const rx = 30 * scale
        const ry = 21 * scale
        const spread = 0.19
        const tipX = Math.cos(a) * rx * 1.5
        const tipY = Math.sin(a) * ry * 1.55
        const ax = Math.cos(a - spread) * rx
        const ay = Math.sin(a - spread) * ry
        const bx = Math.cos(a + spread) * rx
        const by = Math.sin(a + spread) * ry
        const g = ctx.createLinearGradient(ax, ay, tipX, tipY)
        g.addColorStop(0, '#ffbe6f')
        g.addColorStop(1, '#f97d13')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.quadraticCurveTo(Math.cos(a - spread * 0.3) * rx * 1.28, Math.sin(a - spread * 0.3) * ry * 1.3, tipX, tipY)
        ctx.quadraticCurveTo(Math.cos(a + spread * 0.3) * rx * 1.28, Math.sin(a + spread * 0.3) * ry * 1.3, bx, by)
        ctx.closePath()
        ctx.fill()
      }
      ctx.restore()

      // the cloud
      for (const p of puffs) {
        if (p.on <= 0.02) continue
        bubble(p.x, p.y, p.r, '#ffffff', '#dfe6ff', 0.3 + p.on * 0.7)
      }

      // the eye: the one piece that never comes apart, and the reason the
      // shape still reads as the logo once the body is half gone
      ctx.globalAlpha = 1
      const [ex, ey, er] = EYE
      bubble(ex, ey, er, '#ffc078', '#f2820f')
      ctx.fillStyle = '#fffdf8'
      ctx.beginPath()
      ctx.arc(px(ex), py(ey), er * scale * 0.54, 0, 7)
      ctx.fill()
      ctx.strokeStyle = '#2a1a5e'
      ctx.lineWidth = Math.max(1.2, scale * 0.42)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(px(ex) - er * scale * 0.16, py(ey) - er * scale * 0.2)
      ctx.lineTo(px(ex) + er * scale * 0.19, py(ey))
      ctx.lineTo(px(ex) - er * scale * 0.16, py(ey) + er * scale * 0.2)
      ctx.stroke()

      // in transit
      for (const b of falling) {
        bubble(b.x + Math.sin(b.wob) * 0.5, b.y, b.r, '#ffffff', '#a9bcff')
      }

      // landed, and yours
      for (let i = 0; i < COLS; i++) {
        for (let h = 0; h < stack[i]; h++) {
          const top = h === stack[i] - 1
          const jitter = (((i * 31 + h * 17) % 7) - 3) * 0.12
          bubble(
            colX(i) + jitter,
            FLOOR - h * CELL * 0.8 - CELL * 0.45,
            CELL * 0.52,
            top ? '#ffe0bd' : '#ffc998',
            top ? '#ffab5e' : '#f79445',
            flush ? 0.2 + flush * 0.8 : 1
          )
        }
      }

      // the shelf the heap sits on
      const g = ctx.createLinearGradient(px(6), 0, px(W - 6), 0)
      g.addColorStop(0, 'rgba(255,255,255,0)')
      g.addColorStop(0.5, 'rgba(255,255,255,0.75)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(px(6), py(FLOOR) + scale * 0.6, (W - 12) * scale, Math.max(1.5, scale * 0.5))
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      scale = Math.min(w / W, h / H)
      ox = (w - W * scale) / 2
      oy = (h - H * scale) / 2
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      paint()
    }

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0)
      last = now
      acc += dt
      // fixed step, so a slow tab cannot fling puffs through the floor
      while (acc > 1 / 60) {
        tick(1 / 60)
        acc -= 1 / 60
      }
      paint()
      raf = requestAnimationFrame(frame)
    }

    resize()

    if (reduce) {
      // one still frame: part of the cloud gone, puffs in the air, heap part
      // built. The argument survives without the motion.
      for (let i = 0; i < 80; i++) tick(1 / 60)
      for (let i = 0; i < 34; i++) land(7 + Math.random() * (W - 14))
      paint()
    } else {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  })
</script>

<figure
  class="fall"
  bind:this={wrap}
  style="--h:{height}px"
  aria-label="The CloudFALL cloud coming apart puff by puff. The puffs fall and pile up
  into storage of your own underneath it."
>
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
  <figcaption>Subscriptions add up fast</figcaption>
</figure>

<style>
  .fall {
    position: relative;
    margin: 0;
    width: 100%;
    /* on a phone 400px of sky is most of the first screen, so the frame
       shrinks with the viewport instead of pushing the headline off it */
    height: min(var(--h), 46vw + 158px);
    border-radius: var(--r);
    background:
      radial-gradient(120% 80% at 78% 0%, rgba(255, 214, 170, 0.55) 0%, transparent 58%),
      linear-gradient(180deg, #6455f5 0%, #8b9bff 58%, #c3d8ff 100%);
    box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.45), inset 0 -3px 0 rgba(60, 40, 160, 0.18);
    overflow: hidden;
  }

  canvas { width: 100%; height: 100%; }

  figcaption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 12px;
    text-align: center;
    font-family: var(--display);
    font-weight: 500;
    font-size: 0.92rem;
    color: rgba(255, 255, 255, 0.88);
    text-shadow: 0 1px 4px rgba(30, 18, 90, 0.4);
  }
</style>
