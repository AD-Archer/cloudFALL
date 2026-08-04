<script>
  // The shop, read live from Stern. Everything here is priced in tracked
  // hours, so the hour count is the anchor of the card and because this
  // particular shelf is mostly blank discs, the card also states how much
  // library the thing holds. That is the number a self-hoster is actually
  // shopping on.
  import { trackEvent } from './insight.js'
  import { novelBlurb } from './text.js'
  import { capacity } from './spec.js'

  let { prizes = [], loading = false, shopUrl = '', programUrl = '' } = $props()

  const CLIP = 6
  let open = $state(false)
  let band = $state('all')

  let brokenImages = $state(new Set())
  const markBroken = (id) => (brokenImages = new Set(brokenImages).add(id))

  // Brackets, not a slider: the useful question is "what can I reach with the
  // hours I have", and round numbers answer it faster than a range control.
  const hours = (p) => (p.priceType === 'hours' && typeof p.price === 'number' ? p.price : null)

  const BANDS = [
    { id: 'all', label: 'everything', match: () => true },
    { id: 'low', label: 'under 10 hrs', match: (p) => hours(p) !== null && hours(p) < 10 },
    { id: 'mid', label: '10–50 hrs', match: (p) => hours(p) !== null && hours(p) >= 10 && hours(p) <= 50 },
    { id: 'high', label: 'over 50 hrs', match: (p) => hours(p) !== null && hours(p) > 50 }
  ]

  // a band with nothing in it is not a choice, so it never becomes a chip
  let bands = $derived(
    BANDS.map((b) => ({ ...b, n: prizes.filter(b.match).length })).filter(
      (b) => b.id === 'all' || b.n > 0
    )
  )

  let shown = $derived(prizes.filter((BANDS.find((b) => b.id === band) ?? BANDS[0]).match))

  const chooseBand = (next) => {
    if (next === band) return
    band = next
    open = false // a new filter is a new list; re-clip it on phones
    trackEvent('Shop: Filter', { band: next, results: shown.length })
  }

  function price(p) {
    if (p.priceType === 'free' || !p.price) return { n: 'Free', u: '' }
    if (p.priceType === 'hours') return { n: String(p.price), u: 'hrs' }
    return { n: String(p.price), u: p.priceType ?? '' }
  }

  const stockLabel = (p) =>
    p.stock === null || p.stock === undefined ? '' : p.stock > 0 ? `${p.stock} left` : 'out of stock'

  // one line for everything conditional, so a card never grows an extra row
  // just because one item happens to track stock
  const meta = (p) =>
    [
      stockLabel(p),
      p.minHoursRequired > 0 ? `unlocks at ${p.minHoursRequired} hrs` : '',
      p.estimatedShip ? `ships ${p.estimatedShip}` : '',
      p.domesticShippingOnly ? 'us postage' : ''
    ]
      .filter(Boolean)
      .join(' · ')

  // reserve that line on every card only when some item fills it
  let anyMeta = $derived(prizes.some((p) => meta(p)))
</script>

{#if loading}
  <p class="msg mono">reading the shop…</p>
{:else if prizes.length}
  {#if bands.length > 1}
    <div class="chips filters" role="group" aria-label="Filter by cost">
      {#each bands as b}
        <button type="button" class="chip" class:on={band === b.id} onclick={() => chooseBand(b.id)}>
          {b.label}{#if b.id !== 'all'}<span class="chip-n">{b.n}</span>{/if}
        </button>
      {/each}
    </div>
  {/if}

  <ul class="grid" class:clipped={!open}>
    {#each shown as p, i}
      {@const spec = novelBlurb(p.name, p.description)}
      {@const cap = capacity(p.name, p.description)}
      {@const cost = price(p)}
      <li class="card" class:sold-out={p.stock === 0}>
        <a
          class="tile"
          href={p.url || shopUrl}
          data-analytics="Prize: View"
          data-analytics-placement="shop-card"
          data-analytics-item={p.name}
          data-analytics-stock={stockLabel(p) || 'unlimited'}
        >
          <div class="thumb">
            {#if p.imageUrl && !brokenImages.has(p.id)}
              <img
                src={p.imageUrl}
                alt={p.name}
                loading={i < 4 ? 'eager' : 'lazy'}
                decoding="async"
                referrerpolicy="no-referrer"
                onerror={() => markBroken(p.id)}
              />
            {:else}
              <span class="blank" aria-hidden="true"></span>
            {/if}
            {#if p.isFeatured}<span class="tag tag-ember flag">pick</span>{/if}
          </div>

          <div class="card-body">
            <h3>{p.name}</h3>

            <!-- what it holds, which is the whole reason to want it -->
            {#if cap}
              <p class="cap mono">
                <span class="cap-n">{cap.total}</span>
                {#if cap.breakdown}<span class="cap-b">{cap.breakdown}</span>{/if}
              </p>
            {:else if spec}
              <p class="cap blurb">{spec}</p>
            {:else}
              <p class="cap"></p>
            {/if}

            <p class="cost">
              <span class="cost-n">{cost.n}</span>{#if cost.u}<span class="cost-u mono">{cost.u}</span>{/if}
            </p>

            {#if anyMeta}<p class="meta mono">{meta(p)}</p>{/if}
          </div>
        </a>
      </li>
    {/each}
  </ul>

  {#if !open && shown.length > CLIP}
    <div class="more-row">
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        onclick={() => {
          open = true
          trackEvent('Shop: Show More', { band, total: shown.length })
        }}
      >
        Show {shown.length - CLIP} more
      </button>
    </div>
  {/if}

  {#if !shown.length}
    <p class="msg">
      Nothing in that range yet.
      <button type="button" class="link" onclick={() => chooseBand('all')}>Show everything</button>
    </p>
  {/if}
{:else}
  <p class="msg">
    No items are listed right now. The shop is filled in on Stern, so check
    <a href={programUrl}>the program page</a> for what is live.
  </p>
{/if}

<style>
  .filters {
    padding-bottom: 16px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--rule-2);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(196px, 1fr));
    gap: 14px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .card {
    border: 1px solid var(--rule);
    border-radius: var(--r);
    background: var(--void);
    box-shadow: var(--drop-sm);
    overflow: hidden;
    transition: transform 0.16s var(--ease), box-shadow 0.16s var(--ease), border-color 0.16s;
  }
  .card:hover {
    transform: translate(-2px, -2px);
    border-color: var(--sky);
    box-shadow: var(--drop);
  }

  .tile { display: grid; grid-template-rows: auto 1fr; height: 100%; }

  /* the plate is white: these are product photos shot on white, and floating
     them on violet leaves every one of them in a grey halo */
  .thumb {
    position: relative;
    display: grid;
    place-items: center;
    aspect-ratio: 5 / 4;
    padding: 12px;
    background: #f4f2ff;
    border-bottom: 1px solid var(--rule);
  }
  /* absolute, not max-height: inside a grid row whose height comes from the
     aspect-ratio box, a percentage max-height resolves against nothing and
     every photo renders at its intrinsic size, blowing the card open */
  .thumb img {
    position: absolute;
    inset: 12px;
    width: calc(100% - 24px);
    height: calc(100% - 24px);
    object-fit: contain;
    mix-blend-mode: multiply;
  }
  .blank {
    width: 46px;
    height: 46px;
    border: 2px dashed #b9b0e8;
    border-radius: 50%;
  }

  .flag { position: absolute; top: 8px; right: 8px; background: #fff2e4; }

  .card-body {
    display: grid;
    /* fixed rows, so a long name or a missing capacity line cannot make one
       card taller than its neighbours */
    grid-template-rows: 2.5em auto auto;
    align-content: start;
    padding: 11px 12px 12px;
  }

  h3 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    font-size: 0.92rem;
    font-weight: 600;
    font-family: var(--sans);
    line-height: 1.25;
    letter-spacing: 0;
  }

  .cap {
    display: flex;
    align-items: baseline;
    gap: 7px;
    min-height: 1.4em;
    margin-top: 5px;
    font-size: 0.68rem;
  }
  .cap-n { color: #a293ff; }
  .cap-b { color: var(--ink-3); font-size: 0.92em; }
  .blurb {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    overflow: hidden;
    font-family: var(--sans);
    font-size: 0.76rem;
    text-transform: none;
    letter-spacing: 0;
    color: var(--ink-3);
  }

  .cost {
    display: flex;
    align-items: baseline;
    gap: 5px;
    margin-top: 9px;
    padding-top: 9px;
    border-top: 1px solid var(--rule-2);
  }
  .cost-n {
    font-family: var(--display);
    font-weight: 800;
    font-size: 1.5rem;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--ember);
  }
  .cost-u { font-size: 0.64rem; color: var(--ink-3); }

  .meta { margin-top: 6px; min-height: 1.1em; font-size: 0.6rem; }

  .card.sold-out .thumb { opacity: 0.45; }
  .card.sold-out .cost-n { color: var(--ink-3); }

  .msg { margin: 6px 2px; color: var(--ink-2); }
  .msg a { color: var(--ember); text-decoration: underline; }
  .link {
    padding: 0;
    border: none;
    background: none;
    color: var(--ember);
    font: inherit;
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .card-body { padding: 9px 10px 11px; }
    h3 { font-size: 0.86rem; }
    .cost-n { font-size: 1.3rem; }
  }
</style>
