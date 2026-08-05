<script>
  // The checklist a reviewer runs down. `requirements` and `aiPercent` come
  // from Stern and render above the evergreen list when the program sets them,
  // so the page can never disagree with the platform about the AI cap.
  let { items = [], requirements = '', aiPercent = null } = $props()

  // Split a rule's text around its optional highlighted phrase.
  function parts(item) {
    if (!item.mark) return [{ text: item.text, mark: false }]
    const i = item.text.indexOf(item.mark)
    if (i === -1) return [{ text: item.text, mark: false }]
    return [
      { text: item.text.slice(0, i), mark: false },
      { text: item.mark, mark: true },
      { text: item.text.slice(i + item.mark.length), mark: false }
    ]
  }
</script>

<ol class="checks">
  {#if typeof aiPercent === 'number'}
    <li class="check">
      <span class="pill">AI cap</span>
      <p>
        At most <mark>{aiPercent}%</mark> of the project can be AI-assisted, and you only get
        credit for the hours you actually worked.
      </p>
    </li>
  {/if}

  {#if requirements}
    <li class="check">
      <span class="pill">Program</span>
      <p>{requirements}</p>
    </li>
  {/if}

  {#each items as item}
    <li class="check">
      <span class="pill">{item.tag}</span>
      <p>
        {#each parts(item) as p}{#if p.mark}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}
      </p>
    </li>
  {/each}
</ol>

<style>
  .checks { list-style: none; margin: 0; padding: 0; display: grid; }

  .check {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 24px;
    align-items: baseline;
    padding: 18px 0;
    border-top: 1px solid var(--rule);
  }
  .check:last-child { border-bottom: 1px solid var(--rule); }

  .pill { justify-self: start; padding-top: 4px; }

  p { max-width: 70ch; }

  /* the phrase that decides whether a submission comes back. An underline in
     the accent, not a filled bubble around it: the emphasis belongs to the
     words, not to a shape drawn behind them. */
  mark {
    background: none;
    color: inherit;
    text-decoration: underline;
    text-decoration-color: var(--ember);
    text-decoration-thickness: 2.5px;
    text-underline-offset: 4px;
  }

  @media (max-width: 640px) {
    .check { grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .pill { padding-top: 0; }
  }
</style>
