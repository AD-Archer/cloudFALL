<script>
  // 404 and 500, in the page's own voice. This site argues that a service is a
  // machine somebody runs, so its error pages talk like one.
  import { CONFIG } from './data.js'

  let {
    code = '404',
    eyebrow = 'no route to host',
    title = 'Nothing is hosted here.',
    body = 'That path is not on this box.',
    detail = ''
  } = $props()
</script>

<svelte:head>
  <title>{code} · {CONFIG.name}</title>
</svelte:head>

<main class="shell on-sky">
  <section class="wrap panel" aria-labelledby="status-title" data-analytics-section="status">
    <div class="figure" aria-hidden="true">
      <img src="/linky.png" alt="" width="500" height="500" />
      <span class="code">{code} · {eyebrow}</span>
    </div>

    <div class="copy">
      <h1 id="status-title">{title}</h1>
      <p class="lede">{body}</p>
      {#if detail}<p class="detail">{detail}</p>{/if}
      <div class="actions">
        <a class="btn" href="/" data-analytics="CTA: Click" data-analytics-placement="status-home">
          Back to the front page
        </a>
        <a
          class="btn btn-soft"
          href={CONFIG.slackUrl}
          data-analytics="CTA: Click"
          data-analytics-placement="status-slack"
        >
          Ask in Slack
        </a>
      </div>
    </div>
  </section>
</main>

<style>
  /* the whole error page is sky: nothing was served, so there is no ground */
  .shell {
    min-height: 100svh;
    display: grid;
    align-items: center;
    background: var(--sky);
    color: var(--on-sky);
  }

  .panel {
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr);
    align-items: center;
    gap: clamp(24px, 5vw, 56px);
    padding-block: clamp(50px, 10vw, 110px);
    background: none;
    border-radius: 0;
  }

  .figure { display: grid; justify-items: center; gap: 16px; }
  .figure img { width: 100%; max-width: 150px; height: auto; }
  .code {
    font-family: var(--sans);
    font-size: var(--fs-sm);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ember-ink);
    text-align: center;
  }

  /* no size override: h1 already carries the documented display step */
  h1 { max-width: 16ch; }
  .lede { margin-top: 16px; font-size: var(--fs-xl); color: var(--on-sky-2); max-width: 48ch; }

  .detail {
    margin-top: 18px;
    padding: 12px 16px;
    border-radius: var(--r-sm);
    background: var(--paper-2);
    font-family: var(--sans);
    font-size: 0.74rem;
    color: var(--on-sky-2);
    overflow-wrap: anywhere;
    max-width: 60ch;
  }

  .actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 28px; }

  @media (max-width: 720px) {
    .panel { grid-template-columns: minmax(0, 1fr); justify-items: start; }
    .figure { justify-items: start; }
    .figure img { max-width: 110px; }
  }
</style>
