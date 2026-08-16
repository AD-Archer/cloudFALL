<script>
  // WHAT YOU PAY FOR, AND WHAT THAT COMES TO.
  //
  // Eleven rows in one run read as a wall, so they are grouped into four
  // short tabs you flip between. Ticking survives the flip: the total is
  // the whole household, not the tab you happen to be looking at, and the
  // tab labels carry their own running counts so nothing you ticked ever
  // disappears without trace.
  //
  // Three common ones arrive already ticked. A page that opens on $0 makes
  // the visitor do arithmetic before it will tell them anything, and the
  // number is the point of the section — so it states a real one straight
  // away and says out loud that it is a guess at an ordinary household.
  //
  // Ticking a row also shows what would stand in its place, so the saving
  // is a real thing you could build, not just a number that vanished.
  import { trackEvent } from './insight.js'
  import { RENTALS, RENTAL_GROUPS } from './data.js'
  import { BRANDS } from './brands.js'

  let { docsUrl = '' } = $props()

  let picked = $state(new Set(RENTALS.filter((r) => r.common).map((r) => r.id)))
  let touched = $state(false)
  let tab = $state(RENTAL_GROUPS[0].id)

  let chosen = $derived(RENTALS.filter((r) => picked.has(r.id)))
  let monthly = $derived(chosen.reduce((sum, r) => sum + r.usd, 0))
  let yearly = $derived(monthly * 12)
  let rows = $derived(RENTALS.filter((r) => r.group === tab))

  // each tab carries how many of its own rows are ticked, so flipping away
  // from a tab never hides the fact that something in it counted
  let counts = $derived(
    Object.fromEntries(
      RENTAL_GROUPS.map((g) => [g.id, RENTALS.filter((r) => r.group === g.id && picked.has(r.id)).length])
    )
  )

  const money = (n, cents = false) =>
    `$${n.toLocaleString('en-US', {
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0
    })}`

  // The gym is not software and has no brand mark; it gets a drawn glyph
  // rather than a unicode dumbbell standing in for an icon.
  const GLYPHS = {
    dumbbell: 'M4 9v6M20 9v6M7 6.5v11M17 6.5v11M7 12h10'
  }

  function toggle(r) {
    const next = new Set(picked)
    if (next.has(r.id)) {
      next.delete(r.id)
      trackEvent('Ledger: Untick', { service: r.service })
    } else {
      next.add(r.id)
      trackEvent('Ledger: Tick', { service: r.service, monthly: (monthly + r.usd).toFixed(2) })
    }
    picked = next
    touched = true
  }

  function chooseTab(id) {
    if (id === tab) return
    tab = id
    trackEvent('Ledger: Tab', { tab: id })
  }

  function clear() {
    picked = new Set()
    touched = true
    trackEvent('Ledger: Clear', {})
  }
</script>

<div class="ledger">
  <div class="list">
    <div class="chips tabs" role="group" aria-label="Kinds of subscription">
      {#each RENTAL_GROUPS as g}
        <button
          type="button"
          class="chip"
          class:on={tab === g.id}
          onclick={() => chooseTab(g.id)}
        >
          {g.label}{#if counts[g.id]}<span class="chip-n">{counts[g.id]}</span>{/if}
        </button>
      {/each}
    </div>

    <ul class="rows">
      {#each rows as r (r.id)}
        {@const mark = r.brand ? BRANDS[r.brand] : null}
        {@const on = picked.has(r.id)}
        <li class="row" class:on>
          <label class="pick">
            <input type="checkbox" checked={on} onchange={() => toggle(r)} />
            <span class="box" aria-hidden="true">
              <svg viewBox="0 0 22 22"><path d="M5 11.6c1.9 1.4 3.2 2.9 4.3 4.7 2-4.3 4.4-7.4 8-10.2" /></svg>
            </span>

            <span class="mark" style={mark ? `--brand:${mark.hex}` : ''}>
              {#if mark}
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={mark.path} /></svg>
              {:else if r.img}
                <img src={r.img} alt="" width="26" height="26" loading="lazy" decoding="async" />
              {:else}
                <svg viewBox="0 0 24 24" aria-hidden="true" class="drawn">
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

            <span class="what">
              <span class="service">{r.service}</span>
              <span class="plan">{r.what}</span>
            </span>

            <span class="price tnum">{money(r.usd, true)}</span>
          </label>

          {#if on}
            <p class="swap">Build <strong>{r.replacement}</strong> instead</p>
          {/if}
        </li>
      {/each}
    </ul>

    <p class="note">
      The prices are in USD and may not be accurate to your tier or how much you pay, this is just a rough estimate.
    </p>
  </div>

  <!-- ── the total ── -->
  <aside class="total" aria-live="polite">
    {#if chosen.length === 0}
      <p class="label">What it comes to</p>
      <p class="empty">Tick what your household pays for and the year's total adds up here.</p>
    {:else}
      <p class="label">You pay, every year</p>
      <p class="big money tnum">{money(yearly)}</p>
      <p class="per">
        {money(monthly, true)} a month, across {chosen.length}
        {chosen.length === 1 ? 'subscription' : 'subscriptions'}
      </p>


      <p class="says">
        Everything you pay for can be replaced with a free version you can build yourself, or find existing online.
      </p>

      {#if docsUrl}
        <a
          class="btn btn-quiet"
          href={docsUrl}
          target="_blank"
          rel="noopener"
          data-analytics="CTA: Click"
          data-analytics-placement="ledger-docs"
        >
          Learn how to build one
        </a>
      {/if}

      <button type="button" class="clear" onclick={clear}>Start over</button>
    {/if}
  </aside>
</div>

<style>
  .ledger {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
    gap: clamp(28px, 5vw, 64px);
    align-items: start;
  }

  .tabs { padding-bottom: 20px; }

  /* ── the ruled list ── */
  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--rule);
    /* Enough that flipping a tab does not jump the section, short enough
       that the two-row tab you arrive on is not sitting over a hole: the
       tallest tab is four rows, so reserve three. */
    min-height: 212px;
  }

  .row { border-bottom: 1px solid var(--rule); }

  .pick {
    display: grid;
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    align-items: center;
    gap: clamp(12px, 2vw, 18px);
    padding: 15px 4px;
    cursor: pointer;
    transition: background 140ms ease;
  }
  .pick:hover { background: var(--paper-2); }

  /* ── the drawn checkbox ──
     The most-touched control on the page, so it is drawn rather than left
     as the browser's. The tick is a hand-drawn stroke that writes itself
     on, the way a pencil would. The real input stays in the DOM for
     keyboard and assistive tech; only its rendering is replaced. */
  input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    width: 22px;
    height: 22px;
    margin: 0;
    cursor: pointer;
  }

  .box {
    width: 22px;
    height: 22px;
    flex: none;
    display: grid;
    place-items: center;
    border: 1.5px solid var(--rule-2);
    border-radius: 5px;
    background: var(--paper);
    transition: border-color 160ms ease, background 160ms ease;
  }
  .row.on .box { border-color: var(--sky-deep); background: var(--sky-deep); }

  .box svg {
    width: 17px;
    height: 17px;
    overflow: visible;
    fill: none;
    stroke: var(--paper);
    stroke-width: 2.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    /* the tick draws itself on rather than appearing */
    stroke-dasharray: 26;
    stroke-dashoffset: 26;
    transition: stroke-dashoffset 260ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .row.on .box svg { stroke-dashoffset: 0; }

  input:focus-visible + .box {
    outline: 2.5px solid var(--ember-ink);
    outline-offset: 3px;
  }

  .mark {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    color: var(--ink-3);
  }
  .mark svg { width: 100%; height: 100%; }
  .mark svg path { fill: currentColor; }
  .mark .drawn path { fill: none; }
  .mark img { width: 26px; height: 26px; object-fit: contain; }

  /* the brand's own colour, but only once it is one of yours */
  .row.on .mark { color: var(--brand, var(--ink-2)); }

  .what { display: grid; gap: 1px; min-width: 0; }

  .service {
    font-family: var(--sans);
    font-weight: 700;
    font-size: var(--fs-lg);
    line-height: 1.25;
  }

  .plan {
    font-family: var(--sans);
    font-size: var(--fs-sm);
    color: var(--ink-3);
    line-height: 1.3;
  }

  .price {
    font-family: var(--sans);
    font-weight: 700;
    font-size: var(--fs-lg);
    color: var(--ink-2);
  }
  .row.on .price { color: var(--ember-ink); }

  /* what stands in its place, once you have ticked it */
  .swap {
    margin: 0 4px 15px calc(22px + clamp(12px, 2vw, 18px));
    font-family: var(--sans);
    font-size: var(--fs-md);
    color: var(--ink-2);
  }
  .swap strong { color: var(--ink); }

  .note {
    margin-top: 18px;
    font-size: var(--fs-md);
    line-height: 1.55;
    color: var(--ink-3);
    max-width: 56ch;
  }

  /* ── the total ──
     No panel and no tint: it is told apart from the list by the rule above
     it and by the size of the number, the way every other section on this
     page is told apart. */
  .total {
    position: sticky;
    top: 32px;
    display: grid;
    justify-items: start;
    gap: 12px;
    padding-top: 18px;
    border-top: 2px solid var(--ink);
  }

  .empty {
    font-size: var(--fs-lg);
    line-height: 1.55;
    color: var(--ink-2);
    max-width: 34ch;
  }

  .big {
    font-size: clamp(3.2rem, 7.5vw, 4.8rem);
    line-height: 1;
    letter-spacing: -0.035em;
    margin-block: 2px;
  }

  .per {
    font-family: var(--sans);
    font-size: var(--fs-md);
    color: var(--ink-2);
  }

  .guess {
    font-size: var(--fs-md);
    line-height: 1.5;
    color: var(--ink-3);
    max-width: 34ch;
  }

  .says {
    font-size: var(--fs-lg);
    line-height: 1.55;
    color: var(--ink-2);
    max-width: 34ch;
    margin-top: 4px;
  }

  .total .btn { margin-top: 6px; }

  .clear {
    font-family: var(--sans);
    font-size: var(--fs-md);
    color: var(--ink-3);
    background: none;
    border: none;
    padding: 2px 0;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .clear:hover { color: var(--ink); }

  @media (max-width: 860px) {
    .ledger { grid-template-columns: minmax(0, 1fr); }
    .total { position: static; }
    /* the floor exists to stop the section jumping when you flip a tab; in
       one column the rows are taller and it only buys dead space */
    .rows { min-height: 0; }
  }

  @media (max-width: 520px) {
    .pick {
      grid-template-columns: auto auto minmax(0, 1fr);
      row-gap: 4px;
    }
    /* the price drops under the name rather than squeezing it */
    .price { grid-column: 3; justify-self: start; }
  }
</style>
