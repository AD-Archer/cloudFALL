<script>
  // The second signature: an interactive receipt. Tick what you (or your
  // parents) actually pay for, and the page adds up the year. Every row names
  // the open-source thing that does the same job on hardware you own, so the
  // list doubles as the project brief pick a row, build that.
  import { trackEvent } from './insight.js'
  import { RENTALS } from './data.js'

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
      <li class="row" class:on>
        <!-- one hit target for the whole row: the sentence under the name is
             the reason to tick it, so it has to be part of the control -->
        <button type="button" class="hit" aria-pressed={on} onclick={() => toggle(r)}>
          <span class="box" aria-hidden="true"></span>

          <span class="who">
            <span class="service">{r.service}</span>
            <span class="what">{r.what}</span>
          </span>

          <span class="price mono">{money(r.usd, true)}<span class="per">/mo</span></span>

          <span class="swap">
            <span class="run">
              <span class="arrow" aria-hidden="true">↳</span>
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
    <p class="mono t-label">rented, per year</p>
    <p class="t-num">{money(yearly)}</p>
    <p class="t-sub">
      {money(monthly, true)} a month across {picked.size} subscription{picked.size === 1 ? '' : 's'},
      and none of it belongs to you at the end of it.
    </p>
    <a
      class="btn btn-sm t-cta"
      href="https://stern.hackclub.com/cloudfall/welcome"
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
    grid-template-columns: minmax(0, 1fr) 262px;
    gap: 22px;
    align-items: start;
  }

  .rows { list-style: none; margin: 0; padding: 0; }

  .row {
    border-top: 1px solid var(--rule-2);
    /* the lit bar on the left is the whole state change: no colour swap on the
       row fill, which at eight rows would strobe */
    box-shadow: inset 2px 0 0 transparent;
    transition: box-shadow 0.18s var(--ease), background 0.18s;
  }
  .row:last-child { border-bottom: 1px solid var(--rule-2); }
  .row.on { box-shadow: inset 2px 0 0 var(--ember); background: rgba(255, 146, 46, 0.045); }

  .hit {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    align-items: center;
    gap: 5px 14px;
    width: 100%;
    padding: 12px 14px 13px;
    border: none;
    background: none;
    text-align: left;
    color: inherit;
  }

  .box {
    position: relative;
    width: 15px;
    height: 15px;
    border: 1px solid var(--rule);
    border-radius: 2px;
    background: var(--void);
  }
  .row.on .box { border-color: var(--ember); background: var(--ember); }
  /* a tick, not a cross: an X in a box reads as "remove", which is the
     opposite of what ticking a line here means */
  .row.on .box::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 5px;
    height: 9px;
    border: solid #21120a;
    border-width: 0 2px 2px 0;
    transform: rotate(42deg);
  }

  .who { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
  .service {
    font-family: var(--display);
    font-weight: 800;
    font-size: 1.02rem;
    letter-spacing: -0.02em;
  }
  .what {
    font-size: 0.82rem;
    color: var(--ink-3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .price {
    font-size: 0.92rem;
    color: var(--ink-2);
    text-transform: none;
    letter-spacing: 0.02em;
  }
  .row.on .price { color: var(--ember); }
  .per { font-size: 0.72em; color: var(--ink-3); }

  .swap {
    grid-column: 2 / 4;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 2px 12px;
  }
  .arrow { color: var(--ink-3); }
  .run { display: flex; align-items: baseline; gap: 8px; flex: 0 0 auto; }
  .app {
    font-family: var(--mono);
    font-size: 0.82rem;
    color: #a293ff;
  }
  .port { font-size: 0.66rem; color: var(--ink-3); }
  .how {
    flex: 1 1 22ch;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--ink-2);
    max-width: 64ch;
  }

  /* ── THE TOTAL ──
     Sticky, because the number is the argument and it has to stay on screen
     while you tick your way down eight rows. */
  .total {
    position: sticky;
    top: 60px;
    padding: 18px 18px 16px;
    border: 1px solid var(--rule);
    border-radius: var(--r);
    background: var(--void);
    box-shadow: var(--drop-sm);
  }
  .t-label { font-size: 0.68rem; }
  .t-num {
    margin-top: 4px;
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(2.6rem, 5.5vw, 3.4rem);
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--ember);
    font-variant-numeric: tabular-nums;
  }
  .t-sub {
    margin-top: 12px;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--ink-2);
  }
  .t-cta { width: 100%; margin-top: 14px; }
  .t-note {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--rule-2);
    font-size: 0.62rem;
    line-height: 1.5;
  }

  @media (max-width: 900px) {
    .ledger { grid-template-columns: minmax(0, 1fr); }
    /* the total leads on a phone: the number is the reason to read the rows */
    .total { position: static; order: -1; }
    .what { display: none; }
  }
</style>
