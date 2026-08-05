<script>
  // THE POND, and the statement under it.
  //
  // Every subscription your household rents floats overhead as a bubble sized
  // by what it costs, so the gym dwarfs the password manager on sight. Pop one
  // and it lands underneath on a statement: the service struck through, the
  // thing you could run instead in its place with its port, and the total
  // going up. That is the whole program in one interaction.
  //
  // The bubbles are the one place on this page allowed real dimension. Panels,
  // buttons and tags are flat because chrome should be quiet, but a sphere
  // with no light on it is just a circle, and a circle does not pop.
  //
  // Nothing is popped to begin with. The total is only worth anything if it is
  // the visitor's own bill, and a page that guesses which three you pay for is
  // just showing you its own arithmetic.
  import { fly } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import { trackEvent } from './insight.js'
  import { RENTALS } from './data.js'
  import { BRANDS } from './brands.js'

  let { welcomeUrl = '' } = $props()

  let popped = $state(new Set())

  let floating = $derived(RENTALS.filter((r) => !popped.has(r.id)))
  let landed = $derived(RENTALS.filter((r) => popped.has(r.id)))

  let monthly = $derived(landed.reduce((sum, r) => sum + r.usd, 0))
  let yearly = $derived(monthly * 12)

  const money = (n, cents = false) =>
    `$${n.toLocaleString('en-US', {
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0
    })}`

  // Three ways a row can be marked, in order of preference:
  //   `brand`  an inlined Simple Icons path (most of them)
  //   `img`    a real image in public/, for anything Simple Icons has no mark for
  //   neither  a glyph we drew, for the ones that are not software at all
  const GLYPHS = {
    dumbbell: 'M4 9v6M20 9v6M7 6.5v11M17 6.5v11M7 12h10'
  }

  // a fixed scatter, so bubbles sit at different heights without ever
  // overlapping or reflowing into a straight line
  const DRIFT = [0, 30, 10, 38, 4, 26, 16, 34]

  const DEAREST = Math.max(...RENTALS.map((r) => r.usd))
  // area, not diameter, tracks the price: doubling the bill has to look like
  // twice the bubble
  const size = (usd) => Math.round(58 + 84 * Math.sqrt(usd / DEAREST))

  function pop(r) {
    popped = new Set(popped).add(r.id)
    trackEvent('Ledger: Pop', { service: r.service, monthly: (monthly + r.usd).toFixed(2) })
  }

  function refill(r) {
    const next = new Set(popped)
    next.delete(r.id)
    popped = next
    trackEvent('Ledger: Refill', { service: r.service })
  }

  // the burst: the bubble swells for an instant and is gone
  const burst = (node, { duration = 300 } = {}) => ({
    duration,
    easing: cubicOut,
    css: (t) => `opacity:${t}; transform:scale(${1 + (1 - t) * 0.45}); filter:blur(${(1 - t) * 3}px)`
  })
</script>

<div class="ledger">
  <!-- ── OVERHEAD: what you rent ─────────────────────────────────── -->
  <div class="pond" class:clear={!floating.length}>
    <!-- a paragraph, not a heading: the section it sits in already has one -->
    <p class="prompt">
      {#if floating.length}
        Pop everything your household pays for
      {:else}
        That is the lot. Put one back from the statement below.
      {/if}
    </p>

    <ul class="bubbles">
      {#each floating as r (r.id)}
        {@const mark = r.brand ? BRANDS[r.brand] : null}
        {@const i = RENTALS.indexOf(r)}
        <li class="slot" style="--d:{size(r.usd)}px; --i:{i}; --y:{DRIFT[i % DRIFT.length]}px" out:burst>
          <button
            type="button"
            class="bubble"
            onclick={() => pop(r)}
            aria-label="Pop {r.service}, {money(r.usd, true)} a month"
          >
            <span class="logo" style={mark ? `--brand:${mark.hex}` : ''}>
              {#if mark}
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={mark.path} /></svg>
              {:else if r.img}
                <img src={r.img} alt="" width="48" height="48" loading="lazy" decoding="async" />
              {:else}
                <svg viewBox="0 0 24 24" aria-hidden="true" class="own">
                  <path
                    d={GLYPHS[r.glyph] ?? GLYPHS.dumbbell}
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {/if}
            </span>
            <span class="cost">{money(r.usd, true)}</span>
          </button>
          <span class="name">{r.service}</span>
        </li>
      {/each}
    </ul>
  </div>

  <!-- ── UNDERFOOT: the statement ─────────────────────────────────
       A ruled list, not a grid of cards. Each popped bubble lands as one
       line: what you paid for, what you would run instead, what it cost. -->
  <div class="ground">
    {#if landed.length}
      <ul class="lines">
        {#each landed as r (r.id)}
          {@const swap = r.swapBrand ? BRANDS[r.swapBrand] : null}
          <li class="line" in:fly={{ y: -18, duration: 320, easing: cubicOut }}>
            <div class="row">
              <span class="gone">{r.service}</span>
              <span class="arrow" aria-hidden="true">→</span>
              <span class="swap">
                {#if swap}
                  <span class="swap-mark" style="--brand:{swap.hex}">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d={swap.path} /></svg>
                  </span>
                {/if}
                <span class="app">{r.replacement}</span>
                {#if r.port}<span class="port">:{r.port}</span>{/if}
              </span>
              <span class="amt">{money(r.usd, true)}</span>
            </div>

            <p class="how">{r.how}</p>

            <button
              type="button"
              class="undo"
              onclick={() => refill(r)}
              aria-label="Put {r.service} back in the sky"
            >
              Put it back
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty">
        Nothing down here yet. Pop a bubble and the thing you would run instead lands here,
        with a port number and a reason.
      </p>
    {/if}

    <div class="total">
      <a
        class="btn"
        href={welcomeUrl}
        data-analytics="CTA: Click"
        data-analytics-placement="ledger-onboarding"
      >
        Build one of these
      </a>

      <div class="sum">
        <p class="mono">You would stop paying</p>
        <p class="figure" aria-live="polite">{money(yearly)}</p>
        <p class="mono">a year · {money(monthly, true)} a month</p>
      </div>
    </div>
  </div>
</div>

<style>
  .ledger { display: grid; gap: clamp(22px, 3vw, 34px); }

  /* ── THE SKY ──
     A piece of the same sky the page opens in, so the bubbles have somewhere
     to be. One flat violet, no gradient on the panel itself: the depth in here
     belongs to the bubbles. */
  .pond {
    display: grid;
    grid-template-rows: auto 1fr;
    align-items: center;
    gap: 18px;
    min-height: 300px;
    padding: 26px 22px 34px;
    border-radius: var(--r);
    background: var(--sky);
  }
  .pond.clear { min-height: 0; }

  .prompt {
    max-width: 20ch;
    margin: 0 auto;
    font-family: var(--display);
    font-weight: 600;
    font-size: clamp(1.3rem, 2.4vw, 1.85rem);
    line-height: 1.12;
    letter-spacing: -0.02em;
    color: var(--on-sky);
    text-align: center;
  }

  .bubbles {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 10px 16px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .slot {
    display: grid;
    justify-items: center;
    gap: 8px;
    width: var(--d);
    margin-top: var(--y, 0);
    /* every bubble drifts on its own clock, so the group never pulses in sync */
    animation: bob 5.5s calc(var(--i) * -0.7s) ease-in-out infinite alternate;
  }
  /* a target that never stops moving is a target you have to chase, so it
     holds still the moment you go for it */
  .slot:hover,
  .slot:focus-within { animation-play-state: paused; }

  /* the one object on the page with real light on it */
  .bubble {
    position: relative;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 3px;
    width: var(--d);
    height: var(--d);
    padding: 0;
    border: none;
    border-radius: 50%;
    background:
      radial-gradient(circle at 33% 27%,
        #ffffff 0%,
        #f7f8ff 38%,
        #dfe4ff 74%,
        #c3ccfb 100%);
    box-shadow:
      0 10px 22px rgba(20, 10, 80, 0.26),
      inset 0 -7px 15px rgba(110, 120, 210, 0.24),
      inset 0 5px 9px rgba(255, 255, 255, 0.95);
    transition: transform 0.2s ease-out;
  }
  .bubble:hover { transform: scale(1.05); }
  .bubble:active { transform: scale(0.94); }

  /* the specular pin-prick that makes a sphere read as a bubble */
  .bubble::after {
    content: '';
    position: absolute;
    top: 14%;
    left: 20%;
    width: 14%;
    height: 14%;
    border-radius: 50%;
    background: #fff;
    opacity: 0.9;
    pointer-events: none;
  }

  .logo svg,
  .logo img {
    width: calc(var(--d) * 0.3);
    height: calc(var(--d) * 0.3);
    fill: var(--brand, var(--ink-2));
  }
  .logo .own { fill: none; color: var(--ink-2); }
  /* a pixel-art mark: keep the pixels, and round the corners the way a game
     icon is drawn rather than letting a square sit inside a sphere */
  .logo img {
    object-fit: contain;
    border-radius: 4px;
    image-rendering: pixelated;
  }

  .cost {
    font-family: var(--display);
    font-weight: 600;
    font-size: calc(var(--d) * 0.15);
    color: var(--ink);
    font-variant-numeric: tabular-nums;
  }

  .name {
    font-family: var(--display);
    font-weight: 500;
    font-size: 0.78rem;
    line-height: 1.2;
    color: var(--on-sky);
    text-align: center;
  }

  /* ── THE STATEMENT ── */
  .lines { list-style: none; margin: 0 0 6px; padding: 0; }

  .line { padding: 16px 0; border-bottom: 1px solid var(--rule); }
  .line:first-child { border-top: 1px solid var(--rule); }

  .row {
    display: grid;
    grid-template-columns: minmax(0, auto) 18px minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 12px;
  }

  .gone {
    font-family: var(--display);
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--ink-3);
    text-decoration: line-through;
    text-decoration-thickness: 1.5px;
  }
  .arrow { color: var(--ink-3); font-family: var(--mono); }

  .swap { display: flex; align-items: baseline; gap: 9px; min-width: 0; }
  .swap-mark { align-self: center; }
  .swap-mark svg { width: 17px; height: 17px; fill: var(--brand); }
  .app { font-family: var(--display); font-size: 1.05rem; font-weight: 600; }
  .port { font-family: var(--mono); font-size: 0.7rem; color: var(--ink-3); }

  .amt {
    justify-self: end;
    font-family: var(--mono);
    font-size: 0.92rem;
    font-variant-numeric: tabular-nums;
    color: var(--ember-ink);
  }

  .how {
    margin-top: 7px;
    font-size: 0.98rem;
    line-height: 1.5;
    color: var(--ink-2);
    max-width: 76ch;
  }

  .undo {
    margin-top: 9px;
    padding: 0;
    border: none;
    background: none;
    font-family: var(--mono);
    font-size: 0.64rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--ink-3);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .undo:hover { color: var(--ink); }

  .empty {
    color: var(--ink-3);
    max-width: 62ch;
  }

  /* ── THE TOTAL ──
     A statement rules off before its subtotal, so this one does too. The
     figures stay right because they carry on the amount column above them;
     the action goes left, on the same line, rather than stranding both in one
     narrow stack in the corner with the width of the panel empty beside it. */
  .total {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px 32px;
    flex-wrap: wrap-reverse;
    margin-top: 24px;
    padding-top: 22px;
    border-top: 2px solid var(--ink);
  }

  .sum { text-align: right; }
  .sum .mono { display: block; }

  .figure {
    margin: 2px 0 4px;
    font-family: var(--display);
    font-size: clamp(3rem, 9vw, 5.2rem);
    font-weight: 700;
    line-height: 0.94;
    letter-spacing: -0.035em;
    font-variant-numeric: tabular-nums;
    color: var(--ember-ink);
  }

  @keyframes bob {
    from { transform: translateY(-4px); }
    to { transform: translateY(4px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .slot { animation: none; }
  }

  @media (max-width: 640px) {
    .pond { padding: 20px 14px 26px; }
    .bubbles { gap: 8px 12px; }
    /* the biggest bubble would otherwise take half a phone screen */
    .slot { width: calc(var(--d) * 0.78); }
    .bubble { width: calc(var(--d) * 0.78); height: calc(var(--d) * 0.78); }
    .logo svg { width: calc(var(--d) * 0.24); height: calc(var(--d) * 0.24); }
    .cost { font-size: calc(var(--d) * 0.12); }

    /* placed, not auto-flowed: with the arrow gone and the swap spanning both
       columns, auto-placement drops the amount onto a third row of its own */
    .row { grid-template-columns: minmax(0, 1fr) auto; row-gap: 4px; }
    .arrow { display: none; }
    .gone { grid-area: 1 / 1; }
    .amt { grid-area: 1 / 2; }
    .swap { grid-area: 2 / 1 / auto / -1; }
    /* stacked, and reading the way it is spoken: the number, then the offer */
    .total { flex-wrap: wrap; }
    .sum { order: -1; text-align: left; }
  }
</style>
