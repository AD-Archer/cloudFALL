<script>
  // The strip pinned across the top: what the world charges per month, on a
  // loop, plus whatever the program is currently reporting. Two identical runs
  // slide by half the track width, so the loop is seamless without measuring.
  //   <Ticker items={['netflix $17.99/mo', '4.5 hours shipped']} />
  let { items = [], speed = 52 } = $props()
</script>

{#if items.length}
  <div class="ticker">
    <div class="track" style="--dur:{speed}s">
      {#each [0, 1] as copy}
        <ul class="run" aria-hidden={copy === 1 ? 'true' : null}>
          {#each items as item}
            <li>{item}</li>
          {/each}
        </ul>
      {/each}
    </div>
  </div>
{/if}

<style>
  .ticker {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    height: 36px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(10px) saturate(1.2);
    -webkit-backdrop-filter: blur(10px) saturate(1.2);
    box-shadow: 0 2px 14px rgba(38, 22, 110, 0.12);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
  }

  .track {
    display: flex;
    width: max-content;
    animation: slide var(--dur) linear infinite;
  }

  .ticker:hover .track,
  .ticker:focus-within .track { animation-play-state: paused; }

  .run { display: flex; align-items: center; list-style: none; margin: 0; padding: 0; }

  .run li {
    display: flex;
    align-items: center;
    padding-right: 24px;
    font-family: var(--mono);
    font-size: 0.66rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--ink-2);
  }

  /* a small warm bubble between entries */
  .run li::before {
    content: '';
    width: 6px;
    height: 6px;
    margin-right: 24px;
    border-radius: 50%;
    background: linear-gradient(180deg, var(--ember-hi), var(--ember));
  }

  @keyframes slide {
    to { transform: translateX(-50%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .track { animation: none; }
  }
</style>
