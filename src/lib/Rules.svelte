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
      <span class="pill pill-blush">AI CAP</span>
      <p>
        At most <mark>{aiPercent}%</mark> of the project can be AI-assisted, and you only get
        credit for the hours you actually worked.
      </p>
    </li>
  {/if}

  {#if requirements}
    <li class="check live">
      <span class="pill pill-blush">PROGRAM</span>
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
  .checks { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }

  .check {
    display: grid;
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 16px;
    align-items: baseline;
    padding: 14px 18px 15px;
    border-radius: var(--r);
    background: var(--cloud-2);
    transition: background 0.2s, box-shadow 0.24s var(--ease-out);
  }
  .check:hover { background: #fff; box-shadow: var(--lift-sm); }

  .pill { justify-self: start; }

  p {
    font-size: 1rem;
    line-height: 1.55;
    color: var(--ink);
    max-width: 74ch;
  }

  /* the highlight is a soft warm bubble around the phrase, not a hard mark */
  mark {
    padding: 1px 9px 2px;
    border-radius: var(--r-pill);
    color: var(--ember-ink);
    background: linear-gradient(180deg, #ffe4c4 0%, #ffd2a0 100%);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  @media (max-width: 640px) {
    .check { grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 13px 15px 14px; }
    p { font-size: 0.96rem; }
  }
</style>
