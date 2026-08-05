<script>
  import Fall from './lib/Fall.svelte'
  import Drift from './lib/Drift.svelte'
  import Unit from './lib/Unit.svelte'
  import Ledger from './lib/Ledger.svelte'
  import Terms from './lib/Terms.svelte'
  import Shop from './lib/Shop.svelte'
  import Rules from './lib/Rules.svelte'
  import Examples from './lib/Examples.svelte'
  import StatusPage from './lib/StatusPage.svelte'
  import { loadContent } from './lib/api/stern.js'
  import { initAnalytics, refreshAnalyticsSections, trackEvent } from './lib/insight.js'
  import { CONFIG, WHO, MOVES, FINE_PRINT, RULES, HELP, HACK_CLUB } from './lib/data.js'

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

  // The line ruled off under the hero: what a status page would print about
  // this program. Live where it can be, honest where it cannot. This replaces
  // the marquee that used to run across the top saying much the same thing.
  let readout = $derived.by(() => {
    const bits = []
    if (run?.ended) bits.push('closed')
    else if (run && !run.started) bits.push(`opens ${fmtDate(run.start)}`)
    else bits.push('open now')
    if (run?.started && !run.ended) {
      bits.push(run.left === 0 ? 'closes today' : `${run.left} days left`)
    }
    bits.push('ages 13 to 18, anywhere')
    if (typeof api.program?.hoursShipped === 'number') {
      bits.push(`${api.program.hoursShipped} hours shipped`)
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
  <!-- ───────────────────────── THE SKY ─────────────────────────
       The top of the page is the sky, flat and full bleed. The cloud comes
       apart in it, and everything below the fold is ground you own. The page
       is the argument's own shape, which is why there is no wallpaper behind
       the rest of it any more. -->
  <div class="sky sky-top on-sky">
    <Drift />

    <!-- Orpheus's flag hangs off the true top-left corner of the page, which
         is where every Hack Club site puts it. The wordmark lockup that used
         to sit beside it is gone: two marks in one corner is one too many, and
         the program says its own name properly further down the page. -->
    <a
      class="flag"
      href={CONFIG.flagUrl}
      target="_blank"
      rel="noopener"
      aria-label="Hack Club"
      data-analytics="CTA: Click"
      data-analytics-placement="hack-club-flag"
    >
      <img src="/branding/flag-orpheus-top.png" alt="" width="560" height="315" />
    </a>

    <!-- The two rooms this program lives in: its own channel, and the umbrella
         it runs under. Archer belongs above the fold rather than only in the
         footer, because it is who is actually answering. -->
    <header class="wrap masthead">
      <a
        class="btn-text"
        href={CONFIG.slackUrl}
        data-analytics="CTA: Click"
        data-analytics-placement="hero-slack"
      >
        #ysws-cloudfall
      </a>
      <span class="dot" aria-hidden="true">·</span>
      <a
        class="btn-text"
        href={CONFIG.archer.url}
        target="_blank"
        rel="noopener"
        data-analytics="CTA: Click"
        data-analytics-placement="hero-archer"
      >
        An {CONFIG.archer.name} YSWS
      </a>
    </header>

    <section class="wrap hero" id="top">
      <div class="hero-copy">
        <p class="mono tagline">{CONFIG.tagline}</p>

        <h1>
          Stop wasting money.
          <em>Build it yourself.</em>
        </h1>

        <p class="lede">
          Every month you rent films, music, photos and files on a computer you cannot
          touch. Build the replacement, run it in your own room, ship it open-source.
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
            Add up what you pay
          </a>
        </div>
      </div>

      <div class="figure"><Fall height={390} /></div>

      <p class="mono readout">
        {#each readout as bit}<span>{bit}</span>{/each}
      </p>
    </section>
  </div>

  <main class="wrap stack">
    <!-- ───────────────────────── THE BILL ───────────────────────── -->
    <Unit
      id="ledger"
      title="What you rent"
      sub="Every subscription in the house, floating overhead, sized by what it costs. Pop one and it lands underneath as the thing you could run instead. That is the project."
    >
      <Ledger welcomeUrl={CONFIG.welcomeUrl} />
    </Unit>

    <!-- ───────────────────────── WHO WE ARE ─────────────────────────
         The name, at the size a name deserves, now that it is not sitting in
         a corner lockup. FALL is the verb the whole program turns on, so it
         is the half that takes the accent. -->
    <section class="who" id="who" data-analytics-section="who">
      <div class="who-say">
        <img class="who-mark" src="/logo.png" alt="" width="300" height="259" />
        <p class="mono">{WHO.eyebrow}</p>
        <h2>We are <span class="mark">Cloud<em>FALL</em></span></h2>
      </div>

      <div class="who-copy">
        <p class="who-line">{WHO.line}</p>
        <p class="mono who-facts">
          {#each WHO.facts as f}<span>{f}</span>{/each}
        </p>
      </div>
    </section>

    <!-- ───────────────────────── THE BUILD ─────────────────────────
         Three moves, not five steps. The account and the time tracking are
         real, but they are paperwork: they sit in one line underneath rather
         than taking two of the three slots people actually read. -->
    <Unit
      id="build"
      title="How it works"
      sub="Rebuild one thing you pay for every month so that you own it. Ship it open-source and the hardware to keep it running is on us."
    >
      <!-- numbered because it is genuinely an order of operations -->
      <ol class="moves">
        {#each MOVES as m}
          <li class="move">
            <span class="mono move-n">{m.n}</span>
            <h3>{m.title}</h3>
            <p>{m.body}</p>
          </li>
        {/each}
      </ol>

      <div class="moves-foot">
        <a
          class="btn"
          href={CONFIG.welcomeUrl}
          data-analytics="CTA: Click"
          data-analytics-placement="build-onboarding"
        >
          Sign up free
        </a>
        <p class="mono fine">
          {#each FINE_PRINT as f}<span>{f}</span>{/each}
        </p>
      </div>
    </Unit>

    <!-- ──────────── THINGS TO BUILD (live, hidden when empty) ──────────── -->
    {#if api.examples.length}
      <Unit
        id="ideas"
        title="Things to build"
        sub="Starting points, not a menu. Take one and twist it into the stack you actually want."
      >
        <Examples items={api.examples} />
      </Unit>
    {/if}

    <!-- ───────────────────────── TERMS ───────────────────────── -->
    <Unit id="terms" title="New here?" sub="The whole deal in four lines. Read it before the shop.">
      <Terms
        slackUrl={CONFIG.slackUrl}
        hackatimeUrl={CONFIG.hackatimeUrl}
        welcomeUrl={CONFIG.welcomeUrl}
      />
    </Unit>

    <!-- ───────────────────────── HACK CLUB ─────────────────────────
         Most people arriving from a link have never heard of Hack Club, and
         the age rule is the one bit of eligibility that stops somebody
         halfway through. Both belong on the page, not in the FAQ. -->
    <section class="panel hc" id="hackclub" data-analytics-section="hackclub">
      <div class="hc-art">
        <img src="/branding/flag-standalone.svg" alt="Hack Club" width="220" height="127" />
      </div>

      <div class="hc-copy">
        <h2>{HACK_CLUB.headline}</h2>
        <p>{HACK_CLUB.body}</p>
        <p class="hc-elig">{HACK_CLUB.eligibility}</p>
        <p class="mono hc-facts">
          {#each HACK_CLUB.facts as f}<span>{f}</span>{/each}
        </p>
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

    <!-- ───────────────────────── SHOP (live) ───────────────────────── -->
    <Unit
      id="shop"
      title="The shop"
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

    <!-- ───────────────────────── CHECKS ───────────────────────── -->
    <Unit id="checks" title={RULES.title} sub={RULES.intro}>
      <Rules
        items={RULES.items}
        requirements={api.rules?.requirements}
        aiPercent={api.rules?.ai?.maxPercent}
      />
    </Unit>

    <!-- ─────────────── NEWS / EVENTS (live, hidden when empty) ─────────────── -->
    {#if api.news.length}
      <Unit id="news" title="Latest news" sub="Announcements from the people running the program.">
        <div class="feed">
          {#each api.news as item}
            <article class="entry">
              {#if item.publishedAt}
                <p class="mono">{new Date(item.publishedAt).toLocaleDateString()}</p>
              {/if}
              <div>
                {#if item.title}<h3>{item.title}</h3>{/if}
                {#if item.body}<p class="entry-body">{item.body}</p>{/if}
              </div>
            </article>
          {/each}
        </div>
      </Unit>
    {/if}

    {#if api.events.length}
      <Unit id="events" title="What's coming up" sub="Still to come on the schedule.">
        <div class="feed">
          {#each api.events as ev}
            <article class="entry">
              {#if ev.startsAt}<p class="mono">{new Date(ev.startsAt).toLocaleString()}</p>{/if}
              <div>
                {#if ev.title}<h3>{ev.title}</h3>{/if}
                {#if ev.description}<p class="entry-body">{ev.description}</p>{/if}
              </div>
            </article>
          {/each}
        </div>
      </Unit>
    {/if}

    <!-- ───────────────────────── FAQ (live) ───────────────────────── -->
    <Unit id="faq" title="Questions" sub="Anything missing, ask in the Slack.">
      {#if api.loading}
        <p class="msg mono">reading the faq</p>
      {:else if api.faq.length}
        <div class="faq">
          {#each api.faq as item, i}
            <div class="qa" class:open={openFaq === i}>
              <button class="qa-q" onclick={() => toggleFaq(i)} aria-expanded={openFaq === i}>
                <span class="qa-text">{item.question}</span>
                <span class="qa-sign" aria-hidden="true">{openFaq === i ? '–' : '+'}</span>
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

    <!-- ───────────────── NEVER SELF-HOSTED ANYTHING ───────────────── -->
    <Unit
      id="help"
      title="Never hosted anything?"
      sub="Then this program is aimed squarely at you. Nobody is expected to arrive knowing this, and there are people in the Slack who will get your first one running with you."
    >
      <ul class="helps">
        {#each HELP as h}
          <li class="help">
            <span class="pill">{h.tag}</span>
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
  </main>

  <!-- ───────────────────────── BACK TO THE SKY ─────────────────────────
       The page opened in the sky and closes in it. Same flat violet, the ask,
       and nothing else on it. -->
  <section class="sky sky-bottom closer on-sky" id="signup">
    <Drift />

    <div class="wrap closer-in">
      <img class="closer-mark" src="/logo.png" alt="" width="150" height="130" />
      <div>
        <h2>Then it is just a thing you own.</h2>
        <p class="closer-sub">
          No essay, no interview, no fee, and no monthly anything. Pick the subscription you
          would miss least, build the replacement, log the hours, and the discs to keep the
          library on come from us.
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
            Or say hello in #ysws-cloudfall
          </a>
        </div>
      </div>
    </div>
  </section>

  <footer class="wrap footer">
    <div class="footer-top">
      <div class="brand">
        <img src="/logo.png" alt="" width="30" height="26" />
        <span class="wordmark">CloudFALL</span>
      </div>
      <nav class="footer-links">
        <a href={CONFIG.welcomeUrl} data-analytics="CTA: Click" data-analytics-placement="footer-onboarding">Sign up</a>
        <a href={CONFIG.programUrl} data-analytics="CTA: Click" data-analytics-placement="footer-program">Program</a>
        <a href={CONFIG.slackUrl} data-analytics="CTA: Click" data-analytics-placement="footer-slack">Slack</a>
        <a href={CONFIG.hackatimeUrl} data-analytics="CTA: Click" data-analytics-placement="footer-hackatime">Hackatime</a>
        <a href="https://ysws.hackclub.com/" data-analytics="CTA: Click" data-analytics-placement="footer-ysws">All YSWS</a>
        <a href={CONFIG.flagUrl} data-analytics="CTA: Click" data-analytics-placement="footer-hack-club">Hack Club</a>
      </nav>
    </div>
    <p class="mono disclaimer">
      A Hack Club YSWS, part of the
      <a href={CONFIG.archer.url} target="_blank" rel="noopener">{CONFIG.archer.name}</a>
      program · made by teenagers, for teenagers · content served live from
      <a href={CONFIG.programUrl}>Stern</a>
    </p>
  </footer>
{/if}

<style>
  /* ── THE SKY ──
     Two bands of it, one at each end of the page, and the ground in between.
     A sky is allowed to be deeper at the top; that is weather, not chrome. */
  .sky {
    position: relative;
    background: linear-gradient(180deg, #4835ea 0%, var(--sky) 46%);
    color: var(--on-sky);
  }
  /* above the drifting canvas, which is absolute inside the band */
  .masthead,
  .hero,
  .closer-in { position: relative; z-index: 1; }

  /* Where the sky ends, the ground comes up through it as cloud: fifteen
     overlapping circles of fourteen different radii over a 460px tile, so it
     reads as weather rather than as a row of scallops and the repeat is long
     enough that nobody counts it. It is the name of the program drawn at each
     seam, and the only place on the page that spends anything on an edge. */
  .sky-top::after,
  .sky-bottom::before,
  .sky-bottom::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 52px;
    /* above the drifting canvas: ::before would otherwise paint under it */
    z-index: 2;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='460' height='52' viewBox='0 0 460 52' fill='%23efeef9'%3E%3Crect y='34' width='460' height='18'/%3E%3Ccircle cx='0' cy='34' r='18'/%3E%3Ccircle cx='32' cy='34' r='24'/%3E%3Ccircle cx='68' cy='34' r='15'/%3E%3Ccircle cx='98' cy='34' r='26'/%3E%3Ccircle cx='138' cy='34' r='17'/%3E%3Ccircle cx='170' cy='34' r='22'/%3E%3Ccircle cx='204' cy='34' r='15'/%3E%3Ccircle cx='234' cy='34' r='25'/%3E%3Ccircle cx='276' cy='34' r='18'/%3E%3Ccircle cx='310' cy='34' r='23'/%3E%3Ccircle cx='346' cy='34' r='16'/%3E%3Ccircle cx='376' cy='34' r='24'/%3E%3Ccircle cx='416' cy='34' r='17'/%3E%3Ccircle cx='450' cy='34' r='20'/%3E%3Ccircle cx='460' cy='34' r='18'/%3E%3C/svg%3E");
    background-repeat: repeat-x;
    background-size: 460px 52px;
    pointer-events: none;
  }
  .sky-top::after,
  .sky-bottom::after { bottom: -1px; }
  /* the same edge, turned over: the ground dips back into the sky */
  .sky-bottom::before { top: -1px; transform: rotate(180deg); }

  /* ── THE FLAG ──
     Fixed, not absolute: it hangs off the corner of the window and stays
     there the whole way down the page, the way it does on every other Hack
     Club site. It is the only thing on the page that does not scroll. */
  .flag {
    position: fixed;
    top: 0;
    left: clamp(6px, 1.6vw, 24px);
    z-index: 60;
    line-height: 0;
  }
  .flag img { width: clamp(132px, 16vw, 232px); height: auto; }
  /* it travels over violet, pale ground and white panels, so the ring has to
     survive all three: ink against ember reads on any of them */
  .flag:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
    box-shadow: 0 0 0 5px var(--ember);
  }

  /* Held to the right, where the flag can never reach it. */
  .masthead {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 2px 12px;
    padding-block: 18px;
    color: var(--on-sky-2);
  }
  .brand { display: flex; align-items: center; gap: 11px; text-decoration: none; }
  .brand img { width: 34px; height: auto; }
  .wordmark {
    font-family: var(--display);
    font-weight: 700;
    font-size: 1.2rem;
    letter-spacing: -0.02em;
  }

  /* ── HERO ── */
  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
    align-items: center;
    gap: clamp(20px, 4vw, 52px);
    /* the flag hangs into this band, and it grows with the viewport faster
       than the masthead does, so the first line of copy has to start below
       where the banner tip lands */
    padding-top: clamp(30px, 6vw, 88px);
    /* room for the cloud edge to sit under the readout without touching it */
    padding-bottom: clamp(46px, 6vw, 66px);
  }

  .tagline { color: var(--on-sky-2); }

  h1 {
    margin-top: 16px;
    font-size: clamp(2.5rem, 5.6vw, 4.4rem);
    font-weight: 700;
    line-height: 1.02;
    letter-spacing: -0.035em;
    max-width: 15ch;
  }
  h1 em {
    display: block;
    font-style: normal;
    color: var(--ember-sky);
  }

  .lede {
    max-width: 50ch;
    margin-top: 20px;
    font-size: 1.06rem;
    color: var(--on-sky-2);
  }

  .cta-row { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; margin-top: 28px; }

  .figure { min-width: 0; }

  /* the live line: what a status readout would print if this program were a
     service, which is the joke the whole page runs on */
  .readout {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 28px;
    margin-top: clamp(14px, 2.5vw, 26px);
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.28);
    color: var(--on-sky-2);
  }

  /* ── PAGE STACK ── */
  .stack {
    display: grid;
    /* minmax(0,1fr), not the implicit auto column, or the widest child sizes
       the whole stack and overflows small screens */
    grid-template-columns: minmax(0, 1fr);
    gap: var(--gap);
    padding-top: var(--gap);
    padding-bottom: var(--gap);
  }

  /* ── WHO WE ARE ──
     No panel under this one. After a page of white surfaces the name gets
     said straight onto the ground, at full size, and then the page carries on. */
  .who {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    /* centred, not top-aligned: the statement belongs beside the wordmark,
       not floating above it while the name sits at the foot of its column */
    align-items: center;
    gap: clamp(22px, 4vw, 60px);
    padding-inline: clamp(4px, 2vw, 40px);
  }

  .who-mark { width: clamp(112px, 13vw, 172px); height: auto; margin-bottom: 14px; }

  .who h2 {
    margin-top: 10px;
    font-size: clamp(2.4rem, 6vw, 4.4rem);
    font-weight: 700;
    line-height: 0.98;
    letter-spacing: -0.035em;
  }
  /* Cloud is theirs and stays in ink; FALL is the part you do */
  .mark { white-space: nowrap; }
  .mark em { font-style: normal; color: var(--ember-ink); }

  /* one short statement, so it is set at the size of a statement rather than
     at the size of body copy */
  .who-copy { display: grid; justify-items: start; gap: 22px; }
  /* its own class, not `.who-copy > p`: the facts line underneath is a
     paragraph too, and a child selector would blow it up to statement size */
  .who-line {
    font-size: clamp(1.18rem, 2vw, 1.55rem);
    line-height: 1.42;
    color: var(--ink);
    max-width: 38ch;
  }
  .who-facts { display: flex; flex-wrap: wrap; gap: 6px 24px; }

  /* ── MOVES ── */
  .moves {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(20px, 3vw, 40px);
  }
  .move { padding-top: 14px; border-top: 2px solid var(--ember); }
  .move-n { display: block; color: var(--ember-ink); }
  .move h3 { margin-top: 10px; font-size: 1.5rem; }
  .move p { margin-top: 8px; color: var(--ink-2); }

  .moves-foot {
    display: flex;
    align-items: center;
    gap: 18px 30px;
    flex-wrap: wrap;
    margin-top: clamp(26px, 3.5vw, 40px);
  }
  .fine { display: flex; flex-wrap: wrap; gap: 6px 26px; flex: 1 1 22ch; color: var(--ink-2); }

  /* ── HACK CLUB ── */
  .hc {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    align-items: center;
    gap: clamp(22px, 4vw, 50px);
    padding: clamp(26px, 3.6vw, 44px) clamp(22px, 3vw, 40px);
  }
  .hc-art { display: grid; place-items: center; }
  .hc-art img { width: 100%; max-width: 210px; }

  .hc-copy { display: grid; justify-items: start; gap: 16px; max-width: 66ch; }
  .hc h2 { font-size: clamp(1.6rem, 3.2vw, 2.3rem); }
  .hc-copy > p { color: var(--ink-2); }
  /* the age rule is the one thing here that changes whether somebody can take
     part, so it is the one thing marked */
  .hc-elig {
    padding-left: 16px;
    border-left: 3px solid #ec3750;
    color: var(--ink);
  }
  .hc-facts { display: flex; flex-wrap: wrap; gap: 6px 24px; }
  .hc .cta-row { margin-top: 4px; }

  /* ── HELP ── */
  .helps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(20px, 3vw, 40px);
  }
  .help { padding-top: 14px; border-top: 1px solid var(--rule-2); }
  .help h3 { margin-top: 10px; font-size: 1.2rem; }
  .help p { margin-top: 8px; color: var(--ink-2); font-size: 1rem; }
  .help-tail {
    margin-top: clamp(24px, 3.5vw, 38px);
    color: var(--ink-2);
    max-width: 72ch;
  }
  .help-tail a { color: var(--ink); text-underline-offset: 3px; }

  /* ── NEWS / EVENTS ── */
  .feed { display: grid; }
  .entry {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 24px;
    padding: 18px 0;
    border-top: 1px solid var(--rule);
  }
  .entry:last-child { border-bottom: 1px solid var(--rule); }
  .entry h3 { font-size: 1.2rem; }
  .entry .mono { padding-top: 5px; }
  .entry-body { margin-top: 8px; color: var(--ink-2); max-width: 70ch; }

  /* ── FAQ ── */
  .faq { display: grid; }
  .qa { border-top: 1px solid var(--rule); }
  .qa:last-child { border-bottom: 1px solid var(--rule); }
  .qa-q {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 20px;
    align-items: baseline;
    gap: 20px;
    width: 100%;
    padding: 16px 0;
    border: none;
    background: none;
    text-align: left;
    color: var(--ink);
  }
  .qa-text {
    font-family: var(--display);
    font-weight: 500;
    font-size: 1.12rem;
    line-height: 1.35;
  }
  .qa-q:hover .qa-text { color: var(--ember-ink); }
  .qa-sign {
    justify-self: end;
    font-family: var(--mono);
    font-size: 1.1rem;
    color: var(--ink-3);
  }
  .qa-a { padding: 0 0 20px; color: var(--ink-2); max-width: 78ch; }

  .msg { color: var(--ink-2); }
  .msg a { color: var(--ink); }

  /* ── CLOSER ── */
  .closer-in {
    display: grid;
    align-items: center;
    grid-template-columns: 180px minmax(0, 1fr);
    gap: clamp(22px, 4vw, 52px);
    /* the cloud edges eat into both ends of this band, so it is padded past
       them rather than tucked under them */
    padding-top: clamp(74px, 9vw, 118px);
    padding-bottom: clamp(74px, 9vw, 112px);
  }
  .closer-mark { width: 100%; max-width: 170px; height: auto; }
  .closer h2 {
    font-size: clamp(1.9rem, 4.4vw, 3.1rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    max-width: 15ch;
  }
  .closer-sub {
    max-width: 54ch;
    margin-top: 16px;
    font-size: 1.06rem;
    color: var(--on-sky-2);
  }

  /* ── FOOTER ── */
  .footer { padding-block: clamp(26px, 3.5vw, 40px); }
  .footer-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px 30px;
    flex-wrap: wrap;
  }
  .footer-links {
    display: flex;
    gap: 8px 22px;
    flex-wrap: wrap;
    font-family: var(--display);
    font-size: 0.94rem;
  }
  .footer-links a { color: var(--ink-2); text-decoration: none; }
  .footer-links a:hover { color: var(--ember-ink); }
  .disclaimer {
    margin-top: 26px;
    padding-top: 18px;
    border-top: 1px solid var(--rule);
    font-size: 0.62rem;
    line-height: 1.9;
  }
  .disclaimer a { color: var(--ink-2); }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .hero { grid-template-columns: minmax(0, 1fr); }
    /* the cloud leads on narrow screens: it explains the name before a word
       has been read. Its caption goes, though: stacked directly above the
       tagline it made two lines of small mono type in a row. */
    .figure { grid-row: 1; }
    .figure :global(figcaption) { display: none; }
    .moves { grid-template-columns: minmax(0, 1fr); gap: 24px; }
    .helps { grid-template-columns: minmax(0, 1fr); gap: 24px; }
    .hc { grid-template-columns: minmax(0, 1fr); }
    .hc-art img { max-width: 170px; }
    .closer-in { grid-template-columns: minmax(0, 1fr); justify-items: start; }
    .who { grid-template-columns: minmax(0, 1fr); }
    h1 { max-width: none; }
  }
  @media (max-width: 440px) {
    /* below this the pair still fits on one line, but only by starting under
       the flag. Stacked and right-aligned, both clear it, and the separator
       has nothing left to separate. */
    .masthead { flex-direction: column; align-items: flex-end; gap: 2px; }
    .dot { display: none; }
  }
  @media (max-width: 640px) {
    .entry { grid-template-columns: minmax(0, 1fr); gap: 6px; }
  }
</style>
