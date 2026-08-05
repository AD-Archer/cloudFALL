<script>
  import Sky from './lib/Sky.svelte'
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
  import { CONFIG, RENTALS, MOVES, FINE_PRINT, RULES, HELP, HACK_CLUB } from './lib/data.js'

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
  // CloudFALL has no fixed dates yet; when Stern sets them this fills in on
  // its own rather than needing a deploy.
  const DAY = 86400000
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  // Read in UTC: the schedule lands on midnight UTC, so formatting it locally
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

  // What the whole ledger costs in a year, whether or not anyone has touched
  // the rows yet. The marquee is the argument in one line.
  const rentedPerYear = RENTALS.reduce((sum, r) => sum + r.usd, 0) * 12
  const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`

  // The strip across the top is a price list: what the world charges monthly,
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

  // The line under the hero buttons: live where it can be, honest where it
  // cannot.
  let readout = $derived.by(() => {
    const bits = []
    if (run?.ended) bits.push('closed')
    else if (run && !run.started) bits.push(`opens ${fmtDate(run.start)}`)
    else bits.push('open now')
    bits.push('ages 13 to 18, anywhere')
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

<Sky />

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
    <section class="hero cloud" id="top">
      <header class="band">
        <img class="logo" src="/logo.png" alt="" width="42" height="36" />
        <span class="wordmark">CloudFALL</span>
        <span class="pill kicker">hack club · you ship, we ship</span>
        <a
          class="btn-text slack"
          href={CONFIG.slackUrl}
          data-analytics="CTA: Click"
          data-analytics-placement="hero-slack"
        >
          #ysws-cloudfall
        </a>
      </header>

      <div class="hero-body">
        <div class="figure"><Fall height={410} /></div>

        <div class="hero-copy">
          <p class="pill pill-ember tagline">{CONFIG.tagline}</p>
          <h1>Stop renting<br />Own your stuff.</h1>
          <p class="lede">
            Your films, your music, your photos, your files. You pay every month for a copy
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
              add up what you pay
            </a>
          </div>
        </div>
      </div>

      <!-- the hero's own footer: what a status page would print about this
           program, across the full width rather than tucked under the copy -->
      <p class="readout">
        {#each readout as bit}<span class="bit">{bit}</span>{/each}
      </p>
    </section>

    <!-- ───────────────────────── LEDGER ───────────────────────── -->
    <Reveal>
      <Unit
        id="ledger"
        title="The cloud you rent"
        port="8096"
        sub="Every subscription in your house, floating overhead, sized by what it costs. Pop one and it falls, and what lands is the thing you could run yourself instead. That is the project."
      >
        <Ledger welcomeUrl={CONFIG.welcomeUrl} />
      </Unit>
    </Reveal>

    <!-- ───────────────────────── THE BUILD ─────────────────────────
         Three moves, not five steps. The account and the time tracking are
         real, but they are paperwork: they sit in one line underneath rather
         than taking two of the five slots people actually read. -->
    <Reveal>
      <Unit
        id="build"
        title="How it works"
        port="22"
        sub="Rebuild one thing you pay for every month so that you own it. Ship it open-source and the hardware to keep it running is on us."
      >
        <ol class="moves">
          {#each MOVES as m}
            <li class="move">
              <span class="art" aria-hidden="true">
                <svg viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="28" class="badge" />
                  {#if m.art === 'bubble'}
                    <!-- a bill: the thing arriving every month -->
                    <path
                      d="M18 14h20v26l-4-3-3.5 3-3.5-3-3.5 3-3.5-3-2 1.5V14Z"
                      class="stroke"
                    />
                    <path d="M23 22h10M23 28h10" class="stroke" />
                    <path d="M23 34h6" class="accent" />
                  {:else if m.art === 'box'}
                    <!-- a machine of your own, with its power light on -->
                    <rect x="14" y="16" width="28" height="10" rx="3" class="stroke" />
                    <rect x="14" y="30" width="28" height="10" rx="3" class="stroke" />
                    <path d="M32 21h5M32 35h5" class="stroke" />
                    <circle cx="21" cy="21" r="2" class="accent-fill" />
                    <circle cx="21" cy="35" r="2" class="accent-fill" />
                  {:else}
                    <!-- a disc, which is what turns up in the post -->
                    <circle cx="28" cy="28" r="13" class="stroke" />
                    <circle cx="28" cy="28" r="3.6" class="stroke" />
                    <path d="M28 15a13 13 0 0 1 11.3 6.5" class="accent" />
                  {/if}
                </svg>
              </span>
              <h3><span class="move-n">{m.n}</span>{m.title}</h3>
              <p>{m.body}</p>
            </li>
          {/each}
        </ol>

        <a
          class="btn moves-cta"
          href={CONFIG.welcomeUrl}
          data-analytics="CTA: Click"
          data-analytics-placement="build-onboarding"
        >
          Sign up free
        </a>

        <!-- the same footer treatment the hero uses: the mechanics, stated
             once, across the bottom edge of the panel -->
        <p class="fine">
          {#each FINE_PRINT as f}<span class="fine-bit">{f}</span>{/each}
        </p>
      </Unit>
    </Reveal>

    <!-- ───────────────── NEVER SELF-HOSTED ANYTHING ───────────────── -->
    <Reveal>
      <Unit
        id="help"
        title="Never hosted anything?"
        port="41641"
        sub="Then this program is aimed squarely at you. Nobody is expected to arrive knowing this, and there are people in the Slack who will get your first one running with you."
      >
        <ul class="helps">
          {#each HELP as h}
            <li class="help">
              <span class="pill pill-blush">{h.tag}</span>
              <h3>{h.title}</h3>
              <p>{h.body}</p>
            </li>
          {/each}
        </ul>
        <p class="help-tail">
          Stuck at any point, from picking a service to opening a terminal, ask in
          <a
            href={CONFIG.slackUrl}
            data-analytics="CTA: Click"
            data-analytics-placement="help-slack">#ysws-cloudfall</a
          >. Bring the error message, however small it looks.
        </p>
      </Unit>
    </Reveal>

    <!-- ──────────── THINGS TO BUILD (live, hidden when empty) ──────────── -->
    {#if api.examples.length}
      <Reveal>
        <Unit
          id="ideas"
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
      <Unit id="checks" title={RULES.title} port="9090" sub={RULES.intro}>
        <Rules
          items={RULES.items}
          requirements={api.rules?.requirements}
          aiPercent={api.rules?.ai?.maxPercent}
        />
      </Unit>
    </Reveal>

    <!-- ───────────────────────── HACK CLUB ─────────────────────────
         Most people arriving from a link have never heard of Hack Club, and
         the age rule is the one bit of eligibility that stops somebody
         halfway through. Both belong on the page, not in the FAQ. -->
    <Reveal>
      <section class="hc cloud" id="hackclub" data-analytics-section="hackclub">
        <div class="hc-art">
          <img src="/branding/flag-standalone.svg" alt="Hack Club" width="260" height="150" />
        </div>

        <div class="hc-copy">
          <h2>{HACK_CLUB.headline}</h2>
          <p class="hc-body">{HACK_CLUB.body}</p>
          <p class="hc-elig">{HACK_CLUB.eligibility}</p>

          <ul class="hc-facts">
            {#each HACK_CLUB.facts as f}
              <li>{f}</li>
            {/each}
          </ul>

          <div class="cta-row">
            <a
              class="btn btn-soft btn-sm"
              href={CONFIG.flagUrl}
              target="_blank"
              rel="noopener"
              data-analytics="CTA: Click"
              data-analytics-placement="hackclub-site"
            >
              What is Hack Club?
            </a>
            <a
              class="btn-text"
              href="https://stern.hackclub.com/rudder/"
              data-analytics="CTA: Click"
              data-analytics-placement="hackclub-ysws"
            >
              Other YSWS
            </a>
          </div>
        </div>
      </section>
    </Reveal>

    <!-- ─────────────── NEWS / EVENTS (live, hidden when empty) ─────────────── -->
    {#if api.news.length}
      <Reveal>
        <Unit id="news" title="Latest news" port="119" sub="Announcements from the people running the program.">
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
        <Unit id="events" title="What's coming up" port="5232" sub="Still to come on the schedule.">
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
        title="Questions"
        port="3000"
        sub="Straight from the program. Anything missing, ask in the Slack."
      >
        {#if api.loading}
          <p class="msg mono">reading the faq</p>
        {:else if api.faq.length}
          <div class="faq">
            {#each api.faq as item, i}
              <div class="qa" class:open={openFaq === i}>
                <button class="qa-q" onclick={() => toggleFaq(i)} aria-expanded={openFaq === i}>
                  <span class="qa-text">{item.question}</span>
                  <span class="qa-sign" aria-hidden="true"></span>
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

    <!-- ───────────────────────── CLOSER ─────────────────────────
         The end of the page is the logo and the line it came with, next to
         the ask. Nothing else. -->
    <Reveal>
      <section class="closer" id="signup">
        <div class="closer-mark" aria-hidden="true">
          <img src="/logo.png" alt="" width="240" height="207" />
          <span class="scrawl">destroy the cloud<br />by making it free</span>
        </div>

        <div class="closer-copy">
          <h2>Then it is just a thing you own.</h2>
          <p class="closer-sub">
            No essay, no interview, no fee, and no monthly anything. Pick the
            subscription you would miss least, build the replacement, log the hours,
            and the discs to keep the library on come from us.
          </p>
          <div class="cta-row">
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
              class="btn-text"
              data-analytics="CTA: Click"
              data-analytics-placement="footer-slack"
            >
              or say hello in #ysws-cloudfall
            </a>
          </div>
        </div>
      </section>
    </Reveal>

    <footer class="footer cloud">
      <div class="footer-top">
        <div class="footer-brand">
          <img class="logo small" src="/logo.png" alt="" width="34" height="29" />
          <span class="wordmark">CloudFALL</span>
        </div>
        <nav class="footer-links">
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
    top: 36px;
    left: 20px;
    z-index: 150;
    line-height: 0;
    transition: transform 0.4s var(--ease);
  }
  .flag img { width: 168px; height: auto; filter: drop-shadow(0 8px 14px rgba(38, 22, 110, 0.28)); }
  .flag:hover { transform: translateY(4px) rotate(2deg); }

  /* ── PAGE STACK ── */
  .stack {
    display: grid;
    /* minmax(0,1fr), not the implicit auto column, or the widest child sizes
       the whole stack and overflows small screens */
    grid-template-columns: minmax(0, 1fr);
    gap: clamp(16px, 2.2vw, 26px);
    padding-top: clamp(100px, 11vw, 138px);
    padding-bottom: clamp(30px, 5vw, 54px);
  }

  /* ── HERO ── */
  .hero { overflow: hidden; }

  .band {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    padding: 16px 24px 12px;
  }
  .logo { width: 42px; height: auto; }
  .logo.small { width: 34px; }
  .wordmark {
    font-family: var(--display);
    font-weight: 700;
    font-size: 1.24rem;
    letter-spacing: -0.02em;
  }
  .kicker { flex: 0 0 auto; }
  .slack { margin-left: auto; }

  .hero-body {
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    align-items: center;
    gap: clamp(18px, 3vw, 38px);
    padding: 6px clamp(18px, 2.6vw, 26px) clamp(22px, 3vw, 30px);
  }
  .figure { min-width: 0; }

  h1 {
    font-size: clamp(2.6rem, 5.6vw, 4.3rem);
    font-weight: 700;
    letter-spacing: -0.035em;
    animation: rise 0.8s var(--ease-out) both;
  }

  .lede {
    max-width: 52ch;
    margin-top: 18px;
    font-size: clamp(1rem, 1.2vw, 1.1rem);
    color: var(--ink-2);
    animation: rise 0.8s 0.08s var(--ease-out) both;
  }

  .cta-row {
    display: flex;
    align-items: center;
    gap: 22px;
    margin-top: 26px;
    flex-wrap: wrap;
    animation: rise 0.8s 0.16s var(--ease-out) both;
  }
  .cta-row.center { justify-content: center; }

  /* the live line: what a status readout would print if this program were a
     service, which is the joke the whole page runs on */
  .readout {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 26px;
    padding: 15px 24px 17px;
    border-top: 1px solid var(--cloud-3);
    background: rgba(244, 247, 255, 0.7);
    font-family: var(--mono);
    font-size: 0.76rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-2);
  }
  .bit { display: flex; align-items: center; gap: 10px; }
  .bit::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--blush);
  }

  /* ── MOVES ──
     Three cards, read left to right, with a chevron between them so the row
     reads as a sequence rather than three unrelated features. */
  .moves {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .move {
    position: relative;
    padding: 22px 22px 24px;
    border-radius: var(--r);
    background: var(--cloud-2);
  }
  .move + .move::before {
    content: '';
    position: absolute;
    left: -11px;
    top: 58px;
    width: 12px;
    height: 12px;
    border-right: 2.5px solid var(--ink-3);
    border-top: 2.5px solid var(--ink-3);
    border-radius: 2px;
    transform: rotate(45deg);
    opacity: 0.55;
  }

  .art { display: block; width: 64px; height: 64px; margin-bottom: 4px; }
  .art svg { width: 100%; height: 100%; }
  /* one badge, one stroke weight, one warm accent per mark, so the three read
     as a set rather than three clip-art choices */
  .art :global(.badge) { fill: #eceaff; }
  .art :global(.stroke) {
    fill: none;
    stroke: var(--violet);
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .art :global(.accent) {
    fill: none;
    stroke: var(--ember);
    stroke-width: 2.6;
    stroke-linecap: round;
  }
  .art :global(.accent-fill) { fill: var(--ember); }

  .move h3 {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-top: 12px;
    font-size: 1.5rem;
  }
  .move-n {
    font-family: var(--mono);
    font-size: 0.72rem;
    color: var(--ember-lo);
  }
  .move p {
    margin-top: 6px;
    font-size: 0.98rem;
    line-height: 1.5;
    color: var(--ink-2);
    max-width: 30ch;
  }

  /* the mechanics, as the panel's own footer: same band the hero closes with */
  .fine {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 26px;
    margin: 24px -24px -26px;
    padding: 15px 24px 17px;
    border-top: 1px solid var(--cloud-3);
    background: rgba(244, 247, 255, 0.7);
    font-family: var(--mono);
    font-size: 0.76rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-2);
  }
  .fine-bit { display: flex; align-items: center; gap: 10px; }
  .fine-bit::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--blush);
  }

  .moves-cta { margin-top: 20px; }

  /* ── HACK CLUB ── */
  .hc {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    align-items: center;
    gap: clamp(20px, 4vw, 46px);
    padding: clamp(26px, 3.6vw, 40px) clamp(24px, 3vw, 40px);
  }
  .hc-art { display: grid; place-items: center; }
  .hc-art img {
    width: 100%;
    max-width: 240px;
    filter: drop-shadow(0 10px 20px rgba(38, 22, 110, 0.22));
    transform: rotate(-3deg);
  }
  .hc h2 { font-size: clamp(1.7rem, 3.4vw, 2.5rem); font-weight: 700; letter-spacing: -0.03em; }
  .hc-body { margin-top: 12px; color: var(--ink-2); max-width: 62ch; }
  .hc-elig {
    margin-top: 12px;
    padding-left: 14px;
    border-left: 3px solid #ec3750;
    color: var(--ink);
    font-weight: 600;
    max-width: 62ch;
  }
  .hc-facts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0 0;
    padding: 0;
    list-style: none;
  }
  .hc-facts li {
    padding: 5px 12px 6px;
    border-radius: 8px;
    background: #ffe9ec;
    color: #c22240;
    font-family: var(--mono);
    font-size: 0.66rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
  .hc .cta-row { margin-top: 20px; gap: 18px; }

  /* ── HELP ── */
  .helps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .help {
    padding: 18px 20px 20px;
    border-radius: var(--r);
    background: linear-gradient(180deg, #fff 0%, var(--cloud-2) 100%);
    box-shadow: var(--lift-sm);
  }
  .help h3 { margin-top: 10px; font-size: 1.1rem; }
  .help p { margin-top: 7px; color: var(--ink-2); font-size: 0.95rem; }
  .help-tail {
    margin-top: 16px;
    padding: 0 4px;
    font-size: 0.94rem;
    color: var(--ink-3);
  }
  .help-tail a { color: var(--violet); font-weight: 700; }

  /* ── NEWS / EVENTS ── */
  .feed { display: grid; gap: 8px; }
  .entry { padding: 15px 18px 16px; border-radius: var(--r); background: var(--cloud-2); }
  .entry h3 { font-size: 1.1rem; }
  .entry .mono { margin-top: 4px; font-size: 0.62rem; }
  .entry-body { margin-top: 8px; color: var(--ink-2); max-width: 72ch; }

  /* ── FAQ ── */
  .faq { display: grid; gap: 6px; }
  .qa {
    border-radius: var(--r);
    transition: background 0.2s, box-shadow 0.24s var(--ease-out);
  }
  .qa:hover { background: var(--cloud-2); }
  .qa.open { background: var(--cloud-2); box-shadow: var(--lift-sm); }
  .qa-q {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 30px;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 15px 18px;
    border: none;
    background: none;
    text-align: left;
    color: var(--ink);
  }
  .qa-text { font-family: var(--display); font-weight: 500; font-size: 1.06rem; }

  /* a plus that turns into a minus, drawn rather than typed so it sits still
     on every font stack */
  .qa-sign {
    position: relative;
    justify-self: end;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--violet-lo);
    transition: background 0.24s, transform 0.34s var(--ease);
  }
  .qa-sign::before,
  .qa-sign::after {
    content: '';
    position: absolute;
    inset: 50% 7px;
    height: 2px;
    margin-top: -1px;
    border-radius: 2px;
    background: var(--violet);
  }
  .qa-sign::after { transform: rotate(90deg); transition: opacity 0.24s; }
  .qa.open .qa-sign { transform: rotate(180deg); background: var(--ember); }
  .qa.open .qa-sign::before,
  .qa.open .qa-sign::after { background: #fff; }
  .qa.open .qa-sign::after { opacity: 0; }

  .qa-a {
    padding: 0 56px 18px 18px;
    color: var(--ink-2);
    max-width: 84ch;
    animation: fade 0.32s var(--ease-out) both;
  }

  .msg { color: var(--ink-2); }
  .msg a { color: var(--violet); text-decoration: underline; }

  /* ── CLOSER ── */
  .closer {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    align-items: center;
    gap: clamp(24px, 5vw, 60px);
    padding: clamp(34px, 5vw, 58px) clamp(26px, 4vw, 52px);
    border-radius: var(--r-xl);
    background:
      radial-gradient(60% 90% at 18% 10%, rgba(255, 213, 168, 0.6) 0%, transparent 62%),
      linear-gradient(180deg, #ffffff 0%, #f0efff 100%);
    box-shadow: var(--lift), var(--rim);
  }

  .closer-mark { display: grid; justify-items: center; gap: 16px; }
  .closer-mark img {
    width: min(100%, 250px);
    height: auto;
    filter: drop-shadow(0 16px 26px rgba(38, 22, 110, 0.24));
    animation: bob 6s ease-in-out infinite alternate;
  }
  .scrawl {
    font-family: var(--marker);
    font-weight: 700;
    font-size: clamp(1.2rem, 2.4vw, 1.6rem);
    line-height: 1.05;
    text-align: center;
    color: #2c1c63;
    transform: rotate(-3deg);
  }

  .closer h2 {
    font-size: clamp(2rem, 4.6vw, 3.2rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    max-width: 15ch;
  }
  .closer-sub {
    max-width: 54ch;
    margin-top: 16px;
    font-size: 1.04rem;
    color: var(--ink-2);
  }
  .closer .cta-row { margin-top: 24px; }

  /* ── FOOTER ── */
  .footer { padding: 20px 24px 18px; }
  .footer-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .footer-brand { display: flex; align-items: center; gap: 11px; }
  .footer-links {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    font-family: var(--display);
    font-size: 0.92rem;
  }
  .footer-links a { color: var(--ink-3); transition: color 0.16s; }
  .footer-links a:hover { color: var(--violet); }
  .disclaimer {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--cloud-3);
    font-size: 0.58rem;
    line-height: 1.8;
  }
  .disclaimer a { color: var(--ink-2); }
  .disclaimer a:hover { color: var(--violet); }

  /* ── MOTION ── */
  @keyframes rise {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes fade {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes bob {
    from { transform: translateY(-8px) rotate(-2deg); }
    to { transform: translateY(8px) rotate(2deg); }
  }


  /* ── RESPONSIVE ── */
  @media (max-width: 960px) {
    .hero-body { grid-template-columns: minmax(0, 1fr); }
    /* the cloud leads on narrow screens: it explains the name before a word
       has been read */
    .figure { grid-row: 1; }
    .helps { grid-template-columns: minmax(0, 1fr); }
    /* the chevrons only make sense across a row, so the stacked version
       drops them rather than pointing them at nothing */
    .moves { grid-template-columns: minmax(0, 1fr); }
    .hc { grid-template-columns: minmax(0, 1fr); }
    .hc-art img { max-width: 190px; }
    .move + .move::before { display: none; }
    .move { padding: 18px 18px 20px; }
    .move p { max-width: none; }
    .closer { grid-template-columns: minmax(0, 1fr); text-align: center; }
    .closer h2 { max-width: none; }
    .closer-sub { margin-inline: auto; }
    .closer .cta-row { justify-content: center; }
    .closer-mark img { width: min(100%, 170px); }
  }
  @media (max-width: 640px) {
    .flag { left: 10px; }
    .flag img { width: 126px; }
    .stack { padding-top: 94px; }
    .band { padding: 14px 17px 10px; gap: 10px; }
    /* on a phone the band has room for the name and one link, and that is it */
    .kicker { display: none; }
    .qa-a { padding: 0 18px 16px; }
    /* Unit drops to 17px of padding on a phone, so the footer band has to
       reach further out to stay flush with the panel edge */
    .fine { margin: 20px -17px -20px; padding: 13px 17px 15px; font-size: 0.7rem; gap: 6px 18px; }
  }
</style>
