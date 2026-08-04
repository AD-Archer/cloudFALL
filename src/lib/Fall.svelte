<script>
  // THE SIGNATURE. The program's own logo a spiked cloud with an eye
  // drawn as a grid of blocks, coming apart from the bottom and falling into
  // a volume that fills up underneath it.
  //
  // The colour carries the argument: the cloud is pale (theirs), a block in
  // flight is violet (in transit), and a block that has landed is ember
  // (yours). When the volume fills it flushes to disk and the counter ticks.
  //
  //   <Fall height={360} />
  let { height = 360 } = $props()

  let wrap = $state()
  let canvas = $state()
  let written = $state(0)

  // world space; everything below is authored in these units and scaled to fit
  const W = 110
  const H = 96
  const CELL = 3.5
  const FLOOR = 86

  // The logo's cloud, as overlapping lumps: a flat-ish underside with four
  // distinct lobes over the top, or it rasterises into a rectangle.
  const LUMPS = [
    [24, 44, 10], [33, 46, 12], [47, 47, 13], [62, 45, 12], [75, 43, 10],
    [30, 37, 11], [42, 31, 14], [57, 29, 15], [70, 34, 12], [79, 39, 9]
  ]
  const EYE = [70, 35, 7]

  // the spikes, by angle around the body
  const SPIKES = [
    -170, -142, -120, -98, -76, -54, -30, -8, 14, 36, 60, 84, 110, 140
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

    // ── the cloud, as cells ──────────────────────────────────────────
    // `t` is a regrow timer: a detached cell fades back in, so the cloud is
    // always coming apart and never actually runs out.
    const cells = []
    for (let x = CELL; x < W; x += CELL) {
      for (let y = CELL; y < FLOOR - 8; y += CELL) {
        if (!inCloud(x + CELL / 2, y + CELL / 2)) continue
        cells.push({ x, y, on: 1, t: 0, edge: !inCloud(x + CELL / 2, y + CELL * 1.9) })
      }
    }

    const COLS = Math.floor((W - 12) / CELL)
    const colX = (i) => 6 + i * CELL
    let stack = new Array(COLS).fill(0)
    let flush = 0

    let falling = []
    let shed = 0

    function detach() {
      // shed from the underside first: the cloud melts downward, the way the
      // logo's cloud is already breaking up along its bottom edge
      const live = cells.filter((c) => c.on > 0.9)
      if (!live.length) return
      const pool = live.filter((c) => c.edge)
      const c = (pool.length ? pool : live)[Math.floor(Math.random() * (pool.length || live.length))]
      c.on = 0
      c.t = 3.5 + Math.random() * 5
      falling.push({
        x: c.x,
        y: c.y,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 6,
        spin: Math.random() * 6
      })
    }

    function land(b) {
      const i = Math.max(0, Math.min(COLS - 1, Math.round((b.x - 6) / CELL)))
      stack[i] += 1
      // a column that towers over its neighbours spills sideways, so the
      // volume fills flat instead of growing spikes
      for (const j of [i - 1, i + 1]) {
        if (stack[j] !== undefined && stack[i] - stack[j] > 2) {
          stack[i] -= 1
          stack[j] += 1
          break
        }
      }
    }

    function tick(dt) {
      // regrow
      for (const c of cells) {
        if (c.on >= 1) continue
        c.t -= dt
        if (c.t <= 0) c.on = Math.min(1, c.on + dt * 0.9)
      }

      shed += dt * 7
      while (shed >= 1) {
        shed -= 1
        detach()
      }

      const next = []
      for (const b of falling) {
        b.vy += 62 * dt
        b.y += b.vy * dt
        b.x += b.vx * dt
        b.spin += dt * 2
        const col = Math.max(0, Math.min(COLS - 1, Math.round((b.x - 6) / CELL)))
        if (b.y >= FLOOR - stack[col] * CELL - CELL) {
          land(b)
        } else {
          next.push(b)
        }
      }
      falling = next

      // full volume: write it out and start the next one
      if (flush > 0) {
        flush -= dt * 1.6
        if (flush <= 0) {
          flush = 0
          stack = new Array(COLS).fill(0)
        }
      } else if (stack.every((s) => s >= 5)) {
        flush = 1
        written += 1
      }
    }

    // ── paint ────────────────────────────────────────────────────────
    const px = (v) => ox + v * scale
    const py = (v) => oy + v * scale

    function block(x, y, fill, alpha = 1) {
      ctx.globalAlpha = alpha
      ctx.fillStyle = fill
      ctx.fillRect(px(x), py(y), CELL * scale * 0.88, CELL * scale * 0.88)
    }

    function paint() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // spikes, behind the body vector, not blocks, so the silhouette stays
      // readable even as the cloud itself dissolves
      ctx.save()
      ctx.translate(px(51), py(39))
      ctx.fillStyle = '#ff922e'
      ctx.globalAlpha = 0.92
      for (const deg of SPIKES) {
        const a = (deg * Math.PI) / 180
        const rx = 31 * scale
        const ry = 20 * scale
        const w = 0.17
        ctx.beginPath()
        ctx.moveTo(Math.cos(a - w) * rx, Math.sin(a - w) * ry)
        ctx.lineTo(Math.cos(a) * rx * 1.42, Math.sin(a) * ry * 1.46)
        ctx.lineTo(Math.cos(a + w) * rx, Math.sin(a + w) * ry)
        ctx.closePath()
        ctx.fill()
      }
      ctx.restore()
      ctx.globalAlpha = 1

      // the cloud
      for (const c of cells) {
        if (c.on <= 0.02) continue
        block(c.x, c.y, '#dfe3ff', 0.25 + c.on * 0.75)
      }

      // the eye: the one piece that never comes apart, and the only reason
      // the shape still reads as the logo once the body is half gone. Reset
      // the alpha first it is still carrying whatever the last cell faded to.
      ctx.globalAlpha = 1
      const [ex, ey, er] = EYE
      ctx.beginPath()
      ctx.arc(px(ex), py(ey), er * scale, 0, 7)
      ctx.fillStyle = '#ff922e'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(px(ex), py(ey), er * scale * 0.55, 0, 7)
      ctx.fillStyle = '#fffaf4'
      ctx.fill()
      ctx.strokeStyle = '#1a0f30'
      ctx.lineWidth = Math.max(1, scale * 0.5)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(px(ex) - er * scale * 0.18, py(ey) - er * scale * 0.22)
      ctx.lineTo(px(ex) + er * scale * 0.2, py(ey))
      ctx.lineTo(px(ex) - er * scale * 0.18, py(ey) + er * scale * 0.22)
      ctx.stroke()

      // in transit
      for (const b of falling) {
        ctx.globalAlpha = 0.95
        ctx.fillStyle = '#8f79ff'
        ctx.save()
        ctx.translate(px(b.x), py(b.y))
        ctx.rotate(b.spin)
        const s = CELL * scale * 0.84
        ctx.fillRect(-s / 2, -s / 2, s, s)
        ctx.restore()
      }
      ctx.globalAlpha = 1

      // landed yours
      for (let i = 0; i < COLS; i++) {
        for (let h = 0; h < stack[i]; h++) {
          const top = h === stack[i] - 1
          block(
            colX(i),
            FLOOR - (h + 1) * CELL,
            top ? '#ffb266' : '#ff922e',
            flush ? 0.25 + flush * 0.75 : 1
          )
        }
      }

      // the floor line the volume sits on
      ctx.fillStyle = '#3a2b95'
      ctx.fillRect(px(4), py(FLOOR) + 1, (W - 8) * scale, Math.max(1, scale * 0.55))
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
      // fixed step, so a slow tab cannot fling blocks through the floor
      while (acc > 1 / 60) {
        tick(1 / 60)
        acc -= 1 / 60
      }
      paint()
      raf = requestAnimationFrame(frame)
    }

    resize()

    if (reduce) {
      // one still frame: half the cloud gone, blocks in the air, volume part
      // full. The argument survives without the motion.
      for (let i = 0; i < 90; i++) tick(1 / 60)
      for (let i = 0; i < 40; i++) {
        land({ x: 6 + Math.random() * (W - 12) })
      }
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
  aria-label="The CloudFALL cloud coming apart block by block. The blocks fall and stack up
  into a volume of local storage underneath it."
>
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
  <figcaption class="mono">
    <span class="path">./media</span>
    <span class="dot" aria-hidden="true">·</span>
    <span class="count">{written} volume{written === 1 ? '' : 's'} written</span>
  </figcaption>
</figure>

<style>
  .fall {
    position: relative;
    margin: 0;
    width: 100%;
    /* on a phone 400px of sky is most of the first screen, so the figure
       shrinks with the viewport instead of pushing the headline off it */
    height: min(var(--h), 44vw + 150px);
  }

  canvas { width: 100%; height: 100%; }

  figcaption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 2px;
    display: flex;
    justify-content: center;
    gap: 8px;
    font-size: 0.68rem;
  }

  .path { color: var(--ember); }
  .dot { color: var(--ink-3); }
  .count { color: var(--ink-3); }

</style>
