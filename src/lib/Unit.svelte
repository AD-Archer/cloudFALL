<script>
  // A section on the paper. No panel, no card, no border — sections are
  // told apart by the space between them and nothing else. That space is
  // where all of the calm on this page comes from, so it is generous and
  // it never varies.
  //
  //   <Unit id="shop" title="The shop" sub="…" cta="Full shop" href="…">…</Unit>
  let { title = '', sub = '', cta = '', href = '', id = '', children } = $props()
</script>

<section class="unit" {id} data-analytics-section={id}>
  <div class="head">
    <h2>{title}</h2>
    {#if sub}<p class="sub">{sub}</p>{/if}
    {#if cta && href}
      <a
        class="btn-text head-cta"
        {href}
        data-analytics="CTA: Click"
        data-analytics-placement="unit-{id}"
      >
        {cta}
      </a>
    {/if}
  </div>

  <div class="body">
    {@render children()}
  </div>
</section>

<style>
  .unit { padding-block: 0; }

  .head {
    display: grid;
    justify-items: start;
    /* more space above a heading than below it: the sub belongs to the
       heading, so it sits close */
    gap: 12px;
    max-width: 66ch;
  }

  .sub {
    font-size: var(--fs-xl);
    line-height: 1.6;
    color: var(--ink-2);
  }

  .head-cta { margin-top: 4px; }

  .body { margin-top: clamp(28px, 4vw, 44px); }
</style>
