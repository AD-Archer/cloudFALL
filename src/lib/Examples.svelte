<script>
  // Build ideas and shipped projects from Stern, folded into one grid by
  // normalizeExamples(). Empty until the program writes some, which is why the
  // whole unit is hidden rather than showing a placeholder.
  import { trackEvent } from './insight.js'
  import { novelBlurb } from './text.js'

  let { items = [] } = $props()

  let tag = $state('')
  let open = $state(false)
  const CLIP = 6

  let brokenImages = $state(new Set())
  const markBroken = (id) => (brokenImages = new Set(brokenImages).add(id))

  const chooseTag = (next) => {
    tag = tag === next ? '' : next
    open = false // a new filter is a new list; re-clip it on phones
    trackEvent('Examples: Filter', { tag: tag || 'all' })
  }

  // A tag earns a chip only if it actually splits the set: it has to appear on
  // more than one item and not on every item. One chip per tag means more
  // controls than content, which is worse than no filter at all.
  let tags = $derived.by(() => {
    const counts = new Map()
    for (const item of items) {
      for (const t of item.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    }
    return [...counts.entries()]
      .filter(([, n]) => n > 1 && n < items.length)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([t, n]) => ({ t, n }))
  })

  let shown = $derived(tag ? items.filter((i) => i.tags.includes(tag)) : items)

  const foot = (item) =>
    [item.effortLabel, item.credit ? `via ${item.credit}` : ''].filter(Boolean).join(' · ')
</script>

{#if tags.length > 1}
  <div class="chips filters" role="group" aria-label="Filter by tag">
    <button type="button" class="chip" class:on={tag === ''} onclick={() => chooseTag('')}>
      everything
    </button>
    {#each tags as { t, n }}
      <button type="button" class="chip" class:on={tag === t} onclick={() => chooseTag(t)}>
        {t}<span class="chip-n">{n}</span>
      </button>
    {/each}
  </div>
{/if}

{#if shown.length}
  <ul class="grid" class:clipped={!open}>
    {#each shown as item (item.id)}
      {@const spec = novelBlurb(item.title, item.description)}
      <li class="card" class:linked={!!item.link}>
        <svelte:element
          this={item.link ? 'a' : 'div'}
          class="tile"
          href={item.link || undefined}
          target={item.link ? '_blank' : undefined}
          rel={item.link ? 'noopener' : undefined}
          data-analytics={item.link ? 'Example: Open' : undefined}
          data-analytics-kind={item.link ? item.kind : undefined}
          data-analytics-item={item.link ? item.title : undefined}
        >
          <div class="thumb">
            {#if item.image && !brokenImages.has(item.id)}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                onerror={() => markBroken(item.id)}
              />
            {:else}
              <span class="blank" aria-hidden="true"></span>
            {/if}
            {#if item.kind === 'project'}<span class="pill pill-ember flag">shipped</span>{/if}
          </div>

          <div class="card-body">
            <h3>{item.title}</h3>
            {#if spec}<p class="blurb">{spec}</p>{/if}
            <p class="foot mono">{foot(item)}</p>
          </div>
        </svelte:element>
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
          trackEvent('Examples: Show More', { tag: tag || 'all', total: shown.length })
        }}
      >
        Show {shown.length - CLIP} more
      </button>
    </div>
  {/if}
{:else}
  <p class="msg">
    Nothing tagged “{tag}”.
    <button type="button" class="link" onclick={() => chooseTag('')}>Show everything</button>
  </p>
{/if}

<style>
  .filters { padding-bottom: 24px; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(204px, 1fr));
    gap: clamp(16px, 2.2vw, 26px);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .tile { display: grid; grid-template-rows: auto 1fr; height: 100%; text-decoration: none; }

  .thumb {
    position: relative;
    display: grid;
    place-items: center;
    aspect-ratio: 5 / 4;
    border-radius: var(--r-sm);
    background: var(--paper);
    overflow: hidden;
  }
  .thumb img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .blank {
    width: 42px;
    height: 42px;
    border: 2px solid var(--ink-3);
    border-radius: 50%;
    opacity: 0.4;
  }
  .flag {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 3px 8px 4px;
    border-radius: 6px;
    background: var(--ember);
    color: #3a1a00;
  }

  .card-body { padding-top: 12px; }

  h3 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    min-height: 2.7em;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
  }
  /* only the ones that go somewhere respond: an idea with no link should not
     pretend to be clickable */
  .card.linked .tile:hover h3 { text-decoration: underline; text-underline-offset: 3px; }

  .blurb {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    margin-top: 6px;
    font-size: 0.88rem;
    line-height: 1.45;
    color: var(--ink-2);
  }

  .foot { margin-top: 9px; min-height: 1.1em; font-size: 0.6rem; }

  .msg { color: var(--ink-2); }
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
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    h3 { font-size: 0.92rem; }
  }
</style>
