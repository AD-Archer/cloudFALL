<script>
  // Projects people actually shipped through cloudFALL, hand-picked in Stern
  // with the Archer Seal of Approval and read live from /starred. Empty until
  // something is sealed, which is why the whole unit is hidden rather than
  // showing a placeholder.
  import { novelBlurb } from './text.js'
  import Rail from './Rail.svelte'

  let { items = [] } = $props()

  let brokenImages = $state(new Set())
  const markBroken = (id) => (brokenImages = new Set(brokenImages).add(id))
</script>

<Rail label="Projects built by the community">
  {#each items as item, i (item.id)}
    {@const spec = novelBlurb(item.name, item.description)}
    <li>
      <a
        class="tile"
        href={item.url}
        target="_blank"
        rel="noopener"
        data-analytics="Starred: Open"
        data-analytics-item={item.name}
      >
        <!-- No screenshot, no plate: an empty rounded rectangle reads as a
             hole in the row, not as a project awaiting a picture. -->
        {#if item.image && !brokenImages.has(item.id)}
          <div class="thumb">
            <img
              src={item.image}
              alt=""
              loading={i < 4 ? 'eager' : 'lazy'}
              decoding="async"
              referrerpolicy="no-referrer"
              onerror={() => markBroken(item.id)}
            />
          </div>
        {/if}

        <div class="card-body">
          <h3>{item.name}</h3>
          {#if spec}<p class="blurb">{spec}</p>{/if}
          {#if item.builder}<p class="foot">by {item.builder}</p>{/if}
        </div>
      </a>
    </li>
  {/each}
</Rail>

<style>
  .tile { display: grid; grid-template-rows: auto 1fr; height: 100%; text-decoration: none; align-content: start; }

  /* screenshots are editorial, not product shots on white: they cover the
     plate rather than sitting inside it */
  .thumb {
    position: relative;
    aspect-ratio: 5 / 4;
    border-radius: var(--r-sm);
    background: var(--paper-2);
    overflow: hidden;
  }
  .thumb img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-body { padding-top: 12px; }

  h3 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    font-size: var(--fs-lg);
    font-weight: 600;
    line-height: 1.3;
  }
  .tile:hover h3 { text-decoration: underline; text-underline-offset: 3px; }

  .blurb {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    margin-top: 6px;
    font-size: var(--fs-md);
    line-height: 1.45;
    color: var(--ink-2);
  }

  .foot {
    margin-top: 9px;
    font-family: var(--sans);
    font-size: var(--fs-xs);
    color: var(--ink-3);
  }

  @media (max-width: 640px) {
    h3 { font-size: var(--fs-md); }
  }
</style>
