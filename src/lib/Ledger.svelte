<script>
  // The interactive receipt. Tap the things you actually pay for and the page
  // adds up the year you would get back. Each row carries the real mark of the
  // service, because "Netflix" as a word is an abstraction and the logo is the
  // thing you recognise on a bank statement.
  //
  // Every row also names the open-source thing that does the same job on
  // hardware you own, so the list doubles as the project brief: pick a row,
  // build that.
  import { trackEvent } from './insight.js'
  import { RENTALS } from './data.js'
  import { BRANDS } from './brands.js'

  let { welcomeUrl = '' } = $props()

  let picked = $state(new Set(RENTALS.filter((r) => r.on).map((r) => r.id)))

  let monthly = $derived(
    RENTALS.filter((r) => picked.has(r.id)).reduce((sum, r) => sum + r.usd, 0)
  )
  let yearly = $derived(monthly * 12)

  const money = (n, cents = false) =>
    `$${n.toLocaleString('en-US', {
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0
    })}`

  function toggle(rental) {
    const next = new Set(picked)
    next.has(rental.id) ? next.delete(rental.id) : next.add(rental.id)
    picked = next
    trackEvent('Ledger: Toggle', {
      service: rental.service,
      state: next.has(rental.id) ? 'on' : 'off',
      monthly: monthly.toFixed(2)
    })
  }
</script>

<div class="ledger">
  <ul class="rows">
    {#each RENTALS as r}
      {@const on = picked.has(r.id)}
      {@const mark = r.brand ? BRANDS[r.brand] : null}
      {@const swap = r.swapBrand ? BRANDS[r.swapBrand] : null}
      <li class="row" class:on>
        <!-- one hit target per row: the sentence underneath is the reason to
             tick it, so it has to be part of the control -->
        <button type="button" class="hit" aria-pressed={on} onclick={() => toggle(r)}>
          <span class="mark" style={mark ? `--brand:${mark.hex}` : ''}>
            {#if mark}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={mark.path} /></svg>
            {:else}
              <!-- no logo for a gym membership, so it gets the one glyph on
                   this page we drew ourselves -->
              <svg viewBox="0 0 24 24" aria-hidden="true" class="own">
                <path
                  d="M4 9v6M20 9v6M7 6.5v11M17 6.5v11M7 12h10"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                />
              </svg>
            {/if}
          </span>

          <span class="who">
            <span class="service">{r.service}</span>
            <span class="what">{r.what}</span>
          </span>

          <span class="price">
            <span class="amount">{money(r.usd, true)}</span>
            <span class="per mono">/mo</span>
          </span>

          <span class="tick" aria-hidden="true"></span>

          <span class="swap">
            <span class="run">
              <span class="arrow" aria-hidden="true">
                <svg viewBox="0 0 20 20">
                  <path
                    d="M3 10h13m0 0-4.5-4.5M16 10l-4.5 4.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              {#if swap}
                <span class="swap-mark" style="--brand:{swap.hex}">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={swap.path} /></svg>
                </span>
              {/if}
              <span class="app">{r.replacement}</span>
              {#if r.port}<span class="port mono">:{r.port}</span>{/if}
            </span>
            <span class="how">{r.how}</span>
          </span>
        </button>
      </li>
    {/each}
  </ul>

  <aside class="total" aria-live="polite">
    <p class="t-label mono">you would stop paying</p>
    <p class="t-num">{money(yearly)}</p>
    <p class="t-unit mono">every year</p>
    <p class="t-sub">
      {money(monthly, true)} a month across {picked.size} subscription{picked.size === 1 ? '' : 's'},
      and none of it belongs to you at the end of it.
    </p>
    <a
      class="btn btn-sm t-cta"
      href={welcomeUrl}
      data-analytics="CTA: Click"
      data-analytics-placement="ledger-onboarding"
    >
      Build one of these
    </a>
    <p class="t-note mono">us list prices, give or take. yours will differ</p>
  </aside>
</div>

<style>
  .ledger {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 268px;
    gap: 24px;
    align-items: start;
    padding-top: 6px;
  }

  .rows { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }

  .row {
    border-radius: var(--r);
    background: var(--cloud-2);
    transition: background 0.2s, box-shadow 0.24s var(--ease-out), transform 0.24s var(--ease);
  }
  .row:hover { background: #fff; box-shadow: var(--lift-sm); }
  .row.on {
    background: linear-gradient(180deg, #fff6ec 0%, #ffeedd 100%);
    box-shadow: 0 8px 20px rgba(226, 130, 30, 0.2), inset 0 0 0 2px rgba(255, 155, 61, 0.5);
  }

  .hit {
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr) auto 26px;
    align-items: center;
    gap: 6px 14px;
    width: 100%;
    padding: 13px 16px 14px;
    border: none;
    background: none;
    text-align: left;
    color: inherit;
    border-radius: var(--r);
  }

  /* the logo sits in its own white bubble, so eight different brand colours
     never touch each other or the row behind them */
  .mark {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 3px 9px rgba(38, 22, 110, 0.14), inset 0 0 0 1px rgba(38, 22, 110, 0.05);
  }
  .mark svg { width: 23px; height: 23px; fill: var(--brand, var(--ink-2)); }
  .mark .own { fill: none; color: var(--ink-2); }

  .who { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
  .service { font-family: var(--display); font-weight: 600; font-size: 1.08rem; }
  .what {
    font-size: 0.82rem;
    color: var(--ink-3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .price { display: flex; align-items: baseline; gap: 3px; }
  .amount {
    font-family: var(--display);
    font-weight: 600;
    font-size: 1.12rem;
    color: var(--ink-2);
    font-variant-numeric: tabular-nums;
  }
  .row.on .amount { color: var(--ember-lo); }
  .per { font-size: 0.62rem; }

  /* the state, as a bubble that inflates when it is on */
  .tick {
    justify-self: end;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    box-shadow: inset 0 0 0 2px var(--cloud-3);
    transition: background 0.2s, box-shadow 0.2s, transform 0.24s var(--ease);
  }
  .row.on .tick {
    transform: scale(1.06);
    background: linear-gradient(180deg, var(--ember-hi), var(--ember));
    box-shadow: 0 4px 10px rgba(215, 105, 10, 0.35), inset 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
  .row.on .tick::after {
    content: '';
    display: block;
    width: 5px;
    height: 10px;
    margin: 4px 0 0 9px;
    border: solid #fff;
    border-width: 0 2.5px 2.5px 0;
    transform: rotate(42deg);
  }

  .swap {
    grid-column: 2 / 5;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 2px 12px;
  }
  .run { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
  .arrow { color: var(--ink-3); }
  .arrow svg { width: 17px; height: 17px; }
  .swap-mark { display: grid; place-items: center; }
  .swap-mark svg { width: 15px; height: 15px; fill: var(--brand); }
  .app { font-family: var(--display); font-weight: 600; font-size: 0.94rem; color: var(--violet); }
  .port { font-size: 0.62rem; }
  .how {
    flex: 1 1 24ch;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--ink-2);
    max-width: 62ch;
  }

  /* ── THE TOTAL ──
     Sticky, because the number is the argument and it has to stay on screen
     while you tap your way down eight rows. */
  .total {
    position: sticky;
    top: 56px;
    padding: 22px 22px 20px;
    border-radius: var(--r);
    text-align: center;
    background:
      radial-gradient(90% 60% at 50% 0%, rgba(255, 214, 170, 0.55), transparent 70%),
      linear-gradient(180deg, #ffffff 0%, #fff3e6 100%);
    box-shadow: var(--lift), inset 0 2px 0 rgba(255, 255, 255, 0.9);
  }
  .t-label { font-size: 0.66rem; color: var(--ink-3); }
  .t-num {
    margin-top: 6px;
    font-family: var(--display);
    font-weight: 700;
    font-size: clamp(2.8rem, 6vw, 3.6rem);
    line-height: 0.96;
    letter-spacing: -0.03em;
    color: var(--ember-lo);
    font-variant-numeric: tabular-nums;
  }
  .t-unit { margin-top: 6px; font-size: 0.64rem; }
  .t-sub {
    margin-top: 14px;
    font-size: 0.92rem;
    line-height: 1.5;
    color: var(--ink-2);
  }
  .t-cta { width: 100%; margin-top: 16px; }
  .t-note { margin-top: 12px; font-size: 0.58rem; line-height: 1.5; }

  @media (max-width: 900px) {
    .ledger { grid-template-columns: minmax(0, 1fr); }
    /* the total leads on a phone: the number is the reason to read the rows */
    .total { position: static; order: -1; }
    .what { display: none; }
    .hit { grid-template-columns: 40px minmax(0, 1fr) auto 22px; gap: 5px 11px; padding: 12px 13px; }
    .mark { width: 40px; height: 40px; }
    .mark svg { width: 20px; height: 20px; }
  }
</style>
