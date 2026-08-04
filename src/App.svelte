<script>
  import Fall from './lib/Fall.svelte'
  import Ticker from './lib/Ticker.svelte'
  import Unit from './lib/Unit.svelte'
  import Ledger from './lib/Ledger.svelte'
  import Terms from './lib/Terms.svelte'
  import Shop from './lib/Shop.svelte'
  import Rules from './lib/Rules.svelte'
  import Examples from './lib/Examples.svelte'
  import Reveal from './lib/Reveal.svelte'
  import StatusPage from './lib/StatusPage.svelte'
  import { loadContent } from './lib/api/stern.js'
  import { initAnalytics, refreshAnalyticsSections, trackEvent } from './lib/insight.js'
  import { CONFIG, RENTALS, STEPS, RULES } from './lib/data.js'

  let openFaq = $state(0)
  let locationState = $state(readLocation())
  let runtimeError = $state('')

  // everything that changes often lives in Stern, not in this repo
  let api = $state({
    loading: true,
    failures: [],
    program: null,
    currency: null,
    prizes: [],
    rules: null,
    faq: [],
    news: [],
    events: [],
    examples: []
  })

  // ── THE RUN ──
  // CloudFALL has no fixed dates yet; when Stern sets them this fills in on its
  // own rather than needing a deploy.
  const DAY = 86400000
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  // Read in UTC: the schedule lands on midnight UTC, so formatting locally
  // would shift the date back a day for anyone west of Greenwich.
  const fmtDate = (d) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`

  let run = $derived.by(() => {
    const sch = api.program?.schedule
    if (!sch?.startsAt || !sch?.endsAt) return null

    const start = new Date(sch.startsAt)
    const end = new Date(sch.endsAt)
    const now = new Date()
    const total = Math.max(1, Math.round((end - start) / DAY))

    return {
      start,
      end,
      total,
      day: Math.min(total, Math.max(1, Math.floor((now - start) / DAY) + 1)),
      left: Math.max(0, Math.ceil((end - now) / DAY)),
      until: Math.max(0, Math.ceil((start - now) / DAY)),
      started: sch.hasStarted,
      ended: sch.hasEnded
    }
  })

  // What the whole ledger costs a year, whether or not anyone has touched the
  // checkboxes yet the marquee is the argument in one line.
  const rentedPerYear = RENTALS.reduce((sum, r) => sum + r.usd, 0) * 12
  const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`

  // The strip across the top is a price list: what the world charges, monthly,
  // followed by whatever the program is currently reporting.
  let ticker = $derived.by(() => {
    const out = RENTALS.map((r) => `${r.service} $${r.usd.toFixed(2)}/mo`)
    out.push(`${money(rentedPerYear)} a year, rented`)

    if (run) {
      if (run.ended) out.push('this run has ended')
      else if (run.started)
        out.push(run.left === 0 ? 'closes today' : `${run.left} days left`, `runs to ${fmtDate(run.end)}`)
      else out.push(run.until === 0 ? 'opens today' : `opens in ${run.until} days`)
    }
    if (typeof api.program?.hoursShipped === 'number') {
      out.push(`${api.program.hoursShipped} hours shipped`)
    }
    return out
  })

  // The one-line readout under the hero buttons: live where it can be, honest
  // where it cannot.
  let readout = $derived.by(() => {
    const bits = []
    if (run?.ended) bits.push('closed')
    else if (run && !run.started) bits.push(`opens ${fmtDate(run.start)}`)
    else bits.push('open now')
    bits.push('13–18, anywhere')
    if (typeof api.program?.hoursShipped === 'number') {
      bits.push(`${api.program.hoursShipped} hrs shipped`)
    }
    if (api.prizes.length) bits.push(`${api.prizes.length} things in the shop`)
    return bits
  })

  const toggleFaq = (i) => {
    const next = openFaq === i ? -1 : i
    openFaq = next
    trackEvent('FAQ: Toggle', {
      index: i,
      state: next === i ? 'open' : 'close',
      question: api.faq[i]?.question
    })
  }

  // ── ROUTING / ERRORS ──
  const validPaths = new Set(['/', '/index.html', '/404', '/error'])

  function readLocation() {
    return { pathname: window.location.pathname }
  }

  function normalizePath(pathname) {
    return pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname
  }

  let status = $derived.by(() => {
    const pathname = normalizePath(locationState.pathname)

    if (runtimeError || pathname === '/error') {
      return {
        code: '500',
        eyebrow: 'the daemon died',
        title: 'This page stopped serving.',
        body: 'Something failed mid-render. Reload, or head back to the front page while we restart it.',
        detail: runtimeError
      }
    }

    if (pathname === '/404' || !validPaths.has(pathname)) {
      return {
        code: '404',
        eyebrow: 'no route to host',
        title: 'Nothing is hosted here.',
        body: 'That path is not on this box. Everything CloudFALL serves lives on the front page.'
      }
    }

    return null
  })

  $effect(() => {
    initAnalytics()
  })

  $effect(() => {
    if (!api.loading) refreshAnalyticsSections()
  })

  $effect(() => {
    loadContent()
      .then((c) => {
        api = { ...c, loading: false }
        trackEvent(
          'Content: Loaded',
          { status: c.failures.length ? 'partial' : 'complete', failed: c.failures.join(',') },
          { interactive: false }
        )
      })
      .catch((err) => {
        api = { ...api, loading: false, failures: [err.message] }
        trackEvent('Content: Loaded', { status: 'failed', failed: 'all' }, { interactive: false })
      })
  })

  $effect(() => {
    const syncLocation = () => (locationState = readLocation())
    const captureError = (event) => {
      runtimeError = event.error?.message || event.message || 'Unknown runtime error'
    }
    const captureRejection = (event) => {
      runtimeError = event.reason?.message || String(event.reason || 'Unhandled promise rejection')
    }

    window.addEventListener('popstate', syncLocation)
    window.addEventListener('hashchange', syncLocation)
    window.addEventListener('error', captureError)
    window.addEventListener('unhandledrejection', captureRejection)

    return () => {
      window.removeEventListener('popstate', syncLocation)
      window.removeEventListener('hashchange', syncLocation)
      window.removeEventListener('error', captureError)
      window.removeEventListener('unhandledrejection', captureRejection)
    }
  })
</script>

{#if status}
  <StatusPage {...status} />
{:else}
  <Ticker items={ticker} />

  <a
    class="flag"
    href={CONFIG.flagUrl}
    target="_blank"
    rel="noopener"
    aria-label="Hack Club"
    data-analytics="CTA: Click"
    data-analytics-placement="hack-club-flag"
  >
    <img src="/branding/flag-orpheus-top.svg" alt="Hack Club" width="150" height="85" />
  </a>

  <main class="wrap stack">
    <!-- ───────────────────────── HERO ───────────────────────── -->
    <section class="hero" id="top">
      <header class="rail">
        <img class="logo" src="/logo.png" alt="" width="34" height="30" />
        <span class="wordmark">CloudFALL</span>
        <span class="mono kicker">hack club · you ship, we ship · archer</span>
        <span class="right">
          <span class="mono port">:443</span>
          <a
            class="btn-text"
            href={CONFIG.slackUrl}
            data-analytics="CTA: Click"
            data-analytics-placement="hero-slack"
          >
            #ysws-cloudfall →
          </a>
        </span>
      </header>

      <div class="hero-body">
        <div class="figure"><Fall height={400} /></div>

        <div class="hero-copy">
          <p class="mono ember">{CONFIG.tagline}</p>
          <h1>Stop renting<br />your own stuff.</h1>
          <p class="lede">
            Your films, your music, your photos, your files: you pay every month for a copy
            you do not own, on a computer you cannot touch. Build the thing that replaces
            one of them, run it on hardware in your own room, and ship it open-source so
            everybody else can too.
          </p>

          <div class="cta-row">
            <a
              href={CONFIG.welcomeUrl}
              class="btn"
              data-analytics="CTA: Click"
              data-analytics-placement="hero-onboarding"
            >
              Sign up free
            </a>
            <a
              href="#ledger"
              class="btn-text"
              data-analytics="CTA: Click"
              data-analytics-placement="hero-ledger"
            >
              add up what you pay →
            </a>
          </div>

          <p class="readout mono">
            {#each readout as bit, i}<span class="bit" class:first={i === 0}>{bit}</span>{/each}
          </p>
        </div>
      </div>
    </section>

    <!-- ───────────────────────── LEDGER ───────────────────────── -->
    <Reveal>
      <Unit
        id="ledger"
        n="01"
        title="The ledger"
        port="8096"
        sub="Tick what your household actually pays for. Every line names an open-source thing that does the same job on a machine you own. That is the project."
      >
        <Ledger />
      </Unit>
    </Reveal>

    <!-- ───────────────────────── THE BUILD ───────────────────────── -->
    <Reveal>
      <Unit
        id="build"
        n="02"
        title="The build"
        port="22"
        sub="Five steps, in order. No application, no interview, no fee."
      >
        <ol class="steps">
          {#each STEPS as s}
            <li class="step">
              <span class="step-n mono">{s.n}</span>
              <div class="step-copy">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          {/each}
        </ol>
        <a
          class="btn steps-cta"
          href={CONFIG.welcomeUrl}
          data-analytics="CTA: Click"
          data-analytics-placement="build-onboarding"
        >
          Start at step one
        </a>
      </Unit>
    </Reveal>

    <!-- ──────────── THINGS TO BUILD (live, hidden when empty) ──────────── -->
    {#if api.examples.length}
      <Reveal>
        <Unit
          id="ideas"
          n="03"
          title="Things to build"
          port="8000"
          sub="Starting points, not a menu. Take one and twist it into the stack you actually want."
        >
          <Examples items={api.examples} />
        </Unit>
      </Reveal>
    {/if}

    <!-- ───────────────────────── TERMS ───────────────────────── -->
    <Reveal>
      <Unit
        id="terms"
        n={api.examples.length ? '04' : '03'}
        title="New here?"
        port="53"
        sub="The whole deal in four lines. Read it before the shop."
      >
        <Terms
          slackUrl={CONFIG.slackUrl}
          hackatimeUrl={CONFIG.hackatimeUrl}
          welcomeUrl={CONFIG.welcomeUrl}
        />
      </Unit>
    </Reveal>

    <!-- ───────────────────────── SHOP (live) ───────────────────────── -->
    <Reveal>
      <Unit
        id="shop"
        n={api.examples.length ? '05' : '04'}
        title="The shop"
        port="32400"
        sub="Priced in tracked hours, cheapest first. Somewhere to put the library once it is yours."
        cta="Full shop"
        href={CONFIG.programUrl}
      >
        <Shop
          prizes={api.prizes}
          loading={api.loading}
          shopUrl={CONFIG.shopUrl}
          programUrl={CONFIG.programUrl}
        />
      </Unit>
    </Reveal>

    <!-- ───────────────────────── CHECKS ───────────────────────── -->
    <Reveal>
      <Unit
        id="checks"
        n={api.examples.length ? '06' : '05'}
        title={RULES.title}
        port="9090"
        sub={RULES.intro}
      >
        <Rules
          items={RULES.items}
          requirements={api.rules?.requirements}
          aiPercent={api.rules?.ai?.maxPercent}
        />
      </Unit>
    </Reveal>

    <!-- ─────────────── NEWS / EVENTS (live, hidden when empty) ─────────────── -->
    {#if api.news.length}
      <Reveal>
        <Unit id="news" n="—" title="Latest news" port="119" sub="Announcements from the people running the program.">
          <div class="feed">
            {#each api.news as item}
              <article class="entry">
                {#if item.title}<h3>{item.title}</h3>{/if}
                {#if item.publishedAt}
                  <p class="mono">{new Date(item.publishedAt).toLocaleDateString()}</p>
                {/if}
                {#if item.body}<p class="entry-body">{item.body}</p>{/if}
              </article>
            {/each}
          </div>
        </Unit>
      </Reveal>
    {/if}

    {#if api.events.length}
      <Reveal>
        <Unit id="events" n="—" title="What's coming up" port="5232" sub="Still to come on the schedule.">
          <div class="feed">
            {#each api.events as ev}
              <article class="entry">
                {#if ev.title}<h3>{ev.title}</h3>{/if}
                {#if ev.startsAt}<p class="mono">{new Date(ev.startsAt).toLocaleString()}</p>{/if}
                {#if ev.description}<p class="entry-body">{ev.description}</p>{/if}
              </article>
            {/each}
          </div>
        </Unit>
      </Reveal>
    {/if}

    <!-- ───────────────────────── FAQ (live) ───────────────────────── -->
    <Reveal>
      <Unit
        id="faq"
        n={api.examples.length ? '07' : '06'}
        title="Questions"
        port="3000"
        sub="Straight from the program. Anything missing, ask in the Slack."
      >
        {#if api.loading}
          <p class="msg mono">reading the faq…</p>
        {:else if api.faq.length}
          <div class="faq">
            {#each api.faq as item, i}
              <div class="qa" class:open={openFaq === i}>
                <button class="qa-q" onclick={() => toggleFaq(i)} aria-expanded={openFaq === i}>
                  <span class="qa-sign mono" aria-hidden="true">{openFaq === i ? '−' : '+'}</span>
                  <span class="qa-text">{item.question}</span>
                </button>
                {#if openFaq === i}
                  <p class="qa-a">{item.answer}</p>
                {/if}
              </div>
            {/each}
          </div>
        {:else}
          <p class="msg">
            Questions could not be loaded. Ask in <a href={CONFIG.slackUrl}>the Slack</a> and
            someone will answer.
          </p>
        {/if}
      </Unit>
    </Reveal>

    <!-- ───────────────────────── CTA ───────────────────────── -->
    <Reveal>
      <section class="closer" id="signup">
        <p class="mono ember">{CONFIG.tagline}</p>
        <h2>Take one thing back.</h2>
        <p class="closer-sub">
          Pick the subscription you would miss least, build the replacement, and host it
          yourself. Free, open to every teenager on earth, and the only requirement is that
          you finish.
        </p>
        <div class="cta-row center">
          <a
            href={CONFIG.welcomeUrl}
            class="btn"
            data-analytics="CTA: Click"
            data-analytics-placement="footer-onboarding"
          >
            Sign up free
          </a>
          <a
            href={CONFIG.slackUrl}
            class="btn btn-ghost"
            data-analytics="CTA: Click"
            data-analytics-placement="footer-slack"
          >
            Join the Slack
          </a>
        </div>
      </section>
    </Reveal>

    <footer class="footer">
      <div class="footer-top">
        <div class="footer-brand">
          <img class="logo" src="/logo.png" alt="" width="30" height="26" />
          <span class="wordmark">CloudFALL</span>
        </div>
        <nav class="footer-links mono">
          <a href={CONFIG.welcomeUrl} data-analytics="CTA: Click" data-analytics-placement="footer-onboarding">sign up</a>
          <a href={CONFIG.programUrl} data-analytics="CTA: Click" data-analytics-placement="footer-program">program</a>
          <a href={CONFIG.slackUrl} data-analytics="CTA: Click" data-analytics-placement="footer-slack">slack</a>
          <a href={CONFIG.hackatimeUrl} data-analytics="CTA: Click" data-analytics-placement="footer-hackatime">hackatime</a>
          <a href="https://ysws.hackclub.com/" data-analytics="CTA: Click" data-analytics-placement="footer-ysws">all ysws</a>
          <a href={CONFIG.flagUrl} data-analytics="CTA: Click" data-analytics-placement="footer-hack-club">hack club</a>
        </nav>
      </div>
      <p class="disclaimer mono">
        A Hack Club YSWS, part of the
        <a href={CONFIG.archer.url} target="_blank" rel="noopener">{CONFIG.archer.name}</a>
        program · made by teenagers, for teenagers · content served live from
        <a href={CONFIG.programUrl}>Stern</a>
      </p>
    </footer>
  </main>
{/if}

<style>
  /* ── FLAG ── */
  .flag {
    position: fixed;
    top: 34px;
    left: 20px;
    z-index: 150;
    line-height: 0;
    transition: transform 0.3s var(--ease);
  }
  .flag img { width: 168px; height: auto; filter: drop-shadow(4px 6px 0 rgba(4, 2, 16, 0.4)); }
  .flag:hover { transform: translateY(3px) rotate(2deg); }

  /* ── PAGE STACK ── */
  .stack {
    display: grid;
    /* minmax(0,1fr), not the implicit auto column, or the widest child sizes
       the whole stack and overflows small screens */
    grid-template-columns: minmax(0, 1fr);
    gap: clamp(14px, 2vw, 22px);
    padding-top: clamp(96px, 11vw, 132px);
    padding-bottom: clamp(28px, 5vw, 48px);
  }

  /* ── SHARED RAIL (hero only; Unit carries its own) ── */
  .hero {
    border: 1px solid var(--rule);
    border-radius: var(--r);
    background: var(--panel);
    box-shadow: var(--drop);
    overflow: hidden;
  }

  .rail {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 9px 18px;
    border-bottom: 1px solid var(--rule);
    background: var(--panel-2);
  }
  .logo { width: 34px; height: auto; }
  .wordmark {
    font-family: var(--display);
    font-weight: 800;
    font-size: 1.06rem;
    letter-spacing: -0.03em;
  }
  .kicker { font-size: 0.66rem; }
  .right { display: flex; align-items: center; gap: 16px; margin-left: auto; }
  .port { font-size: 0.7rem; }

  /* ── HERO ── */
  .hero-body {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: center;
    gap: clamp(18px, 3vw, 40px);
    padding: clamp(20px, 3vw, 34px);
  }
  .figure { min-width: 0; }

  .ember { color: var(--ember); }

  h1 {
    margin-top: 12px;
    font-size: clamp(2.5rem, 5.4vw, 4.2rem);
    letter-spacing: -0.045em;
    animation: rise 0.7s var(--ease) both;
  }

  .lede {
    max-width: 54ch;
    margin-top: 18px;
    font-size: clamp(1rem, 1.2vw, 1.1rem);
    color: var(--ink-2);
    animation: rise 0.7s 0.08s var(--ease) both;
  }

  .cta-row {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 26px;
    flex-wrap: wrap;
    animation: rise 0.7s 0.16s var(--ease) both;
  }
  .cta-row.center { justify-content: center; }

  /* the live line: what a status readout would print if this program were a
     service, which is the joke the whole page runs on */
  .readout {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    margin-top: 22px;
    padding-top: 16px;
    border-top: 1px solid var(--rule-2);
    font-size: 0.66rem;
  }
  .bit { display: flex; align-items: center; gap: 8px; }
  .bit::before {
    content: '';
    width: 4px;
    height: 4px;
    background: var(--rule);
  }
  .bit.first::before { background: var(--ember); }

  /* ── STEPS ── */
  .steps { list-style: none; margin: 0; padding: 0; }
  .step {
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr);
    gap: 18px;
    padding: 15px 2px;
    border-top: 1px solid var(--rule-2);
  }
  .step:first-child { border-top: none; }
  .step-n { font-size: 0.86rem; color: var(--ember); padding-top: 0.15em; }
  .step-copy h3 { font-size: 1.1rem; letter-spacing: -0.02em; }
  .step-copy p { margin-top: 6px; color: var(--ink-2); max-width: 68ch; }
  .steps-cta { margin-top: 20px; margin-left: 64px; }

  /* ── NEWS / EVENTS ── */
  .feed { display: grid; }
  .entry { padding: 14px 2px; border-top: 1px solid var(--rule-2); }
  .entry:first-child { border-top: none; }
  .entry h3 { font-size: 1.08rem; }
  .entry .mono { margin-top: 4px; font-size: 0.64rem; }
  .entry-body { margin-top: 8px; color: var(--ink-2); max-width: 72ch; }

  /* ── FAQ ── */
  .qa { border-top: 1px solid var(--rule-2); }
  .qa:first-child { border-top: none; }
  .qa-q {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
    align-items: baseline;
    gap: 14px;
    width: 100%;
    padding: 15px 2px;
    border: none;
    background: none;
    text-align: left;
    color: var(--ink);
  }
  .qa-sign { font-size: 0.9rem; color: var(--ember); }
  .qa-text {
    font-family: var(--display);
    font-weight: 600;
    font-size: 1.04rem;
    letter-spacing: -0.015em;
  }
  .qa.open .qa-text { color: var(--ember); }
  .qa-a {
    padding: 0 6px 18px 34px;
    color: var(--ink-2);
    max-width: 84ch;
    animation: fade 0.3s var(--ease) both;
  }

  .msg { color: var(--ink-2); }
  .msg a { color: var(--ember); text-decoration: underline; }

  /* ── CLOSER ── */
  .closer {
    padding: clamp(44px, 6vw, 76px) 24px;
    border: 1px solid var(--rule);
    border-radius: var(--r);
    background:
      radial-gradient(80% 120% at 50% -10%, rgba(84, 62, 250, 0.42), transparent 70%),
      var(--panel);
    box-shadow: var(--drop);
    text-align: center;
  }
  .closer h2 {
    margin-top: 10px;
    font-size: clamp(2.2rem, 6vw, 4rem);
    letter-spacing: -0.045em;
  }
  .closer-sub {
    max-width: 52ch;
    margin: 16px auto 0;
    font-size: 1.06rem;
    color: var(--ink-2);
  }

  /* ── FOOTER ── */
  .footer {
    padding: 18px 20px 16px;
    border: 1px solid var(--rule);
    border-radius: var(--r);
    background: var(--panel);
  }
  .footer-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .footer-brand { display: flex; align-items: center; gap: 11px; }
  .footer-links { display: flex; gap: 18px; flex-wrap: wrap; font-size: 0.66rem; }
  .footer-links a { color: var(--ink-3); transition: color 0.16s; }
  .footer-links a:hover { color: var(--ember); }
  .disclaimer {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--rule-2);
    font-size: 0.6rem;
    line-height: 1.7;
  }
  .disclaimer a { color: var(--ink-2); }
  .disclaimer a:hover { color: var(--ember); }

  /* ── MOTION ── */
  @keyframes rise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes fade {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: none; }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 960px) {
    .hero-body { grid-template-columns: minmax(0, 1fr); }
    /* the cloud leads on narrow screens: it is the one thing that explains the
       name before a word is read */
    .figure { grid-row: 1; }
    .rail { flex-wrap: wrap; gap: 8px 12px; }
    .kicker { flex-basis: 100%; order: 3; }
    .right { margin-left: auto; }
  }
  @media (max-width: 640px) {
    .flag { left: 10px; }
    .flag img { width: 128px; }
    .stack { padding-top: 92px; }
    /* on a phone the rail has room for the name and one link, and that is it */
    .kicker,
    .port { display: none; }
    .step { grid-template-columns: 34px minmax(0, 1fr); gap: 12px; }
    .steps-cta { margin-left: 0; }
    .qa-a { padding-left: 2px; }
  }
</style>
