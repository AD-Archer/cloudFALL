# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary confirmed audience for this surface: the general public and recruiters/evaluators encountering the page — not only the teen participants who actually run the challenge. The page has to read as credible, competent work to someone judging it cold, while still speaking to its actual doers: Hack Club teens (13–18, any country) who pick a household subscription, build a self-hosted open-source replacement, log hours via Hackatime, and redeem hours for prizes in the Stern-run shop.

## Product Purpose

cloudFALL teaches people to self-host instead of paying for subscriptions. Its hook, in the user's own words: "stop wasting money, learn to do it yourself." It's a Hack Club "You Ship, We Ship" (YSWS) program: pick a subscription your household pays for (Netflix, Spotify, Google Photos, iCloud, etc.), replace it with a self-hosted open-source equivalent (Jellyfin, Navidrome, Immich, Syncthing, etc.), and get rewarded for the hours spent building it.

## Positioning

Stop wasting money on subscriptions — learn to replace them yourself. Unlike a generic self-hosting tutorial, cloudFALL frames it as a concrete, reward-backed challenge tied to real household costs (the ledger of what you're currently renting vs. what you could own) and to Hack Club's teen-maker ecosystem.

## Operating Context

- Docs live separately at sterndocs.hackclub.com/cloudfall.
- Backend/content comes from Stern (stern.hackclub.com), a Hack Club internal CMS/API — program info, prize shop, rules, FAQ, news, and events, fetched client-side with ~60s edge cache, no auth key.
- Hours are logged via Hackatime; hours redeem for prizes (blank discs, drives, hardware) in a Stern-run shop.
- Deployed as a static Svelte site (Vite) on Vercel at cloudfall.hackclub.com.

## Capabilities and Constraints

- Single-page app. As of the 2026-08-16 rebuild the running order is: hero ("what this is"), the ledger ("what you pay for" plus the year's total), how it works, a docs section pointing at sterndocs.hackclub.com/cloudfall, community projects (sealed in Stern), prize shop, submission rules, news, events, FAQ, a Hack Club block, signup/closer, footer. Cut in that rebuild, on the user's "calm and simple" brief: the separate "who we are" block, the "new here / terms" block, and the "never hosted anything" help list — the docs section now carries the last of these.
- Uses official Hack Club branding assets (flags, icons) that must be preserved as-is per Hack Club brand usage.
- Content dynamically pulled from Stern at runtime; a redesign must keep working against that live data shape (program, shop items, rules, FAQ, news, events, starred projects) rather than hardcoding copy that Stern already owns.
- Refer to "Hack Club" only that way (never "Hackclub," "hack club," or "HackClub") — org-level requirement.

## Brand Commitments

- Program name: cloudFALL.
- Hack Club branding assets (flag/icon variants) must appear and remain recognizably Hack Club's official marks.
- The old "flat sky" visual system (violet/orange, Fredoka/Newsreader/DM Mono) is evidence and anti-reference, not a constraint to preserve.

**Shipped identity (2026-08-16).** The previously-pinned hand-drawn direction is no longer a sketch — both assets are finished, drawn by the user, and are now the identity:

- `public/logo.png` — the wordmark. Hand-lettered "cloud fall" in dusty blue (`#5484a8`) high-contrast serif, with the mascot standing in for the "o" of *cloud*, a red "HACK CLUB" ribbon behind the lettering, and white hand-drawn cloud puffs. This **replaced** the old cloud-eye mark at the same path; the orange-spiked single-eye logo is retired everywhere.
- `public/linky.png` — the mascot on his own: a round peach-to-mauve creature with orange spikes, a single eye drawn as a terminal prompt (`>`), and a curled tail.

Rules that bind any future work on these:

- **Neither asset is ever recoloured or redrawn.** The wordmark is full-colour art; knocking it out to a single tone (a white `filter` on a dark band, for instance) deletes the mascot and the ribbon, which are the identity. The site's sky band is pale specifically so the mark can sit on it unmodified. The mascot is rendered from his PNG and never traced into SVG — a traced approximation is a different creature in his colours.
- The mascot **recurs across the site** (hero, docs section, closer), posed differently but never redrawn.
- The mascot's name is **not surfaced in page copy** — user's call, 2026-08-16. He is visual only; alt text treats him as decorative.
- Favicon is the mascot.
- Palette sampled from the assets: ink blue `#5484a8`, peach `#f0b4a8`, spike orange `#fc9c6c`, mauve `#c090a8`.

## Evidence on Hand

- Real, live content is served from Stern (prizes, rules, FAQ, news, events, example builds) — do not fabricate testimonials, pricing, or prize data; treat Stern as the source of truth and design for its actual shape.
- Existing static copy blocks (ledger/rentals data, "who we are," how-it-works, Hack Club info, fine print) live in `src/lib/data.js` and can be reused or restructured but not invented from scratch.

## Product Principles

1. Credibility first: the redesign must read as legitimate, high-craft work to a cold general/recruiter audience, not just insiders.
2. The money hook leads: "stop wasting money, learn to do it yourself" and the rentals-vs-self-host comparison are the emotional and argumentative core — don't bury them.
3. Hack Club identity stays visible and correctly attributed, without letting it dominate cloudFALL's own identity.
4. Design against live Stern data, not fabricated placeholder content.
5. This is a full redesign: the current flat-sky violet/orange system is discarded as a direction, but product truth, copy sourced from Stern, functionality, and Hack Club assets are preserved.

## Accessibility & Inclusion

The incumbent build already respects `prefers-reduced-motion`, uses `aria-live`, descriptive `alt`/`aria-label` on meaningful and decorative imagery, and visible `:focus-visible` states. No stricter standard was specified by the user; carry this level of care forward as a floor, not a ceiling.
