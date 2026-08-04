<script>
  // Every section of the page is a unit in a stack you are assembling: a
  // header rail bolted to a panel body. The rail carries an index, a name, and
  // the port the thing on that rail would actually listen on 8096 is
  // Jellyfin, 32400 is Plex. Anyone who has run a server reads it instantly,
  // and it beats a decorative divider for the same width of page.
  //
  //   <Unit n="02" title="The ledger" port="8096" sub="…">…</Unit>
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

<section class="unit" {id}>
  <header class="rail">
    <span class="n mono">{n}</span>
    <h2>{title}</h2>
    {#if sub}<p class="sub">{sub}</p>{/if}
    <span class="right">
      {#if port}<span class="port mono">:{port}</span>{/if}
      {#if cta && href}
        <a class="btn-text" {href} data-analytics="CTA: Click" data-analytics-placement="unit-{id || n}">
          {cta} →
        </a>
      {/if}
    </span>
  </header>

  <div class="body">
    {@render children()}
  </div>
</section>

<style>
  .unit {
    border: 1px solid var(--rule);
    border-radius: var(--r);
    background: var(--panel);
    box-shadow: var(--drop);
    overflow: hidden;
  }

  .rail {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 11px 18px;
    border-bottom: 1px solid var(--rule);
    background: var(--panel-2);
  }

  .n {
    flex: 0 0 auto;
    font-size: 0.78rem;
    color: var(--ember);
  }

  h2 {
    flex: 0 0 auto;
    font-size: 1.28rem;
    letter-spacing: -0.025em;
  }

  .sub {
    flex: 1 1 auto;
    min-width: 0;
    padding-left: 16px;
    border-left: 1px solid var(--rule);
    font-size: 0.92rem;
    line-height: 1.45;
    color: var(--ink-2);
    max-width: 62ch;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;
    flex: 0 0 auto;
  }

  .port { font-size: 0.72rem; color: var(--ink-3); }

  .body { padding: 20px 22px 24px; }

  @media (max-width: 900px) {
    .rail { flex-wrap: wrap; gap: 8px 14px; padding: 12px 16px; }
    .sub { flex-basis: 100%; padding-left: 0; border-left: none; }
    .right { margin-left: auto; order: -1; }
    .body { padding: 16px 15px 20px; }
  }
</style>
