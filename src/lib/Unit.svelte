<script>
  // Every section is a cloud with a header band across the top: a numbered
  // bubble, a name, and the port the thing on that band would actually listen
  // on. 8096 is Jellyfin, 32400 is Plex. Anyone who has run a server reads it
  // instantly, and it says more than a decorative divider would.
  //
  //   <Unit n="01" title="The ledger" port="8096" sub="…">…</Unit>
  let {
    n = '',
    title = '',
    sub = '',
    port = '',
    cta = '',
    href = '',
    id = '',
    children
  } = $props()
</script>

<section class="unit cloud" {id}>
  <header class="band">
    {#if n}<span class="n">{n}</span>{/if}
    <h2>{title}</h2>
    {#if port}<span class="pill port">:{port}</span>{/if}
    {#if cta && href}
      <a class="btn-text go" {href} data-analytics="CTA: Click" data-analytics-placement="unit-{id || n}">
        {cta}
      </a>
    {/if}
    {#if sub}<p class="sub">{sub}</p>{/if}
  </header>

  <div class="body">
    {@render children()}
  </div>
</section>

<style>
  .unit { overflow: hidden; }

  .band {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    padding: 18px 24px 16px;
    background: linear-gradient(180deg, #f2f1ff 0%, rgba(242, 241, 255, 0) 100%);
  }

  /* the index is a bubble, like everything else that carries a number here */
  .n {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    font-family: var(--mono);
    font-size: 0.76rem;
    color: var(--ember-ink);
    background: linear-gradient(180deg, var(--ember-hi) 0%, var(--ember) 100%);
    box-shadow: 0 5px 12px rgba(215, 105, 10, 0.32), inset 0 2px 0 rgba(255, 255, 255, 0.7);
  }

  h2 {
    font-size: 1.42rem;
    font-weight: 600;
  }

  .port { flex: 0 0 auto; }
  .go { margin-left: auto; }

  .sub {
    flex-basis: 100%;
    margin-top: 2px;
    font-size: 0.98rem;
    color: var(--ink-2);
    max-width: 68ch;
  }

  .body { padding: 6px 24px 26px; }

  @media (max-width: 640px) {
    .band { padding: 15px 17px 13px; gap: 11px; }
    h2 { font-size: 1.28rem; }
    .body { padding: 4px 17px 20px; }
    .go { margin-left: 0; }
  }
</style>
