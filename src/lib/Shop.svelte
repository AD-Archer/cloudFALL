<script>
  // The shop, read live from Stern. Everything here is priced in tracked
  // hours, so the hour count is the anchor of the card and because this
  // particular shelf is mostly blank discs, the card also states how much
  // library the thing holds. That is the number a self-hoster is actually
  // shopping on.
  import { trackEvent } from './insight.js'
  import { novelBlurb } from './text.js'
  import { capacity } from './spec.js'
  import Rail from './Rail.svelte'

  let { prizes = [], loading = false, shopUrl = '', programUrl = '' } = $props()

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
    band = next // Rail takes this as its resetKey and goes back to the front
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
  <p class="msg">Reading the shop…</p>
{:else if prizes.length}
  <Rail label="Shop items" resetKey={band}>
    {#snippet lead()}
      {#if bands.length > 1}
        <div class="chips" role="group" aria-label="Filter by cost">
          {#each bands as b}
            <button type="button" class="chip" class:on={band === b.id} onclick={() => chooseBand(b.id)}>
              {b.label}{#if b.id !== 'all'}<span class="chip-n">{b.n}</span>{/if}
            </button>
          {/each}
        </div>
      {/if}
    {/snippet}
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
          <!-- No photo, no plate: an empty rounded rectangle reads as a
               hole in the shelf rather than as an item awaiting a photo. -->
          {#if p.imageUrl && !brokenImages.has(p.id)}
            <div class="thumb">
              <img
                src={p.imageUrl}
                alt={p.name}
                loading={i < 4 ? 'eager' : 'lazy'}
                decoding="async"
                referrerpolicy="no-referrer"
                onerror={() => markBroken(p.id)}
              />
              {#if p.isFeatured}<span class="pill pill-ember flag">pick</span>{/if}
            </div>
          {:else if p.isFeatured}
            <p class="tag-row"><span class="pill pill-ember">pick</span></p>
          {/if}

          <div class="card-body">
            <h3>{p.name}</h3>

            <!-- what it holds, which is the whole reason to want it -->
            {#if cap}
              <p class="cap">
                <span class="cap-n">{cap.total}</span>
                {#if cap.breakdown}<span class="cap-b">{cap.breakdown}</span>{/if}
              </p>
            {:else if spec}
              <p class="cap blurb">{spec}</p>
            {:else}
              <p class="cap"></p>
            {/if}

            <p class="cost">
              <span class="cost-n">{cost.n}</span>{#if cost.u}<span class="cost-u">{cost.u}</span>{/if}
            </p>

            {#if anyMeta}<p class="meta">{meta(p)}</p>{/if}
          </div>
        </a>
      </li>
    {/each}
  </Rail>

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
  /* The shelf is thirty-odd items long, so it runs sideways on a Rail
     rather than stacking: one row is a look at what is on it, and
     an unclipped grid of near identical cards would be the loudest thing on
     a quiet page. */

  /* no card: the item sits on the panel it is already on. What separates one
     from the next is the space between them. */
  .tile { display: grid; grid-template-rows: auto 1fr; height: 100%; text-decoration: none; align-content: start; }
  .tag-row { margin-bottom: 10px; }

  /* a flat plate, so a product photo shot on white has something to sit on */
  .thumb {
    position: relative;
    display: grid;
    place-items: center;
    aspect-ratio: 5 / 4;
    border-radius: var(--r-sm);
    /* the plate has to differ from the ground it sits on, or an item with
       no photo yet reads as a hole in the grid rather than an empty plate */
    background: var(--paper-2);
  }
  /* absolute, not max-height: inside a grid row whose height comes from the
     aspect-ratio box, a percentage max-height resolves against nothing and
     every photo renders at its intrinsic size, blowing the card open */
  .thumb img {
    position: absolute;
    inset: 14px;
    width: calc(100% - 28px);
    height: calc(100% - 28px);
    object-fit: contain;
    mix-blend-mode: multiply;
  }
  /* position only: the fill, the radius and the ink all come from
     .pill-ember, which this element already carries */
  .flag {
    position: absolute;
    top: 8px;
    left: 8px;
  }

  .card-body {
    display: grid;
    /* fixed rows, so a long name or a missing capacity line cannot make one
       card taller than its neighbours */
    grid-template-rows: 2.7em auto auto;
    align-content: start;
    padding-top: 12px;
  }

  h3 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    font-size: var(--fs-lg);
    font-weight: 600;
    line-height: 1.3;
  }
  .tile:hover h3 { text-decoration: underline; text-underline-offset: 3px; }

  /* these lines were sized for uppercase monospace. They are the sans now,
     so they need a real reading size rather than a caption's. */
  .cap {
    display: flex;
    align-items: baseline;
    gap: 7px;
    min-height: 1.4em;
    margin-top: 4px;
    font-family: var(--sans);
    font-size: var(--fs-sm);
  }
  .cap-n { color: var(--ink-2); }
  .cap-b { color: var(--ink-3); font-size: 0.92em; }
  .blurb {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    overflow: hidden;
    font-family: var(--serif);
    font-size: var(--fs-sm);
    text-transform: none;
    letter-spacing: 0;
    color: var(--ink-3);
  }

  /* the price is the hours you shipped: a number, not a badge */
  .cost {
    display: flex;
    align-items: baseline;
    gap: 5px;
    margin-top: 12px;
  }
  .cost-n {
    font-family: var(--sans);
    font-weight: 600;
    font-size: var(--fs-2xl);
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--ember-ink);
  }
  .cost-u { font-family: var(--sans); font-size: var(--fs-sm); color: var(--ink-3); }

  .meta {
    margin-top: 8px;
    min-height: 1.1em;
    font-family: var(--sans);
    font-size: var(--fs-xs);
    color: var(--ink-3);
  }

  .card.sold-out .thumb { opacity: 0.45; }
  .card.sold-out .cost-n { color: var(--ink-3); }

  .msg { color: var(--ink-2); }
  .msg a { color: var(--ink); }
  .link {
    padding: 0;
    border: none;
    background: none;
    color: var(--ink);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: 640px) {
    h3 { font-size: var(--fs-md); }
    .cost-n { font-size: 1.2rem; }
  }
</style>
