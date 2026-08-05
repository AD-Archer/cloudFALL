<script>
  // Every section is a white panel on the ground: a title in the left column,
  // the one line of context in the right, then the body. Same shape every
  // time, so the reader stops noticing it after the second section.
  //
  // The header used to carry a port number as a badge. Ports are real
  // information, so they moved to the bill where they say something true about
  // a machine, rather than sitting on "Questions" as decoration.
  //
  //   <Unit id="shop" title="The shop" sub="…" cta="Full shop" href="…">…</Unit>
  let {
    title = '',
    sub = '',
    cta = '',
    href = '',
    id = '',
    children
  } = $props()
</script>

<section class="unit panel" {id}>
  <div class="head">
    <h2>{title}</h2>

    <div class="aside">
      {#if sub}<p class="sub">{sub}</p>{/if}
      {#if cta && href}
        <a class="btn-text" {href} data-analytics="CTA: Click" data-analytics-placement="unit-{id}">
          {cta}
        </a>
      {/if}
    </div>
  </div>

  <div class="body">
    {@render children()}
  </div>
</section>

<style>
  .unit { padding: clamp(26px, 3.6vw, 44px) clamp(22px, 3vw, 40px); }

  .head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
    gap: clamp(14px, 3vw, 48px);
  }

  h2 {
    font-size: clamp(1.6rem, 3.2vw, 2.3rem);
    max-width: 13ch;
  }

  .aside { display: grid; justify-items: start; gap: 14px; }

  .sub {
    font-size: 1.02rem;
    line-height: 1.5;
    color: var(--ink-2);
    max-width: 54ch;
  }

  .body { margin-top: clamp(26px, 3.5vw, 42px); }

  @media (max-width: 800px) {
    .head { grid-template-columns: minmax(0, 1fr); }
    h2 { max-width: none; }
  }
</style>
