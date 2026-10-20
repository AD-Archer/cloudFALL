<script>
  // A row that scrolls sideways (.rail in app.css) with previous/next
  // buttons on its two sides, centred on the photo plates. `lead` (a filter
  // row, say) sits above the row. Change `resetKey` and the row goes back to
  // the front.
  //
  //   <Rail label="Shop items" resetKey={band}>{#snippet lead()}…{/snippet}<li>…</li></Rail>
  let { label = '', resetKey = undefined, lead, children } = $props()

  const id = `rail-${Math.random().toString(36).slice(2, 8)}`
  let el = $state()
  let atStart = $state(true)
  let atEnd = $state(true)

  function measure() {
    if (!el) return
    atStart = el.scrollLeft <= 1
    atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
  }

  $effect(() => {
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  })

  $effect(() => {
    void resetKey
    el?.scrollTo({ left: 0 })
    measure()
  })

  // A page is as many whole items as are fully in view, so the one peeking
  // past the edge becomes the first one after a click rather than being
  // skipped or cut in half again.
  function page(dir) {
    if (!el) return
    const [a, b] = el.children
    const pitch = a && b ? b.offsetLeft - a.offsetLeft : el.clientWidth
    const step = Math.max(1, Math.floor(el.clientWidth / pitch)) * pitch
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * step, behavior: reduce ? 'auto' : 'smooth' })
  }
</script>

{#if lead}<div class="lead">{@render lead()}</div>{/if}

<div class="frame">
  <ul class="rail" {id} bind:this={el} aria-label={label} onscroll={measure}>
    {@render children()}
  </ul>

  <!-- Disabled at its end, and then gone: a greyed-out circle parked on top
       of a photo is noise, not information. -->
  <button
    type="button"
    class="step prev"
    aria-label="Previous"
    aria-controls={id}
    disabled={atStart}
    onclick={() => page(-1)}
    data-analytics="Rail: Previous"
    data-analytics-rail={label}
  >
    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" /></svg>
  </button>
  <button
    type="button"
    class="step next"
    aria-label="Next"
    aria-controls={id}
    disabled={atEnd}
    onclick={() => page(1)}
    data-analytics="Rail: Next"
    data-analytics-rail={label}
  >
    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
  </button>
</div>

<style>
  .lead { padding-bottom: 24px; }

  .frame { position: relative; }

  /* Filled in the action blue, like .btn and a selected chip: these sit over
     photos, where a ruled ring alone vanishes into a busy screenshot. The
     chevron is paper for the same reason .btn's label is. */
  .step {
    position: absolute;
    /* the middle of the 5:4 plate: the rail's 4px top padding plus 40% of
       one item's width */
    top: calc(4px + var(--rail-item) * 0.4);
    translate: 0 -50%;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    color: var(--paper);
    background: var(--sky-deep);
    border: none;
    border-radius: 999px;
    transition: background 160ms ease, opacity 150ms ease;
  }
  .step:hover { background: var(--sky-deeper); }
  .step:disabled { opacity: 0; pointer-events: none; }

  /* just inside the edge on a phone, where the page gutter is too thin to
     hold one; half out into the gutter once it is wide enough */
  .prev { left: 6px; }
  .next { right: 6px; }
  @media (min-width: 800px) {
    .prev { left: -20px; }
    .next { right: -20px; }
  }

  .step svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
