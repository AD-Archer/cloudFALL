# CLOUDFALL ☁️

A Hack Club **You Ship, We Ship** landing page: destroy the cloud by making it free.
Pick a subscription your household pays for every month, build the self-hosted thing
that replaces it, ship it open-source, and spend the hours you logged on discs to keep
your library on.

Static **Svelte 5 + Vite** site, run with **`just`**. Onboarding, the shop and all
program content live in **Stern**; this repo is the front page.

Forked from [future](../future), then rebuilt around this program's own brand: violet
sky, hand-drawn spiked cloud, everything round and buoyant.

## Quick start

```bash
just          # list all recipes
just dev      # http://localhost:5174
just build    # static production build into dist/
just preview  # preview the production build
just clean    # remove node_modules and build output
```

`just dev` and `just build` install dependencies on first run. There is no server to
run: deploy `dist/` anywhere static.

## The backend is Stern

Everything that changes often is read at runtime from Stern's public content API
(no key, CORS open, edge-cached about 60s), so an edit in Stern shows up here within a
minute:

| What | Endpoint |
|------|----------|
| Program, images, accent, hours shipped | `/api/public/programs/cloudfall` |
| The live shop | `/api/public/programs/cloudfall/prizes` |
| Rules, project types, AI cap | `/api/public/programs/cloudfall/rules` |
| FAQ | `/api/public/programs/cloudfall/faq` |
| News | `/api/public/programs/cloudfall/news` |
| Events | `/api/public/programs/cloudfall/events` |
| Explore ideas and examples | `/api/public/programs/cloudfall/examples` |

Client: [src/lib/api/stern.js](src/lib/api/stern.js). Prizes are sorted by hours gate
first, then price. Each endpoint fails independently, so one outage degrades one
section instead of the page. News, events and examples hide their whole section when
Stern has nothing in them.

Every call to action points at <https://stern.hackclub.com/cloudfall/welcome>.

## The two things worth knowing

**The hero cloud** ([src/lib/Fall.svelte](src/lib/Fall.svelte)) is the program's logo
drawn as a mass of soft bubbles that keeps coming apart. Puffs drift off the underside,
fall, and pile up at the bottom of the frame. It is the name of the program as an
animation, and the caption underneath says what the pile means.

**The pond** ([src/lib/Ledger.svelte](src/lib/Ledger.svelte)) is the section that does
the arguing. Every subscription floats overhead as a bubble sized by what it costs, so
the gym dwarfs the password manager on sight. Pop one and it lands underneath as the
open-source thing you could run instead, with its port number and a reason, and the
yearly total goes up. Nothing is selected by default: the number is only worth anything
if it is the visitor's own bill.

Brand marks come from [Simple Icons](https://simpleicons.org) (CC0) and are inlined in
[src/lib/brands.js](src/lib/brands.js) rather than fetched, so a blocked CDN cannot
leave the pond full of empty circles. To add or change one:

```bash
npm i -D simple-icons     # temporarily
node -e "…"               # copy the path and hex into brands.js
npm uninstall simple-icons
```

## Where to edit things

| What | File |
|------|------|
| Program name, links, tagline | [src/lib/data.js](src/lib/data.js) → `CONFIG` |
| The subscriptions and their replacements | `RENTALS` |
| The five steps, the reviewer checks, the terms | `STEPS`, `RULES`, `TERMS` |
| Self-hosting help copy | `HELP` |
| Colours, type, buttons, cloud surfaces | [src/app.css](src/app.css) |
| Page layout and section order | [src/App.svelte](src/App.svelte) |
| The section shell (number, title, port) | [src/lib/Unit.svelte](src/lib/Unit.svelte) |
| Sky wallpaper (clouds, bubbles, sparkles) | [src/lib/Sky.svelte](src/lib/Sky.svelte) |

Section headers carry the port the thing on that band would actually listen on: 8096 is
Jellyfin, 32400 is Plex, 41641 is Tailscale. Anyone who has run a server reads it
instantly, and it beats a decorative divider.

## Analytics

Same self-hosted Plausible instance as Stern, at `https://plausible.adarcher.app`,
registered with the site domain `cloudfall.hackclub.com`. The client tracker records
pageviews and engagement, plus outbound links, downloads, section views, and the main
actions on this page: popping and refilling bubbles, shop filters, FAQ opens, and every
call to action by placement.

To verify locally, opt in explicitly so localhost traffic is sent:

```bash
VITE_PLAUSIBLE_CAPTURE_LOCALHOST=true just dev
```

The tracker is imported lazily from [src/lib/insight.js](src/lib/insight.js) (named
`insight`, not `analytics`, because content blockers eat anything that looks like
analytics and a blocked static import takes the whole page down with it).

## Link previews

`index.html` carries a full Open Graph and Twitter card set, using the program's own
cover art at `public/cover.jpg`. Crawlers do not run JS and will not resolve a relative
`og:image`, so the absolute origin is substituted into `%SITE_URL%` at build time by a
small plugin in [vite.config.js](vite.config.js):

```bash
just build                                          # defaults to https://cloudfall.hackclub.com
SITE_URL=https://cloudfall.hackclub.com just build  # or set it per deploy
```

## Notes

- Fonts are Fredoka (display), Nunito (body) and DM Mono (data), from Google Fonts.
- Mono type is deliberate: ports, sizes, prices and statuses stay in it, and it is what
  stops a sky full of bubbles from reading as a toy.
- `prefers-reduced-motion` is respected everywhere. The sky freezes, the cloud renders
  one still frame with the pile part built, and nothing bobs.
- Do not use em dashes in copy in this repo.
