<script>
  import Linky from './lib/Linky.svelte'
  import Horizon from './lib/Horizon.svelte'
  import Unit from './lib/Unit.svelte'
  import Ledger from './lib/Ledger.svelte'
  import Shop from './lib/Shop.svelte'
  import Rules from './lib/Rules.svelte'
  import Starred from './lib/Starred.svelte'
  import StatusPage from './lib/StatusPage.svelte'
  import { loadContent } from './lib/api/stern.js'
  import { initAnalytics, refreshAnalyticsSections, trackEvent } from './lib/insight.js'
  import { CONFIG, MOVES, RULES, HACK_CLUB } from './lib/data.js'

  let openFaq = $state(-1)
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
    starred: []
  })

  // ── THE RUN ──
  // cloudFALL has no fixed dates yet; when Stern sets them this fills in on
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

  // One quiet line under the hero: open or not, who can enter, how big the
  // shop is. Live where it can be, silent where it cannot.
  let readout = $derived.by(() => {
    const bits = []
    if (run?.ended) bits.push('Closed')
    else if (run && !run.started) bits.push(`Opens ${fmtDate(run.start)}`)
    else bits.push('Open now')
    if (run?.started && !run.ended) {
      bits.push(run.left === 0 ? 'Closes today' : `${run.left} days left`)
    }
    bits.push('Ages 13–18, anywhere')
    bits.push('Free to enter')
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
        body: 'That address does not exist on this site. The front page has the shop, the rules and the sign-up.',
        detail: ''
      }
    }

    return null
  })

  $effect(() => {
    initAnalytics()

    const onError = (event) => {
      runtimeError = event?.error?.message || event?.message || 'Unknown error'
    }
    const onRejection = (event) => {
      runtimeError = event?.reason?.message || String(event?.reason ?? 'Unhandled rejection')
    }
    const onPopState = () => {
      locationState = readLocation()
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    window.addEventListener('popstate', onPopState)

    loadContent().then((next) => {
      api = { ...next, loading: false }
      refreshAnalyticsSections()
    })

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
      window.removeEventListener('popstate', onPopState)
    }
  })
</script>

{#if status}
  <StatusPage {...status} homeUrl="/" slackUrl={CONFIG.slackUrl} />
{:else}
  <!-- The Hack Club flag, hanging off the corner of the window the way it
       does on every other Hack Club site. Official mark, unmodified. -->
  <a class="flag" href={CONFIG.flagUrl} target="_blank" rel="noopener" aria-label="Hack Club">
    <img src="/branding/flag-orpheus-top.svg" alt="" width="150" height="65" />
  </a>

  <!-- ═══════════════════ THE SKY ═══════════════════
       Everything you rent lives up here. It is one band, it is the
       wordmark's own blue, and it ends in a drawn horizon. -->
  <div class="sky on-sky">
    <!-- The wordmark is a banner, not a corner logo, so it runs full bleed
         across the top of the sky rather than sitting inside the content
         column. There is no nav: this is one page, meant to be scrolled. -->
    <header class="banner">
      <img src="/logo.png" alt="cloudFALL" width="1602" height="599" fetchpriority="high" />
    </header>

    <section class="wrap hero" id="top">
      <div class="hero-copy">
        <h1>Stop wasting money and build it yourself.</h1>

        <p class="hero-line">
        The cloud is just someone else's computer, you're wasting money renting it. CloudFALL is a free program that will teach you how to stop renting and own your own "cloud"
        </p>

        <div class="actions">
          <a
            href={CONFIG.welcomeUrl}
            class="btn"
            data-analytics="CTA: Click"
            data-analytics-placement="hero-signup"
          >
            Sign up free
          </a>
          <a
            href={CONFIG.docsUrl}
            class="btn-text"
            target="_blank"
            rel="noopener"
            data-analytics="CTA: Click"
            data-analytics-placement="hero-docs"
          >
            Learn how it's done
          </a>
        </div>
      </div>

    </section>

    <div class="wrap">
      <p class="readout">
        {#each readout as bit}<span>{bit}</span>{/each}
      </p>
    </div>

    <Horizon />
  </div>

  <!-- ═══════════════════ THE GROUND ═══════════════════ -->
  <main class="wrap stack">
    <!-- ── WHAT YOU PAY FOR, AND WHAT IT COMES TO ── -->
    <Unit
      id="pay"
      title="What you pay for"
      sub="Tick the ones you pay for, we'll show you how much you can save."
    >
      <Ledger docsUrl={CONFIG.docsUrl} />
    </Unit>

    <!-- ── HOW IT WORKS ── -->
    <Unit
      id="how"
      title="How it works"
      sub="Three moves. Rebuild one thing you pay for monthly so that you own it, ship it open-source, and the hardware to keep it running comes from us."
    >
      <!-- One ruled run, in the same grammar as the reviewer checks and the
           questions below. Three equal columns of rule-plus-heading-plus-two-
           lines is the step-card scaffold with the box taken off. -->
      <ol class="moves">
        {#each MOVES as m}
          <li class="move">
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
          data-analytics-placement="how-signup"
        >
          Sign up free
        </a>
        <p class="moves-note">
          Teens around the world. can sign up using
           <a class="link" href={CONFIG.hackatimeUrl} target="_blank" rel="noopener">Hackatime</a>.
          to win prizes while building.
        </p>
      </div>
    </Unit>

    <!-- ── THE DOCS ──
         The honest blocker is not the code, it is not knowing that an old
         laptop and one file is genuinely the whole setup. So the docs get a
         section rather than a footer link. -->
    <section class="docs" id="docs" data-analytics-section="docs">
      <div class="docs-copy">
        <h2>Never run a server before?</h2>
        <p class="prose">
          You don't have to, using our slack channel and the docs we can teach you how to turn an old device into a server, and how to selfhost. Let's get away from paying for things we don't own
        </p>
        <p>
          The docs are open to everyone to learn, only teens 13-18 can compete but anyone can follow along.
        </p>
        <a
          class="btn"
          href={CONFIG.docsUrl}
          target="_blank"
          rel="noopener"
          data-analytics="CTA: Click"
          data-analytics-placement="docs-section"
        >
          Read the docs
        </a>
      </div>

      <div class="docs-art">
        <Linky pose="lean" size={150} flip />
      </div>
    </section>

    <!-- ── BUILT BY THE COMMUNITY (live, hidden when empty) ── -->
    {#if api.starred.length}
      <Unit
        id="built"
        title="Built by the community"
        sub="Projects people shipped through cloudFALL that we think are worth a look."
      >
        <Starred items={api.starred} />
      </Unit>
    {/if}

    <!-- ── THE SHOP (live) ── -->
    <Unit
      id="shop"
      title="The shop"
      sub="For every hour you work you can get rewarded and redeem your hours for prizes."
      cta="See the full shop"
      href={CONFIG.programUrl}
    >
      <Shop
        prizes={api.prizes}
        loading={api.loading}
        shopUrl={CONFIG.shopUrl}
        programUrl={CONFIG.programUrl}
      />
    </Unit>

    <!-- ── WHAT REVIEWERS CHECK ── -->
    <Unit id="checks" title={RULES.title} sub={RULES.intro}>
      <Rules
        items={RULES.items}
        requirements={api.rules?.requirements}
        aiPercent={api.rules?.ai?.maxPercent}
      />
    </Unit>

    <!-- ── NEWS / EVENTS (live, hidden when empty) ── -->
    {#if api.news.length}
      <Unit id="news" title="Latest news" sub="Announcements from the people running the program.">
        <div class="feed">
          {#each api.news as item}
            <article class="entry">
              {#if item.publishedAt}
                <p class="entry-when">{new Date(item.publishedAt).toLocaleDateString()}</p>
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
              {#if ev.startsAt}<p class="entry-when">{new Date(ev.startsAt).toLocaleString()}</p>{/if}
              <div>
                {#if ev.title}<h3>{ev.title}</h3>{/if}
                {#if ev.description}<p class="entry-body">{ev.description}</p>{/if}
              </div>
            </article>
          {/each}
        </div>
      </Unit>
    {/if}

    <!-- ── QUESTIONS (live) ── -->
    <Unit id="faq" title="Questions" sub="Anything missing, ask in the Slack.">
      {#if api.loading}
        <p class="msg">Reading the questions…</p>
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
          The questions could not be loaded. Ask in
          <a class="link" href={CONFIG.slackUrl}>the Slack</a> and someone will answer.
        </p>
      {/if}
    </Unit>

    <!-- ── WHO RUNS THIS ──
         Most people arriving from a link have never heard of Hack Club. -->
    <section class="hc" id="hackclub" data-analytics-section="hackclub">
      <!-- not lazy: it is the one image on the page whose absence would read
           as a missing credit rather than a slow load -->
      <img
        class="hc-flag"
        src="/branding/flag-standalone.svg"
        alt="Hack Club"
        width="526"
        height="184"
      />
      <div class="hc-copy">
        <h2>{HACK_CLUB.headline}</h2>
        <p class="prose">{HACK_CLUB.body}</p>
        <p class="prose">{HACK_CLUB.eligibility}</p>
        <a
          class="btn-text"
          href={CONFIG.flagUrl}
          target="_blank"
          rel="noopener"
          data-analytics="CTA: Click"
          data-analytics-placement="hackclub-site"
        >
          What is Hack Club?
        </a>
      </div>
    </section>
  </main>

  <!-- ═══════════════════ BACK TO THE SKY ═══════════════════ -->
  <section class="sky sky-foot on-sky" id="signup">
    <Horizon flip />

    <div class="wrap closer">
      <div class="closer-copy">
        <h2>Let's start building.</h2>
        <p class="closer-line">
          Pick the subscription,
          build the replacement, log the hours.
        </p>
        <div class="actions">
          <a
            href={CONFIG.welcomeUrl}
            class="btn"
            data-analytics="CTA: Click"
            data-analytics-placement="closer-signup"
          >
            Sign up free
          </a>
          <a
            href={CONFIG.slackUrl}
            class="btn-text"
            data-analytics="CTA: Click"
            data-analytics-placement="closer-slack"
          >
            Or say hello in #ysws-cloudfall
          </a>
        </div>
      </div>

      <div class="closer-art">
        <Linky pose="peek" size={124} />
      </div>
    </div>

    <footer class="wrap">
      <div class="footer">
      <nav class="footer-links">
        <a href={CONFIG.welcomeUrl} data-analytics="CTA: Click" data-analytics-placement="footer-signup">Sign up</a>
        <a href={CONFIG.docsUrl} target="_blank" rel="noopener" data-analytics="CTA: Click" data-analytics-placement="footer-docs">Docs</a>
        <a href={CONFIG.programUrl} data-analytics="CTA: Click" data-analytics-placement="footer-program">Program</a>
        <a href={CONFIG.slackUrl} data-analytics="CTA: Click" data-analytics-placement="footer-slack">Slack</a>
        <a href={CONFIG.hackatimeUrl} data-analytics="CTA: Click" data-analytics-placement="footer-hackatime">Hackatime</a>
        <a href="https://ysws.hackclub.com/" data-analytics="CTA: Click" data-analytics-placement="footer-ysws">All YSWS</a>
      </nav>
      <p class="disclaimer">
        A Hack Club YSWS, part of the
        <a href={CONFIG.archer.url} target="_blank" rel="noopener">{CONFIG.archer.name}</a>
        program. Made by teenagers, for teenagers. Content served live from
        <a href={CONFIG.programUrl}>Stern</a>.
      </p>
      </div>
    </footer>
  </section>
{/if}

<style>
  /* ═══════════ THE FLAG ═══════════
     Fixed to the corner of the window, unmodified, the way it sits on
     every Hack Club site. */
  .flag {
    position: fixed;
    top: 0;
    left: clamp(14px, 3.5vw, 44px);
    z-index: 60;
    width: clamp(104px, 12vw, 168px);
    filter: drop-shadow(0 5px 12px rgba(20, 30, 44, 0.2));
  }
  .flag img { width: 100%; height: auto; }

  /* ═══════════ THE SKY ═══════════ */
  .sky { padding-top: clamp(44px, 4.4vw, 60px); }

  .sky-foot {
    padding-top: 0;
    margin-top: var(--gap);
  }

  /* ── the banner ──
     The wordmark ships at its own colours and is never recoloured: the
     creature standing in for the o and the Hack Club ribbon behind it are
     both full-colour art, and knocking the mark out to a single tone
     deletes them. The sky is pale so that it does not have to be.

     Full bleed: it is not inside the content column, it spans the whole
     band. The art carries transparent margin on every side — 12% of its
     height above and 14.7% below — so the negative block margins trim
     exactly that much back off. Without them the band is 540px of mostly
     empty sky at desktop width and the horizon never reaches the fold.
     Percentages resolve against the band's width, which is why they read
     as 4.4/5.4 rather than 12/14.7. */
  .banner {
    display: block;
    width: 100%;
  }
  .banner img {
    width: 100%;
    height: auto;
    margin-block: -4.4% -5.4%;
  }

  /* ── hero ── */
  /* One column and no mascot: the banner above already carries him, as the
     o of cloud. Two instances of one drawing at one scale in one viewport
     reads as a template repeat and spends the wordmark's joke twice. His
     first standalone appearance is the docs section, where it lands.

     Centred, not left-aligned: the full-bleed banner reads as a centred
     graphic, so text that jumps hard-left underneath it read as two
     different alignments arguing with each other. The status line below
     stays left — it is a status readout, not part of the hero's pitch,
     and centring a long list of short facts turns it into a ragged
     stack rather than a scanned line. */
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-top: clamp(14px, 1.8vw, 22px);
    padding-bottom: clamp(20px, 2.6vw, 30px);
  }

  .hero-copy { max-width: 640px; }

  h1 { letter-spacing: -0.02em; }

  .hero-line {
    margin-top: 16px;
    margin-inline: auto;
    font-size: clamp(1.06rem, 1.5vw, 1.19rem);
    line-height: 1.58;
    color: var(--on-sky-2);
    max-width: 52ch;
  }

  .hero .actions {
    margin-top: 24px;
    justify-content: center;
  }


  /* ── the quiet line under the hero ──
     Left-aligned on purpose, against the centred hero above it: this is
     a scanned status line, not a pitch, and centring a row of short
     unequal facts turns a scan into a ragged stack. */
  .readout {
    display: flex;
    flex-wrap: wrap;
    gap: 8px clamp(14px, 2.4vw, 26px);
    font-family: var(--sans);
    font-size: var(--fs-sm);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--on-sky-3);
    padding-bottom: clamp(16px, 2.2vw, 24px);
    border-top: 1px solid var(--rule-sky);
    padding-top: 13px;
  }

  /* ═══════════ THE GROUND ═══════════ */
  .stack {
    display: grid;
    /* minmax(0, …), not the implicit auto: an auto track grows to its widest
       child, and a rail's whole row is that wide, so the page would scroll
       sideways instead of the rail */
    grid-template-columns: minmax(0, 1fr);
    gap: var(--gap);
    padding-top: clamp(46px, 7vw, 88px);
  }

  /* ── how it works ── */
  .moves {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--rule);
  }

  .move {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: clamp(14px, 3vw, 34px);
    align-items: baseline;
    padding-block: 20px;
    border-bottom: 1px solid var(--rule);
  }
  .move p {
    font-size: var(--fs-lg);
    line-height: 1.55;
    color: var(--ink-2);
    max-width: 60ch;
  }

  .moves-foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: clamp(16px, 3vw, 32px);
    margin-top: clamp(28px, 4vw, 40px);
  }
  .moves-note {
    font-size: var(--fs-md);
    line-height: 1.55;
    color: var(--ink-3);
    max-width: 46ch;
  }

  /* ── the docs ──
     The one section on the paper that takes a tint, because it is the
     answer to the question that stops most people. */
  /* No box. It is told apart from what surrounds it by the heavy rule and
     by the space above it, the same way every other section on this page
     is told apart. */
  .docs {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: clamp(20px, 4vw, 48px);
    padding-top: clamp(26px, 3.5vw, 38px);
    border-top: 2px solid var(--ink);
  }

  .docs-copy { display: grid; justify-items: start; gap: 16px; }
  .docs-copy .btn { margin-top: 4px; }

  .docs-url {
    font-family: var(--sans);
    font-size: var(--fs-md);
    letter-spacing: 0.02em;
    color: var(--ink-3);
  }

  .docs-art { justify-self: end; }

  /* ── news / events ── */
  .feed { display: grid; gap: 0; }

  .entry {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: clamp(14px, 3vw, 34px);
    padding-block: 22px;
    border-top: 1px solid var(--rule);
  }
  .entry:last-child { border-bottom: 1px solid var(--rule); }

  .entry-when {
    font-family: var(--sans);
    font-size: var(--fs-sm);
    letter-spacing: 0.04em;
    color: var(--ink-3);
    padding-top: 3px;
  }
  .entry-body {
    margin-top: 6px;
    font-size: var(--fs-lg);
    line-height: 1.6;
    color: var(--ink-2);
    max-width: 62ch;
  }

  /* ── questions ── */
  .faq { border-top: 1px solid var(--rule); }

  .qa { border-bottom: 1px solid var(--rule); }

  .qa-q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
    background: none;
    border: none;
    padding: 19px 2px;
    text-align: left;
    color: inherit;
    font-family: var(--serif);
    font-size: var(--fs-xl);
    font-weight: 600;
    line-height: 1.4;
    transition: color 150ms ease;
  }
  .qa-q:hover { color: var(--ember-ink); }

  /* a drawn plus/minus, not a unicode glyph */
  .qa-sign {
    position: relative;
    flex: none;
    width: 15px;
    height: 15px;
  }
  .qa-sign::before,
  .qa-sign::after {
    content: '';
    position: absolute;
    inset: 50% 0 auto 0;
    height: 2px;
    background: var(--ink-3);
    transform: translateY(-50%);
    transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease;
  }
  .qa-sign::after { transform: translateY(-50%) rotate(90deg); }
  .qa.open .qa-sign::after { transform: translateY(-50%) rotate(0deg); opacity: 0; }

  .qa-a {
    padding: 0 2px 22px;
    font-size: var(--fs-lg);
    line-height: 1.62;
    color: var(--ink-2);
    max-width: 68ch;
  }

  .msg { color: var(--ink-3); }

  /* ── who runs this ── */
  /* one column, starting on the same margin as every other section */
  .hc {
    display: grid;
    justify-items: start;
    gap: clamp(18px, 2.6vw, 26px);
    padding-top: clamp(28px, 4vw, 40px);
    border-top: 1px solid var(--rule);
  }
  .hc-flag { width: clamp(170px, 22vw, 250px); height: auto; }
  .hc-copy { display: grid; justify-items: start; gap: 14px; }

  /* ═══════════ THE CLOSER ═══════════ */
  .closer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: clamp(22px, 4vw, 50px);
    padding-top: clamp(34px, 5vw, 62px);
    padding-bottom: clamp(34px, 5vw, 58px);
  }

  .closer-line {
    margin-top: 16px;
    font-size: var(--fs-xl);
    line-height: 1.58;
    color: var(--on-sky-2);
    max-width: 50ch;
  }
  .closer .actions { margin-top: 26px; }
  .closer-art { justify-self: end; }

  /* ── footer ── */
  .footer {
    display: grid;
    gap: 16px;
    padding-top: 26px;
    padding-bottom: clamp(34px, 5vw, 52px);
    border-top: 1px solid var(--rule-sky);
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px clamp(16px, 2.6vw, 30px);
    font-family: var(--sans);
    font-size: var(--fs-md);
    font-weight: 500;
  }
  .footer-links a {
    text-decoration: none;
    color: var(--on-sky-2);
    border-bottom: 1.5px solid transparent;
    transition: color 150ms ease, border-color 150ms ease;
  }
  .footer-links a:hover { color: var(--on-sky); border-bottom-color: var(--on-sky-3); }

  .disclaimer {
    font-family: var(--sans);
    font-size: var(--fs-md);
    line-height: 1.6;
    color: var(--on-sky-3);
    max-width: 68ch;
  }
  .disclaimer a { color: var(--on-sky-2); text-underline-offset: 3px; }

  /* ═══════════ NARROW ═══════════ */
  @media (max-width: 860px) {
    /* everywhere else he stays beside the copy rather than dropping below
       it, which is what made him read as loose on a narrow screen */
    .docs,
    .closer {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: clamp(14px, 3vw, 28px);
    }
    .docs-art :global(.linky),
    .closer-art :global(.linky) { width: min(96px, 24vw); }

    .move { grid-template-columns: minmax(0, 1fr); gap: 4px; }

    .entry { grid-template-columns: minmax(0, 1fr); gap: 6px; }
  }
</style>
