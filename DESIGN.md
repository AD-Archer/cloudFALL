---
name: cloudFALL
description: A quiet ruled page — sky at each end, warm paper down the middle, and one number louder than anything else on it.
colors:
  sky: "#cee1ed"
  sky-deep: "#3f6d92"
  paper: "#fbf7f1"
  paper-2: "#f4ece0"
  rule: "#e6dccd"
  rule-2: "#d3c5b1"
  rule-sky: "rgba(34, 53, 73, 0.16)"
  ink: "#26374a"
  ink-2: "#596d81"
  ink-3: "#5b6c80"
  on-sky: "#223549"
  on-sky-2: "#47607a"
  on-sky-3: "#4a5f74"
  peach: "#f0b4a8"
  ember: "#fc9c6c"
  ember-ink: "#ae4b15"
  sky-deeper: "#355c7d"
  wash: "rgba(255, 255, 255, 0.44)"
  on-peach: "#46281f"
  on-ember: "#52260c"
typography:
  display:
    fontFamily: "Alegreya, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.3rem, 5.6vw, 3.7rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "'Alegreya Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.2rem, 7.5vw, 4.8rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
    fontFeature: "tabular-nums"
  headline:
    fontFamily: "Alegreya, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.75rem, 3.4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Alegreya, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.1rem, 1.7vw, 1.3rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Alegreya, Georgia, 'Times New Roman', serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  prose:
    fontFamily: "Alegreya, Georgia, 'Times New Roman', serif"
    fontSize: "1.06rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "'Alegreya Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.76rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.09em"
  ui:
    fontFamily: "'Alegreya Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.005em"
smallTypeRamp:
  fs-xs: "0.76rem"
  fs-sm: "0.86rem"
  fs-md: "0.94rem"
  fs-lg: "1rem"
  fs-xl: "1.06rem"
  fs-2xl: "1.45rem"
rounded:
  plate: "8px"
  box: "5px"
  focus: "3px"
  full: "999px"
spacing:
  pad: "clamp(20px, 5vw, 44px)"
  gap: "clamp(56px, 8vw, 108px)"
  body-top: "clamp(28px, 4vw, 44px)"
  row: "clamp(16px, 2.2vw, 26px)"
components:
  button-primary:
    backgroundColor: "{colors.sky-deep}"
    textColor: "{colors.paper}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "0.72em 1.35em"
  button-primary-hover:
    backgroundColor: "{colors.sky-deeper}"
    textColor: "{colors.paper}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "0.72em 1.35em"
  button-ghost-hover:
    backgroundColor: "{colors.paper-2}"
  button-soft:
    backgroundColor: "transparent"
    textColor: "{colors.on-sky}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "0.72em 1.35em"
  button-sm:
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "0.58em 1.15em"
  button-text:
    backgroundColor: "transparent"
    textColor: "inherit"
    typography: "{typography.ui}"
    padding: "0"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  chip-on:
    backgroundColor: "{colors.sky-deep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  pill:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "3px 9px 4px"
  pill-ember:
    backgroundColor: "{colors.ember}"
    textColor: "#52260c"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "3px 9px 4px"
  checkbox:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.box}"
    size: "22px"
  checkbox-checked:
    backgroundColor: "{colors.sky-deep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.box}"
    size: "22px"
---

# Design System: cloudFALL

## Overview

**Creative North Star: "Sky Over Paper"**

The page is the name. A band of pale sky opens it, a hand-drawn horizon cuts across, and warm paper runs the rest of the way down until the paper turns back into sky at the foot. Sky is where the things you rent live; paper is the part you own. That reading is not decoration — it is the only structural metaphor the system has, and everything else defers to it.

The identity is two drawings: a hand-lettered full-colour wordmark and a small round creature who stands in for the *o*. Every token here was chosen to sit under those two drawings without arguing with them. The blue is lifted off the lettering, the peach and the orange off the creature, the ground is paper, and the ink is a blue-grey from the same family rather than a black. The sky is deliberately pale — a saturated band would force the mark to be knocked out to white, which deletes the creature and the Hack Club ribbon, so the pale ground exists precisely so the art can ship unmodified.

Calm is enforced structurally, not stylistically. There are no cards, no panels, no tinted boxes and no shadows on any surface. Sections are told apart by a single generous space token and a hairline rule; a grid of items is told apart by the gutter between the items. Density is low and the measure is short (46–70ch depending on role). The one loud thing on the page is the yearly total in the ledger, set at 3.2–4.8rem, and it is loud because nothing else competes with it.

**Key Characteristics:**
- Two grounds, one system: a pale sky tint and warm paper, joined by a drawn horizon, never inverted.
- Zero container chrome — no cards, no panels, no shadows on any UI surface.
- Rules and space do all the separating; a 2px ink rule is the only "this matters more" signal.
- Two faces from one superfamily, and no monospace anywhere.
- One authored motion in the whole build; everything else is state transition.
- One accent for money, one accent for actions, and they are not the same colour.

## Colors

A palette sampled off two drawings: a dusty blue lifted from the lettering, warm paper under it, and a peach-orange family taken from the creature and given exclusively to money.

### Primary
- **Dusty Sky Blue** (`sky-deep`): every primary action on the page — the sign-up buttons, the selected filter chip, a rail's previous/next buttons, the checked state of the drawn checkbox, and the browser's own `accent-color`. It is the one colour on paper with enough weight to be pressed and enough contrast to be read.
- **Pale Sky** (`sky`): the two bands at the head and foot of the page and the full ground of the status pages, and nowhere else. It is a tint of the ink family, not an inversion: text on it is still ink, and the same button works on both grounds.

### Secondary
- **Spike Orange** (`ember`): a fill only — the one filled tag (`pill-ember`, reserved for the handful of things Stern flags as featured or shipped) and the underline colour on an emphasised phrase in the reviewer checklist.
- **Burnt Orange Ink** (`ember-ink`): the readable weight of the same orange, and the only colour on the page that is allowed to be money. It carries the yearly total, a ticked row's price, the shop's hour price, the focus ring, and the caret.

### Tertiary
- **Peach** (`peach`): the creature's own colour. Its single system use is `::selection`, paired with a deep brown text colour (7.45:1). It is never a surface, a border, or a link underline.

### Neutral
- **Warm Paper** (`paper`): the page ground, and the label colour on any filled action.
- **Deeper Paper** (`paper-2`): the only tint in the system — hover on a ledger row and a ghost button, and the flat plate behind a product photo so a missing image reads as an empty plate rather than a hole.
- **Blue-Grey Ink** (`ink`): all headings and primary reading text (11.39:1 on paper), and the 2px heavy rule.
- **Secondary Ink** (`ink-2`): running body copy, sub-headings, blurbs (5.01:1).
- **Tertiary Ink** (`ink-3`): labels, captions, timestamps, meta lines (5.04:1 on paper).
- **Paper Rule / Deep Rule** (`rule`, `rule-2`): the hairline that separates every list row and section (`rule`), and the stroke of an unfilled control plus the underline on prose links (`rule-2`).
- **Sky Ink** (`on-sky`, `on-sky-2`, `on-sky-3`): the same three-step ink ramp recomputed against the sky band — 9.33:1, 4.85:1 and 4.91:1 respectively. `rule-sky` is the sky band's hairline.

### Named Rules

**The Five Step Rule.** Everything below the headings sits on the six-value small-type ramp (`fs-xs` 0.76 · `fs-sm` 0.86 · `fs-md` 0.94 · `fs-lg` 1 · `fs-xl` 1.06 · `fs-2xl` 1.45rem) and nowhere between. This exists because the first build drifted to fourteen ad-hoc sizes between 0.7 and 1.08rem — invisible one component at a time, and plainly untidy once the page is read end to end. A new size is a change to this ramp, not a local literal. The same applies to colour: `sky-deeper`, `wash`, `on-peach` and `on-ember` were literals scattered through hover and on-colour states before they were named, and an unnamed value cannot be kept consistent.

**The Measured Tint Rule.** Every text tint in this system is a measured number, not a taste judgement, and it clears 4.5:1 on the ground it actually sits on. `ink-3` exists because the caption grey it replaced (`#8496a6`) read 2.85:1 on paper. `on-sky-3` exists because the sky-band label needed a value that clears the tint (4.91:1) rather than inheriting the paper one. A filled action's label is `paper`, never `on-sky` — when the sky went pale, `on-sky` became ink and the button label silently rendered at 2.28:1 on `sky-deep`; it is 5.16:1 now, 6.61:1 on hover. Nobody may lighten one of these tints "to soften it" without re-measuring; `ember-ink` was darkened from #b34e17 to #ae4b15 for exactly this reason — at the lighter value it fell to 4.46:1 over the `paper-2` row-hover tint, and it now clears both grounds (5.15 and 4.70).

**The Unmodified Mark Rule.** `logo.png` and `linky.png` ship at their own colours, always. They are never recoloured, filtered, knocked out, tinted, or traced into SVG. The wordmark is full-colour art — blue lettering, a pink creature as the *o*, a red Hack Club ribbon — and flattening it to one tone deletes the creature and the ribbon, which *are* the identity. The pale sky exists so the mark never has to be modified to survive its ground. A traced approximation of the creature is a different creature wearing his colours. This rule has already been broken once, at the cost of both the mascot and the ribbon.

**The Money Colour Rule.** Peach and spike-orange belong to the creature and to money. Orange is text only where a figure is money or a price; it is a fill only on the single flagged tag and on an emphasis underline. It is never a button, never a heading, never a section tint, and never a link underline — prose underlines use `rule-2` for exactly this reason.

## Typography

**Display Font:** Alegreya (with Georgia, Times New Roman, serif)
**Body Font:** Alegreya (same face; the serif does all the reading)
**Label/UI Font:** Alegreya Sans (with ui-sans-serif, system-ui)

**Character:** One superfamily, split by job: the serif reads and the sans labels. The serif is warm and slightly bookish at reading size and gets tight and editorial at display sizes (−0.02em at hero scale); the sans is upright and plain, used small, spaced, and uppercase for anything that is a tag rather than a sentence. Alegreya Sans also carries every number in the build, because it has tabular figures and the whole page is an argument about a figure.

### Hierarchy
- **Display** (Alegreya 700, `clamp(2.3rem, 5.6vw, 3.7rem)`, 1.12, −0.02em): the thesis line in the sky band and the status-page headline. One per view, balanced wrap.
- **Figure** (Alegreya Sans 700, `clamp(3.2rem, 7.5vw, 4.8rem)`, 1.0, −0.035em, tabular): the yearly total, in `ember-ink`. The single largest thing on the page and the only element allowed to outrank the display.
- **Headline** (Alegreya 700, `clamp(1.75rem, 3.4vw, 2.5rem)`, 1.12, −0.012em): section titles.
- **Title** (Alegreya 700, `clamp(1.1rem, 1.7vw, 1.3rem)`, 1.12): sub-headings inside a section — a step in the how-it-works run, a news entry. Card titles drop to 1rem/600 and clamp to two lines.
- **Body** (Alegreya 400, 19px, 1.62): the page default. Running copy sets at 1.06rem/1.65 in `ink-2` and never exceeds 66ch; subordinate copy runs 46–62ch.
- **Label** (Alegreya Sans 700, 0.76rem, 0.09em, uppercase, `ink-3`): the total's caption, section labels. Tags use the same treatment at 0.7rem; the live readout line under the hero runs 0.86rem/0.05em uppercase.

### Named Rules

**The Two Faces Rule.** Alegreya and Alegreya Sans, and nothing else. A third family is noise in a system this quiet.

**The No Costume Rule.** No monospace anywhere. This is a site about running servers and monospace is the obvious costume for that; the previous build wore it and the type ended up sized for uppercase mono rather than for reading. Ports, capacities, prices and error detail all set in the sans at a real reading size.

**The Tabular Figure Rule.** Any number that is compared down a column or that changes in place — prices, totals, hour costs — uses `font-variant-numeric: tabular-nums` so it does not shimmy when it updates.

## Layout

One column, centred, `max-width: 1040px` (`--maxw`) with a narrow variant at 720px, gutter `clamp(20px, 5vw, 44px)`. Every rule, heading and image on the page starts on that same content edge — including the banner wordmark, whose own art carries ~14% empty margin per side and is pulled back with a proportional negative inline margin so its lettering aligns with the copy beneath it rather than floating inboard.

The vertical rhythm is one token. Sections on the paper are a CSS grid with `gap: clamp(56px, 8vw, 108px)` (`--gap`) and no padding, borders or backgrounds of their own; the sky's foot band takes the same value as its top margin. Inside a section, the heading block and its body are separated by `clamp(28px, 4vw, 44px)`, and the heading sits 12px above its sub. Almost all of the calm on this page comes from that one gap value and nothing else.

Recurring internal grids: a **150px label column plus fluid content** for the how-it-works steps, the reviewer checks and the news/events feed; a **1.5fr / 1fr split** for the ledger's list and its sticky total; a **fluid copy column plus an auto mascot column** for the docs block and the closer. Item rows are **rails** (`.rail` in app.css): one row that scrolls sideways inside its section, items at a fixed `clamp(140px, 38vw, 232px)` so the next one always peeks past the edge, `clamp(16px, 2.2vw, 26px)` gutter, `scroll-snap-type: x proximity`. The shop and the community projects both run on it. The page itself never scrolls sideways.

Breakpoints are three and behavioural: **860px** collapses the label columns to one column and the ledger to a single stack (its sticky total goes static and its list min-height floor is released); **720px** stacks the status page; **640px** drops card titles to 0.92rem; **520px** moves a ledger row's price beneath its name. The mascot never takes more than 34vw regardless of the size he is asked for, and beside the docs and closer copy he stays alongside rather than dropping below.

### Named Rules

**The One Gap Rule.** Section separation is `--gap`, always, and it never varies by section importance. If a section needs more weight it gets a heavier rule, not more air.

**The Peek Rule.** A rail (always drawn through `Rail.svelte`) has no edge fade and no "show more": the next item cut off at the edge says it scrolls, so item width stays fixed rather than fitting the row exactly. Previous/next buttons sit on the rail's two sides, centred on the photo plate (from the shared `--rail-item` token): half out into the page gutter from 800px up, just inside the edge below that. They are 40px circles filled `sky-deep` (hover `sky-deeper`) with a `paper` SVG chevron, the same pairing as a primary button, and they page by as many whole items as are in view. Each fades out at its own end, so both are gone when the row already fits. Filter chips sit above the rail, not beside the buttons. Changing filters on a rail sends it back to the front.

## Elevation & Depth

**There are no shadows on any interface surface.** No cards, no panels, no raised containers, no tinted boxes — every section, list row, total and grid item sits directly on its ground. Depth is conveyed by three things only: which ground you are on (sky or paper), a horizontal rule, and space.

The only two shadows in the build belong to *drawings*, not to UI, and both are wide, low-opacity and directly under the object so they read as the paper the drawing is resting on rather than as lift: the mascot (`drop-shadow(0 10px 18px rgba(38, 55, 74, 0.13))`) and the corner Hack Club flag (`drop-shadow(0 5px 12px rgba(20, 30, 44, 0.2))`).

The one place the system spends anything on an edge is the horizon: a hand-drawn wobbling SVG path, filled in the paper colour, that joins the sky band to the ground and is flipped where the paper runs back into the sky at the foot. It is the only structural edge on the page allowed a wobble, because the identity is hand-lettered.

### Named Rules

**The No Box Rule.** Nothing on this page is put in a box to mark it as important. Not the total, not the docs block, not a shop item, not an error page. If two things need telling apart, they get space and a rule.

**The Two Rule Weights Rule.** There is a 1px `rule` (ordinary separator: list rows, section tops, the feed, the FAQ) and a 2px `ink` rule (extra weight: exactly the docs block and the ledger total). There is no third weight. Every rule spans its full content box at one width — no inset rules, no partial rules, no rules that stop short of the margin.

## Shapes

The form language is soft-but-not-rounded, and radius is applied only where something is genuinely a shape rather than a region.

- **Pills** (`999px`): every button, chip and tag. These are the only fully rounded objects in the system, and they are rounded because they are small standalone objects, not containers.
- **Plates** (`8px`, `--r-sm`): the flat photo plate in a grid item and the error-detail block. This is the largest radius any rectangular region gets.
- **Controls** (`5px`): the drawn checkbox.
- **Focus** (`3px`): the global focus ring's own corner rounding.

Borders are hairlines and strokes, never frames: 1px `rule` for separators, 1px `rule-2` for a chip or tag outline, and `inset 0 0 0 1.5px` box-shadow for a ghost button's stroke so it does not shift layout against its filled sibling. Nothing on the page is enclosed on four sides except the pill-shaped controls and the 22px checkbox.

The recurring silhouette is the horizontal line: a page of full-width hairlines with type sitting on them, opened and closed by one hand-drawn curve.

## Components

### Buttons

- **Shape:** fully rounded pill (`999px`), sans 700 at 1rem, padding `0.72em 1.35em`; a small variant drops to 0.92rem / `0.58em 1.15em`.
- **Primary:** filled `sky-deep` with a `paper` label (5.16:1). Hover deepens to `#355c7d` (6.61:1); active nudges down 1px. One primary button exists in the system and it works identically on both grounds — the sky is a tint, not an inversion, so there is no separate sky-side primary.
- **Ghost / Quiet:** transparent with a 1.5px inset `rule-2` stroke and `ink` label; hover fills `paper-2`. On the sky band the stroke becomes `rule-sky` and hover fills `rgba(255,255,255,0.42)`.
- **Text action:** sans 700, underlined at 1.5px in `rule-2` (or `rule-sky` on the band) with a 4px offset; hover promotes the underline to `currentColor`. Used as the secondary of every action pair.
- **Focus:** the global ring — 2.5px solid `ember-ink`, 3px offset, 3px radius. It is the same ring everywhere in the build, including on custom controls.

### Chips

- **Style:** sans 500 at 0.9rem, transparent with a 1px `rule-2` outline, pill shape, `6px 14px`. An optional trailing count sets at 0.82em with 0.62 opacity.
- **State:** hover raises the border to `ink-3` and the label to `ink`; selected fills `sky-deep` with a `paper` label. Chips carry filter state in the shop and the ledger's tabs, and a chip whose bucket is empty is never rendered.

### Tags (pills)

- **Style:** sans 700 at 0.7rem, 0.09em, uppercase, `ink-2`, 1px `rule-2` outline, ruled and never filled. A filled bubble behind every label turns a quiet page into confetti.
- **The one exception:** `pill-ember` — filled `ember` with a deep brown label (6.16:1), reserved for the handful of items Stern itself flags (featured, shipped). It is the only filled tag in the system.

### Cards / Containers

There are none. Grid items are borderless, background-free stacks of a photo plate, a title, a spec line and a price, separated from their neighbours by the grid gutter alone. Where an item has a photo it sits on a flat `paper-2` plate at 8px radius with a fixed 5:4 aspect (product shots contain with `mix-blend-mode: multiply` so a white-background photo merges into the plate; editorial images cover). Where an item has no photo, no plate is drawn at all — an empty rounded rectangle is a hole, not a thumbnail. Card bodies use fixed grid rows so a long title cannot make one item taller than its neighbours.

### Inputs / Fields — the drawn checkbox (signature)

The most-touched control on the page, and the reference pattern for any future custom control in this system:

- The real `<input type="checkbox">` stays in the DOM, absolutely positioned at 0 opacity over its 22px box. Keyboard, assistive tech and the label association all keep working; only the rendering is replaced.
- The visual box is 22px, 5px radius, 1.5px `rule-2` stroke on `paper`; checked, it fills and strokes `sky-deep`.
- The tick is a hand-drawn SVG path stroked in `paper` at 2.6 with round caps, animated on with `stroke-dasharray: 26 / stroke-dashoffset: 26 → 0` over 260ms — it writes itself the way a pencil would rather than appearing.
- Focus is forwarded explicitly: `input:focus-visible + .box` draws the standard `ember-ink` ring on the drawn box.
- A ticked row promotes its price to `ember-ink` and its brand mark to the brand's own colour, and reveals the replacement line beneath it.

Any future custom control follows this shape: keep the native element, replace the rendering, forward focus by hand.

### Navigation

There is no navigation bar. The page is one scroll and the wordmark runs at banner scale across the top of the sky band with nothing opposite it. The only link cluster is the footer's — sans 500 at 0.96rem in `on-sky-2`, undecorated, with a transparent 1.5px bottom border that becomes `on-sky-3` on hover as the label rises to `on-sky`.

### Accordion (FAQ)

Serif 600 at 1.08rem on a full-width hairline-separated row; hover takes the question to `ember-ink`. The open/close indicator is a drawn plus built from two 2px pseudo-element bars — the vertical one rotates to horizontal and fades over 200ms — not a unicode glyph and not an icon font.

### Motion

**The One Moment Rule.** The build has exactly one authored animation: the mascot's `breathe` on his idle pose — 5.2s ease-in-out infinite, a 9px rise and a 1.5° tilt. Everything else that moves is a response to state: 140–160ms ease on background, colour and transform; 200ms on the accordion sign; 260ms `cubic-bezier(0.22, 1, 0.36, 1)` on the checkbox tick. `prefers-reduced-motion: reduce` is honoured globally — all animation and transition durations collapse to 0.001ms and smooth scrolling is disabled — so no new component needs to opt in, but nothing may bypass it either.

## Do's and Don'ts

### Do:
- **Do** separate sections with `--gap` and a rule, never with a box, a tint or a shadow.
- **Do** use exactly two rule weights: 1px `rule` for ordinary separation, 2px `ink` for a section that needs extra weight. Span the full content box at one width.
- **Do** ship `logo.png` and `linky.png` at their own colours, at their own scale, unmodified.
- **Do** measure any new text tint against the ground it will actually sit on, and clear 4.5:1 before it lands.
- **Do** put a filled action's label in `paper` on both grounds — one button serves the sky and the paper.
- **Do** set every number in Alegreya Sans with tabular figures.
- **Do** put a long row of items on a `.rail` rather than a clipped grid, and keep its items fixed-width so the next one peeks.
- **Do** keep the native element and forward `:focus-visible` by hand whenever a control is drawn rather than default.
- **Do** draw an indicator (plus/minus, tick, glyph) as an SVG or CSS stroke.

### Don't:
- **Don't** recolour, filter, knock out, tint or trace the wordmark or the mascot. Ever, on any ground.
- **Don't** use peach or spike-orange for anything that is not the creature or money — no orange buttons, no orange headings, no orange link underlines, no orange section tints.
- **Don't** put a shadow on an interface surface. The only shadows in this system are the wide, low-opacity ones beneath the two drawings.
- **Don't** introduce a third font family, and don't use monospace to signal "technical".
- **Don't** wrap a label in a filled bubble; tags are ruled. The single filled tag is `pill-ember`, reserved for what Stern flags.
- **Don't** draw an empty plate where an item has no image — omit the plate entirely.
- **Don't** invert the sky band into a saturated or dark surface; it is a tint, and ink on it is still ink.
- **Don't** add a second authored animation. New motion is state transition or it does not ship.
- **Don't** lighten `ink-3`, `on-sky-3`, `ember-ink` or a filled button's label without re-running the contrast numbers; each of those values replaced one that failed.
- **Don't** open a section, page or block with a kicker or eyebrow line above its heading. Headings start the block.
