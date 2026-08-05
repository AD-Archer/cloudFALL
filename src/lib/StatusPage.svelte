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

<main class="shell wrap">
  <section class="cloud panel" aria-labelledby="status-title" data-analytics-section="status">
    <div class="figure" aria-hidden="true">
      <img class="mark" src="/logo.png" alt="" width="150" height="130" />
      <span class="code">{code}</span>
    </div>

    <div class="copy">
      <p class="pill pill-ember">{eyebrow}</p>
      <h1 id="status-title">{title}</h1>
      <p class="lede">{body}</p>
      {#if detail}<p class="detail mono">{detail}</p>{/if}
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
  .shell {
    min-height: 100svh;
    display: grid;
    align-items: center;
    padding-block: clamp(60px, 12vw, 120px);
  }

  .panel {
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr);
    align-items: center;
    gap: clamp(20px, 4vw, 46px);
    padding: clamp(26px, 4vw, 50px) clamp(22px, 3vw, 40px);
  }

  .figure { position: relative; justify-self: center; }
  .mark { width: 170px; height: auto; animation: bob 5s ease-in-out infinite alternate; }
  .code {
    position: absolute;
    right: -6px;
    bottom: -10px;
    padding: 5px 14px 6px;
    border-radius: var(--r-pill);
    font-family: var(--mono);
    font-size: 0.86rem;
    color: #fff;
    background: linear-gradient(180deg, #8375ff, var(--violet));
    box-shadow: var(--lift-sm);
  }

  h1 { margin-top: 14px; font-size: clamp(2rem, 4.4vw, 3.1rem); font-weight: 700; max-width: 16ch; }
  .lede { margin-top: 14px; font-size: 1.06rem; color: var(--ink-2); max-width: 48ch; }

  .detail {
    margin-top: 16px;
    padding: 12px 16px;
    border-radius: var(--r-sm);
    background: var(--cloud-2);
    color: var(--ink-2);
    font-size: 0.7rem;
    text-transform: none;
    letter-spacing: 0.02em;
    overflow-wrap: anywhere;
    max-width: 60ch;
  }

  .actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 26px; }

  @keyframes bob {
    from { transform: translateY(-7px); }
    to { transform: translateY(9px); }
  }

  @media (max-width: 720px) {
    .panel { grid-template-columns: minmax(0, 1fr); }
    .mark { width: 118px; }
  }
</style>
