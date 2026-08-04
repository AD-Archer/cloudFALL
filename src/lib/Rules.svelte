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
    <li class="check live">
      <span class="tag">AI CAP</span>
      <p>
        At most <mark>{aiPercent}%</mark> of the project can be AI-assisted, and you only get
        credit for the hours you actually worked.
      </p>
    </li>
  {/if}

  {#if requirements}
    <li class="check live">
      <span class="tag">PROGRAM</span>
      <p>{requirements}</p>
    </li>
  {/if}

  {#each items as item}
    <li class="check">
      <span class="tag">{item.tag}</span>
      <p>
        {#each parts(item) as p}{#if p.mark}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}
      </p>
    </li>
  {/each}
</ol>

<style>
  .checks { list-style: none; margin: 0; padding: 0; }

  .check {
    display: grid;
    grid-template-columns: 104px minmax(0, 1fr);
    gap: 16px;
    align-items: baseline;
    padding: 14px 4px;
    border-top: 1px solid var(--rule-2);
  }
  .check:first-child { border-top: none; }

  /* a live row came from Stern rather than this repo the violet tag is the
     only tell, and it is deliberately quiet */
  .live .tag { border-color: var(--sky); color: #a293ff; }

  .tag { justify-self: start; }

  p {
    font-size: 1rem;
    line-height: 1.55;
    color: var(--ink);
    max-width: 74ch;
  }

  mark {
    padding: 0 2px;
    color: var(--ember);
    background: none;
    box-shadow: inset 0 -2px 0 rgba(255, 146, 46, 0.45);
  }

  @media (max-width: 640px) {
    .check { grid-template-columns: minmax(0, 1fr); gap: 7px; }
    p { font-size: 0.96rem; }
  }
</style>
