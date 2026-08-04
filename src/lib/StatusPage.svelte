<script>
  // 404 and 500, in the page's own voice: this site is arguing that a service
  // is a machine somebody runs, so its error pages talk like one.
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

<main class="shell wrap">
  <section class="unit" aria-labelledby="status-title" data-analytics-section="status">
    <header class="rail">
      <span class="n mono">{code}</span>
      <span class="mono eyebrow">{eyebrow}</span>
      <a class="home mono" href="/">cloudfall.hackclub.com</a>
    </header>

    <div class="body">
      <img class="mark" src="/logo.png" alt="" width="120" height="104" />
      <div class="copy">
        <h1 id="status-title">{title}</h1>
        <p class="lede">{body}</p>
        {#if detail}<p class="detail mono">{detail}</p>{/if}
        <div class="actions">
          <a class="btn" href="/" data-analytics="CTA: Click" data-analytics-placement="status-home">
            Back to the front page
          </a>
          <a
            class="btn btn-ghost"
            href={CONFIG.slackUrl}
            data-analytics="CTA: Click"
            data-analytics-placement="status-slack"
          >
            Ask in Slack
          </a>
        </div>
      </div>
    </div>
  </section>
</main>

<style>
  .shell {
    min-height: 100svh;
    display: grid;
    align-items: center;
    padding-block: clamp(60px, 12vw, 120px);
  }

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
  .n { font-size: 0.78rem; color: var(--ember); }
  .eyebrow { font-size: 0.7rem; }
  .home { margin-left: auto; font-family: var(--mono); font-size: 0.68rem; color: var(--ink-3); }
  .home:hover { color: var(--ember); }

  .body {
    display: grid;
    grid-template-columns: 130px minmax(0, 1fr);
    align-items: center;
    gap: clamp(20px, 4vw, 44px);
    padding: clamp(24px, 4vw, 48px) clamp(20px, 3vw, 36px);
  }

  .mark { width: 130px; height: auto; opacity: 0.9; }

  h1 { font-size: clamp(1.9rem, 4.4vw, 3rem); max-width: 16ch; }
  .lede { margin-top: 14px; font-size: 1.06rem; color: var(--ink-2); max-width: 48ch; }

  .detail {
    margin-top: 16px;
    padding: 10px 12px;
    border-left: 2px solid var(--ember);
    background: var(--void);
    color: var(--ink-2);
    font-size: 0.72rem;
    text-transform: none;
    letter-spacing: 0.02em;
    overflow-wrap: anywhere;
    max-width: 60ch;
  }

  .actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 26px; }

  @media (max-width: 720px) {
    .body { grid-template-columns: minmax(0, 1fr); }
    .mark { width: 92px; }
  }
</style>
