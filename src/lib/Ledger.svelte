<script>
  // THE POND. Every subscription your household rents floats overhead as a
  // bubble, sized by what it costs: the gym is enormous, the password manager
  // is a pea. Pop one and it falls out of the sky and lands underneath as
  // something you could run yourself. That is the whole program in one
  // interaction, and it is the same story the hero animation tells.
  //
  // A table of checkboxes said the same thing and nobody would have touched it.
  import { fly } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import { trackEvent } from './insight.js'
  import { RENTALS } from './data.js'
  import { BRANDS } from './brands.js'

  let { welcomeUrl = '' } = $props()

  // Nothing is pre-selected. The number below is only worth anything if it is
  // the visitor's own bill, and a page that guesses which three you pay for is
  // just showing you its own arithmetic.
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

  // Area, not diameter, tracks the price: doubling the bill has to look like
  // twice the bubble, and the gym at $42 has to dwarf a password manager.
  // Two of these have no mark anyone can borrow, so they get glyphs we drew.
  const GLYPHS = {
    dumbbell: 'M4 9v6M20 9v6M7 6.5v11M17 6.5v11M7 12h10',
    cube: 'M12 3.2 20.5 8v8L12 20.8 3.5 16V8ZM3.5 8 12 12.8 20.5 8M12 12.8v8'
  }

  // a fixed scatter, so bubbles sit at different heights without ever
  // overlapping or reflowing into a straight line
  const DRIFT = [0, 30, 10, 38, 4, 26, 16, 34]

  const DEAREST = Math.max(...RENTALS.map((r) => r.usd))
  // sized so all eight fit the widest row without one straggler wrapping
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
    <!-- a paragraph, not a heading: the page already has one h1 and this sits
         inside a section that has its own -->
    <p class="prompt">
      {#if floating.length}
        Pop everything your household pays for
      {:else}
        That is the lot. Tap anything below to put it back.
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

  <!-- ── UNDERFOOT: what you would run instead ───────────────────── -->
  <div class="ground">
    <header class="tally">
      <div class="sum">
        <p class="mono">you would stop paying</p>
        <p class="num" aria-live="polite">{money(yearly)}</p>
        <p class="mono unit">a year, {money(monthly, true)} a month</p>
      </div>
      <a
        class="btn"
        href={welcomeUrl}
        data-analytics="CTA: Click"
        data-analytics-placement="ledger-onboarding"
      >
        Build one of these
      </a>
    </header>

    {#if landed.length}
      <ul class="kept">
        {#each landed as r (r.id)}
          {@const swap = r.swapBrand ? BRANDS[r.swapBrand] : null}
          <li in:fly={{ y: -22, duration: 340, easing: cubicOut }}>
            <div class="tile">
              <div class="tile-top">
                {#if swap}
                  <span class="swap-mark" style="--brand:{swap.hex}">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d={swap.path} /></svg>
                  </span>
                {:else}
                  <span class="swap-dot" aria-hidden="true"></span>
                {/if}
                <span class="app">{r.replacement}</span>
                {#if r.port}<span class="port mono">:{r.port}</span>{/if}
                <span class="saved mono">{money(r.usd, true)}/mo back</span>
              </div>
              <p class="how">{r.how}</p>
              <button
                type="button"
                class="undo"
                onclick={() => refill(r)}
                aria-label="Put {r.service} back in the sky"
              >
                I still pay for {r.service}
              </button>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty">
        Nothing down here yet. Pop a bubble and the thing you would run instead lands here,
        with a port number and a reason.
      </p>
    {/if}
  </div>
</div>

<style>
  .ledger { display: grid; gap: 14px; padding-top: 6px; }

  /* ── THE SKY ── */
  .pond {
    position: relative;
    display: grid;
    grid-template-rows: auto 1fr;
    align-items: center;
    gap: 10px;
    min-height: 296px;
    padding: 20px 20px 30px;
    border-radius: var(--r);
    background:
      radial-gradient(80% 60% at 76% 0%, rgba(255, 213, 168, 0.5) 0%, transparent 60%),
      linear-gradient(180deg, #6455f5 0%, #8b9bff 62%, #c3d8ff 100%);
    box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.45), inset 0 -3px 0 rgba(60, 40, 160, 0.16);
    transition: min-height 0.4s var(--ease-out);
  }
  .pond.clear { min-height: 170px; }

  .prompt {
    max-width: 20ch;
    margin: 4px auto 2px;
    font-family: var(--display);
    font-weight: 600;
    font-size: clamp(1.4rem, 2.6vw, 2rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: #fff;
    text-align: center;
    text-shadow: 0 2px 10px rgba(30, 18, 90, 0.28);
  }

  .bubbles {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 10px 14px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .slot {
    display: grid;
    justify-items: center;
    gap: 7px;
    width: var(--d);
    margin-top: var(--y, 0);
    /* every bubble drifts on its own clock, so the group never pulses in sync */
    animation: bob 5.5s calc(var(--i) * -0.7s) ease-in-out infinite alternate;
  }

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
      radial-gradient(circle at 34% 28%, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.82) 52%, rgba(226, 234, 255, 0.6) 100%);
    box-shadow:
      0 8px 18px rgba(40, 24, 120, 0.16),
      inset 0 -5px 12px rgba(150, 160, 230, 0.16),
      inset 0 3px 6px rgba(255, 255, 255, 0.85);
    transition: transform 0.24s var(--ease), box-shadow 0.24s var(--ease-out);
  }
  .bubble:hover {
    transform: scale(1.06);
    box-shadow:
      0 12px 24px rgba(40, 24, 120, 0.2),
      inset 0 -5px 12px rgba(150, 160, 230, 0.12),
      inset 0 3px 6px rgba(255, 255, 255, 0.95);
  }
  .bubble:active { transform: scale(0.94); }

  /* the specular pin-prick that makes a circle read as a bubble */
  .bubble::after {
    content: '';
    position: absolute;
    top: 15%;
    left: 21%;
    width: 13%;
    height: 13%;
    border-radius: 50%;
    background: #fff;
    opacity: 0.8;
    pointer-events: none;
  }

  .logo svg { width: calc(var(--d) * 0.3); height: calc(var(--d) * 0.3); fill: var(--brand, var(--ink-2)); }
  .logo .own { fill: none; color: var(--ink-2); }

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
    color: #fff;
    text-align: center;
    line-height: 1.2;
    text-shadow: 0 1px 3px rgba(30, 18, 90, 0.45);
  }

  /* ── THE GROUND ── */
  .ground {
    padding: 20px 22px 22px;
    border-radius: var(--r);
    background: linear-gradient(180deg, #ffffff 0%, #fff4e8 100%);
    box-shadow: var(--lift-sm);
  }

  .tally {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    padding-bottom: 18px;
  }
  .num {
    font-family: var(--display);
    font-weight: 700;
    font-size: clamp(2.6rem, 7vw, 3.8rem);
    line-height: 0.94;
    letter-spacing: -0.035em;
    color: var(--ember-lo);
    font-variant-numeric: tabular-nums;
  }
  .sum .mono { font-size: 0.66rem; }
  .unit { margin-top: 7px; }

  .kept {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
    gap: 10px;
  }

  .tile {
    height: 100%;
    padding: 15px 17px 14px;
    border-radius: var(--r-sm);
    background: #fff;
    box-shadow: inset 0 0 0 1px rgba(255, 155, 61, 0.28);
  }
  .tile-top { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
  .swap-mark svg { width: 17px; height: 17px; fill: var(--brand); }
  .swap-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: linear-gradient(180deg, var(--ember-hi), var(--ember));
  }
  .app { font-family: var(--display); font-weight: 600; font-size: 1rem; color: var(--violet); }
  .port { font-size: 0.6rem; }
  .saved { margin-left: auto; font-size: 0.6rem; color: var(--ember-lo); }

  .how { margin-top: 7px; font-size: 0.88rem; line-height: 1.5; color: var(--ink-2); }

  .undo {
    margin-top: 10px;
    padding: 0;
    border: none;
    background: none;
    font-family: var(--mono);
    font-size: 0.6rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-3);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .undo:hover { color: var(--violet); }

  .empty {
    padding: 4px 2px 6px;
    font-size: 0.96rem;
    color: var(--ink-3);
    max-width: 62ch;
  }

  .note { margin-top: 16px; font-size: 0.58rem; line-height: 1.6; }

  @keyframes bob {
    from { transform: translateY(-7px); }
    to { transform: translateY(7px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .slot { animation: none; }
  }

  @media (max-width: 640px) {
    .pond { padding: 16px 14px 22px; gap: 14px; }
    .bubbles { gap: 8px 12px; }
    /* the biggest bubble would otherwise take half a phone screen */
    .slot { width: calc(var(--d) * 0.78); }
    .bubble { width: calc(var(--d) * 0.78); height: calc(var(--d) * 0.78); }
    .logo svg { width: calc(var(--d) * 0.24); height: calc(var(--d) * 0.24); }
    .cost { font-size: calc(var(--d) * 0.12); }
    .ground { padding: 16px 15px 18px; }
    .kept { grid-template-columns: minmax(0, 1fr); }
  }
</style>
