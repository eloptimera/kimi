Prompt

# Recreate this site as a single HTML file: KIMI — GRIDO1 Racing Systems / Kimi Antonelli

You are an expert creative front-end developer. Produce a **single self-contained `index.html`**
that reproduces the project below **exactly** — same layout, copy, visuals, motion and interaction.
Pure HTML/CSS/JS in one file: no build step, no framework, no bundler. ES modules inline in a
`<script type="module">`. **three.js and Lenis are the only external code**, pulled through an
import map; the spring solver, the shared ticker, the scroll triggers, the text reveals, the
sticky stack, the circuit trace, the halftone, the chequered dissolves, the contour backdrops and
the loader are all written by hand. Hardcode every value given here as a fixed constant.

Where this document quotes source verbatim it is the project's own TypeScript — **strip the type
annotations and use it as it stands**. Every number in it is the shipped default. Nothing in it is
a suggestion.

## What it is

A one-page driver site for **Kimi Antonelli**, driver_012 of *GRIDO1 Racing Systems*, in his rookie
Mercedes-AMG F1 season. A light art-directed sheet: one near-white ground (`#f7fafb`), pure-black
copy, one cyan accent (`#02d2e3`), and near-black panels that come and go per section. Two faces —
**Oswald** (condensed display, bold and uppercase, for the name, the mastheads, the stat figures) and
**Space Grotesk** (everything conversational — nav, meta rows, panel copy, always uppercase).

Five blocks, and the first three are a **stack**: each pins at the top of the viewport and the next
one comes out over it, the covered one receding — scaling to 0.9 and darkening to 55% black —
rather than scrolling away. The timeline is the last layer, so it covers but is never covered, and
the page returns to ordinary flow under it.

1. **Hero** — the masthead, the driver's name at 96px, the meta rows, two bracket-cornered panels
   and a footer row, laid over a full-bleed WebGL scene: a **depth-parallax photograph of the
   driver** with a **Mercedes helmet worn over it**. The page opens behind a loading veil — a
   helmet silhouette filling from the top and a 4px meter along the foot — that lifts only when
   the scene has compiled. Then the helmet **burns away** crown-to-chin with a cyan glowing front,
   and from there it exists only where the cursor has just been: the pointer's recent path is a
   liquid-edged mask that reveals the gold-and-carbon shell (and, on the backdrop behind it, a
   grey band-striped shadow of the same shape), a faint wireframe wave scans the invisible helmet
   every 3.1s, the portrait relights toward the cursor off a normal map, and animated contour
   lines roll across the whole block behind everything.
2. **The season so far** — the first dark surface. The seam with the hero is a **chequered flag
   coming apart**: the light ground carries into the top of the dark block as solid rows, breaks
   into a chequerboard and burns off as you scroll. Behind the copy, a 2560×1440 instrument-panel
   map of the circuit: an 8,004-dot halftone landmass, dashed grid axes that crawl, a hub with three
   rings and a slow ping, and the designer's own filled track ribbon. When the block arrives the
   circuit **fills from the chequered flag, clockwise, in one 6-second lap** — a cyan line with an
   additive glow and a white filament at its hot head, braking through the corners and running away
   down the straights — lighting four turn markers as it passes them, and cooling to a plain closed
   lap when it rests. After that the cursor becomes a **reticle** over the map: two arms along its
   own lattice row and column, dots squaring up into a chequer wherever they cross.
3. **From karts to F1** — the career timeline: seven photographs in stepped-corner plates on a
   near-black ground, stacked with no gap, a rail down the middle with a white progress thread and
   a square marker that turns five times over the block, three parallax layers per row, years that
   assemble letter by letter and then settle back to 40%, and a hover that dims every other row.
4. **From the paddock** — back to light: a 96px masthead, the race report, a chamfered dark button,
   the portrait bleeding off both ends of the block and melting into a dark band that carries the
   five-round calendar strip with its crawling dashed connectors, its live-round bracket and pulse.
   The same contour field as the hero rolls behind it, drawn on a canvas by marching squares.
5. **Keep pushing forward** — the sign-off: a cyan page edge with a near-black panel inset 16 inside
   it, the same contours in white at 10%, the helmet-and-suit figure standing off the foot of the
   block and riding back into place as the page bottoms out, the nav column resolving letter by
   letter, and the legal row along the foot.

Everything that moves is a spring (react-spring's damped spring: `tension`, `friction`, `mass 1`).
Nothing on the page is a CSS keyframe; the only CSS transitions are hover colour, the plates' inset
and the button floods.

## Page shell & libraries

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.185.0/examples/jsm/",
    "lenis": "https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.mjs"
  }
}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
```

From `three/addons/` you need `loaders/GLTFLoader.js`, `loaders/DRACOLoader.js`,
`loaders/RGBELoader.js` and `utils/BufferGeometryUtils.js` (`mergeGeometries`). **The helmet
model is Draco-compressed** — it will not parse without a `DRACOLoader`, whose decoder path is
`https://cdn.jsdelivr.net/npm/three@0.185.0/examples/jsm/libs/draco/gltf/`. The studio HDR is
loaded with `RGBELoader` and prefiltered through a `PMREMGenerator`.

`<html lang="en">`, `<body>` in Space Grotesk. `history.scrollRestoration = "manual"` and
`window.scrollTo(0, 0)` before anything else — the page opens behind a veil and always starts at
the top.

### Tokens — the whole palette and type scale

Three tiers, exactly as the project has them. Tier 1 is the only place a literal appears.

```css
:root {
  --raw-color-ice-50: #f7fafb;        /* frame fill */
  --raw-color-ice-100: #ebeef1;       /* backdrop contour lines */
  --raw-color-ice-200: #dfe5e9;       /* hairlines & dividers */
  --raw-color-steel-400: #b6c1c8;     /* muted copy on dark */
  --raw-color-ink-950: #090a0b;       /* all body copy */
  --raw-color-ink-900: #0e0f14;       /* "view profile" panel fill */
  --raw-color-ink-800: #1b1d24;
  --raw-color-ink-700: #2a2d36;
  --raw-color-ink-alpha-35: rgb(9 10 11 / 0.35);   /* driver_012, 01:26 */
  --raw-color-slate-500: #7a7a7a;     /* season map: the halftone */
  --raw-color-slate-600: #4d4d4d;     /* season map: grid lines, inner ring */
  --raw-color-slate-900: #1e1e1e;     /* season map: the two outer rings */
  --raw-color-cyan-400: #02d2e3;      /* accent */
  --raw-color-cyan-alpha-25: rgb(2 210 227 / 0.25);
  --raw-color-stone-600: #535450;     /* timeline: plate outline */
  --raw-color-white-alpha-10: rgb(255 255 255 / 0.1);  /* timeline plate fill; footer contours */
  --raw-color-white-alpha-20: rgb(255 255 255 / 0.2);  /* timeline: the rail */
  --raw-color-ink-alpha-08: rgb(9 10 11 / 0.08);       /* paddock: the contour lines */
  --raw-color-white-alpha-40: rgb(255 255 255 / 0.4);  /* footer: the copyright */
  --raw-color-white: #ffffff;
  --raw-color-orange-500: #ff6b00;    /* error/warning only — never on the page */

  --raw-font-size-96: 6rem;      /* "kimi antonelli" */
  --raw-font-size-70: 4.375rem;  /* the name on phones */
  --raw-font-size-52: 3.25rem;   /* the headline below 1024 */
  --raw-font-size-38: 2.375rem;  /* stat figures */
  --raw-font-size-20: 1.25rem;   /* "view profile" */
  --raw-font-size-18: 1.125rem;  /* driver meta rows */
  --raw-font-size-16: 1rem;      /* nav, "[ Garage → ]" */
  --raw-font-size-14: 0.875rem;  /* panel body, "watch trailer", socials */
  --raw-font-size-12: 0.75rem;   /* panel eyebrows, stat labels */
  --raw-font-size-55: 3.4375rem; /* "the season so far" */
  --raw-font-size-36: 2.25rem;   /* timeline years */

  --raw-leading-95: 0.95;   /* headline */
  --raw-leading-90: 0.9;    /* every other uppercase run */
  --raw-leading-72: 0.72;   /* cap-height text-box trim */
  --raw-leading-110: 1.1;   /* floor for clipped text reveals */
  --raw-tracking-stat: -0.08em;
  --raw-tracking-label: -0.04em;
  --raw-tracking-eyebrow: -0.02em;

  --raw-radius-16: 1rem; --raw-radius-48: 3rem; --raw-radius-100: 6.25rem;
  --raw-duration-fast: 150ms; --raw-duration-normal: 250ms; --raw-duration-slow: 700ms;
  --raw-edge-fade-share: 10%; --raw-edge-fade-length: 6rem;

  /* Tier 2 — roles */
  --background: var(--raw-color-ice-50);
  --foreground: var(--raw-color-ink-950);
  --foreground-muted: var(--raw-color-ink-alpha-35);
  --surface-dark: var(--raw-color-ink-900);
  --surface-dark-raised: var(--raw-color-ink-800);
  --surface-black: var(--raw-color-ink-950);
  --surface-muted: var(--raw-color-ice-100);
  --surface-soft: var(--raw-color-ice-200);
  --foreground-on-dark: var(--raw-color-white);
  --foreground-on-dark-muted: var(--raw-color-steel-400);
  --foreground-on-dark-faint: var(--raw-color-white-alpha-40);
  --border-muted: var(--raw-color-ice-200);
  --border-on-dark: var(--raw-color-ink-700);
  --map-dot: var(--raw-color-slate-500);
  --map-grid: var(--raw-color-slate-600);
  --map-grid-ghost: var(--raw-color-slate-900);
  --map-mark: var(--raw-color-ice-50);
  --timeline-outline: var(--raw-color-stone-600);
  --timeline-fill: var(--raw-color-white-alpha-10);
  --timeline-rail: var(--raw-color-white-alpha-20);
  --paddock-contour: var(--raw-color-ink-alpha-08);
  --footer-contour: var(--raw-color-white-alpha-10);
  --accent: var(--raw-color-cyan-400);
  --accent-muted: var(--raw-color-cyan-alpha-25);
  --type-impact: var(--raw-font-size-96); --type-display-lg: var(--raw-font-size-70);
  --type-display: var(--raw-font-size-52); --type-heading: var(--raw-font-size-38);
  --type-title: var(--raw-font-size-20); --type-lead: var(--raw-font-size-18);
  --type-label: var(--raw-font-size-16); --type-body: var(--raw-font-size-14);
  --type-eyebrow: var(--raw-font-size-12); --type-display-sm: var(--raw-font-size-55);
  --type-year: var(--raw-font-size-36);
  --leading-headline: 0.95; --leading-flat: 0.9; --leading-cap: 0.72; --leading-display: 1.1;
  --duration-fast: 150ms; --duration-normal: 250ms; --duration-plate: 700ms;
  --ease-entrance: cubic-bezier(0.2, 0, 0, 1);
  --ease-plate: cubic-bezier(0.33, 0, 0, 1);
  --font-sans: "Space Grotesk", system-ui, sans-serif;
  --font-display: "Oswald", Impact, sans-serif;
}
body { background: var(--background); color: var(--foreground); min-height: 100lvh; margin: 0; }
```

There is **no dark-mode override**: the theme is fixed and each block chooses its own surface.

### The root font-size bands

The hero and the season block are measured in `rem`; the root scales with the viewport in bands so
a rem is one design pixel of the frame the band was drawn at. **Below 1280 the root holds at 16px**
and the layouts adapt by breakpoint rather than by scale.

```css
html { font-size: 16px; }
@media (max-width: 1920px) { html { font-size: 0.833333vw; } }   /* 16·100/1920 */
@media (max-width: 1440px) { html { font-size: 1.111111vw; } }   /* 16·100/1440 */
@media (max-width: 1279px) { html { font-size: 16px; } }
```

Above 1920 keep scaling up: `font-size = 16 * innerWidth / 1920` px, written to `<html>` on resize.

**The 1441–1920 band is based on 1920, but the blocks were drawn at 1440**, so inside it the hero
and the season block multiply their type back up by exactly `1920 / 1440`:

```css
@media (min-width: 1441px) and (max-width: 1920px) {
  [data-hero]   { --hero-base: calc(1920 / 1440);
    --type-impact: calc(6rem * var(--hero-base)); --type-display-lg: calc(4.375rem * var(--hero-base));
    --type-display: calc(3.25rem * var(--hero-base)); --type-heading: calc(2.375rem * var(--hero-base));
    --type-title: calc(1.25rem * var(--hero-base)); --type-lead: calc(1.125rem * var(--hero-base));
    --type-label: calc(1rem * var(--hero-base)); --type-body: calc(0.875rem * var(--hero-base));
    --type-eyebrow: calc(0.75rem * var(--hero-base)); }
  [data-hero] [data-hero-panels] { width: calc(13.625rem * var(--hero-base, 1)); }
  [data-hero] [data-hero-stats]  { width: calc(10.75rem * var(--hero-base, 1)); }
  [data-hero] [data-hero-map]    { height: calc(3.125rem * var(--hero-base, 1)); width: calc(4.875rem * var(--hero-base, 1)); }
  [data-season] { --season-base: calc(1920 / 1440);
    --type-display-sm: calc(3.4375rem * var(--season-base)); --type-lead: calc(1.125rem * var(--season-base));
    --type-body: calc(0.875rem * var(--season-base)); --type-eyebrow: calc(0.75rem * var(--season-base)); }
}
```

The timeline, the paddock and the footer measure themselves in **`cqw`** off their own `container-type:
inline-size` section — one design pixel is `(value / 1440 * 100).toFixed(4)cqw` — so they are the 1440
frame at every width, and in that band the two schemes come out pixel-identical.

Breakpoints, Tailwind's: `sm` 640, `md` 768, `lg` 1024, `xl` 1280. One custom one, **`short`**:
`@media (max-height: 500px)` — landscape phones, where the hero's stack has to tighten.

### The motion engine you write

**One rAF loop.** A reference-counted ticker: subscribers register `(callback, getFramerate)`; each
frame the loop walks a snapshot of the set and calls a subscriber only when
`time - last > getFramerate()` (so a framerate of `0` runs every tick and `1000/60 - 2` gives 60 on
a 60Hz screen and every second tick at 120). It starts on the first subscriber and cancels on the
last. **Lenis runs from this loop, registered first**, so every scroll reader on the page sees this
frame's `scrollY`:

```js
import Lenis from "lenis";
const lenis = new Lenis({ smoothWheel: true });   // the project's own settings — default lerp, no syncTouch
subscribe((time) => lenis.raf(time), () => 0);
```

Under `prefers-reduced-motion: reduce` skip Lenis and let the platform scroll.

**The spring.** react-spring's solver, reproduced: state `{ value, velocity }`, stepped at 1ms
substeps up to a 64ms frame cap, `tension` and `friction` as given, mass 1, at rest when
`|velocity| < 0.01` and `|target - value| < 0.01` (0.001 for opacity-like ranges). Every animated
thing below is one of these driven toward a target, with a **delay before it starts** (`delayIn`).
Three "modes" the page uses:

- `always` — animates to `to` while enabled, back to `from` when not.
- `once` — plays in once per mount and never replays.
- `forward` — plays in when enabled; on the way back up the page (element top above the viewport
  top) it holds `to` rather than reversing. Implement as: track `scrolledDown` on scroll
  (`rect.top <= 0`), and when computing the target treat "forward and scrolledDown" as still active.

Spring configs used, by name, so you can bake them: `REVEAL {tension 90, friction 26}`,
`ROW/ITEM {170, 24}`, `SHEET {190, 26}`, `FIGURE {200, 24}`, `TYPE {210, 24}`, `YEAR {190, 24}`,
`COPY {110, 26}` / `{150, 24}`, `NAME {190, 24}`, `VEIL {70, 24}`, `CLEAR {140, 26}`,
`LABEL {110, 26}`, `PROGRESS (waiting) {10, 30}` / `(ready) {170, 26}`, `YEAR_SETTLE {32, 26}`,
`TRIGGER {140, 30}`. A config given as `{ duration, easing }` is a plain tween of that length.

**Text reveals (the "text engine").** A block of text is split into **words** or **letters**, each
in an `inline-block` span, and each unit runs its own spring from `*Out` to `*In` — the two
states are always `{ opacity: 0, y: "0.35em" }` → `{ opacity: 1, y: "0em" }` for words and
`{ opacity: 0, y: "0.3em" }` → `{ opacity: 1, y: "0em" }` for letters, `y` being a `translateY`. Unit
*i* starts at `delayIn + i * stagger` ms. The container is `display: flex; flex-wrap: wrap` with a
`column-gap` in `em` (default 0.3, and several places set it — noted where). `mode="forward"`
units play in when the block is on screen and hold. Keep a visually-hidden copy of the plain
string for assistive technology and mark the animated spans `aria-hidden`. **No `overflow` clip on
any of them** — the display leadings (0.95, 0.72) would shave descenders.

**Scroll triggers.** Two flavours, both reading the element's rect inside the ticker (framerate
10ms):

```js
// positions of a trigger element, all relative to the viewport
const poses = {
  top_top: bb.top, center_top: bb.top + bb.height / 2, bottom_top: bb.bottom,
  top_bottom: bb.top - vh, center_bottom: bb.top + bb.height / 2 - vh, bottom_bottom: bb.bottom - vh,
  top_center: bb.top - vh / 2, center_center: bb.top + bb.height / 2 - vh / 2, bottom_center: bb.bottom - vh / 2,
};
const scrollStart = poses[start], scrollEnd = poses[end];
const length = Math.abs(scrollStart - scrollEnd);
const progress = Math.min(Math.max(0, 1 - (scrollStart + length) / length), 1);
```

A **scrub** trigger interpolates `from`→`to` linearly by `progress` and hands the result to a spring
of `{ duration: 1 }` (i.e. it is applied immediately); a **toggle** snaps at `progress >= 1`. The
interpolation handles a bare number, a `"<number><unit>"` string, and a single transform function
`fn(<number><unit>)`. An `interpolatedProgress` spring (0–1) is also kept for readers that want the
smoothed value. Each trigger also runs an `IntersectionObserver`: it only computes while its element
is in view **plus ten more frames after it leaves** (that is the "loop in view" rule every canvas
on the page uses too).

An **in-view gate** (`useInView` with `once: true`) fires when the element enters the viewport
inset by a `rootMargin` — `0% 0% -25% 0%` for timeline rows, `0% 0% -20% 0%` for the calendar strip.

### The sticky stack

Wrap the first three blocks in a `position: relative; background: var(--surface-black)` container.
Each layer is `position: sticky; top: 0` with `z-index` 0 / 10, except the last (the timeline),
which is `position: relative; z-index: 20`. Inside each pinned layer: a `transform-origin: center`
inner wrapper holding the block, then a full-bleed `absolute inset-0` shade, `background: var(--surface-black); opacity: 0; pointer-events: none`.
A passive scroll listener (coalesced into one rAF) drives the recede — verbatim:

```ts
const RECEDE_SCALE = 0.9;
const RECEDE_SHADE = 0.55;
const phone = window.matchMedia("(max-width: 639px)");
const apply = () => {
  const view = window.innerHeight || 1;
  const shrink = phone.matches ? 0 : 1 - RECEDE_SCALE;      // no shrink on a phone, shade only
  for (const { inner, shade, next } of pinned) {
    // 0 while the next block is still a full screen away, 1 once it has taken the whole viewport.
    const p = Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / view));
    // No transform at rest — a scale(1) here makes the layer the containing block for the
    // hero's position:fixed loader, which then centres in the section instead of the viewport.
    inner.style.transform = p > 0 && shrink > 0 ? `scale(${1 - shrink * p})` : "";
    inner.style.willChange = p > 0 && shrink > 0 ? "transform" : "";
    shade.style.opacity = `${RECEDE_SHADE * p}`;
    inner.style.visibility = p >= 1 ? "hidden" : "visible";   // fully covered: stop painting the scene
  }
};
```

The transform lives on the inner wrapper, never on the sticky element — a transformed ancestor takes
`position: sticky` out of the viewport's frame of reference.


## 1 — The hero

`<section data-hero>` — `position: relative; isolation: isolate; min-height: 100lvh; overflow: hidden; background: var(--background)`.
Layers, bottom up: the scene canvas (`absolute inset-0 z-0; pointer-events: none`, full-bleed at
every width), a copy ramp (below `xl` only), the loading veil (`position: fixed`), and the content
column.

### Two arrangements

**From `xl` (1280) the frame's overlay layout**: the content column is
`min-height: 100lvh; display: flex; flex-direction: column; padding: 1.5rem` (`short:` 0.75rem
top/bottom; `sm` 2rem sides). Masthead on top; then a middle row `flex: 1; display: flex; align-items: center; justify-content: space-between` with the driver identity on the left (max width
26.0625rem, gap 6.0625rem between name block and meta rows) and the two panels on the right in a
13.625rem column; then the actions row on the foot. The portrait sits behind all of it, centred,
the scene sizing it to the whole canvas.

**Below `xl`** the scene stays full-bleed but the *subject* is fitted to a box the layout owns:
`absolute inset-0` (`margin: 0 -1.5rem`), and below `lg` only the **bottom 70%** of the section
(`max-sm` 64%). Inside it the fit box is `absolute inset-x-0 bottom-0; height: calc(100% - 4rem)`
(`md` `calc(100% - 2rem)`, below `lg` `100%`). The scene reads that box's rect every resize and
draws the portrait at the size and place the box gives it (see `fitSubjectToBox`). The content is a
column: masthead, identity (`order: 2`), panels (`order: 3`, **hidden below `sm`**), actions; from `md`
the identity and the panels sit opposite each other in one row (`display: flex; justify-content: space-between; gap: 2rem`). Column gaps: 2rem (`short:` 1rem, `md` 1.5rem, below `lg` 1rem, below `sm` 0.5rem).

**The ramp** (below `xl`, over the scene, under the copy, `z-index: 10`): `absolute inset-x-0 bottom-0; height: 22%`, six stops tracing an ease so it never shows where it began:

```css
background-image: linear-gradient(to bottom,
  color-mix(in srgb, var(--background) 0%, transparent) 0%,
  color-mix(in srgb, var(--background) 6%, transparent) 26%,
  color-mix(in srgb, var(--background) 20%, transparent) 46%,
  color-mix(in srgb, var(--background) 45%, transparent) 64%,
  color-mix(in srgb, var(--background) 74%, transparent) 80%,
  color-mix(in srgb, var(--background) 93%, transparent) 91%,
  var(--background) 100%);
```

Below `md` a second ramp under the figure box: `absolute inset-x-0; bottom: -13rem; height: 26rem; background: linear-gradient(to bottom, transparent, var(--background) 60%, var(--background))`.

### The masthead

`<header>` — `display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 30`.

- Logo: `grido1-logo.webp` (424×97) at `height: 1.5rem; width: auto`, linking to `/`, `aria-label="Grido1 Racing Systems"`.
- Nav (from `xl`, hidden below): `position: absolute; left: 50%; transform: translateX(-50%)` — pinned
  to the **page's** centre line, not between logo and garage link. `<ul>` with `gap: 4rem`; each link
  `font-size: var(--type-label); text-transform: uppercase; line-height: 0.9; color: var(--foreground)`,
  hover `color: var(--accent)` over `150ms cubic-bezier(0.2,0,0,1)`. Links, verbatim:
  `Driver` → `/driver`, `SEASON` → `/season`, `journal` → `/journal`, `next race` → `/next-race`,
  `store` → `/store`. (Casing is the design's; the uppercase look is CSS.)
- Right (from `xl`): `[ Garage → ]` → `/garage`, bold, same style — the brackets and arrow are
  `aria-hidden` spans: `"[ "`, then the label, then `" → ]"`.
- Below `xl`: a burger button (`padding: 0.5rem; margin-right: -0.5rem`) — two 1px lines 1.5rem wide,
  0.3125rem apart, `background: var(--foreground)`. It opens a **full-screen sheet** appended to
  `<body>` (never inside the transformed masthead — a transformed ancestor would pin a fixed sheet
  inside the header): `position: fixed; inset: 0; z-index: 50; background: var(--background); padding: 1.5rem 2rem; display: flex; flex-direction: column`, fading in with `SHEET {190, 26}`. Top row:
  the logo (closes on click) and a close button (two 1px lines rotated ±45°). Then a nav
  `flex: 1; justify-content: center` listing the five links **plus Garage**, `gap: 1rem` (`sm` 1.5rem),
  each `font-family: var(--font-display); font-weight: 700; font-size: var(--type-heading); text-transform: uppercase; line-height: 0.95` (`sm` `var(--type-display)`), hover accent — and each item
  rising in `{opacity 0, translateY(0.75rem)}` → `{1, 0}` with `ITEM {170, 24}` at
  `120 + index * 55` ms. Open: stop Lenis and lock scroll (`html { position: relative; overflow: hidden; height: 100% }`),
  focus the close button, close on `Escape`; close automatically if the viewport crosses 1280.

### The driver identity (left rail)

```
driver_012                      ← --type-label, uppercase, color --foreground-muted
KIMI                            ← h1, Oswald 700, --type-impact (96), uppercase, line-height 0.95
ANTONELLI
🇮🇹 ITALY                        ← meta rows: icon + --type-lead label, uppercase, line-height 0.9, gap 0.5rem
✦ ROOKIE SEASON_2026
✦ MERCEDES-AMG F1 TEAM
```

- The id is `position: absolute; left: 20.0625rem; top: 0.5625rem` beside the first name from `xl`;
  below that it is an eyebrow above the name with `margin-bottom: 1rem` (`short:` 0.25rem).
- The name is one `<h1>` holding `kimi antonelli`, revealed **word by word** (`wordStagger 110`,
  `REVEAL {90, 26}`, `mode once`, no overflow clip), `max-width: 6em; justify-content: flex-start; text-align: left`.
  Size: `var(--type-display-lg)` by default, `short:` `var(--type-heading)`, `md` `var(--type-impact)`,
  `lg` back to `var(--type-display-lg)` (the 1024–1279 band, where the root is pinned and the name
  ran into the figure), `xl` `var(--type-impact)`.
- Meta rows: `gap: 1rem` (`short:` 0.25rem) list. Icons at their intrinsic size in rem:
  `flag-italy.webp` 18×12 (`1.125rem × 0.75rem`, alt "Italy"), `icon-rookie.svg` 16×16 (`1rem`),
  `mercedes-logo.webp` 14×14 (`0.875rem`). Labels verbatim: `Italy`, `rookie season_2026`,
  `Mercedes-AMG F1 Team`.
- Entrance (all from the loader's handover, see below): the id fades (`opacity 0→1`) at `+180`;
  the name's words at `+180`; each meta row rises `{0, translateY(0.75rem)} → {1, 0}` at
  `180 + 260 + index * 130`.

### The two panels (right rail)

A `<div data-hero-panels>` column, `gap: 2rem`, width `13.625rem` from `md` (`sm` a wrapping row).
Each is a **bracket panel**: `padding: 1rem` (`sm` `1rem 1.375rem 1.1875rem`), no border, no fill —
four 10×10 corner strokes, one path drawn four times: `viewBox="0 0 10.5 10.5"`, `M0 0.5H10V10.5`,
`stroke: currentColor` (`--foreground`), each `0.625rem` square, absolutely at the four corners:
top-right as drawn, top-left `scaleX(-1)`, bottom-left `scale(-1)`, bottom-right `scaleY(-1)`.

**Panel 1 — next race.** Eyebrow `next race` (`--type-eyebrow`, weight 500, uppercase,
line-height 0.9, tracking −0.02em, `color: var(--accent)`). Then a `<dl>` (`--type-body`, uppercase,
line-height 0.9, gap 0.375rem, `margin-top: 1rem`): `<dt>` bold `belgian gp`, `<dd>` `spa-francorchamps`,
`<dd><time datetime="2026-07-27">27 jul 2026</time></dd>`. Then `circuit-spa.webp` (312×199,
alt "Spa-Francorchamps circuit layout") at `4.375rem × 6.25rem` object-contain right (`sm`
`3.125rem × 4.875rem`, left; `md` `margin-top: 1.75rem`, under the list). Below `md` the list and the
map sit side by side (`justify-content: space-between`).

**Panel 2 — season stats.** Eyebrow `Season stats`. A `<dl data-hero-stats>` `margin-top: 1.5rem`
three-up (`grid-template-columns: repeat(3, 1fr); gap: 1rem`; `sm` a `10.75rem` flex row
`justify-content: space-between`, cells centred). Each: `<dt>` `--type-eyebrow`, uppercase,
tracking −0.04em, `white-space: nowrap` — `Races`, `Podiums`, `Points`; `<dd>` Oswald 500,
`--type-heading` (38), line-height 0.72, tracking −0.08em — `12`, `3`, `118`, revealed **letter by
letter** (`letterStagger 26`, `FIGURE {200, 24}`, `delayIn index * 90`, mode forward).

The whole panel column rises `{0, translateY(1.25rem)} → {1, 0}` with `REVEAL` at `+900`.

### The actions row (foot)

`margin-top: 0.5rem` (`sm` 0); a column of full-width items `gap: 1rem` below `sm`; from `sm` a
`grid-template-columns: 1fr auto 1fr; align-items: end; gap: 2rem` row.

- **Trailer** (hidden below `sm`): `play-button.svg` (32×32) at `2rem` + two lines `--type-body`
  uppercase line-height 0.9, gap 0.375rem: `watch trailer` (weight 500, hover accent) over `01:26`
  (`--foreground-muted`). Links `/trailer`.
- **Profile CTA** — `view profile` → `/driver/kimi-antonelli`. A `220×50` frame measured in **em
  off its own 20px label**: `height: 2.5em; width: 11em` (`sm`; full width and `height: 3.5rem`
  below), `font-size: var(--type-title)`, centred content `gap: 1.6em`. The frame is an inline SVG
  `viewBox="0 0 220 50" preserveAspectRatio="none"`, `absolute inset-0`:

  ```
  body:      M220 42L212.932 50H0V0H220V42Z   fill #0E0F14
  flood:     same path, fill var(--accent), transform-origin left, scaleX(0) → scaleX(1) on hover (250ms, --ease-plate)
  ring:      same path, fill none, stroke var(--accent), stroke-opacity 0.25
  brackets:  M205 49.5H213L219.5 42V36 · M212 0.5H219.5V7 · M8 0.5H0.5V7 · M7.5 49.5H0.5V42.5   stroke var(--accent)
  ```

  The flood sits under the brackets. Label: uppercase, line-height 0.9, `color: var(--accent)`,
  turning `var(--surface-black)` on hover (250ms). Arrow: `viewBox="0 0 13.7071 10.7071"`,
  `M0 5.35355H13M8 10.3536L13 5.35355L8 0.353553`, stroke accent (→ black on hover),
  `0.65em × 0.5em`, `translateX(0.25rem)` on hover (150ms).
- **Socials** (hidden below `sm`): `inst` → instagram.com, `x` → x.com, `youtube` → youtube.com;
  `--type-body` uppercase, `gap: 2rem` (`xl` 3.6875rem), right-aligned, hover accent.

The row rises with `REVEAL` at `+1500`. The masthead rises at `+0`.

### The loading veil

`position: fixed; inset: 0; z-index: 50; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--background)`, `role="status"`, `aria-label` "Loading Grido1 Racing Systems" → "Loaded".
Centre: a `7.2rem × 8.5rem` box **masked to the helmet silhouette** (`helmet-mask.png`, 434×512,
`mask-size: contain; mask-repeat: no-repeat; mask-position: center`) holding a faint shell
(`background: var(--foreground)` at 12% opacity) and over it a solid sheet
`background: var(--foreground); transform-origin: top` whose `scaleY` **is the progress**. Under it,
`margin-top: 1.75rem`, the name `kimi antonelli` — `--type-lead`, uppercase, line-height 0.9,
`letter-spacing: 0.18em` — rising in `{0, translateY(0.6rem)} → {1, 0}` with `{110, 26}` at
`+260ms`. Along the foot a `4px` meter: track `background: var(--border-muted)`, fill
`background: var(--foreground); transform-origin: left; scaleX = progress`.

**Progress is not measured** — it creeps to **0.7** on a soft spring (`{tension 10, friction 30}`,
so a warm load resolves with the meter about a third across) and completes to **1** on a stiff one
(`{170, 26}`) the moment the scene reports `ready`. Both the helmet fill and the meter read the
same value.

**The exit runs in three beats**: on `ready` the veil's own content clears (opacity 1→0 and
`translateY(-0.75rem)`, `{140, 26}`; the meter fades with it) — then **430 + 240 ms** later the
veil lifts (`opacity 1 → 0`, `{70, 24}`) **and the page's entrance begins** (this is the handover
every `+N` above is measured from; the scene's `beginRise()` is called on the same tick). Remove
the veil element only when its **rendered** opacity is `<= 0.004` (poll `getComputedStyle` each
frame; 3000ms timeout as a backstop for a backgrounded tab) — never on a timer. While it is up,
`pointer-events: auto`; from `ready`, `none`.


## 2 — The hero scene (WebGL)

One canvas, one context, plain three.js. The wrapper below is described; the scene itself is
**quoted verbatim** after it (the project's `scene.ts`, TypeScript — strip the types). Two things to
substitute when you paste it: `ASSETS` becomes `ASSET_BASE_URL + "/hero/scene"`, and the Draco
decoder path becomes the CDN path given in the shell section. `readToken()` resolves a CSS custom
property through a probe element's computed `color` — keep it; the scene takes every colour from
the tokens (`--accent` for the burn, `--foreground` for the outline, `--background` and
`--surface-soft` for the backdrop).

### Where it lives, and what drives it

- The canvas fills the hero (`absolute inset-0; transform: translateZ(0); backface-visibility: hidden; will-change: transform`), `<canvas class="size-full" aria-hidden>`.
- **Tier** — decided by `getSceneTier()` (verbatim below) at construction, and **re-read** on every
  change of the container's *width* or of the `(hover: none) and (pointer: coarse)` query
  (`scene.retune()`). Height-only changes on a coarse pointer are ignored (the iOS URL bar). The
  container is observed with a `ResizeObserver`, coalesced into one rAF.
- **The render loop** rides the shared ticker at the tier's `frameInterval`, **only while the hero is
  in view (plus ten frames), the tab is visible, and `scrollY <= innerHeight * 1.15`** — the hero is
  sticky, so its rect never leaves the viewport; the scroll read is the gate.
- **Pointer**: a `pointermove` listener on `window`, bound only when `tier.pointerEnabled`,
  handing `scene.setPointer((clientX / innerWidth) * 2 - 1, (clientY / innerHeight) * 2 - 1)`.
  Re-bound/unbound whenever the tier changes.
- **Ready → loader**: `scene.onReady` fires after every texture is uploaded, every program compiled
  and one throwaway frame rendered. That is the veil's `ready`. `scene.beginRise()` is called when
  the veil starts to lift.
- **`applyFit`**, run at mount, on every resize/retune, and whenever params change — it re-fits the
  subject to the layout's box and applies the width-keyed overrides, in this order (later wins):

```ts
const s = section.getBoundingClientRect();
const b = box.getBoundingClientRect();           // the fit box — only when it is displayed (offsetParent !== null), i.e. below xl
scene.setParams({
  ...DEFAULT_PARAMS,
  ...fitSubjectToBox(DEFAULT_PARAMS, { top: b.top - s.top, height: b.height }, container.clientHeight),
  // Every touch width, not just phones: the parked cursor reveal never moves and reads as a blob.
  ...(window.matchMedia("(max-width: 1023px)").matches ? { bgRevealOpacity: 0 } : null),
  // Where there is no pointer at all the reveal is driven for the reader by the idle sweep.
  ...(window.matchMedia("(hover: none)").matches ? { autoSweepAmount: 0.76 } : null),
  // The brush is sized for the screen: on a phone a wider brush reveals the head as one mass.
  ...(window.matchMedia("(max-width: 639px)").matches ? { sweepRadius: 0.95, sweepWarp: 0.18, autoSweepAmount: 0.55 } : null),
  // Last, because it overrides the two above: the mobile tier has no reveal after the burn at all.
  ...(scene.tier.reveal ? null : { autoSweepAmount: 0 }),
});
```

From `xl` the box is `display: none`, so `fitSubjectToBox` is skipped and the subject fills the
canvas — the composition the frame was signed off at.

### What you will see, in order

1. Under the veil: load `studio-light.hdr` (PMREM environment), the four portrait maps
   (`person-diffuse` sRGB, `person-depth`, `person-alpha`, `person-normal`, all mipmapped), the
   Draco `helmet3.glb` (its own baked base colour / normal / metallic-roughness, kept as the
   material it arrives with, `FrontSide`, `transparent`, `depthWrite false`, `envMapIntensity 1.3`),
   and `noise.webp` (repeat-wrapped). Build the head plane, the helmet with its reveal mask injected
   through `onBeforeCompile`, the merged **wireframe** of the helmet's own geometry on the same pivot,
   and the full-frustum **backdrop** plane at z −3. `reveal = 1` from the first frame. Prewarm:
   `initTexture` everything, `compileAsync`, one render. Then `ready`.
2. The veil lifts and the composition **rises 200 CSS pixels into place over 2s** (ease-out quad),
   the helmet whole and unmasked.
3. From `ready`, a 4-second entrance clock: at 0.14 of it the helmet starts to **burn** — a
   per-pixel threshold that mixes screen height (55%) with the noise texture (45%), swept by a
   `smoothstep(0.14, 1, intro)` front, `uBurnSoft 0.02` either side, and a glow of
   `4·intact·(1−intact)` in the accent at strength 4 along the front. The wireframe wave fades **in
   on the burn's own curve**, so the shell and the outline never coexist.
4. From there the helmet is drawn only inside `max(cursorTrail, sweepTrail)`: a chain of capsules
   along the last N smoothed pointer positions (N = the tier's `trailSamples`), each link weighted
   `pow(1 - i/span, taper)`, thresholded hard at `0.08 ± 0.005`, the sample point displaced by two
   scrolling noise fetches (`revealWarp 1.29`, scale 2.9) so the edge crawls. The **pace** — eased
   pointer speed, attack 0.09 / release 0.205 against a peak of 0.029 NDC per frame — scales the
   brush (`0.46`, idle `×0.28`) and the taper (`1.9 × 1.6 idle … 1.25 fast`) and **gates the whole
   thing** (`smoothstep(0.06, 0.21, pace)`): a resting cursor shows no helmet. The backdrop draws the
   same mask as two alternating greys (`0.62` / `0.44` linear, banded by the contour field's parity).
5. The helmet **pitches 2.5° and yaws 2.1°** at the window edges, linearly, through two cascaded
   filters of `pointerLerp 0.17` (so it leans rather than snaps), about its own centre — the
   `helmetPivot` carries the worn offset `(0, −0.56, 0.35)`; the whole subject slides
   `subjectParallax 0.02` with the cursor; the portrait's UVs shift by its depth map
   (`headParallax 0.005`) and it is relit by its normal map toward the cursor (`headRelight 0.32`).
6. The wireframe wave: a gaussian band of width 0.15 travelling crown-to-chin over 3.1s, one spawned
   every 1.2s, peak opacity 0.09, stroke lifted 64% from `--foreground` toward white.
7. The backdrop: contours of an analytic four-sine field (`bgLineScale 3.8`, 2.5 bands, thickness
   1.4 in `fwidth` units, opacity 0.85, rolled by two crossed sine displacements of amplitude 0.37 at
   speed 1.66), in `--surface-soft` on `--background`.
8. On a touch device the pointer is parked at `STATIC_POSE (0.3, 0.1)`; on the mobile tier the
   reveal is off after the burn (the helmet stays dissolved), the wireframe is not drawn, DPR is 1
   and the loop runs at 60. Reduced motion: play the entrance, then freeze on the settled frame.

### The tier module — verbatim


```ts
/**
 * Device tier for the hero scene — decided once at construction, read by
 * everything (DPR, frame budget, pointer, antialias, mask cost) so values can
 * never drift apart. Feature-local port of the canonical device module from
 * the optimize-3d-scene skill (§2).
 *
 * Read at construction, and re-read when the container's **width** changes or
 * the pointer class flips — a device does not change tier mid-session, but a
 * window dragged across a breakpoint and a device emulator switched off both
 * do, and the scene has to follow (`HeroScene.retune`). What is baked into
 * shader source or the GL context (`trailSamples`, `antialias`) stays as
 * built; everything else is live.
 */

export type TierName = "mobile" | "tablet" | "desktop";

export interface SceneTier {
  name: TierName;
  mobile: boolean;
  /**
   * Touch-class input. Distinct from `mobile`, which a merely-narrow desktop
   * window also satisfies — this one is about the device, and it is what
   * gates the resize handler (see the iOS URL-bar note in the skill, §13).
   */
  coarsePointer: boolean;
  reducedMotion: boolean;
  /** Renderer pixel-ratio cap. */
  maxDpr: number;
  /** Minimum ms between renders for the shared ticker (0 = every tick). */
  frameInterval: number;
  /** Whether the cursor drives the reveal at all. */
  pointerEnabled: boolean;
  antialias: boolean;
  /**
   * Length of the reveal's pointer history, and therefore the per-fragment
   * loop bound. The single biggest fill-rate lever in this scene: the mask is
   * evaluated over a full-screen backdrop, twice (cursor + sweep), so every
   * sample is paid for across the frame. Shortening it on a phone costs a
   * slightly stubbier trail and nothing else.
   */
  trailSamples: number;
  /**
   * Whether the scanning wireframe is drawn. The helmet is 37.8k triangles,
   * so its wireframe is 113k line segments per frame — over a helmet some
   * 300px wide on a phone, most of them sub-pixel. That is the pathological
   * case for a tile-based mobile GPU (binning dominates), for a wave that
   * peaks at 9% opacity and reads as a grey shimmer at that size.
   */
  outline: boolean;
  /**
   * Whether the liquid reveal runs at all after the entrance — the cursor
   * trail and the idle sweep that stands in for it on touch. Off on a phone
   * (2026-09-08): the sweep is the one thing in the frame that never rests,
   * and its warp is two noise fetches plus up to 18 capsule distances per
   * fragment of the helmet, every frame, for a stroke nobody asked for. The
   * entrance burn is untouched; after it the helmet has dissolved and the
   * portrait stands on its own.
   */
  reveal: boolean;
  /**
   * Play the entrance, then stop drawing on a settled frame. WebGL keeps the
   * last frame on the canvas, so a frozen scene costs zero.
   */
  freeze: boolean;
}

/**
 * The cap for touch tiers, as the shared ticker measures it.
 *
 * The ticker skips while `time - last <= framerate`, so a budget of exactly
 * 1000/60 lets a 60Hz screen through every tick (16.67 is not <= 16.67 minus
 * float noise… until it is), and on a 120Hz screen the first tick past it
 * lands at 25ms — 40fps, not 60. Two milliseconds under puts 60Hz on every
 * tick and 120Hz on every second one, which is what "60" is meant to say.
 */
const CAP_60 = 1000 / 60 - 2;

/**
 * The nearest web-exposed proxy for iOS Low Power Mode, which has no API.
 * Save-Data is an explicit request to spend less; 2GB or under is the class of
 * device that cannot hold a 60fps fragment loop anyway.
 */
const isEnergySaver = (): boolean => {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  return Boolean(nav.connection?.saveData) || (nav.deviceMemory ?? 8) <= 2;
};

export const getSceneTier = (): SceneTier => {
  // The coarse-pointer clause is what catches tablets and large phones; width
  // alone misses an iPad in landscape.
  const coarse = window.matchMedia("(hover: none) and (pointer: coarse)")
    .matches;
  const width = window.innerWidth;
  const name: TierName =
    width < 768 || (coarse && width < 1024)
      ? "mobile"
      : coarse || width < 1280
        ? "tablet"
        : "desktop";

  const mobile = name === "mobile";
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const saver = isEnergySaver();

  return {
    name,
    mobile,
    coarsePointer: coarse,
    reducedMotion,
    // 1 → 1.25 → 1.5. Held at 1 on a phone rather than the skill's 0.85: this
    // scene draws hairline backdrop contours, and sub-1.0 aliases them
    // visibly (§6's hard-edged-geometry exception). Not above 1.5 anywhere —
    // a 3× phone at its native ratio would draw nine times the fragments of
    // this for no difference a reader can see.
    maxDpr: mobile ? 1 : name === "tablet" ? 1.25 : 1.5,
    // Touch tiers cap at 60, desktop runs every tick. This was 1000/30 on a
    // phone (26fps as the ticker measures it) and 1000/45 on a tablet, on the
    // skill's argument that a slowly evolving field cannot show a halved
    // frame rate — but nothing in this scene evolves slowly. The idle sweep
    // is a 0.45s stroke, the entrance is a burn, and the helmet tilts with
    // the pointer; at 26fps every one of them stepped, and it was reported
    // as lag from a device emulator on a desktop GPU, where fill cannot have
    // been the cost. The frame is paid for elsewhere: the backdrop's reveal
    // loop no longer runs where it is invisible, and the wireframe is off.
    frameInterval: name === "desktop" ? 0 : CAP_60,
    pointerEnabled: !coarse && !reducedMotion,
    antialias: name === "desktop",
    trailSamples: mobile ? 28 : name === "tablet" ? 44 : 72,
    outline: !mobile,
    reveal: !mobile,
    freeze: reducedMotion || (mobile && saver),
  };
};
```

### The scene — `scene.ts`, verbatim (2,050 lines; every shader, every default, the whole class)

Imports it needs: `ACESFilmicToneMapping, Box3, BufferGeometry, Color, FrontSide, Group, LinearMipmapLinearFilter, Matrix4, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PMREMGenerator, RepeatWrapping, Scene, ShaderMaterial, SRGBColorSpace, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer` from `three`; `DRACOLoader`, `GLTFLoader`, `RGBELoader` and `mergeGeometries` from the addons. `getSceneTier` is the module above.

```ts
const ASSETS = "/assets/hero/scene";

/**
 * Resolves a Tier-2 design token to a concrete colour. A custom property read
 * straight off `:root` can still be an unsubstituted `var()` chain, so the
 * value is bounced through a probe element's computed `color` instead.
 */
const readToken = (token: string): string => {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${token})`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
};

/** World height of the head plane — everything else is sized relative to it. */
const HEAD_HEIGHT = 5.4;

const DEG = Math.PI / 180;

/**
 * The helmet's cursor rotation, one axis at a time: the angle it reaches when
 * the cursor is at the **edge of the window** (`ampDeg`, signed — the sign is
 * the direction), and how it gets there (`curve`).
 *
 * The amplitude is the whole instrument. Until 2026-09-08 each axis was a gain
 * on the pointer, and the pitch had a cap on its *input* on top (`helmetRotX`
 * × `tiltLimit`); the angle a reader actually saw was the product of the two,
 * in radians of input, and the yaw had no ceiling at all. Nobody could say
 * how far the helmet turned without doing the sum, and once the gain sat at
 * its slider's floor there was no way to ask for more. Now the slider *is*
 * the answer: the degrees at the edge of the sweep, per axis.
 *
 * `curve` is the shape between the centre and that edge, and it is
 * **normalised** — `tanh(curve·v) / tanh(curve)` — so it reaches exactly the
 * amplitude at `|v| = 1` whatever its value: 0 is a straight line, higher
 * saturates earlier, which keeps the response steep through the middle of the
 * frame (where a reader's pointer actually lives) and eases it off toward the
 * edges. `tanh` rather than a clamp because a clamp leaves a corner where the
 * turn stops dead, and that corner sits exactly where a cursor crossing the
 * frame is moving fastest — the helmet would visibly freeze mid-sweep and then
 * start again. This has no such point: the response only ever thins.
 *
 * Sizing the pitch needs the crown's **on-screen** travel, which is not the
 * obvious number. Tilting about a horizontal axis moves the crown almost
 * entirely in **z**: `y' = h·cos(theta)` changes only in theta squared, while
 * `z' = h·sin(theta)` is first-order. So `h·sin(theta)` — the tempting figure —
 * is the crown's *depth* swing, and what a reader sees is the much smaller
 * second-order drop plus what perspective makes of the depth. Measured
 * properly (project the crown through the real camera), visible travel across
 * a full cursor sweep at 1440x900 comes to about **2.4px per degree** of
 * amplitude, near enough linear over the range the slider offers: 4.4° is
 * 10.7px, 7.2° is 17.5px, 8.6° is 20.9px. For scale, `subjectParallax` moves
 * the whole composition 8.8px over that same sweep.
 */
const swing = (v: number, ampDeg: number, curve: number) => {
  const amp = ampDeg * DEG;
  if (curve < 1e-3) return amp * v;
  return (amp * Math.tanh(curve * v)) / Math.tanh(curve);
};

/**
 * Where the helmet's own centre sits once it is worn, relative to the group
 * that carries the composition's placement. Dropped so the visor opening
 * frames the eyes (photo eye-line ~ y -0.4) and pushed forward so it sits in
 * front of the portrait plane rather than through it.
 */
const HELMET_WORN_OFFSET = new Vector3(0, -0.56, 0.35);

/**
 * Extra plane height added below the portrait, as a fraction of HEAD_HEIGHT.
 *
 * The framing puts the plane's bottom edge ~14px above the viewport bottom,
 * which showed as a white strip under the suit. The plane is grown downwards
 * and the extra band samples the texture's clamped bottom row — which is a
 * near-uniform dark suit spanning most of the width, so it reads as the suit
 * running off the frame exactly as the design has it. Growing the *subject*
 * instead would have re-broken the framing the owner just signed off.
 */
const HEAD_EXTEND = 0.14;


/**
 * Where the cursor is assumed to be when there is none (touch, reduced
 * motion). Screen space, y down — it resolves to the right half of the face.
 */
const STATIC_POSE = { x: 0.3, y: 0.1 };

/**
 * Camera constants, exported because the subject's on-screen size is a
 * function of them and of the canvas height — anything outside the scene that
 * wants to keep the subject a fixed pixel size while the canvas is resized has
 * to do that arithmetic. See `fitSubjectToBox`.
 */
export const CAMERA_FOV = 35;
export const CAMERA_Y = 0.1;

/**
 * World-space height visible at the subject's depth. The camera's vertical
 * field of view is fixed, so this — not the canvas width — is what a pixel is
 * measured against.
 */
export const visibleWorldHeight = (cameraZ: number) =>
  2 * cameraZ * Math.tan((CAMERA_FOV * Math.PI) / 360);

/**
 * Keeps the subject at the size and place a *box* would have given it, while
 * the canvas itself is some other size — which is how the backdrop can be
 * stretched over the whole block without the portrait growing with it.
 *
 * The subject scales about its own origin and the world-to-pixel factor is
 * proportional to canvas height, so the size term is the plain ratio of the
 * two heights. The position term is the box's centre moving relative to the
 * canvas's, converted back into world units.
 *
 * With `box` equal to the canvas both terms collapse to identity, so a
 * full-bleed scene is unaffected.
 */
export const fitSubjectToBox = (
  params: Pick<HeroSceneParams, "subjectScale" | "subjectY" | "cameraZ">,
  box: { top: number; height: number },
  canvasHeight: number,
): Pick<HeroSceneParams, "subjectScale" | "subjectY"> => {
  if (canvasHeight <= 0 || box.height <= 0) {
    return { subjectScale: params.subjectScale, subjectY: params.subjectY };
  }
  const ratio = box.height / canvasHeight;
  const world = visibleWorldHeight(params.cameraZ);
  const centreShift = canvasHeight / 2 - (box.top + box.height / 2);
  return {
    subjectScale: params.subjectScale * ratio,
    subjectY:
      CAMERA_Y +
      (params.subjectY - CAMERA_Y) * ratio +
      (centreShift * world) / canvasHeight,
  };
};

/**
 * How many recent pointer samples a reveal trail is built from — chosen per
 * tier (`SceneTier.trailSamples`), not fixed, because it is the loop bound of
 * a per-fragment mask evaluated over a full-screen plane twice per frame. A
 * phone runs a little over a third of the desktop count.
 *
 * The history lives on the CPU and is passed as a uniform array rather than
 * accumulated in a ping-pong render target. A target that main-scene
 * materials sample can still be bound to a texture unit when the next frame
 * renders into it, which ANGLE reports as a framebuffer feedback loop and
 * then drops the draw — the whole scene goes blank. Sampling an array costs
 * one extra pass less and cannot feed back at all.
 *
 * Because it sizes a uniform array and a loop bound, it must be baked into
 * the shader source at construction; it cannot become a uniform.
 */

/**
 * Ceiling on outline waves in flight at once. The loop breaks as soon as a
 * spawn is older than its period, so this only bounds the shader — the real
 * count is `outlinePeriod / outlineStagger`.
 */
const OUTLINE_MAX_WAVES = 8;

/** Depth of the backdrop plane — behind everything the subject group holds. */
const BACKDROP_Z = -3;

/**
 * The figure is measured against the **shape of the window**, not its width.
 *
 * The copy is laid out in shares of the width — the masthead always ends at
 * 31.2% and the socials always start at 82.7%, at every size. The figure is
 * world units against a camera with a fixed vertical field of view, so its
 * size is tied to the *height*. Their ratio is therefore governed by the
 * window's aspect and by nothing else: 1280x800 and 1440x900 are the same
 * 1.600 and render identically, while a 1440x1080 window at 1.333 puts a
 * figure 20% larger against exactly the same text.
 *
 * `REFERENCE_ASPECT` is the shape the block is signed off at — a 1440-wide
 * window on a 16:9 display, once browser chrome is taken off. Anything
 * squarer than that gets the figure scaled back to the share of the width it
 * has there, which is what re-opens the masthead's column.
 *
 * Above `PORT_WIDTH` this does nothing at all, by construction: that frame is
 * finished and is not to be touched.
 */
const REFERENCE_ASPECT = 1.778;
const PORT_WIDTH = 1440;
/**
 * How far the figure is ever allowed to shrink. A squarer window keeps making
 * it larger against the copy without limit, and at 1024x768 the unclamped
 * ratio took it to 0.75 — small enough that the subject stopped being the
 * subject. 0.9 is exactly what 1280x800 already resolves to, so clamping here
 * cannot move that width.
 */
const MIN_FIT = 0.9;
/**
 * How far the figure steps right below `PORT_WIDTH`, in world units.
 *
 * Only there. At 1280 and up the masthead is set in the block's own scale and
 * clears the head on its own; below that the root font size is pinned at 16
 * and the name keeps growing against a viewport that is not, until
 * "antonelli" runs into the hair. A step of about 50 screen pixels opens that
 * back up without reaching the panels on the right, which start at 1190 of
 * the frame.
 */
const NARROW_STEP = 0.25;
/**
 * The width the step starts under. **Not** `PORT_WIDTH`: 1280 is signed off
 * and must not move, so the step begins strictly below it.
 */
const STEP_UNDER = 1280;

/**
 * Waypoints of the idle sweep, in pointer space (x −1…1, y −1…1 with y down).
 *
 * Four points, so three strokes: right, back left, right again, each one
 * descending. It is deliberately a path rather than an orbit — the effect
 * reads as somebody dragging the cursor across the face, which is exactly the
 * gesture the reveal was built to respond to. A circle would betray itself as
 * a machine immediately.
 */
const AUTO_SWEEP_PATH = [
  { x: -0.85, y: -0.62 },
  { x: 0.78, y: -0.2 },
  { x: -0.7, y: 0.2 },
  { x: 0.82, y: 0.6 },
] as const;

/**
 * One reveal-mask evaluation, emitted once per trail.
 *
 * There are two independent trails — the cursor and the idle sweep — and they
 * must be able to run at the same time, so each needs its own history, bounds
 * and pace. GLSL ES cannot take a uniform array as a function parameter, so
 * the body is generated per trail instead of branching inside one copy.
 */
const revealTrailFunction = (
  name: string,
  trail: string,
  boundsMin: string,
  boundsMax: string,
  pace: string,
  warp: string,
  length: string,
  radius: string,
  samples: number,
) => /* glsl */ `
  float ${name}(vec2 ndc) {
    // Cheapest rejection first. Below the gate this trail contributes nothing
    // at all, so skipping here removes the entire loop for whichever trail is
    // resting — which, for the cursor, is most of the time.
    float gate = smoothstep(uGateStart, uGateStart + uGateWidth, ${pace});
    if (gate <= 0.0) return 0.0;

    // Then reject anything outside this trail's bounding box. The backdrop is
    // full-screen, so without this the mask would run its loop over every
    // pixel of the frame; a trail only ever covers a small part of it. The
    // bounds already carry the brush radius and the warp's reach as margin.
    vec2 bounded = vec2(ndc.x * uAspect, ndc.y);
    if (any(lessThan(bounded, ${boundsMin})) || any(greaterThan(bounded, ${boundsMax}))) {
      return 0.0;
    }

    // Displace the point being measured, not the result. Warping the sample
    // position bends the whole shape — so a parked cursor still shows a blob
    // that kneads itself rather than a perfect disc — whereas nudging the
    // final value only shifts the threshold and leaves the silhouette round.
    //
    // Branched, because the two texture fetches are the expensive part and a
    // trail with no warp should not pay for them at all.
    vec2 point = bounded;
    if (${warp} > 0.001) {
      vec2 noiseUv = ndc * 0.5 + 0.5;
      float nx = texture2D(uNoiseTex, noiseUv * uWarpScale + vec2(uTime * 0.07, uTime * 0.05)).r;
      float ny = texture2D(uNoiseTex, noiseUv * uWarpScale * 1.4 - vec2(uTime * 0.06, uTime * 0.09)).r;
      point += (vec2(nx, ny) - 0.5) * ${warp} * 0.22;
    }

    // Speed drives the shape: barely moving gives a small tight blob, a fast
    // sweep widens the brush and flattens the age falloff so the whole path
    // stays above threshold as one long trail.
    float radius = ${radius} * mix(uIdleScale, 1.0, ${pace});
    float taper = uTaper * mix(uTaperIdle, uTaperFast, ${pace});

    // Sweep a capsule along every link of the recent path and keep the
    // strongest. Linking successive samples — rather than stamping a dot per
    // sample — is what keeps the stroke unbroken when the point being tracked
    // outruns the frame rate.
    float span = max(${length} * float(${samples} - 1), 1.0);
    float ceiling = uThreshold + uEdge;
    float trail = 0.0;
    for (int i = 0; i < ${samples} - 1; i++) {
      // Links past this trail's length contribute nothing, so stop rather than
      // multiplying by zero — this is what keeps a long history affordable.
      if (float(i) >= span) break;
      float weight = pow(1.0 - float(i) / span, taper);

      // Two exact early exits. Neither changes a pixel; both cut the common
      // case hard, which matters because this loop now runs twice per
      // fragment over a full-screen plane.
      //
      // 1. A link's contribution is weight * smoothstep(...), and smoothstep
      //    tops out at 1 — so weight is its ceiling. weight decreases
      //    monotonically with age, so once it drops to what we already have,
      //    no remaining link can beat it. This fires almost immediately in
      //    the solid core of a stroke.
      if (weight <= trail) break;

      vec2 a = vec2(${trail}[i].x * uAspect, ${trail}[i].y);
      vec2 b = vec2(${trail}[i + 1].x * uAspect, ${trail}[i + 1].y);
      float r = radius * weight;
      trail = max(trail, weight * smoothstep(r, r * 0.35, revealSegment(point, a, b)));

      // 2. Past the upper threshold edge the final smoothstep saturates, so
      //    a larger trail value is indistinguishable from this one.
      if (trail >= ceiling) break;
    }

    return smoothstep(uThreshold - uEdge, uThreshold + uEdge, trail) * gate;
  }
`;

/**
 * Uniform block + helpers for the reveal, shared verbatim by the helmet
 * materials and the backdrop plane.
 *
 * Sharing the *source* is the requirement, not just the uniforms: the mask is
 * evaluated from clip-space NDC, so the same code on two different meshes
 * resolves to the same shape for the same screen pixel. That is what lets the
 * grey backdrop reveal meet the helmet reveal exactly at the silhouette
 * instead of the two drifting apart at their edges.
 *
 * `revealTrail` is the union of the two trails, so a cursor stroke and an idle
 * sweep can be open at once and simply overlap.
 */
const buildRevealDeclarations = (samples: number) => /* glsl */ `
  uniform vec2 uTrail[${samples}];
  uniform vec2 uTrailMin;
  uniform vec2 uTrailMax;
  uniform float uPace;
  uniform vec2 uSweep[${samples}];
  uniform vec2 uSweepMin;
  uniform vec2 uSweepMax;
  uniform float uSweepPace;
  uniform float uSweepWarp;
  uniform float uSweepLength;
  uniform float uSweepRadius;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uIdleScale;
  uniform float uTaper;
  uniform float uTaperIdle;
  uniform float uTaperFast;
  uniform float uLength;
  uniform float uGateStart;
  uniform float uGateWidth;
  uniform float uWarpScale;
  uniform float uTime;
  uniform float uEdge;
  uniform float uThreshold;
  uniform float uWarp;
  uniform float uRevealMix;
  uniform sampler2D uNoiseTex;

  /** Distance from p to the segment a-b — one link of a trail. */
  float revealSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
  }

  ${revealTrailFunction("revealCursorTrail", "uTrail", "uTrailMin", "uTrailMax", "uPace", "uWarp", "uLength", "uRadius", samples)}
  ${revealTrailFunction("revealSweepTrail", "uSweep", "uSweepMin", "uSweepMax", "uSweepPace", "uSweepWarp", "uSweepLength", "uSweepRadius", samples)}

  float revealTrail(vec2 ndc) {
    // Short-circuit rather than max(): where the cursor already reveals fully
    // the sweep cannot add anything, so its whole loop is skipped. Exactly the
    // region where both trails overlap — which is the case that was costing.
    float cursor = revealCursorTrail(ndc);
    if (cursor >= 1.0) return 1.0;
    return max(cursor, revealSweepTrail(ndc));
  }
`;

/**
 * Every knob of the effect, one named constant each.
 * Defaults are the shipped look.
 */
export interface HeroSceneParams {
  cameraZ: number;
  /** Uniform scale of the head + helmet pair, about the world origin. */
  subjectScale: number;
  /** Vertical placement of that pair, so it frames like the Figma hero. */
  /**
   * Horizontal placement of the whole subject, in world units. 0 puts the
   * head plane on the camera axis — dead centre of the canvas. The pose in
   * the photograph is not symmetric, so the optical centre can sit a little
   * off the geometric one; this is the lever for that.
   */
  subjectX: number;
  subjectY: number;
  /**
   * How far the composition rises into place on load, in **CSS pixels** — a
   * screen-space distance, so it reads the same on any viewport rather than
   * scaling with the world. Converted against the frustum each frame.
   */
  riseDistance: number;
  /** Seconds the rise takes, easing out to a stop. */
  riseDuration: number;
  /**
   * How far the whole composition — portrait and helmet together — slides
   * with the cursor. Distinct from `headParallax`, which shifts the
   * portrait's UVs against its own depth map, and from `helmetFollow`, which
   * moves only the helmet. This one moves the pair bodily.
   */
  subjectParallax: number;
  headScale: number;
  headY: number;
  headParallax: number;
  /** Strength of the cursor-driven relight read off the portrait's normals. */
  headRelight: number;
  helmetScale: number;
  helmetX: number;
  helmetY: number;
  helmetZ: number;
  helmetFollow: number;
  /**
   * Pitch — the turn about x — the helmet reaches with the cursor at the top
   * or bottom edge of the window, in **degrees**. Signed: negative looks up
   * as the cursor goes down. See `swing`.
   */
  helmetAmpX: number;
  /** Shape of the pitch between centre and edge: 0 linear, higher steeper. */
  helmetCurveX: number;
  /** Yaw — the turn about y — at the left or right edge, in degrees. */
  helmetAmpY: number;
  helmetCurveY: number;
  /** Brightness multiplier on the helmet shell's baked base colour. */
  helmetBrightness: number;
  /** Brush size of the cursor trail that masks the helmet in. */
  trailRadius: number;
  /** Fraction of `trailRadius` the brush shrinks to at rest. */
  trailIdleScale: number;
  /** Base taper exponent — higher thins the tail faster. */
  trailTaper: number;
  /** Taper multiplier at rest (short tail → a blob). */
  trailTaperIdle: number;
  /** Taper multiplier at full pace (long tail → a streak). */
  trailTaperFast: number;
  /** Fraction of the sample history that contributes, 0–1. */
  trailLength: number;
  /** Trail value at which the helmet becomes solid. */
  revealThreshold: number;
  revealEdge: number;
  /** How far the noise displaces the sample point — the blob's wobble. */
  revealWarp: number;
  /** Frequency of that noise; higher is a finer, busier edge. */
  revealWarpScale: number;
  revealSpeed: number;
  pointerLerp: number;
  /** Pointer speed (NDC/frame) counted as fully "fast". */
  pacePeak: number;
  /** Easing toward a rising pace — the trail swelling. */
  paceAttack: number;
  /** Easing toward a falling pace — the trail draining. */
  paceRelease: number;
  /** Pace below which nothing is revealed at all. */
  paceThreshold: number;
  /** Pace range over which the reveal fades up past that threshold. */
  paceRamp: number;
  /** Seconds for one crown-to-chin pass of a single outline wave. */
  outlinePeriod: number;
  /**
   * The idle sweep's own warp and history length, kept separate from the
   * cursor's. It runs unattended and constantly, so it is the trail worth
   * making cheap — and nobody is watching its edge closely enough to miss
   * the detail. 0 warp skips two texture fetches per fragment outright.
   */
  sweepWarp: number;
  sweepLength: number;
  /** Brush size of the idle sweep, independent of the cursor's. */
  sweepRadius: number;
  /** Seconds between wave starts. Below `outlinePeriod`, waves overlap. */
  outlineStagger: number;
  /** Peak opacity at the centre of the wave. */
  outlineOpacity: number;
  /** Thickness of the wave, as a fraction of the helmet's height. */
  outlineWidth: number;
  /** Opacity of the wireframe outside the wave — 0 keeps the helmet hidden. */
  outlineBase: number;
  /** Lifts the outline from the foreground token toward white. 0 = token. */
  outlineLightness: number;
  /** Spatial frequency of the backdrop contours. */
  bgLineScale: number;
  /** How many contour bands the noise field is sliced into. */
  bgLineCount: number;
  /** Stroke width of each contour, in screen-derivative units. */
  bgLineThickness: number;
  bgLineOpacity: number;
  /** Amplitude of the rolling wave displacement. */
  bgWaveAmount: number;
  bgWaveSpeed: number;
  /** Grey level of the backdrop half of the reveal. 0 = black, 1 = white. */
  bgRevealLightness: number;
  /** The alternate grey, used in every other band between the lines. */
  bgRevealLightnessAlt: number;
  bgRevealOpacity: number;
  /** Seconds the entrance takes, from prewarmed scene to cursor control. */
  introDuration: number;
  /** Point in the entrance (0–1) where the helmet starts burning away. */
  burnStart: number;
  /** Width of the burn's dissolve front. */
  burnSoftness: number;
  /** Brightness of the glowing edge that leads the burn. */
  burnGlow: number;
  /** Extent of the idle sweep's path. 0 turns the whole thing off. */
  autoSweepAmount: number;
  /** Seconds between the start of one idle sweep and the next. */
  autoSweepPeriod: number;
  /** Seconds one stroke takes to travel its leg. */
  autoSweepStroke: number;
  /** Seconds held still between strokes. */
  autoSweepHold: number;
}

/** The shipped look — the shipped look, tuned by the owner
 *  (2026-08-04) and pasted back here via "copy values". */
export const DEFAULT_PARAMS: HeroSceneParams = {
  cameraZ: 6.5,
  subjectScale: 1.15,
  // The photograph is not symmetric: the head sits ~43px left of the 2048px
  // texture's centre while the shoulders sit ~14px right of it, so the figure
  // reads as leaning left. 0.09 world units (~19px at an 800px-tall canvas)
  // puts the head back on the axis.
  subjectX: 0,
  subjectY: 0.42,
  subjectParallax: 0.02,
  riseDistance: 200,
  riseDuration: 2,
  headScale: 0.8,
  headY: 0.58,
  headParallax: 0.005,
  headRelight: 0.32,
  helmetScale: 0.69,
  helmetX: -0.08,
  helmetY: 0.45,
  helmetZ: 0,
  helmetFollow: 0.01,
  // The owner's pass on the degree sliders (2026-09-08, second tune of the
  // day): a small, **linear** turn on both axes, and the pitch now goes *with*
  // the cursor — positive looks down as the cursor goes down. Before it, the
  // shipped tilt was −8.6° at curve 6.67 (the old `−1 × 0.15 rad` restated),
  // steep through the middle and held at the ends; that read as too much
  // helmet, and once the angle was a number on a slider the owner took it to
  // a fraction. About 6px of crown travel across a full sweep at 1440×900 —
  // under the whole composition's own `subjectParallax`, which is the point:
  // the helmet is worn, it is not looking around.
  helmetAmpX: 2.5,
  helmetCurveX: 0,
  helmetAmpY: 2.1,
  helmetCurveY: 0,
  helmetBrightness: 1,
  trailRadius: 0.46,
  trailIdleScale: 0.28,
  trailTaper: 1.9,
  trailTaperIdle: 1.6,
  trailTaperFast: 1.25,
  trailLength: 0.64,
  revealThreshold: 0.08,
  revealEdge: 0.005,
  revealWarp: 1.29,
  revealWarpScale: 2.9,
  revealSpeed: 1.25,
  pointerLerp: 0.17,
  pacePeak: 0.029,
  paceAttack: 0.09,
  paceRelease: 0.205,
  paceThreshold: 0.06,
  paceRamp: 0.15,
  outlinePeriod: 3.1,
  sweepWarp: 0.86,
  sweepLength: 0.67,
  sweepRadius: 0.33,
  outlineStagger: 1.2,
  outlineOpacity: 0.09,
  outlineWidth: 0.15,
  outlineBase: 0,
  outlineLightness: 0.64,
  bgLineScale: 3.8,
  // 1 slices the noise field into a single band, so the backdrop draws one
  // sparse iso-line rather than a dense contour map.
  bgLineCount: 2.5,
  bgLineThickness: 1.4,
  bgLineOpacity: 0.85,
  bgWaveAmount: 0.37,
  bgWaveSpeed: 1.66,
  // Linear, so the sRGB encode lands this near mid grey — close to the lit
  // helmet's on-screen value, which is what makes the two halves read as one.
  bgRevealLightness: 0.62,
  bgRevealLightnessAlt: 0.44,
  bgRevealOpacity: 1,
  introDuration: 4,
  burnStart: 0.14,
  burnSoftness: 0.02,
  burnGlow: 4,
  // **Off.** The idle sweep is a second, synthetic cursor that runs on its own
  // cycle whether or not anyone is pointing at the scene, so the helmet kept
  // revealing itself with the mouse nowhere near it. The reveal is a hover
  // effect and nothing else. The slider still brings it back — 0.76 was the
  // tuned extent, if it is ever wanted.
  autoSweepAmount: 0,
  autoSweepPeriod: 5,
  autoSweepStroke: 0.45,
  autoSweepHold: 0,
};

/**
 * Wireframe wave over the helmet's own geometry. The helmet is invisible by
 * default; a soft band travels crown-to-chin once per `uPeriod` and is the
 * only thing that ever draws it, so the shape fades up as the wave arrives
 * and fades out behind it.
 *
 * The band is a gaussian, not the reference's `pow(fract(...), 4.)`. That
 * form is a repeating sawtooth: it snaps from full to nothing at the wrap,
 * which reads as a hard scan line rather than a wave. Centring a gaussian and
 * starting it *above* the crown / ending it *below* the chin means the only
 * fade in and out are the wave's own tails — no discontinuity to hide.
 *
 * `uMinY`/`uRangeY` normalise local Y from the merged geometry's bounds, so
 * one wave spans the helmet regardless of the model's own scale.
 */
const outlineVertex = /* glsl */ `
  varying float vHeight;
  uniform float uMinY;
  uniform float uRangeY;
  void main() {
    vHeight = (position.y - uMinY) / max(uRangeY, 0.0001);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const outlineFragment = /* glsl */ `
  varying float vHeight;
  uniform float uTime;
  uniform float uPeriod;
  uniform float uStagger;
  uniform float uOpacity;
  uniform float uBase;
  uniform float uWidth;
  uniform float uLightness;
  uniform float uRevealMix;
  uniform vec3 uColor;

  void main() {
    float width = max(uWidth, 0.0001);
    float period = max(uPeriod, 0.0001);
    float stagger = max(uStagger, 0.0001);

    // Enter three widths above the crown, leave three below the chin, so a
    // wave is fully faded at both ends of its travel.
    float start = 1.0 + width * 3.0;
    float travel = 1.0 + width * 6.0;

    // A wave is *spawned* every uStagger seconds and lives uPeriod seconds,
    // so several are in flight at once whenever stagger < period — that is
    // the wave train. Walking back from the most recent spawn means the loop
    // costs only as many iterations as there are live waves; set stagger >=
    // period and it collapses to the single-wave behaviour.
    float wave = 0.0;
    for (int i = 0; i < ${OUTLINE_MAX_WAVES}; i++) {
      float age = mod(uTime, stagger) + float(i) * stagger;
      if (age > period) break;
      float centre = start - (age / period) * travel;
      float d = (vHeight - centre) / width;
      // max, not sum: waves all travel the same way at the same speed so they
      // never actually meet, and summing would blow out if they ever did.
      wave = max(wave, exp(-d * d));
    }

    // Lift off the foreground token toward white, so the token stays the
    // source of the colour and this is only a tuning offset from it.
    vec3 stroke = mix(uColor, vec3(1.0), uLightness);
    gl_FragColor = vec4(stroke, (uBase + wave * uOpacity) * uRevealMix);
  }
`;

/**
 * The backdrop: animated contour lines, plus the grey half of the cursor
 * reveal.
 *
 * Both live on one plane behind the subject because they are one surface. The
 * reveal here calls the same `revealTrail` the helmet does, so where the
 * cursor crosses the silhouette the grey shape and the helmet shape are the
 * same shape — the helmet simply occludes its half. Drawing the grey on a
 * separate quad with its own maths would leave a seam at every edge.
 *
 * The lines are procedural rather than the Figma backdrop SVG: that asset is
 * a flat vector sitting behind an opaque canvas, so it was never visible on
 * desktop, and rasterising it would make "thicker" a dilate and "wavier" a
 * per-frame re-render. Contours of a scrolling noise field give thickness and
 * motion as two uniforms, and read as the same organic curves.
 */
const backdropVertex = /* glsl */ `
  varying vec4 vBackdropClip;
  void main() {
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vBackdropClip = clip;
    gl_Position = clip;
  }
`;

const buildBackdropFragment = (samples: number) => /* glsl */ `
  varying vec4 vBackdropClip;
  uniform vec3 uBackground;
  uniform vec3 uLineColor;
  uniform vec3 uRevealColor;
  uniform vec3 uRevealColorAlt;
  uniform float uLineScale;
  uniform float uLineCount;
  uniform float uLineThickness;
  uniform float uLineOpacity;
  uniform float uWaveAmount;
  uniform float uWaveSpeed;
  uniform float uRevealOpacity;
  ${buildRevealDeclarations(samples)}

  /**
   * Smooth analytic field the contours are sliced from.
   *
   * Four sines at incommensurate frequencies, two of them diagonal. This
   * replaced a noise-texture lookup: the texture is low-resolution and
   * tiling, so its contours came out ragged and broken up — "messy". An
   * analytic field is continuous everywhere and infinitely magnifiable, so
   * every iso-line is one unbroken solid curve however far it is scaled.
   */
  float backdropField(vec2 p, float t) {
    float f = sin(p.x * 1.00 + t * 0.60) * 0.50;
    f += sin(p.y * 0.85 - t * 0.45) * 0.45;
    f += sin((p.x + p.y) * 0.65 + t * 0.35) * 0.35;
    f += sin((p.x - p.y) * 0.95 - t * 0.55) * 0.25;
    return f * 0.5 + 0.5;
  }

  void main() {
    vec2 ndc = vBackdropClip.xy / vBackdropClip.w;
    vec2 p = vec2(ndc.x * uAspect, ndc.y) * uLineScale;

    // Two out-of-phase displacements, one per axis: a single sine reads as a
    // flag rippling, crossing them makes the whole field roll.
    float t = uTime * uWaveSpeed;
    vec2 q = p;
    q.x += sin(p.y * 0.8 + t * 0.7) * uWaveAmount;
    q.y += cos(p.x * 0.7 - t * 0.6) * uWaveAmount;

    float scaled = backdropField(q, t) * uLineCount;

    // Derivative of the *unwrapped* field, never of fract(): fract's jump at
    // each integer makes fwidth spike there and punches holes in the stroke.
    float w = max(fwidth(scaled) * uLineThickness, 1e-5);
    float line = 1.0 - smoothstep(0.0, w, abs(fract(scaled) - 0.5));

    vec3 color = mix(uBackground, uLineColor, line * uLineOpacity * uRevealMix);

    // The lines sit halfway between integers, so flooring the half-offset
    // field numbers the bands they enclose. Alternating two greys by that
    // band's parity makes the reveal read as the lines dividing it, rather
    // than as a flat shape laid over the top of them.
    float parity = mod(floor(scaled + 0.5), 2.0);
    vec3 revealShade = mix(uRevealColor, uRevealColorAlt, parity);

    // Skipped outright where the grey reveal is switched off — which is every
    // touch width (see applyFit's bgRevealOpacity). A uniform branch is
    // coherent across the whole draw, so it costs nothing; without it the
    // sweep's loop ran over every fragment of a full-screen plane on a phone
    // only to be multiplied by zero. On a 390×844 screen that was ~6M
    // segment distances per frame for no pixel.
    if (uRevealOpacity > 0.001) {
      color = mix(
        color,
        revealShade,
        revealTrail(ndc) * uRevealMix * uRevealOpacity
      );
    }

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

/** Fake-depth parallax shader for the photographic head plane. */
const headVertex = /* glsl */ `
  uniform float uExtend;
  varying vec2 vUv;
  void main() {
    // Top edge stays pinned to v = 1; the plane's extra height at the bottom
    // runs v negative, which the texture's clamp-to-edge turns into a repeat
    // of the last row. See HEAD_EXTEND.
    vUv = vec2(uv.x, 1.0 - (1.0 - uv.y) * (1.0 + uExtend));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Displaces the portrait's UVs by its depth map, then relights it with the
 * normal map derived from that same depth. The relight is what sells the
 * volume: the light direction is the cursor, so brow, nose and cheekbones
 * catch and lose it as the pointer moves — parallax alone reads as a photo
 * sliding, not a face turning. Both terms are pure texture work; there is no
 * lit material and no extra draw.
 */
const headFragment = /* glsl */ `
  uniform sampler2D uDiffuse;
  uniform sampler2D uDepth;
  uniform sampler2D uAlpha;
  uniform sampler2D uNormal;
  uniform vec2 uParallax;
  uniform float uReveal;
  uniform float uDepthScale;
  uniform float uRelight;
  varying vec2 vUv;
  void main() {
    float depth = texture2D(uDepth, vUv).r;
    vec2 offset = uParallax * (depth - 0.5) * uDepthScale;
    vec2 uv = vUv + offset;
    vec4 color = texture2D(uDiffuse, uv);
    float alpha = texture2D(uAlpha, uv).r;

    vec3 normal = normalize(texture2D(uNormal, uv).rgb * 2.0 - 1.0);
    vec3 lightDir = normalize(vec3(uParallax * 1.6, 1.0));
    // Signed around the flat-normal response so the relight brightens the
    // slopes facing the cursor and shades the ones turning away, instead of
    // washing the whole portrait lighter.
    float lambert = max(dot(normal, lightDir), 0.0) - 0.72;
    vec3 lit = color.rgb * (1.0 + lambert * uRelight);

    gl_FragColor = vec4(clamp(lit, 0.0, 1.0), alpha * uReveal);

    // uDiffuse is an sRGB texture, so the sampler hands back linear values.
    // Without this encode the portrait is written to an sRGB framebuffer
    // still linear and reads several stops too dark — three only injects the
    // chunk automatically for its built-in materials, not a ShaderMaterial.
    #include <colorspace_fragment>
  }
`;

/** Uniforms injected into the masked materials — the cursor-following
 *  liquid reveal. All params-driven values are written each frame. */
interface RevealUniforms {
  /** Newest-first pointer history in NDC — see `SceneTier.trailSamples`. */
  uTrail: { value: Vector2[] };
  /** Screen-space bounds of the active trail, inflated by brush + warp. */
  uTrailMin: { value: Vector2 };
  uTrailMax: { value: Vector2 };
  /** The idle sweep's own history and bounds — see `revealTrailFunction`. */
  uSweep: { value: Vector2[] };
  uSweepMin: { value: Vector2 };
  uSweepMax: { value: Vector2 };
  uSweepPace: { value: number };
  uSweepWarp: { value: number };
  uSweepLength: { value: number };
  uSweepRadius: { value: number };
  uAspect: { value: number };
  uRadius: { value: number };
  uIdleScale: { value: number };
  uTaper: { value: number };
  uTaperIdle: { value: number };
  uTaperFast: { value: number };
  uLength: { value: number };
  /** Eased pointer speed, 0–1 — see `pacePeak`. */
  uPace: { value: number };
  uGateStart: { value: number };
  uGateWidth: { value: number };
  uWarpScale: { value: number };
  uTime: { value: number };
  uThreshold: { value: number };
  uEdge: { value: number };
  uWarp: { value: number };
  uRevealMix: { value: number };
  uNoiseTex: { value: Texture };
  /** Entrance progress 0–1; drives the helmet's burn-off. */
  uIntro: { value: number };
  uBurnStart: { value: number };
  uBurnSoft: { value: number };
  uBurnGlow: { value: number };
  uBurnColor: { value: Color };
}

/**
 * The immersive hero scene — depth-parallax head, glass helmet shell, the
 * gold helmet revealed liquid-style around the cursor, and wireframe
 * circuit outlines. Plain three.js class; the React wrapper drives
 * update/resize/dispose through the project's shared ticker loop.
 */
export class HeroScene {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 50);
  private headMaterial: ShaderMaterial | null = null;
  private headMesh: Mesh | null = null;
  private shellMaterial: MeshStandardMaterial | null = null;
  /** The shell's own maps, unpacked from the GLB — prewarmed like the rest. */
  private helmetTextures: Texture[] = [];
  private revealUniforms: RevealUniforms | null = null;
  private outlineMaterial: ShaderMaterial | null = null;
  /** The wireframe itself — kept so `retune()` can show or hide it per tier. */
  private outlineMesh: Mesh | null = null;
  /** How many samples each trail keeps — from the tier. */
  private readonly samples: number;
  /** Pointer history in NDC, newest first — the reveal mask's input. */
  private readonly trail: Vector2[];
  /** Placement and scale of the worn helmet — no rotation of its own. */
  private helmetGroup = new Group();
  /**
   * The helmet's own centre, and the node the cursor tilt turns.
   *
   * This exists because rotating `helmetGroup` does not turn the helmet, it
   * *orbits* it: the mesh sits `HELMET_WORN_OFFSET` away from that group's
   * origin, ~0.66 units, so a tilt swung the helmet through an arc of that
   * radius and dragged it along z. Under a perspective camera a z-swing is an
   * apparent size change, so the helmet lunged toward the viewer and grew on
   * one side of centre and receded on the other — the same `rot x` magnitude
   * reading far stronger negative than positive. Carrying the offset here and
   * turning this node instead makes the rotation a rotation.
   */
  private helmetPivot = new Group();
  /** Head plane + helmet, so the pair scales and moves as one composition. */
  private subjectGroup = new Group();
  private backdropMesh: Mesh | null = null;
  private backdropMaterial: ShaderMaterial | null = null;
  private params: HeroSceneParams = { ...DEFAULT_PARAMS };
  private pointer = { x: 0, y: 0 };
  private smoothed = { x: 0, y: 0 };
  private lastSmoothed = { x: 0, y: 0 };
  /**
   * Whether a real cursor position has ever been seen. Until one has, the
   * three above hold (0, 0) — the centre of the window, where the cursor
   * almost certainly is not. See `setPointer`.
   */
  private pointerSeen = false;
  /**
   * The tilt's own follower, one filter downstream of `smoothed`.
   *
   * A single lerp is at its fastest the instant its target moves and decays
   * from there, so the helmet left every gesture at full speed and coasted in
   * — a lurch, whatever the amplitude. Running the tilt through a second
   * filter makes its velocity start at zero and ramp, which is the difference
   * between a snap and a lean. Costs about 0.2s of extra settle, which is what
   * a helmet with weight should cost.
   *
   * Both are the **angle itself**, in radians, not the pointer input that
   * produced it — `swing` runs upstream of the filter, so the filter smooths
   * what is drawn.
   */
  private tilt = 0;
  /**
   * The yaw's, the same one filter downstream. It went without while its gain
   * was under a degree at the edge — nothing to lurch with — but the amplitude
   * is a slider now, and a yaw raised to match the pitch needs the same weight.
   */
  private yaw = 0;
  /** Eased 0–1 pointer speed feeding the reveal's blob-to-trail response. */
  private pace = 0;
  /** Seconds-since-start at which the scene finished prewarming. */
  private readyAt: number | null = null;
  /** Entrance progress 0–1 — helmet whole, then burned away. */
  private intro = 0;
  /** Canvas height in CSS pixels, for pixel-denominated distances. */
  private viewportHeight = 1;
  private viewportWidth = 1;
  /** Set when the loader hands over; the rise is clocked from there. */
  private riseStarted = false;
  private riseAt: number | null = null;
  /**
   * The idle sweep's own pointer, history and pace — a complete second copy
   * of the cursor's state. It runs unconditionally and in parallel with the
   * real cursor rather than taking it over, so both reveals can be open at
   * once and simply overlap.
   */
  private sweepPointer: { x: number; y: number } = {
    x: AUTO_SWEEP_PATH[0].x,
    y: AUTO_SWEEP_PATH[0].y,
  };
  private sweepSmoothed: { x: number; y: number } = { ...this.sweepPointer };
  private sweepLast: { x: number; y: number } = { ...this.sweepPointer };
  private sweepPace = 0;
  /** Previous frame's position within the sweep period, to detect the wrap. */
  private sweepCycle = 0;
  private readonly sweepTrail: Vector2[];
  private aspect = 1;
  private reveal = 0;
  private settled = false;
  private disposed = false;
  private startTime: number | null = null;

  /**
   * The live tier. Replaced by `retune()` when the container's width or the
   * pointer class changes; what is baked into the context or the shaders
   * (`antialias`, `trailSamples`) is carried over from the tier the scene was
   * built under, so those two fields always describe what is actually drawn.
   */
  private _tier: SceneTier;
  get tier(): SceneTier {
    return this._tier;
  }

  /** Flips to true once every async asset is in the scene and prewarmed. */
  ready = false;
  onReady: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this._tier = getSceneTier();
    this.samples = this._tier.trailSamples;
    this.trail = Array.from(
      { length: this.samples },
      () => new Vector2(STATIC_POSE.x, -STATIC_POSE.y),
    );
    this.sweepTrail = Array.from(
      { length: this.samples },
      () => new Vector2(AUTO_SWEEP_PATH[0].x, -AUTO_SWEEP_PATH[0].y),
    );
    this.renderer = new WebGLRenderer({
      canvas,
      // Opaque canvas — cheaper compositing than alpha; the clear colour is
      // read from the page so the brand token stays the single source.
      alpha: false,
      antialias: this._tier.antialias,
      stencil: false,
      powerPreference: this._tier.mobile ? "default" : "high-performance",
    });
    this.renderer.setClearColor(
      new Color(getComputedStyle(document.body).backgroundColor),
    );
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, this._tier.maxDpr),
    );
    this.renderer.toneMapping = ACESFilmicToneMapping;

    // Touch devices never move a cursor, so the mask would sit dead-centre and
    // read as a smudge over the nose. Park it where the Figma frame puts the
    // helmet instead — over the right half of the face — and let the same
    // constant give the parallax its fixed off-axis pose.
    if (!this._tier.pointerEnabled) this.parkPointer();

    // z 6.5 (was 7.5) scales the whole composition ~15% up in frame.
    this.camera.position.set(0, CAMERA_Y, 6.5);
    this.helmetGroup.add(this.helmetPivot);
    this.subjectGroup.add(this.helmetGroup);
    this.scene.add(this.subjectGroup);

    void this.load();
  }

  /**
   * Re-reads the device tier and applies everything that can change without
   * a rebuild: the pixel-ratio cap, the frame budget, whether the wireframe
   * draws, whether the pointer is parked, and whether a frozen scene resumes.
   * Returns the tier so the React wrapper can follow it — the frame budget
   * into the ticker, the pointer flag into its listener.
   *
   * Called when the container's width changes or the pointer class flips. A
   * desktop window dragged across a breakpoint genuinely changes tier, and
   * so does a device emulator switched off: until 2026-09-08 the second case
   * was never handled, because touch-class devices were excluded from the
   * resize path wholesale, so a page opened under emulation and returned to
   * a desktop viewport kept a phone's canvas size, budget and parked pointer
   * for the rest of the session. The skill's "read the tier once" rule is
   * about a *device* not changing class mid-session, which still holds — the
   * iOS URL bar only ever changes the height, and the wrapper ignores that.
   *
   * `trailSamples` and `antialias` deliberately do **not** update: one is
   * baked into the shader source and the other into the GL context, so
   * honouring them would mean recompiling every material or rebuilding the
   * context mid-session. A window dragged from phone-width to desktop keeps
   * the shorter trail and no MSAA until reload — a slightly stubbier reveal,
   * and nothing else.
   */
  retune(): SceneTier {
    const fresh = getSceneTier();
    const previous = this._tier;
    const tier: SceneTier = {
      ...fresh,
      antialias: previous.antialias,
      trailSamples: previous.trailSamples,
    };
    this._tier = tier;

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, tier.maxDpr),
    );
    if (this.outlineMesh) this.outlineMesh.visible = tier.outline;

    // The pointer follows the tier's class: parked where there is none, and
    // un-parked — waiting for the first real event to snap to — where one
    // has appeared. Leaving a parked pose under a live cursor would hold the
    // reveal at the static pose until the next `pointermove`, which is fine;
    // leaving a live pose under no cursor is not, since nothing would ever
    // move it again and the mask would sit wherever the pointer last was.
    if (!tier.pointerEnabled) this.parkPointer();
    else if (!previous.pointerEnabled) this.pointerSeen = false;

    // A scene frozen on a settled frame under a saver phone must draw again
    // once it is a desktop; the wrapper's next `setParams` clears `settled`
    // too, but not every retune carries one.
    if (!tier.freeze) this.settled = false;

    return tier;
  }

  /**
   * Parks the cursor at `STATIC_POSE` and settles every follower on it, so a
   * scene with no pointer — touch, reduced motion, or a tier that has just
   * lost its cursor — holds the composition's fixed off-axis pose rather than
   * whatever the last real event left behind.
   */
  private parkPointer() {
    this.pointer = { ...STATIC_POSE };
    this.smoothed = { ...STATIC_POSE };
    this.lastSmoothed = { ...STATIC_POSE };
    this.tilt = this.pitchFor(STATIC_POSE.y);
    this.yaw = this.yawFor(STATIC_POSE.x);
    this.pointerSeen = false;
  }

  /**
   * Starts the composition's rise into place. Called the moment the loader's
   * veil begins to fade, so the two read as one movement — the page opening
   * *onto* something already arriving, rather than a curtain lifting on a
   * static frame.
   */
  beginRise() {
    this.riseStarted = true;
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;

    // The first event is a *discovery*, not a movement. Before it the scene
    // assumes (0, 0) — dead centre — because there is no API to ask where the
    // cursor is; the pointer is wherever the reader left it, commonly high in
    // the window. Easing from the assumption to the truth animates a journey
    // that never happened: the helmet swings up out of level the moment the
    // mouse twitches, the pace term reads that jump as a huge velocity and
    // blooms the reveal with it, and the trail draws a stroke across the
    // middle of the screen. Snap the whole chain instead, so the first frame
    // after discovery is simply correct and there is nothing to catch up.
    if (!this.pointerSeen) {
      this.pointerSeen = true;
      this.smoothed.x = x;
      this.smoothed.y = y;
      this.lastSmoothed.x = x;
      this.lastSmoothed.y = y;
      this.tilt = this.pitchFor(y);
      this.yaw = this.yawFor(x);
    }
  }

  /** The pitch the cursor's vertical position asks for, in radians. */
  private pitchFor(y: number) {
    return swing(y, this.params.helmetAmpX, this.params.helmetCurveX);
  }

  /** The yaw its horizontal position asks for. */
  private yawFor(x: number) {
    return swing(x, this.params.helmetAmpY, this.params.helmetCurveY);
  }

  /** Live-apply a partial set of effect parameters. */
  setParams(partial: Partial<HeroSceneParams>) {
    Object.assign(this.params, partial);
    this.settled = false;
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    // Kept so a distance expressed in CSS pixels can be converted to world
    // units — see `riseDistance`.
    this.viewportHeight = Math.max(height, 1);
    this.viewportWidth = Math.max(width, 1);
    this.aspect = width / height;
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();
    // The trail brush is measured in screen space, so it needs the aspect to
    // stay round rather than stretching with the viewport.
    if (this.revealUniforms) this.revealUniforms.uAspect.value = this.aspect;
  }

  update(time: number) {
    if (this.disposed || this.settled) return;
    if (this.startTime === null) this.startTime = time;
    const t = (time - this.startTime) / 1000;

    const p = this.params;

    // Frozen tiers (reduced motion, or an energy-constrained phone): play the
    // entrance, render the settled frame, stop drawing entirely.
    // WebGL keeps the last frame on the canvas, so a frozen scene is free.
    // The intro has to be finished too, or the scene freezes mid-burn with
    // the helmet half-eaten.
    if (this._tier.freeze && this.reveal > 0.995 && this.intro >= 1) {
      this.settled = true;
    }

    // Idle sweep — a second cursor that never stops. It drives its own
    // pointer rather than borrowing the real one, so moving the mouse and a
    // sweep can be in flight at the same time and their reveals just overlap.
    const autoEnabled =
      p.autoSweepAmount > 0 && !this._tier.freeze && this.intro >= 1;
    if (autoEnabled) {
      const cycle = t % Math.max(p.autoSweepPeriod, 0.001);

      // The cycle restarting means the path teleports from its last waypoint
      // back to its first. Left alone, the smoothing would glide across that
      // gap and draw a fourth stroke back up the diagonal. Snap every piece
      // of the sweep's state — including its history — so the next cycle
      // begins from nothing.
      if (cycle < this.sweepCycle) this.resetSweep();
      this.sweepCycle = cycle;

      // Each leg is a stroke followed by a hold. The pause is what separates
      // the three into distinct gestures — run back to back they read as one
      // long drag however they are eased. Holds sit *between* strokes, so a
      // three-stroke sequence spans 3·stroke + 2·hold and the remainder of
      // the period is dead time before the next one.
      const legs = AUTO_SWEEP_PATH.length - 1;
      const stroke = Math.max(p.autoSweepStroke, 0.05);
      const slot = stroke + Math.max(p.autoSweepHold, 0);
      const leg = Math.floor(cycle / slot);

      if (leg < legs) {
        const local = Math.min(1, (cycle - leg * slot) / stroke);
        // Ease-out quad: leaves fast and arrives slow, like a hand throwing
        // the cursor across and letting it settle. Smoothstep eases *in* too,
        // which made every stroke start apologetically.
        const eased = 1 - (1 - local) * (1 - local);

        const from = AUTO_SWEEP_PATH[leg];
        const to = AUTO_SWEEP_PATH[leg + 1];
        this.sweepPointer.x =
          (from.x + (to.x - from.x) * eased) * p.autoSweepAmount;
        this.sweepPointer.y =
          (from.y + (to.y - from.y) * eased) * p.autoSweepAmount;
      }
    }

    this.sweepSmoothed.x +=
      (this.sweepPointer.x - this.sweepSmoothed.x) * p.pointerLerp;
    this.sweepSmoothed.y +=
      (this.sweepPointer.y - this.sweepSmoothed.y) * p.pointerLerp;

    const sweepStep = Math.hypot(
      this.sweepSmoothed.x - this.sweepLast.x,
      this.sweepSmoothed.y - this.sweepLast.y,
    );
    const sweepTarget = autoEnabled
      ? Math.min(1, sweepStep / Math.max(p.pacePeak, 1e-5))
      : 0;
    this.sweepPace +=
      (sweepTarget - this.sweepPace) *
      (sweepTarget > this.sweepPace ? p.paceAttack : p.paceRelease);
    this.sweepLast.x = this.sweepSmoothed.x;
    this.sweepLast.y = this.sweepSmoothed.y;

    const oldestSweep = this.sweepTrail.pop();
    if (oldestSweep) {
      oldestSweep.set(this.sweepSmoothed.x, -this.sweepSmoothed.y);
      this.sweepTrail.unshift(oldestSweep);
    }

    // Ease the pointer without keyframes — plain lerp toward the target.
    // `reveal` is deliberately *not* eased; see where it is set in load().
    this.smoothed.x += (this.pointer.x - this.smoothed.x) * p.pointerLerp;
    this.smoothed.y += (this.pointer.y - this.smoothed.y) * p.pointerLerp;

    // Entrance clock. It starts at `ready` — that is, after every texture is
    // uploaded and every program compiled — so the burn always plays at full
    // rate instead of stuttering through the first frames.
    if (this.ready) {
      if (this.readyAt === null) this.readyAt = t;
      this.intro = Math.min(
        1,
        (t - this.readyAt) / Math.max(p.introDuration, 0.001),
      );
      // Nothing to reveal for someone who asked for no motion.
      if (this._tier.freeze) this.intro = 1;
    }

    this.camera.position.z = p.cameraZ;

    // One transform for the whole subject, so head and helmet can never
    // drift apart when the composition is resized, re-framed, or slid with
    // the cursor. Moving the group is also one matrix update rather than a
    // per-child walk (optimize-3d-scene §9).
    this.subjectGroup.scale.setScalar(p.subjectScale * this.narrowFit());
    this.subjectGroup.position.x =
      p.subjectX +
      // Landscape only. On a portrait screen the copy sits above the figure
      // rather than beside it, so there is nothing to step away from — and
      // stepping anyway put him off the block's centre line.
      (this.viewportWidth < STEP_UNDER && this.aspect >= 1.2 ? NARROW_STEP : 0) +
      this.smoothed.x * p.subjectParallax;
    // `smoothed.y` is screen-space, y down; world y is up.
    this.subjectGroup.position.y =
      p.subjectY - this.smoothed.y * p.subjectParallax - this.riseOffset(t, p);

    if (this.headMaterial) {
      this.headMaterial.uniforms.uParallax.value.set(
        this.smoothed.x,
        -this.smoothed.y,
      );
      this.headMaterial.uniforms.uReveal.value = this.reveal;
      this.headMaterial.uniforms.uDepthScale.value = p.headParallax;
      this.headMaterial.uniforms.uRelight.value = p.headRelight;
    }
    if (this.headMesh) {
      this.headMesh.scale.setScalar(p.headScale);
      // The geometry grew downwards around its own centre, so drop the mesh by
      // half the added height to leave the portrait itself where it was.
      this.headMesh.position.y =
        -0.55 + p.headY - (HEAD_HEIGHT * HEAD_EXTEND * p.headScale) / 2;
    }

    // The helmet is worn — it tracks the head's parallax, gently, so it
    // never detaches from the face.
    // Turned about the helmet's own centre — see `helmetPivot`. The group
    // below carries where the helmet *is*; this node carries where it looks.
    //
    // Both axes run through their own second filter rather than through
    // `pointerLerp`, which every other reader of the cursor shares: the reveal
    // brush is *meant* to leave instantly — that snap is the effect — and
    // slowing the shared value to settle the helmet would take the trail down
    // with it.
    this.tilt += (this.pitchFor(this.smoothed.y) - this.tilt) * p.pointerLerp;
    this.yaw += (this.yawFor(this.smoothed.x) - this.yaw) * p.pointerLerp;
    this.helmetPivot.rotation.x = this.tilt;
    this.helmetPivot.rotation.y = this.yaw;
    this.helmetGroup.position.x = p.helmetX + this.smoothed.x * p.helmetFollow;
    this.helmetGroup.position.y =
      p.helmetY - this.smoothed.y * p.helmetFollow * 0.8;
    this.helmetGroup.position.z = p.helmetZ;
    this.helmetGroup.scale.setScalar(p.helmetScale);

    // Pointer speed, eased. Rising quickly and falling slowly is deliberate:
    // the trail should swell the instant the cursor moves and relax back to a
    // blob gradually, not flicker between the two on every jitter.
    const step = Math.hypot(
      this.smoothed.x - this.lastSmoothed.x,
      this.smoothed.y - this.lastSmoothed.y,
    );
    if (this._tier.pointerEnabled) {
      const target = Math.min(1, step / Math.max(p.pacePeak, 1e-5));
      this.pace +=
        (target - this.pace) *
        (target > this.pace ? p.paceAttack : p.paceRelease);
    } else if (!autoEnabled && this.intro >= 1 && this._tier.reveal) {
      // No cursor to measure *and* no sweep running: the pace gate would sit
      // at zero and hide the helmet permanently. Touch devices normally get
      // their movement from the sweep; this only catches the case where it
      // has been switched off by hand. Not on a tier with the reveal off —
      // there the helmet dissolving for good is the intended end state, and
      // forcing the gate open would park a warped blob over the face and
      // charge the full trail loop for it every frame.
      this.pace = 1;
    }
    this.lastSmoothed.x = this.smoothed.x;
    this.lastSmoothed.y = this.smoothed.y;

    // Push the smoothed pointer onto the history, oldest sample falling off
    // the end. Rotating in place keeps the same Vector2 objects, so the
    // uniform array is never reallocated.
    const oldest = this.trail.pop();
    if (oldest) {
      oldest.set(this.smoothed.x, -this.smoothed.y);
      this.trail.unshift(oldest);
    }

    if (this.revealUniforms) {
      this.revealUniforms.uAspect.value = this.aspect;
      this.revealUniforms.uRadius.value = p.trailRadius;
      this.revealUniforms.uIdleScale.value = p.trailIdleScale;
      this.revealUniforms.uTaper.value = p.trailTaper;
      this.revealUniforms.uTaperIdle.value = p.trailTaperIdle;
      this.revealUniforms.uTaperFast.value = p.trailTaperFast;
      this.revealUniforms.uLength.value = p.trailLength;
      this.revealUniforms.uPace.value = this.pace;
      this.revealUniforms.uGateStart.value = p.paceThreshold;
      this.revealUniforms.uGateWidth.value = p.paceRamp;
      this.revealUniforms.uWarpScale.value = p.revealWarpScale;
      this.revealUniforms.uTime.value = t * p.revealSpeed;
      this.revealUniforms.uRevealMix.value = this.reveal;
      this.revealUniforms.uThreshold.value = p.revealThreshold;
      this.revealUniforms.uEdge.value = p.revealEdge;
      this.revealUniforms.uWarp.value = p.revealWarp;
      this.revealUniforms.uIntro.value = this.intro;
      this.revealUniforms.uBurnStart.value = p.burnStart;
      this.revealUniforms.uBurnSoft.value = p.burnSoftness;
      this.revealUniforms.uBurnGlow.value = p.burnGlow;

      this.revealUniforms.uSweepPace.value = this.sweepPace;
      this.revealUniforms.uSweepWarp.value = p.sweepWarp;
      this.revealUniforms.uSweepLength.value = p.sweepLength;
      this.revealUniforms.uSweepRadius.value = p.sweepRadius;

      this.writeTrailBounds(
        this.trail,
        p.trailLength,
        p.revealWarp,
        p.trailRadius,
        this.revealUniforms.uTrailMin.value,
        this.revealUniforms.uTrailMax.value,
      );
      this.writeTrailBounds(
        this.sweepTrail,
        p.sweepLength,
        p.sweepWarp,
        p.sweepRadius,
        this.revealUniforms.uSweepMin.value,
        this.revealUniforms.uSweepMax.value,
      );
    }

    if (this.backdropMesh && this.backdropMaterial) {
      // Sized from the frustum each frame so it always fills the view, even
      // as `cameraZ` changes.
      const distance = this.camera.position.z - BACKDROP_Z;
      const height =
        2 * distance * Math.tan((this.camera.fov * Math.PI) / 360) * 1.06;
      this.backdropMesh.scale.set(height * this.aspect, height, 1);

      const bg = this.backdropMaterial.uniforms;
      bg.uLineScale.value = p.bgLineScale;
      bg.uLineCount.value = p.bgLineCount;
      bg.uLineThickness.value = p.bgLineThickness;
      bg.uLineOpacity.value = p.bgLineOpacity;
      bg.uWaveAmount.value = p.bgWaveAmount;
      bg.uWaveSpeed.value = p.bgWaveSpeed;
      bg.uRevealOpacity.value = p.bgRevealOpacity;
      (bg.uRevealColor.value as Color).setScalar(p.bgRevealLightness);
      (bg.uRevealColorAlt.value as Color).setScalar(p.bgRevealLightnessAlt);
    }

    if (this.outlineMaterial) {
      const outline = this.outlineMaterial.uniforms;
      outline.uTime.value = t;
      outline.uPeriod.value = p.outlinePeriod;
      outline.uStagger.value = p.outlineStagger;
      outline.uOpacity.value = p.outlineOpacity;
      outline.uWidth.value = p.outlineWidth;
      outline.uLightness.value = p.outlineLightness;
      outline.uBase.value = p.outlineBase;
      // Held back until the burn has actually consumed the shell.
      //
      // The outline exists to disclose an *invisible* helmet. Drawn over a
      // solid one — which is exactly what the entrance shows for its first
      // second — it is a wireframe laid across opaque paint and reads as raw
      // polygons, worst of all through the semi-transparent visor. Fading it
      // in on the burn's own curve means the two hand over rather than
      // overlap: the shell dissolves, the outline takes its place.
      outline.uRevealMix.value = this.reveal * this.burnProgress(p);
    }

    // `color` multiplies the base-colour map, so this is a live brightness
    // dial over the baked grey without regenerating the atlas.
    this.shellMaterial?.color.setScalar(p.helmetBrightness);

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * World-space drop still to be travelled by the composition's entrance.
   *
   * `riseDistance` is given in CSS pixels so it stays the same apparent
   * movement on every screen; converting it needs the frustum height at the
   * subject's depth, which changes with `cameraZ`, so it is resolved per
   * frame rather than baked once.
   *
   * Holds at the full drop until `beginRise()` — the loader covers that, and
   * settling into place before the veil lifts would waste the whole gesture.
   */
  private riseOffset(t: number, p: HeroSceneParams): number {
    // Nothing to animate for someone who asked for no motion.
    if (this._tier.freeze || p.riseDistance === 0) return 0;

    let remaining = 1;
    if (this.riseStarted) {
      if (this.riseAt === null) this.riseAt = t;
      const u = Math.min(
        1,
        (t - this.riseAt) / Math.max(p.riseDuration, 0.001),
      );
      // Ease-out quad: leaves at speed and coasts to a stop, so the arrival
      // is the part you notice.
      remaining = 1 - (1 - (1 - u) * (1 - u));
    }
    if (remaining <= 0) return 0;

    const visible =
      2 * p.cameraZ * Math.tan((this.camera.fov * Math.PI) / 360);
    return remaining * p.riseDistance * (visible / this.viewportHeight);
  }

  /**
   * How far the entrance burn has progressed, 0 before it starts and 1 once
   * the shell is gone. Mirrors the `smoothstep(uBurnStart, 1.0, uIntro)` the
   * burn shader uses, so anything keyed off it stays in step with the front.
   */
  private burnProgress(p: HeroSceneParams): number {
    const span = Math.max(1 - p.burnStart, 1e-4);
    const x = Math.min(1, Math.max(0, (this.intro - p.burnStart) / span));
    return x * x * (3 - 2 * x);
  }

  /** Collapses the sweep back to its first waypoint with no motion recorded. */
  private resetSweep() {
    const start = AUTO_SWEEP_PATH[0];
    const amount = this.params.autoSweepAmount;
    const x = start.x * amount;
    const y = start.y * amount;
    this.sweepPointer.x = x;
    this.sweepPointer.y = y;
    this.sweepSmoothed.x = x;
    this.sweepSmoothed.y = y;
    this.sweepLast.x = x;
    this.sweepLast.y = y;
    this.sweepPace = 0;
    for (const sample of this.sweepTrail) sample.set(x, -y);
  }

  /**
   * How much the figure gives back on a narrow screen, and how far right it
   * steps, as the viewport closes on the masthead.
   *
   * The masthead is set in rem and the figure in world units against a fixed
   * camera, so the two do not shrink together: below 1440 the name keeps its
   * share of the width while the figure keeps its share of the *height*, and
   * on a 1280x800 screen the helmet had closed on "antonelli" until the last
   * letters were reading through the glass. At 1440 and above both are
   * identities — 1 and 0 — so the frame the block is drawn at is untouched.
   */
  private narrowFit() {
    if (this.viewportWidth >= PORT_WIDTH) return 1;
    // **Landscape only.** On a portrait screen the React side already sizes
    // the subject to a real box — `fitSubjectToBox`, fed by the bottom-
    // anchored element in `hero/index.tsx` — and applying this on top of that
    // shrank an already-fitted figure a second time: at 768x1024 it came out
    // half the size of its own box and floating in the middle of the screen
    // instead of standing on the foot of it. Returning 1 hands the decision
    // to the box, which is the thing that actually knows the layout.
    if (this.aspect < 1.2) return 1;
    return Math.max(MIN_FIT, Math.min(1, this.aspect / REFERENCE_ASPECT));
  }

  /**
   * Screen-space bounding box of the samples the shader will actually visit,
   * inflated by the widest brush and the warp's reach so nothing inside the
   * mask is ever clipped by the early-out. Written in place — this runs twice
   * a frame and must not allocate.
   */
  private writeTrailBounds(
    trail: Vector2[],
    length: number,
    warp: number,
    radius: number,
    min: Vector2,
    max: Vector2,
  ) {
    // Length and warp differ per trail, and the box has to match the loop it
    // guards — too small and it clips the mask, too large and it stops
    // rejecting anything.
    const active = Math.min(
      trail.length,
      Math.ceil(length * (this.samples - 1)) + 1,
    );
    const margin = radius + warp * 0.22 + 0.05;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < active; i++) {
      const sample = trail[i];
      const x = sample.x * this.aspect;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (sample.y < minY) minY = sample.y;
      if (sample.y > maxY) maxY = sample.y;
    }
    min.set(minX - margin, minY - margin);
    max.set(maxX + margin, maxY + margin);
  }

  dispose() {
    this.disposed = true;
    this.scene.traverse((object) => {
      const mesh = object as Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const material of materials) {
        if (!material) continue;
        for (const value of Object.values(material)) {
          if (value instanceof Texture) value.dispose();
        }
        material.dispose();
      }
    });
    this.renderer.dispose();
  }

  private async load() {
    const textureLoader = new TextureLoader();
    const loadTexture = (file: string, srgb = false, forGltf = false) =>
      new Promise<Texture>((resolve, reject) => {
        textureLoader.load(
          `${ASSETS}/${file}`,
          (texture) => {
            if (srgb) texture.colorSpace = SRGBColorSpace;
            if (forGltf) texture.flipY = false;
            // Mipmapped (three's default), deliberately. These were
            // `LinearFilter`, which drops the mip chain — and the portrait's
            // diffuse and alpha are 2048² drawn onto a plane some 300px wide
            // on a phone: a 7× minification sampled from the full-size level,
            // where neighbouring fragments read texels 7 apart and every
            // fetch misses the cache. That is the texture-thrash stutter the
            // skill's §12 describes, and a mip chain is the whole fix: the
            // sampler reads the level that matches the footprint. Every map
            // here is power-of-two, so the chain is free to generate.
            texture.minFilter = LinearMipmapLinearFilter;
            texture.generateMipmaps = true;
            resolve(texture);
          },
          undefined,
          reject,
        );
      });

    // The source GLBs are Draco-compressed; the decoder ships with three and
    // is served from public/ (see AGENTS rule — assets per section).
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(`${ASSETS}/draco/`);
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    const [env, headMaps, helmetGltf, noise] = await Promise.all([
      new RGBELoader().loadAsync(`${ASSETS}/studio-light.hdr`),
      // Derived from the source portrait by scripts/generate-person-maps.mjs
      // — the cut-out PNG carries neither depth nor normals.
      Promise.all([
        loadTexture("person-diffuse.webp", true),
        loadTexture("person-depth.webp"),
        loadTexture("person-alpha.webp"),
        loadTexture("person-normal.webp"),
      ]),
      // helmet3.glb ships its own baked PBR set — base colour, normal and
      // metallic-roughness painted into the model's own UV layout, embedded
      // as WebP. That is exactly the input ADR-0022 said the old helmet had
      // never been given, so there is no external livery atlas to load any
      // more: the shell keeps the material the GLB arrives with. See ADR-0027.
      gltfLoader.loadAsync(`${ASSETS}/helmet3.glb`),
      // Not a helmet map — the shared reveal/burn noise, read by both the
      // helmet mask and the backdrop's copy of it.
      loadTexture("noise.webp"),
    ]);
    if (this.disposed) return;

    const pmrem = new PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromEquirectangular(env).texture;
    env.dispose();
    pmrem.dispose();

    // Order matters: buildHelmet creates the shared reveal uniforms that the
    // backdrop's copy of the mask reads from.
    this.buildHead(headMaps[0], headMaps[1], headMaps[2], headMaps[3]);
    this.buildHelmet(helmetGltf.scene, noise);
    this.buildBackdrop(noise);

    // Opaque from the first frame. This used to ramp 0 → 1 over about a
    // second once ready, which was both pointless and a visible bug: the
    // loader covers the whole ramp, so nobody ever saw the fade — but if the
    // veil lifted while it was still running, the helmet was caught at
    // partial alpha. Its shell and visor are `transparent` with
    // `depthWrite: false`, so a partly-transparent helmet shows its own back
    // faces through itself and reads as loose polygons. The entrance the
    // scene actually needs is the burn, which starts from a solid helmet.
    //
    // Set before the prewarm render so that throwaway frame is drawn at the
    // real alpha, and every blend path it touches is compiled too.
    this.reveal = 1;

    // Prewarm while the poster still owns the screen: upload every texture,
    // compile every program, and render one throwaway frame so the first
    // visible frame allocates nothing (optimize-3d-scene §3).
    // The helmet's maps come out of the GLB rather than off the network, but
    // they are uploaded on first draw just the same, so they belong here too.
    for (const texture of [...headMaps, noise, ...this.helmetTextures]) {
      this.renderer.initTexture(texture);
    }
    await this.renderer.compileAsync(this.scene, this.camera);
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);

    this.ready = true;
    this.onReady?.();
  }

  private buildHead(
    diffuse: Texture,
    depth: Texture,
    alpha: Texture,
    normal: Texture,
  ) {
    this.headMaterial = new ShaderMaterial({
      vertexShader: headVertex,
      fragmentShader: headFragment,
      uniforms: {
        uDiffuse: { value: diffuse },
        uDepth: { value: depth },
        uAlpha: { value: alpha },
        uNormal: { value: normal },
        uParallax: { value: new Vector2() },
        uReveal: { value: 0 },
        uDepthScale: { value: DEFAULT_PARAMS.headParallax },
        uRelight: { value: DEFAULT_PARAMS.headRelight },
        uExtend: { value: HEAD_EXTEND },
      },
      transparent: true,
    });
    const geometry = new PlaneGeometry(
      HEAD_HEIGHT,
      HEAD_HEIGHT * (1 + HEAD_EXTEND),
    );
    const head = new Mesh(geometry, this.headMaterial);
    head.position.set(0, -0.55, 0);
    this.headMesh = head;
    this.subjectGroup.add(head);
  }

  private buildHelmet(root: Group, noise: Texture) {
    noise.wrapS = RepeatWrapping;
    noise.wrapT = RepeatWrapping;

    // Shared by every masked material, written once per frame in update().
    this.revealUniforms = {
      uTrail: { value: this.trail },
      uTrailMin: { value: new Vector2(-1e3, -1e3) },
      uTrailMax: { value: new Vector2(1e3, 1e3) },
      uSweep: { value: this.sweepTrail },
      uSweepMin: { value: new Vector2(-1e3, -1e3) },
      uSweepMax: { value: new Vector2(1e3, 1e3) },
      uSweepPace: { value: 0 },
      uSweepWarp: { value: DEFAULT_PARAMS.sweepWarp },
      uSweepLength: { value: DEFAULT_PARAMS.sweepLength },
      uSweepRadius: { value: DEFAULT_PARAMS.sweepRadius },
      uAspect: { value: this.aspect },
      uRadius: { value: DEFAULT_PARAMS.trailRadius },
      uIdleScale: { value: DEFAULT_PARAMS.trailIdleScale },
      uTaper: { value: DEFAULT_PARAMS.trailTaper },
      uTaperIdle: { value: DEFAULT_PARAMS.trailTaperIdle },
      uTaperFast: { value: DEFAULT_PARAMS.trailTaperFast },
      uLength: { value: DEFAULT_PARAMS.trailLength },
      uPace: { value: 0 },
      uGateStart: { value: DEFAULT_PARAMS.paceThreshold },
      uGateWidth: { value: DEFAULT_PARAMS.paceRamp },
      uWarpScale: { value: DEFAULT_PARAMS.revealWarpScale },
      uTime: { value: 0 },
      uThreshold: { value: DEFAULT_PARAMS.revealThreshold },
      uEdge: { value: DEFAULT_PARAMS.revealEdge },
      uWarp: { value: DEFAULT_PARAMS.revealWarp },
      uRevealMix: { value: 0 },
      uNoiseTex: { value: noise },
      uIntro: { value: 0 },
      uBurnStart: { value: DEFAULT_PARAMS.burnStart },
      uBurnSoft: { value: DEFAULT_PARAMS.burnSoftness },
      uBurnGlow: { value: DEFAULT_PARAMS.burnGlow },
      uBurnColor: { value: new Color(readToken("--accent")) },
    };

    root.traverse((object) => {
      if (!(object as Mesh).isMesh) return;
      const mesh = object as Mesh;

      // The supplied helmet is a single mesh under one material, not the old
      // helmet/glass/plastic split, so there is nothing to match by name and
      // nothing to hide. The material it arrives with is already the right
      // one — a MeshStandardMaterial carrying the baked base colour, normal
      // and metallic-roughness in the model's own UVs — so the shell is that
      // material, adjusted for the reveal rather than rebuilt from an atlas.
      const shell = mesh.material as MeshStandardMaterial;

      // FrontSide whatever the export declares. The exporter marks this
      // material double-sided, and a double-sided pass that is `transparent`
      // with `depthWrite: false` — which the liquid reveal requires — shows
      // the helmet's own back faces through itself and reads as loose
      // polygons. Same failure the entrance burn was fixed for.
      shell.side = FrontSide;
      shell.transparent = true;
      shell.depthWrite = false;
      // The baked maps set metalness and roughness per texel; only the
      // environment weight is a look decision, and it is the value the
      // previous lacquered shell was tuned to.
      shell.envMapIntensity = 1.3;

      this.injectRevealMask(shell);
      mesh.renderOrder = 1;
      this.shellMaterial = shell;

      // Kept so the prewarm can upload them before the loader lifts.
      for (const map of [
        shell.map,
        shell.normalMap,
        shell.roughnessMap,
        shell.metalnessMap,
      ]) {
        if (map && !this.helmetTextures.includes(map)) {
          this.helmetTextures.push(map);
        }
      }
    });

    // Normalise so the helmet is worn: sized to the head plane's face area.
    const bounds = new Box3().setFromObject(root);
    const size = bounds.getSize(new Vector3());
    const scale = (HEAD_HEIGHT * 0.56) / size.y;
    root.scale.setScalar(scale);
    bounds.setFromObject(root);
    const center = bounds.getCenter(new Vector3());
    // Centred on the pivot's origin, so turning the pivot turns the helmet in
    // place. The offset that actually wears it lives on the pivot itself, one
    // level up, where the tilt cannot reach it.
    root.position.sub(center);
    this.helmetPivot.position.copy(HELMET_WORN_OFFSET);

    this.helmetPivot.add(root);
    this.helmetGroup.updateMatrixWorld(true);
    this.buildOutline(root);
  }

  /**
   * The scanning wireframe. Built from the helmet's own geometries merged into
   * one mesh so the scan is a single draw rather than one per shell, and
   * parented to the same node as the shell — the pivot — so it inherits every
   * transform including the tilt; a separately-placed copy drifts out of
   * register the moment the helmet follows the pointer.
   */
  private buildOutline(root: Group) {
    // Bake each mesh into the pivot's local space. Using `matrixWorld`
    // directly would fold in that node's own transform and then have it
    // applied a second time when the outline is parented back to it.
    const toGroupLocal = this.helmetPivot.matrixWorld.clone().invert();

    const geometries: BufferGeometry[] = [];
    root.traverse((object) => {
      const mesh = object as Mesh;
      // Only the shell and visor — the hidden plastic hardware would scan too.
      if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return;
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(
        new Matrix4().multiplyMatrices(toGroupLocal, mesh.matrixWorld),
      );
      // The merge needs an identical attribute set across inputs.
      for (const name of Object.keys(geometry.attributes)) {
        if (name !== "position") geometry.deleteAttribute(name);
      }
      geometries.push(geometry);
    });
    if (!geometries.length) return;

    const merged = mergeGeometries(geometries, false);
    for (const geometry of geometries) geometry.dispose();
    if (!merged) return;

    // A full triangle wireframe, not crease edges: the shell is a smooth dome,
    // so any workable crease threshold throws the silhouette away and leaves
    // only the visor brim floating. Density is handled with opacity instead —
    // each line is faint enough that the overlap reads as a ghosted surface
    // rather than the solid grey mass a higher alpha collapses into.
    merged.computeBoundingBox();
    const bounds = merged.boundingBox;
    const minY = bounds?.min.y ?? 0;
    const rangeY = bounds ? bounds.max.y - bounds.min.y : 1;

    this.outlineMaterial = new ShaderMaterial({
      vertexShader: outlineVertex,
      fragmentShader: outlineFragment,
      wireframe: true,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uPeriod: { value: DEFAULT_PARAMS.outlinePeriod },
        uStagger: { value: DEFAULT_PARAMS.outlineStagger },
        uOpacity: { value: DEFAULT_PARAMS.outlineOpacity },
        uWidth: { value: DEFAULT_PARAMS.outlineWidth },
        uLightness: { value: DEFAULT_PARAMS.outlineLightness },
        uBase: { value: DEFAULT_PARAMS.outlineBase },
        uRevealMix: { value: 0 },
        uColor: { value: new Color(readToken("--foreground")) },
        uMinY: { value: minY },
        uRangeY: { value: rangeY },
      },
    });

    const outline = new Mesh(merged, this.outlineMaterial);
    outline.renderOrder = 3;
    // Per tier — off on a phone, where 113k mostly sub-pixel lines are the
    // most expensive draw in the frame for the least visible thing in it.
    // See `SceneTier.outline`. Built regardless, and compiled in the prewarm,
    // so a tier change can switch it on without a mid-session compile.
    outline.visible = this._tier.outline;
    this.outlineMesh = outline;
    // `root` already carries the fit transform, and the merge baked each
    // mesh's world matrix in — so the outline goes beside root, not inside it.
    // On the pivot, though, or the wireframe stays put while the shell tilts.
    this.helmetPivot.add(outline);
  }

  /**
   * Injects the liquid reveal into a material's alpha.
   *
   * The mask is the cursor's recent *path* (see `SceneTier.trailSamples`), not a falloff
   * around its current position: the helmet floods along the way the pointer
   * came and drains behind it. The threshold is deliberately narrow —
   * `uEdge` is a few hundredths — because a hard boundary is what makes the
   * surface read as liquid metal instead of a soft spotlight; the softness
   * that keeps it from looking cut out comes from `uWarp` displacing the
   * lookup with scrolling noise, so the edge crawls.
   *
   * Shares one uniforms object across every masked material (shell + visor).
   */
  private injectRevealMask(material: MeshStandardMaterial) {
    const uniforms = this.revealUniforms;
    if (!uniforms) return;

    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec4 vRevealClip;",
        )
        .replace(
          "#include <project_vertex>",
          "#include <project_vertex>\nvRevealClip = gl_Position;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec4 vRevealClip;
           uniform float uIntro;
           uniform float uBurnStart;
           uniform float uBurnSoft;
           uniform float uBurnGlow;
           uniform vec3 uBurnColor;
           ${buildRevealDeclarations(this.samples)}`,
        )
        .replace(
          "#include <alphamap_fragment>",
          `#include <alphamap_fragment>
           vec2 revealNdc = vRevealClip.xy / vRevealClip.w;

           // Entrance: the helmet arrives whole, then burns off.
           //
           // Every pixel gets a threshold from a noise lookup biased by
           // height, and the burn front sweeps that threshold from 0 to 1.
           // Pure noise dissolves as an even speckle; pure height is a flat
           // wipe. Mixing them gives a ragged front that still travels
           // crown-to-chin, which is the direction the outline wave runs.
           float burnFront = smoothstep(uBurnStart, 1.0, uIntro);
           float burnNoise = texture2D(uNoiseTex, revealNdc * 0.5 + 0.5).r;
           float burnHeight = 1.0 - (revealNdc.y * 0.5 + 0.5);
           float burnAt = mix(burnHeight, burnNoise, 0.45);
           // 1 where the shell is still intact, 0 where the burn has passed.
           float intact = smoothstep(
             burnFront - uBurnSoft,
             burnFront + uBurnSoft,
             burnAt
           );

           // Union, so the cursor can already be carving the helmet back in
           // while the tail of the burn is still finishing.
           float mask = max(revealTrail(revealNdc), intact);
           diffuseColor.a *= mask * uRevealMix;

           // The dissolve front itself glows — without it the shell just
           // thins out and the burn reads as a fade, not a burn.
           //
           // Derived from intact rather than from a second gaussian over
           // burnAt, which is what made the burn flicker. That form had its
           // own width (uBurnSoft) applied to a *noisy* field, so at a tight
           // setting the glowing pixels were a scatter that re-rolled every
           // frame as the front crept — sparkle, not a moving edge. This peaks
           // at exactly intact == 0.5, so it is pinned to the real dissolve
           // boundary however ragged that is, and can never be noisier than
           // the dissolve already is.
           float burnEdge = 4.0 * intact * (1.0 - intact);

           // No step() gate either: that snapped the glow off the instant
           // uIntro reached 1 and popped. intact is already 0 once the burn
           // has passed, so the term retires on its own.
           diffuseColor.rgb += uBurnColor * burnEdge * uBurnGlow * uRevealMix;`,
        );
    };
  }

  /**
   * The backdrop plane — animated contour lines plus the grey half of the
   * cursor reveal. Sits behind everything and is re-scaled to the frustum
   * each frame, so it fills the view at any aspect or camera distance.
   *
   * It replaces the circuit-outline `LineSegments` that used to sit here.
   * Those could not do what was asked of them: `LineBasicMaterial.linewidth`
   * is ignored by every WebGL backend, so "a little thicker" was impossible
   * without pulling in fat-line geometry, and they were five draws for art
   * that a single shader now produces and animates.
   */
  private buildBackdrop(noise: Texture) {
    const uniforms = this.revealUniforms;
    if (!uniforms) return;

    this.backdropMaterial = new ShaderMaterial({
      vertexShader: backdropVertex,
      fragmentShader: buildBackdropFragment(this.samples),
      depthWrite: false,
      uniforms: {
        ...uniforms,
        uNoiseTex: { value: noise },
        uBackground: { value: new Color(readToken("--background")) },
        uLineColor: { value: new Color(readToken("--surface-soft")) },
        uRevealColor: {
          value: new Color().setScalar(DEFAULT_PARAMS.bgRevealLightness),
        },
        uRevealColorAlt: {
          value: new Color().setScalar(DEFAULT_PARAMS.bgRevealLightnessAlt),
        },
        uLineScale: { value: DEFAULT_PARAMS.bgLineScale },
        uLineCount: { value: DEFAULT_PARAMS.bgLineCount },
        uLineThickness: { value: DEFAULT_PARAMS.bgLineThickness },
        uLineOpacity: { value: DEFAULT_PARAMS.bgLineOpacity },
        uWaveAmount: { value: DEFAULT_PARAMS.bgWaveAmount },
        uWaveSpeed: { value: DEFAULT_PARAMS.bgWaveSpeed },
        uRevealOpacity: { value: DEFAULT_PARAMS.bgRevealOpacity },
      },
    });

    const backdrop = new Mesh(new PlaneGeometry(1, 1), this.backdropMaterial);
    backdrop.position.z = BACKDROP_Z;
    backdrop.renderOrder = -1;
    this.backdropMesh = backdrop;
    this.scene.add(backdrop);
  }
```

`visibleWorldHeight` and `fitSubjectToBox` (in the module above) are what the wrapper uses to keep the subject the size the layout box gives it while the canvas spans the whole block.

## 3 — The season so far

`<section data-season>` — `container-type: inline-size; position: relative; isolation: isolate; min-height: var(--season-h, 100lvh); overflow: hidden; background: var(--surface-black); color: var(--foreground-on-dark)`.
This block is written in `rem` for its copy (so it shares the hero's gutters) and in **`cqw`** for its
plate and rules; `px(v) = (v/1440*100).toFixed(4)cqw`. Below `lg` it sets, on the section:
`--gutter-min: 32px; --type-min: 13px; --copy-min-size: 17px; --copy-min-w: 15rem; --head-min: 6.6667cqw; --plate-w: 277px; --plate-h: 78px; --plate-cell: 83px; --plate-badge-gap: 11px; --plate-globe-w: 37px; --plate-globe-h: 23px; --plate-stats-left: 16px; --plate-stats-gap: 8px; --plate-eyebrow: 12px; --plate-body: 14px`;
below `sm` also `--head-min: 40px; --head-air: 20px; --season-h: 680px`.

Layers: the circuit stage (`absolute inset-0`, described below), the chequered dissolve
(`z-index 10`, phone `z-index 0`), then the copy column:
`position: relative; min-height: var(--season-h, 100lvh); display: flex; flex-direction: column; justify-content: space-between; gap: 4rem; padding: 4.8611cqw 1.5rem 2rem` — from `sm` the sides and bottom are `--season-gutter: max(2.2222cqw, var(--gutter-min, 0px))`.

### The heading (left rail)

`<h2>` Oswald 700, uppercase, line-height 0.95, `color: var(--accent)`,
`font-size: max(3.8194cqw, var(--head-min, 0px))`, two authored lines — `the season` / `so far` —
each its own word reveal (`wordStagger 110`, `REVEAL`, `delayIn index * 130`, mode forward,
`justify-content: flex-start`), and the full stop after the last line as a separate span in
**white** (`--foreground-on-dark`), fading in at `130 + 110`. Then a cyan rule — `1.6667cqw × 0.1389cqw`,
`margin-top: max(1.9444cqw, var(--head-air, 0px))`, `transform-origin: left`, `{opacity 0, scaleX(0)}
→ {1, 1}` at `2 * 130` — and the intro
`Every race is a step forward. Here's how the season is shaping up.` word by word
(`wordStagger 34`, `{150, 24}`, `column-gap: 0.22em`, delay `2*130 + 90`), uppercase, line-height
1.1, `margin-top: max(2.0833cqw, var(--head-air))`, `width: max(16.1111cqw, var(--copy-min-w))`,
`font-size: max(1.25cqw, var(--copy-min-size))`.

### The standings plate (bottom right, `align-self: flex-end`)

A `277×78` frame with the bottom-right corner cut 9, drawn as one stroked-and-filled SVG path:
`viewBox="0 0 277 78"`, `M0.5 0.5H276.5V69L268 77.5H0.5Z`, `fill: var(--surface-black); stroke: var(--accent); stroke-width 1; vector-effect: non-scaling-stroke`, plus a divider line at `x = 83`.
Size `var(--plate-w, 19.2361cqw) × var(--plate-h, 5.4167cqw)`, `display: grid; grid-template-columns: var(--plate-cell, 5.7639cqw) 1fr`.
The plate rises `{0, translateY(0.75rem)} → {1, 0}` with `REVEAL` at **260ms**; its type starts at
**430**.

- Badge cell (centred column, `gap: var(--plate-badge-gap, 0.7639cqw)`): the **globe** — an SVG
  `viewBox="0 0 37 23"`, `stroke: var(--accent); stroke-width 1; fill none`: an ellipse
  `cx 18.5 cy 11.5 rx 18 ry 11`, the equator line from `0.5,11.5` to `36.5,11.5`, and a **meridian**
  ellipse whose `rx = max(0.5, |cos(turn)| * 18)`, `turn` running 0→2π every **10s** linear, looping
  (paused off screen). Under it `F1` (white) and `/ 2026` (accent), letter by letter
  (`letterStagger 22`, `TYPE {210, 24}`) at 430 and 490, `font-size: var(--plate-eyebrow, max(0.8333cqw, var(--type-min)))`, line-height 0.72, tracking −0.02em, `gap: 0.3em`.
- Stats cell (`padding-left: var(--plate-stats-left, 1.1111cqw); gap: var(--plate-stats-gap, 0.5556cqw)`, uppercase, line-height 0.72, `font-size: var(--plate-body, max(0.9722cqw, var(--type-min)))`),
  three rows `<dt>` accent + `<dd>` white (`gap: 0.35em`, `dd` grows, nowrap), letter by letter:
  `P1` / `in the championship`, `6` / `wins`, `9` / `podiums.` — the figure at `430 + row * 110`, its
  wording 70ms after.

### The chequered dissolve (the seam)

A canvas band `absolute inset-x-0 top-0; height: 34svh; pointer-events: none`, over the copy.
Scrubbed by a scroll trigger `start "top bottom" → end "top top"` (`TRIGGER {140, 30}`), progress
0→1 as the band's top rises from the fold to the ceiling. Verbatim render:

```ts
const CELL = 24;            // square edge in CSS px; read `--flag-cell` off the band first if set
const SOLID_UNTIL = 0.16;   // share of the band that stays solid before the checker starts
const LIFT = 2;             // how far the pattern travels off the top over the window
const ACCENT_SHARE = 0.06;  // share of squares that come through in the accent instead
const noise = (x, y) => {   // deterministic per-cell hash — stable across resizes
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
// render(): ratio = min(devicePixelRatio, 2); surface = carry === "light" ? --background : --surface-black
const columns = Math.ceil(width / cell), rows = Math.ceil(height / cell), lift = progress * LIFT;
for (let y = 0; y < rows; y += 1) {
  const depth = y / Math.max(1, rows - 1) + lift;
  if (depth > 1) break;
  const solid = depth <= SOLID_UNTIL;
  const fade = clamp01(1 - (depth - SOLID_UNTIL) / (1 - SOLID_UNTIL));
  if (!solid && fade <= 0) break;
  for (let x = 0; x < columns; x += 1) {
    if (!solid) {
      if ((x + y) % 2 !== 0) continue;          // only one colour of the board survives
      if (noise(x, y) > fade) continue;
    }
    context.fillStyle = !solid && noise(x + 101, y + 57) < ACCENT_SHARE ? accent : surface;
    context.fillRect(x * cell, y * cell, cell, cell);
  }
}
```

`carry="light"` here (the hero's ground carried into the dark block). The same component seams the
timeline (`carry="light"`, `z-index 30`) and the paddock (`carry="dark"`: the near-black carried into
the light block, `z-index 30`). Re-render on resize and on every progress change.

### The circuit stage

A `1440×800` stage (`position: absolute; left: 0; top: 0; width: 1440px; height: 800px; transform-origin: top left`) inside an `absolute inset-0; overflow: hidden` frame masked top and bottom
(`mask-image: linear-gradient(to bottom, transparent 0, #000 10%, #000 90%, transparent 100%)`; no
mask below `lg`). **Fit**: from 1024 wide, **cover** — `scale = max(w/1440, h/800)`, centred by
`translate((w - 1440s)/2, (h - 800s)/2)`. Below 1024, **fit the track box to the width**:
`TRACK_BOX` = the lap path's bounding box padded 46 → `scale = w / TRACK_BOX.width`, centred on the
box's centre. Re-fit on resize.

Inside the stage, two things at the artboard's coordinates:

1. **The map** — a `2560×1440` SVG (plus its halftone canvas beneath it) placed at
   `top: 2 - 11.67 * 796 / 1416.66 px` (= −4.559px), `width: 1438.43px`, `height: 796 * 1440 / 1416.66 px` (= 809.11px) — the artwork is 1.807:1 in a squarer frame, banded 11.67 top and bottom; undoing the band seats the circuit on the artboard.
2. **The trace canvas** — `1440×800` CSS, backing store `× min(devicePixelRatio, 2)` (1 on a coarse
   pointer), drawn in artboard units.

#### The map SVG

`viewBox="0 0 2560 1440"`, `overflow: visible`, `aria-hidden`. In this order:

- **The halftone canvas** `absolute inset-0` under the SVG (see below).
- `<g id="grid">`: three vertical and one horizontal dashed axes — `x = 645.31, 1276.96, 1908.61` and
  `y = 697.98`, drawn **4000 units past the artboard** on both ends, `stroke: var(--map-grid); stroke-width 2.13; stroke-dasharray "12.15 8.35"`, with `stroke-dashoffset` running 0 → 20.5 (one dash period) every **7s** linear, looping — the grid crawls. Three rings on the hub `(1278.48, 699.5)`: `r 69.85` width 3.04 in `--map-grid`; `r 356.06` and `442.61` width 2.13 in `--map-grid-ghost`. A **ping**: a circle on the hub, `r = 10.63 + v * 86`, `opacity = 0.4 * (1 - v)²`, `stroke: var(--accent)` width 2.13, `v` 0→1 every **4.2s** ease-out quad, looping. Seven `16.7`-square corner marks in `--map-mark` at `[65.29, 76.96] [2471.93, 76.96] [65.29, 931.81] [2471.93, 931.81] [65.29, 1343.3] [1155.49, 1343.3] [1384.77, 1343.3]` and the hub dot `r 10.63`. Both loops pause off screen.
- The **track**, cut at the flag: inside a mask that is white everywhere except a
  `36 × 40` black rect centred on `(822.96, 921.57)` rotated `144°` — the ribbon path `TRACK_RIBBON`
  (below) filled `--foreground-on-dark`, and the **same path filled `--accent` under the lap mask**.
- The **lap mask**: `LAP_CENTRELINE` stroked white, `stroke-width 30`, round caps and joins,
  `stroke-dasharray = 4805.57 + 60`, `stroke-dashoffset = 60 + reveal * 4805.57` where
  `reveal = 1 - distanceAtTime(lap) / TOTAL` — the mask uncovers the designer's ribbon *along the
  lap* on the same distance curve the canvas head uses.
- `<g id="markers">`: four turn triangles — `<polygon points="13.69,0 -6.85,11.86 -6.85,-11.86">`
  filled `--accent`, at `(1349.96, 351.98) rotate 73.5`, `(1862.23, 611.24) rotate 30.5`,
  `(1732.95, 903.82) rotate 89.5`, `(585.43, 916.65) rotate 17.5` — and the chequered flag
  `FLAG_DIAMONDS` in `--map-mark`, over the gap the cut leaves.

The vector data, verbatim:


```ts
// 📖 Docs: obsidian/frontend/components/sections.md

/**
 * The season block's measurements, in the design's own pixels.
 *
 * `cqw` — a share of the block's own width — which is what the timeline, the
 * paddock and the footer use. It was written in **rem** because it shares the
 * page's gutters with the hero, and that is exactly what made its type the
 * odd one out: below 1280 the root font size is pinned at 16, so a 55 here
 * stayed 55 while the same 55 in the timeline scaled with the viewport. At
 * 768 the two headlines came out 55 and 29.3 side by side. On `cqw` all four
 * blocks scale as one, and at 1440 nothing moves — a rem *is* a design pixel
 * there.
 */
export const px = (value: number) =>
  `${((value / 1440) * 100).toFixed(4)}cqw`;

/**
 * A design pixel for **type**, with a floor — the same helper the timeline,
 * the paddock and the footer carry, so the four blocks size their type by one
 * rule. Anything above the floor keeps its exact share of the frame.
 */
export const type = (value: number) =>
  `max(${px(value)}, var(--type-min, 0px))`;

/**
 * The block's masthead, with a floor of its own.
 *
 * The four blocks do not set their mastheads at one size — the frame gives
 * the paddock 96 and the other three 55 — and scaled down that spread reads
 * as three different type systems rather than one: at 768 it is 51.2 against
 * 29.3. The floor closes the gap from below, so every masthead lands on the
 * paddock's size where the block is narrow and each keeps the frame's own
 * number where it is not.
 */
export const masthead = (value: number) =>
  `max(${px(value)}, var(--head-min, 0px))`;

/** The block's own gutter, the same 32 every other block sets. */
export const GUTTER = 32;

/** The left rail: the cyan rule under the headline, then the intro. */
export const RULE = { top: 28, width: 24, height: 2 } as const;
export const INTRO = { top: 30, width: 232 } as const;

/** The standings plate, and the cells inside it. */
export const PLATE = {
  width: 277,
  height: 78,
  /** The cyan divider, which is also the badge cell's width. */
  divider: 83,
  cut: 9,
  /** Globe over wordmark, inside the badge cell. */
  badgeGap: 11,
  globe: { width: 37, height: 23 },
  /** The figures cell: its inset from the divider, and its row rhythm. */
  statsLeft: 16,
  statsGap: 8,
} as const;
```

`map-vector.ts`:

```ts
// 📖 Docs: obsidian/frontend/components/sections.md

/**
 * The block's artwork as vector, in the map SVG's own 2560x1440 space.
 *
 * `TRACK_RIBBON` is the designer's path, not a trace of it: the Figma layer
 * arrives as a filled ribbon with variable width, which is why the lap now
 * *fills the real shape* instead of a constant-width stroke standing in for it.
 * Its position came from the raster — the exported layer carries none — by
 * fitting its bounding box to the track's, which agreed on both axes to 1.0000.
 *
 * `LAP_CENTRELINE` is the same walk `circuit-path.ts` animates, mapped into
 * this space and simplified. It is only ever a *mask*: stroked wide and
 * revealed by `stroke-dashoffset`, it uncovers the ribbon along the lap. It
 * strays at most 3.3 units from the path the canvas uses, against a mask half
 * width of 12, so the two can never come apart.
 */

/** The artwork's frame. The 1.807:1 art sits in a squarer box, banded top and
 *  bottom — `BAND` is what has to be undone to seat it on the artboard. */
export const MAP_VIEW = { width: 2560, height: 1440, band: 11.67 } as const;

export const TRACK_RIBBON =
  "M1739.98 200.38C1750.67 207.68 1753.87 215.16 1752.98 229.76C1751.91 245.43 1747.46 251.84 1726.27 267.52C1704.73 283.54 1698.68 289.24 1694.58 297.26C1687.82 310.43 1691.91 329.49 1703.31 337.68C1706.16 339.64 1716.13 344.09 1725.38 347.48C1759.21 359.58 1764.02 364.21 1770.61 389.68C1776.66 412.83 1781.29 418.53 1806.39 434.38C1832.74 450.76 1844.67 462.52 1854.11 481.22C1858.02 489.05 1865.5 503.48 1870.66 513.27C1881.17 533.04 1883.13 541.59 1879.92 552.98C1873.87 576.13 1842.54 589.49 1820.81 578.27C1810.13 572.75 1808.71 571.33 1788.94 546.04C1770.25 521.82 1758.32 510.96 1742.83 503.83C1734.29 499.74 1730.55 499.2 1714.35 499.2C1695.83 499.02 1684.08 501.52 1665.39 509.71C1662.54 510.96 1652.39 514.52 1643.13 517.72C1633.87 520.75 1624.97 523.78 1623.55 524.31C1622.12 524.85 1619.63 525.56 1618.21 525.91C1616.78 526.27 1609.12 528.41 1601.29 530.9C1593.46 533.22 1579.93 537.31 1571.02 539.98C1562.3 542.48 1551.8 545.68 1547.88 547.11C1543.96 548.53 1535.24 550.85 1528.3 552.63C1521.53 554.23 1514.76 556.37 1513.52 557.44C1512.27 558.33 1510.85 558.68 1510.31 558.15C1509.78 557.61 1503.9 558.86 1497.49 560.64C1490.91 562.6 1479.87 565.27 1472.75 566.69C1441.59 572.75 1425.57 589.49 1417.02 624.93C1415.06 633.12 1412.93 647.01 1412.21 655.92C1410.08 689.04 1423.07 710.59 1453.52 724.12C1458.5 726.26 1464.02 728.93 1465.98 730C1467.94 731.07 1482.72 736.59 1498.92 742.11C1515.12 747.81 1529.54 752.79 1530.97 753.5C1532.39 754.04 1538.26 755.64 1543.96 757.07C1549.48 758.49 1554.82 760.09 1555.71 760.63C1556.6 761.16 1561.59 762.76 1566.75 764.19C1576.01 766.68 1616.96 780.93 1635.12 787.88C1652.92 794.64 1673.04 806.22 1682.65 814.94C1702.24 832.75 1705.44 852.16 1695.12 886.18C1687.46 910.93 1687.28 925.18 1694.41 936.4C1701.88 947.97 1710.79 954.92 1730.01 964.36C1807.64 1001.57 1822.24 1011.37 1832.21 1032.2C1839.86 1048.05 1836.66 1059.09 1816.01 1087.59C1811.38 1094 1800.34 1109.49 1791.79 1122.31C1774.17 1147.96 1769.54 1152.77 1756.36 1159.89C1742.65 1167.01 1726.27 1167.55 1699.21 1161.49C1658.62 1152.41 1615 1135.49 1585.62 1117.15C1546.46 1092.75 1517.79 1062.3 1456.72 980.74C1413.82 923.4 1393.16 901.49 1363.08 881.72C1341.53 867.48 1303.97 852.16 1284.74 849.85C1280.64 849.31 1273.34 848.25 1268.36 847.18C1246.1 843.08 1213.34 846.82 1190.55 855.9C1183.43 858.75 1168.83 865.34 1157.97 870.33C1118.09 889.2 1089.43 901.13 1060.94 910.75C1053.64 913.24 1046.88 915.92 1045.99 916.81C1044.92 917.7 1042.78 918.41 1041.18 918.41C1039.4 918.41 1031.74 920.37 1024.09 922.68C997.56 930.87 985.1 934.44 954.65 942.45C917.26 952.25 905.16 952.96 893.94 945.66C885.57 940.14 882.9 934.44 882.9 921.26C882.9 911.11 879.7 904.88 872.75 902.2C867.77 900.42 861.72 902.92 849.25 912.53C843.2 916.98 840.88 917.88 839.1 916.45C837.68 915.38 836.61 915.03 836.61 915.74C836.61 916.45 835.37 916.09 833.94 914.85C830.38 912 830.56 909.68 834.48 908.26C836.08 907.72 842.13 903.99 847.65 900.24C853.17 896.33 860.65 892.41 864.39 891.7C880.23 888.13 893.58 901.31 893.58 920.37C893.58 942.81 904.98 945.12 953.23 931.94C962.13 929.45 979.76 924.64 992.75 921.08C1015.9 914.85 1036.19 908.79 1041.36 906.48C1042.78 905.94 1044.38 905.23 1044.92 905.05C1045.45 904.88 1048.66 903.99 1052.04 902.92C1072.34 896.86 1107.77 882.08 1165.09 855.55C1192.69 842.9 1204.98 839.34 1230.08 836.49C1256.61 833.46 1292.39 838.63 1321.41 849.67C1334.41 854.48 1367.88 871.39 1372.33 875.14C1373.94 876.56 1381.41 882.44 1389.07 888.49C1410.79 905.41 1431.44 929.09 1474.71 986.97C1531.86 1063.19 1567.64 1097.92 1612.69 1120.71C1644.38 1136.56 1705.98 1155.26 1726.99 1155.26C1741.76 1155.26 1754.05 1150.81 1763.48 1141.9C1767.58 1137.99 1777.55 1124.81 1785.74 1112.52C1793.75 1100.23 1804.44 1085.09 1809.24 1078.86C1820.64 1064.08 1827.22 1050.01 1825.62 1043.25C1823.31 1032.2 1814.76 1022.41 1798.38 1011.37C1789.48 1005.49 1776.3 997.83 1769.18 994.45C1709.18 965.78 1704.2 963.11 1695.3 954.74C1679.27 939.78 1674.64 921.62 1680.7 899.35C1682.48 892.59 1685.5 882.08 1687.64 876.03C1692.63 860.36 1692.27 848.07 1686.75 837.2C1674.64 813.87 1648.83 800.87 1555 771.49C1447.64 737.83 1421.29 724.48 1409.19 697.76C1399.22 675.33 1398.86 654.49 1408.12 618.52C1413.1 598.93 1418.62 587.71 1427.88 578.27C1439.63 566.34 1451.56 560.82 1482.54 553.16C1497.85 549.42 1517.79 544.08 1526.51 541.59C1542.72 536.95 1563.73 531.26 1583.49 525.74C1589.36 524.13 1595.42 522.35 1596.84 521.82C1598.26 521.28 1600.4 520.57 1601.65 520.22C1608.77 518.79 1647.4 505.61 1669.12 497.07C1702.42 484.24 1726.63 484.6 1753.69 498.13C1766.87 504.9 1785.21 522.89 1803.72 547.28C1814.4 561.35 1819.21 566.16 1825.62 569.37C1836.12 574.35 1847.52 573.28 1857.49 566.16C1870.84 556.72 1874.4 542.65 1866.93 528.23C1864.61 523.96 1856.6 508.82 1849.12 494.57C1833.45 465.19 1829.72 460.91 1803.72 445.06C1786.1 434.02 1771.32 421.2 1766.87 412.65C1765.44 409.98 1763.13 402.5 1761.7 395.91C1756.01 371.87 1751.02 366.89 1723.25 357.63C1696.54 348.72 1683.9 336.97 1681.41 318.27C1678.56 297.08 1687.28 283.19 1718.8 260.39C1733.4 249.71 1737.85 245.43 1740.87 239.02C1745.33 229.58 1745.5 225.84 1742.12 217.83C1738.92 210.35 1733.04 206.08 1725.38 206.08C1719.15 206.08 1694.76 216.23 1694.76 218.9C1694.76 219.61 1693.34 220.32 1691.56 220.32C1689.78 220.32 1687.64 221.04 1686.75 221.93C1685.68 222.82 1630.49 250.95 1563.9 284.43C1497.32 318.09 1442.12 346.05 1441.06 346.76C1440.17 347.48 1407.58 364.04 1368.95 383.27C1330.32 402.5 1296.13 420.31 1292.93 422.63C1289.9 424.94 1286.52 426.9 1285.63 426.9C1284.74 426.9 1276.37 432.24 1267.29 438.83C1223.14 470 1204.98 479.97 1157.97 498.13C1112.4 515.76 1070.73 536.78 1046.34 554.59C1036.02 562.24 1015.9 578.63 1001.83 591.09C966.94 621.9 948.42 637.22 933.64 647.55C917.26 658.94 891.98 671.94 882.55 673.72C870.8 676.04 843.02 686.55 835.72 691.53C820.41 701.68 807.41 717.53 771.63 770.07C764.33 780.93 749.19 797.49 722.67 824.03C653.05 893.66 647 902.56 601.6 999.44C596.08 1011.01 578.63 1047.7 567.59 1070.85C558.34 1090.08 557.62 1094.36 562.43 1100.59C564.57 1103.26 567.59 1105.4 569.2 1105.4C572.4 1105.4 579.17 1101.3 587.18 1094.71C589.67 1092.57 631.51 1061.23 679.94 1024.9C728.36 988.57 776.26 952.6 786.05 945.12C801.72 933.19 804.56 931.59 806.7 933.73C808.84 936.04 809.73 935.86 812.58 932.66C815.25 929.81 815.43 928.74 813.47 926.42C811.33 923.93 810.8 923.93 808.13 926.42C805.45 928.92 804.92 928.92 802.78 926.42C800.65 923.75 801 921.79 804.92 916.27C806.7 913.6 806.7 912.53 804.03 910.04C801.18 907.19 801.18 906.83 804.92 902.92L808.84 898.82L812.76 903.63C816.49 908.44 816.85 908.44 820.05 905.41C823.44 902.56 823.79 902.56 826.82 905.94C830.2 909.68 830.2 909.68 825.22 913.6C820.77 917.16 820.59 917.88 823.08 920.01C824.51 921.26 826.46 921.79 827.35 921.26C828.42 920.72 830.02 921.44 831.27 922.86C833.23 925.35 833.94 925.35 836.97 922.68C839.99 919.83 840.35 919.83 842.66 923.04C844.8 925.89 844.8 926.78 842.66 929.27C840.53 931.59 840.71 932.48 843.02 936.04C845.69 939.78 845.69 940.31 843.2 942.98C840.53 945.48 839.99 945.48 836.61 942.45C833.23 939.42 833.23 939.07 836.08 935.86C838.75 932.83 838.75 932.3 836.08 929.63C833.58 927.14 832.87 927.14 830.2 929.27C827.89 931.23 827 931.23 826.46 929.45C825.4 926.42 821.48 926.78 818.81 929.98C815.78 933.73 819.88 939.07 823.44 936.04C826.46 933.55 831.27 935.15 831.27 938.53C831.27 939.96 830.02 942.09 828.6 943.34C826.29 945.3 825.4 945.12 823.44 942.27C821.3 939.6 820.59 939.42 818.1 941.38C815.96 943.16 814.71 943.34 812.76 941.74C810.08 939.42 810.08 939.6 760.05 978.07C751.69 984.48 724.8 1004.78 700.23 1023.3C675.66 1041.64 654.3 1057.67 653.05 1058.74C642.37 1067.82 580.06 1112.34 576.67 1113.59C574.18 1114.3 570.44 1115.19 568.13 1115.19C562.08 1115.37 551.75 1105.75 550.15 1098.27C548.19 1089.01 551.04 1081.53 578.45 1024.37C585.22 1009.94 590.92 998.01 590.92 997.66C590.92 995.34 619.05 937.64 629.2 919.3C645.22 889.92 664.63 866.23 703.62 828.3C729.79 802.83 747.59 784.13 755.6 773.81C761.83 765.97 786.76 729.29 786.76 727.86C786.76 727.15 787.47 726.08 788.19 725.72C788.9 725.37 793.17 720.38 797.8 714.51C818.81 687.08 831.98 677.82 861.54 669.09C907.12 655.74 928.84 642.2 987.77 590.02C998.81 580.05 1010.38 569.72 1013.58 567.05C1022.84 558.86 1045.27 541.94 1056.49 534.64C1066.46 528.23 1111.33 505.08 1115.24 504.19C1116.31 504.01 1126.99 499.74 1139.28 494.75C1151.56 489.59 1169.55 482.11 1179.34 478.19C1189.13 474.09 1203.91 466.97 1212.28 462.16C1231.5 451.12 1230.97 451.48 1252.87 436.16C1278.86 418 1282.07 416.04 1312.51 400.37C1355.06 378.46 1632.63 237.95 1698.32 205.01C1720.93 193.61 1729.12 192.72 1739.98 200.38Z";

export const LAP_CENTRELINE =
  "M813.87 936.41L803.19 936.95L794.47 942.82L576.98 1105.84L561.86 1106.02L553.67 1093.21L563.46 1063.13L641.23 905.8L680.74 855.61L755.85 779.8L801.76 714.66L827.57 687.79L841.09 679.42L896.62 660.91L919.94 648.1L958.56 619.62L1031.17 556.8L1075.48 527.26L1197.39 474.22L1296.52 411.93L1710.49 202.81L1720.63 199.97L1736.12 202.64L1745.73 215.27L1747.51 230.93L1738.07 249.8L1703.9 275.25L1689.66 291.09L1683.97 311.38L1687.71 326.86L1702.12 342.34L1741.63 358.18L1754.62 367.08L1774.73 415.67L1837.38 464.43L1874.58 535.09L1875.29 545.59L1868.53 560L1856.96 570.86L1847.17 574.95L1825.99 574.24L1812.29 566.05L1801.61 554.31L1775.45 520.85L1754.98 503.59L1730.6 493.44L1699.27 491.66L1613.85 520.32L1445.49 568.55L1428.94 581.89L1417.55 599.87L1404.73 656.46L1406.51 677.64L1413.81 697.58L1423.6 710.03L1440.86 722.67L1484.64 741.89L1621.32 786.38L1664.75 806.67L1684.86 823.94L1694.47 848.32L1694.11 864.34L1682.37 910.43L1683.08 926.27L1690.02 940.68L1709.42 958.48L1776.87 990.87L1804.1 1007.6L1819.94 1021.66L1829.02 1040.88L1829.19 1051.38L1822.25 1065.62L1782.92 1122.75L1762.81 1147.49L1748.75 1155.14L1711.91 1157.63L1680.94 1150.51L1620.97 1129.33L1579.14 1106.02L1549.78 1082.88L1523.44 1056.54L1403.66 906.69L1375.19 882.49L1343.51 862.91L1288.34 843.69L1246.51 837.82L1194.37 846.36L1067.47 901.53L991.48 925.38L914.24 943.89L903.74 943.53L890.39 934.99L883.81 904.2L876.69 896.37L866.37 894.59L838.07 910.61L813.87 936.41";

/**
 * Wide enough to cover the ribbon *and* the mask line's own wander: the ribbon
 * reaches 19.4 across and the simplified centreline strays up to 3.3 from the
 * walk, so half of 24 fell a unit short at the widest corners. Still far below
 * the 53-unit closest approach between distant strands, so it cannot bleed onto
 * a part of the lap that has not been reached yet.
 */
export const LAP_MASK_WIDTH = 30;

/**
 * The mask path's exact length. It is a polyline, so this is the sum of its
 * segments — no measuring at runtime, and no reliance on `pathLength`, which
 * not every renderer honours for dash maths.
 */
export const LAP_LENGTH = 4805.57;

/**
 * The canvas layers draw in the 1440x800 artboard the block was laid out in;
 * the map draws in its own 2560x1440 frame. This is the one conversion between
 * them, derived from the box the artwork occupies on the artboard rather than
 * from constants copied by hand.
 */
const ART_BOX = { top: 2, width: 1438.43, height: 796 } as const;
const ART_SCALE_X = MAP_VIEW.width / ART_BOX.width;
const ART_SCALE_Y = (MAP_VIEW.height - MAP_VIEW.band * 2) / ART_BOX.height;

export const mapToArtboard = (x: number, y: number): [number, number] => [
  x / ART_SCALE_X,
  (y - MAP_VIEW.band) / ART_SCALE_Y + ART_BOX.top,
];

export const artboardToMap = (x: number, y: number): [number, number] => [
  x * ART_SCALE_X,
  MAP_VIEW.band + (y - ART_BOX.top) * ART_SCALE_Y,
];

export const GRID_AXES_X = [645.31, 1276.96, 1908.61] as const;
export const GRID_AXIS_Y = 697.98;
export const GRID_DASH = "12.15 8.35";
export const GRID_STROKE = 2.13;

export const HUB = { x: 1278.48, y: 699.5, r: 10.63 } as const;
export const RINGS = [
  { r: 69.85, width: 3.04, ghost: false },
  { r: 356.06, width: 2.13, ghost: true },
  { r: 442.61, width: 2.13, ghost: true },
] as const;

/**
 * The frame's own corner ticks. The artwork carries eight; the bottom-right
 * one, at [2471.93, 1343.3], is dropped. The backdrop is cover-fitted, which
 * pins that column of marks to the section's right edge at every size, and at
 * the plate's own height it lands beside the plate as a stray white chip —
 * measured at 3.4px past the plate's border on a 1550-wide window. It sits off
 * screen at the design's 1440, so nothing there changes by leaving it out.
 */
export const CORNER_MARKS = [
  [65.29, 76.96], [2471.93, 76.96], [65.29, 931.81], [2471.93, 931.81],
  [65.29, 1343.3], [1155.49, 1343.3], [1384.77, 1343.3],
] as const;
export const CORNER_MARK_SIZE = 16.7;

/** One equilateral marker, re-used and rotated — angles fitted by overlap. */
export const TURN_POINTS = "13.69,0 -6.85,11.86 -6.85,-11.86";
export const TURNS = [
  { x: 1349.96, y: 351.98, angle: 73.5 },
  { x: 1862.23, y: 611.24, angle: 30.5 },
  { x: 1732.95, y: 903.82, angle: 89.5 },
  { x: 585.43, y: 916.65, angle: 17.5 },
] as const;

/**
 * Where the ribbon stops for the flag.
 *
 * The designer's path runs straight through the finish — it is one closed
 * ribbon — but the frame does not: the white line ends bluntly on the approach,
 * the chequers fill the gap, and the line picks up again on the far side. Left
 * uncut, the lap's fill rides over the flag instead of arriving at it.
 *
 * `angle` is the track's own heading at the seam, measured off the dense
 * centreline (144 deg), so the cut is square to the line rather than to the
 * frame.
 */
export const FLAG_CUT = {
  x: 822.96,
  y: 921.57,
  along: 36,
  // Wide enough for the canvas glow too, not just the ribbon: the glow runs 15
  // artboard units across, and the same cut has to clear it. Still far under
  // the 53-unit closest approach between distant strands, so it cannot bite a
  // stretch of track that merely passes nearby.
  across: 40,
  angle: 144,
} as const;

/**
 * The chequered flag, as its own diamonds rather than a patterned square.
 *
 * A `<pattern>` filling a rect draws a full board; the frame's flag is a loose
 * run of seven diamonds with the map showing between them, and the solid patch
 * read as a different object entirely. These are the seven, measured off the
 * frame — their bounding boxes come out exactly half filled, which is what
 * says diamond rather than square.
 */
export const FLAG_DIAMONDS = "M807.78 899.17L813.85 905.24L807.78 911.31L801.71 905.24ZM822.21 902.21L828.28 908.28L822.21 914.35L816.14 908.28ZM807.02 915.88L813.09 921.95L807.02 928.02L800.95 921.95ZM821.45 915.88L827.52 921.95L821.45 928.02L815.38 921.95ZM835.87 915.88L841.94 921.95L835.87 928.02L829.8 921.95ZM826.0 931.82L832.07 937.89L826.0 943.96L819.93 937.89ZM838.91 931.82L844.98 937.89L838.91 943.96L832.84 937.89Z";
```


#### The lap — one 6-second pass when the block arrives

An `IntersectionObserver` at `threshold 0.35` on the stage's frame starts a one-shot tween
`lap: 0 → 1` over **6000ms, ease-in-out sine**; every change re-renders the canvas. When it rests, a
second tween `heat: 1 → 0` over **800ms ease-out cubic** cools the head to a plain line — and only
when *that* rests is the cursor reticle armed. The lap must never re-run or reverse.

The path is the `CIRCUIT_PATH` below (900 points, 3 units apart, closed on the flag). **Pacing lives
in the path's own curvature**: the lap slows through the corners and runs away down the straights.
Verbatim:

```ts
const LAP_MS = 6000;
const LINE_WIDTH = 5.9;         // the crisp core; the raster's own track is 5.75 across
const GLOW_WIDTH = 15;          // the additive bloom around the head
const HEAD_UNITS = 210;         // the hot zone behind the tip
const COOL_MS = 800;
const MARKER_POP_UNITS = 90;    // how far past a marker the arrival flare settles
const CORNER_BRAKE = 9;         // how hard the corners slow the lap. 0 = a metronome
const CUT_CENTRE = mapToArtboard(FLAG_CUT.x, FLAG_CUT.y);
const CUT_SCALE = 1438.43 / 2560;
const CUT_ALONG = FLAG_CUT.along * CUT_SCALE;
const CUT_ACROSS = FLAG_CUT.across * CUT_SCALE;

const CUMULATIVE = CIRCUIT_PATH.reduce((acc, point, index) => {
  if (index === 0) return [0];
  const previous = CIRCUIT_PATH[index - 1];
  acc.push(acc[index - 1] + Math.hypot(point[0] - previous[0], point[1] - previous[1]));
  return acc;
}, []);
const TOTAL = CUMULATIVE[CUMULATIVE.length - 1];   // NOT the rounded CIRCUIT_LENGTH — half a unit off reopens the seam

const TIME_AT = (() => {
  const count = CIRCUIT_PATH.length;
  const turn = new Array(count).fill(0);
  for (let i = 1; i < count - 1; i += 1) {
    const [ax, ay] = CIRCUIT_PATH[i - 1]; const [bx, by] = CIRCUIT_PATH[i]; const [cx, cy] = CIRCUIT_PATH[i + 1];
    const ux = bx - ax, uy = by - ay, vx = cx - bx, vy = cy - by;
    const lengths = (Math.hypot(ux, uy) || 1) * (Math.hypot(vx, vy) || 1);
    turn[i] = Math.acos(Math.min(1, Math.max(-1, (ux * vx + uy * vy) / lengths)));
  }
  const window = 6;
  const smoothed = turn.map((_, i) => {
    let sum = 0, n = 0;
    for (let j = Math.max(0, i - window); j <= Math.min(count - 1, i + window); j += 1) { sum += turn[j]; n += 1; }
    return sum / n;
  });
  const accumulated = [0];
  for (let i = 1; i < count; i += 1) {
    const span = CUMULATIVE[i] - CUMULATIVE[i - 1];
    const speed = 1 / (1 + CORNER_BRAKE * smoothed[i]);
    accumulated.push(accumulated[i - 1] + span / speed);
  }
  const total = accumulated[count - 1] || 1;
  return accumulated.map((value) => value / total);
})();

const distanceAtTime = (time) => {
  if (time <= 0) return 0;
  if (time >= 1) return TOTAL;
  let low = 0, high = TIME_AT.length - 1;
  while (low < high - 1) { const mid = (low + high) >> 1; if (TIME_AT[mid] <= time) low = mid; else high = mid; }
  const span = TIME_AT[high] - TIME_AT[low] || 1;
  const ratio = (time - TIME_AT[low]) / span;
  return CUMULATIVE[low] + (CUMULATIVE[high] - CUMULATIVE[low]) * ratio;
};

// palette: accent = --accent, white = --foreground-on-dark, bright = mix(accent, white, 0.55) → [141,243,250]
const rgba = ([r, g, b], alpha) => `rgb(${r} ${g} ${b} / ${alpha})`;

const trailUpTo = (distance) => {            // points up to a distance, plus the partial segment
  const out = [];
  for (let i = 0; i < CIRCUIT_PATH.length; i += 1) {
    if (CUMULATIVE[i] <= distance) { out.push(CIRCUIT_PATH[i]); continue; }
    const a = CIRCUIT_PATH[i - 1], b = CIRCUIT_PATH[i];
    const ratio = (distance - CUMULATIVE[i - 1]) / (CUMULATIVE[i] - CUMULATIVE[i - 1]);
    out.push([a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio]);
    break;
  }
  return out;
};
const stroke = (context, points, scale, from = 0) => {
  context.beginPath();
  context.moveTo(points[from][0] * scale, points[from][1] * scale);
  for (let i = from + 1; i < points.length; i += 1) context.lineTo(points[i][0] * scale, points[i][1] * scale);
  context.stroke();
};
const drawTrail = (context, points, scale, minWidth, glow, heat) => {
  if (points.length < 2) return;
  const width = Math.max(minWidth, LINE_WIDTH * scale);
  context.lineCap = "round"; context.lineJoin = "round";
  if (glow) {
    context.save();
    context.globalCompositeOperation = "lighter";
    context.strokeStyle = rgba(palette.accent, 0.05); context.lineWidth = GLOW_WIDTH * scale; stroke(context, points, scale);
    context.strokeStyle = rgba(palette.accent, 0.1);  context.lineWidth = GLOW_WIDTH * 0.45 * scale; stroke(context, points, scale);
    context.restore();
  }
  // The hot zone: accent into the light accent, at the SAME width.
  const head = Math.max(2, Math.round(HEAD_UNITS / CIRCUIT_STEP));
  const from = Math.max(0, points.length - head);
  const tip = points[points.length - 1];
  const hot = context.createLinearGradient(points[from][0] * scale, points[from][1] * scale, tip[0] * scale, tip[1] * scale);
  hot.addColorStop(0, rgba(palette.accent, 0));
  hot.addColorStop(0.45, rgba(palette.accent, 0.9));
  hot.addColorStop(1, rgba(mix(palette.accent, palette.bright, heat), 1));
  context.strokeStyle = hot; context.lineWidth = width; stroke(context, points, scale, from);
  // A white filament down the middle of the last third — the only white on the canvas.
  const coreFrom = Math.max(0, points.length - Math.round(head * 0.42));
  if (points.length - coreFrom > 1) {
    const core = context.createLinearGradient(points[coreFrom][0] * scale, points[coreFrom][1] * scale, tip[0] * scale, tip[1] * scale);
    core.addColorStop(0, rgba(palette.bright, 0));
    core.addColorStop(1, rgba(palette.white, 0.95 * heat));
    context.strokeStyle = core; context.lineWidth = Math.max(minWidth * 0.6, width * 0.38); stroke(context, points, scale, coreFrom);
  }
};
const render = (progress) => {
  const distance = distanceAtTime(progress);
  const points = trailUpTo(distance);
  const heat = heatRef;                              // 1 while running, cooling to 0 after
  context.clearRect(0, 0, 1440, 800);
  // publish the hot edge for the halftone, in MAP units (artboardToMap), heat included
  if (points.length > 1) {
    drawTrail(context, points, 1, 0.6, true, heat);
    const [tx, ty] = points[points.length - 1];            // the spark at the tip, additive
    context.save(); context.globalCompositeOperation = "lighter";
    const spark = context.createRadialGradient(tx, ty, 0, tx, ty, LINE_WIDTH * 2.6);
    spark.addColorStop(0, rgba(palette.white, 0.85 * heat));
    spark.addColorStop(0.35, rgba(palette.bright, 0.4 * heat));
    spark.addColorStop(1, rgba(palette.accent, 0));
    context.fillStyle = spark; context.beginPath(); context.arc(tx, ty, LINE_WIDTH * 2.6, 0, Math.PI * 2); context.fill();
    context.restore();
  }
  // Punch the finish out of everything just drawn, so the glow stops at the flag like the ribbon.
  context.save(); context.translate(CUT_CENTRE[0], CUT_CENTRE[1]); context.rotate((FLAG_CUT.angle * Math.PI) / 180);
  context.clearRect(-CUT_ALONG / 2, -CUT_ACROSS / 2, CUT_ALONG, CUT_ACROSS); context.restore();
  for (const marker of CIRCUIT_MARKERS) {
    if (distance < marker.d) continue;
    const age = Math.min(1, (distance - marker.d) / MARKER_POP_UNITS);
    const radius = 12 + (1 - age) * 14;
    const glow = context.createRadialGradient(marker.x, marker.y, 0, marker.x, marker.y, radius);
    glow.addColorStop(0, rgba(palette.bright, 0.5 + 0.45 * (1 - age)));
    glow.addColorStop(0.45, rgba(palette.accent, 0.32));
    glow.addColorStop(1, rgba(palette.accent, 0));
    context.save(); context.globalCompositeOperation = "lighter"; context.fillStyle = glow;
    context.beginPath(); context.arc(marker.x, marker.y, radius, 0, Math.PI * 2); context.fill(); context.restore();
    if (age < 1) {
      context.strokeStyle = rgba(palette.bright, (1 - age) * 0.6); context.lineWidth = 1;
      context.beginPath(); context.arc(marker.x, marker.y, 9 + age * 20, 0, Math.PI * 2); context.stroke();
    }
  }
};
```

The path data:


```ts
/**
 * The season circuit, in the block's 1440x800 authoring space.
 *
 * The Figma layer for this track (`Vector`, 748x545) is a *filled ribbon* —
 * a closed outline with no stroke — so it cannot be drawn progressively by
 * a canvas. This centreline was recovered from the frame's raster instead:
 * the white line was thresholded to a mask, thinned to one pixel with
 * Zhang-Suen, walked as a single chain, and resampled to a fixed step.
 *
 * The walk leaves the chain **open** — it ends 20 units short of where it
 * started, right at the chequered flag, which is exactly where the eye is
 * looking when the lap finishes. Those units are bridged here at the same step
 * so the last point *is* the first point and a lap closes on itself.
 *
 * Markers carry their distance along the path rather than a fraction of it,
 * so re-timing the lap cannot slide them off their corners.
 */

/** A cyan turn marker, lit as the fill reaches it. */
export interface CircuitMarker {
  x: number;
  y: number;
  /** Distance along the path at which the fill arrives, in units. */
  d: number;
}

/** [x, y] in the 1440x800 authoring space, ordered clockwise from the flag. */
export type CircuitPoint = readonly [number, number];

export const CIRCUIT_PATH: readonly CircuitPoint[] = [
  [457.3, 521.6], [454.3, 521.6], [451.3, 521.9], [448.8, 523.5],
  [446.4, 525.2], [444.0, 527.0], [441.6, 528.9], [439.1, 530.6],
  [436.9, 532.5], [434.4, 534.3], [432.1, 536.1], [429.6, 537.8],
  [427.2, 539.6], [424.8, 541.5], [422.5, 543.4], [420.1, 545.1],
  [417.9, 547.1], [415.4, 548.7], [412.9, 550.5], [410.5, 552.2],
  [408.1, 554.1], [405.8, 555.9], [403.4, 557.7], [401.1, 559.7],
  [398.6, 561.4], [396.2, 563.1], [393.9, 565.0], [391.5, 566.8],
  [389.0, 568.5], [386.7, 570.4], [384.3, 572.2], [381.9, 574.1],
  [379.5, 575.7], [377.1, 577.6], [374.6, 579.3], [372.2, 581.1],
  [369.9, 583.0], [367.6, 584.8], [365.1, 586.5], [362.8, 588.4],
  [360.4, 590.2], [357.9, 591.8], [355.4, 593.6], [353.0, 595.4],
  [350.7, 597.2], [348.3, 599.1], [345.9, 600.9], [343.5, 602.6],
  [341.1, 604.4], [338.7, 606.3], [336.2, 607.9], [333.9, 609.8],
  [331.5, 611.6], [329.0, 613.3], [326.7, 615.2], [324.2, 616.8],
  [321.4, 618.0], [318.4, 618.0], [315.7, 616.9], [313.3, 615.1],
  [311.6, 612.7], [311.1, 609.7], [311.4, 606.7], [311.9, 603.8],
  [312.9, 601.0], [314.2, 598.3], [315.5, 595.6], [316.6, 592.8],
  [318.0, 590.2], [319.5, 587.6], [320.6, 584.8], [321.9, 582.1],
  [323.4, 579.5], [324.6, 576.8], [325.9, 574.1], [327.0, 571.3],
  [328.4, 568.6], [329.6, 565.9], [330.9, 563.2], [332.2, 560.5],
  [333.4, 557.7], [334.6, 555.0], [335.9, 552.3], [337.3, 549.7],
  [338.5, 547.0], [339.9, 544.3], [340.9, 541.5], [342.2, 538.8],
  [343.3, 536.0], [344.9, 533.5], [346.3, 530.8], [347.4, 528.0],
  [348.9, 525.4], [350.2, 522.8], [351.5, 520.1], [352.9, 517.4],
  [354.3, 514.8], [355.6, 512.1], [357.3, 509.6], [358.8, 507.0],
  [360.3, 504.4], [362.0, 501.9], [363.8, 499.5], [365.4, 497.0],
  [367.3, 494.7], [369.1, 492.3], [370.7, 489.8], [372.6, 487.4],
  [374.6, 485.1], [376.7, 483.1], [378.6, 480.8], [380.6, 478.5],
  [382.5, 476.2], [384.6, 474.0], [386.7, 471.9], [388.8, 469.8],
  [390.9, 467.6], [393.2, 465.6], [395.4, 463.6], [397.5, 461.5],
  [399.6, 459.4], [401.8, 457.4], [404.0, 455.4], [406.2, 453.3],
  [408.3, 451.1], [410.4, 449.0], [412.5, 446.9], [414.6, 444.8],
  [416.8, 442.6], [418.7, 440.4], [420.7, 438.1], [422.7, 435.9],
  [424.7, 433.6], [426.4, 431.2], [428.2, 428.8], [430.0, 426.4],
  [431.8, 424.0], [433.4, 421.5], [435.1, 419.0], [436.7, 416.5],
  [438.5, 414.1], [440.0, 411.5], [442.0, 409.2], [443.5, 406.7],
  [445.3, 404.3], [447.0, 401.9], [449.0, 399.6], [450.5, 397.0],
  [452.5, 394.8], [454.3, 392.4], [456.3, 390.2], [458.4, 388.0],
  [460.6, 386.0], [462.7, 383.9], [465.0, 381.9], [467.5, 380.3],
  [470.1, 378.8], [472.6, 377.2], [475.5, 376.2], [478.3, 375.4],
  [481.1, 374.3], [484.0, 373.6], [486.9, 372.7], [489.7, 371.7],
  [492.6, 371.0], [495.5, 370.3], [498.3, 369.1], [501.0, 367.9],
  [503.8, 366.8], [506.4, 365.4], [509.1, 364.0], [511.8, 362.7],
  [514.4, 361.2], [516.9, 359.6], [519.4, 357.9], [521.9, 356.2],
  [524.4, 354.6], [526.9, 352.9], [529.2, 351.0], [531.6, 349.2],
  [533.9, 347.3], [536.2, 345.4], [538.6, 343.6], [540.9, 341.6],
  [543.2, 339.7], [545.5, 337.8], [547.7, 335.8], [549.9, 333.8],
  [552.3, 331.9], [554.6, 330.0], [556.8, 328.0], [559.0, 326.0],
  [561.2, 323.9], [563.5, 321.9], [565.8, 320.0], [568.0, 318.0],
  [570.3, 316.1], [572.6, 314.1], [574.7, 312.0], [577.0, 310.2],
  [579.4, 308.3], [581.8, 306.6], [584.3, 304.9], [586.7, 303.1],
  [589.1, 301.2], [591.5, 299.5], [594.0, 297.9], [596.6, 296.4],
  [599.2, 294.8], [601.7, 293.2], [604.3, 291.7], [607.0, 290.4],
  [609.7, 289.1], [612.4, 287.7], [615.0, 286.4], [617.8, 285.1],
  [620.4, 283.7], [623.2, 282.7], [625.9, 281.4], [628.7, 280.4],
  [631.4, 279.0], [634.1, 277.7], [636.9, 276.6], [639.6, 275.4],
  [642.5, 274.4], [645.2, 273.2], [648.0, 272.3], [650.8, 271.1],
  [653.6, 270.1], [656.3, 268.7], [659.1, 267.7], [661.9, 266.6],
  [664.6, 265.4], [667.4, 264.3], [670.1, 263.1], [672.8, 261.9],
  [675.4, 260.4], [678.1, 259.1], [680.8, 257.7], [683.4, 256.2],
  [686.0, 254.7], [688.6, 253.3], [691.0, 251.6], [693.6, 250.0],
  [696.1, 248.4], [698.6, 246.7], [701.1, 245.0], [703.5, 243.3],
  [705.9, 241.5], [708.4, 239.8], [710.8, 238.0], [713.2, 236.2],
  [715.8, 234.7], [718.3, 233.0], [720.9, 231.5], [723.4, 229.9],
  [725.9, 228.3], [728.5, 226.9], [731.2, 225.5], [733.8, 224.1],
  [736.6, 223.0], [739.1, 221.4], [741.9, 220.2], [744.6, 219.0],
  [747.3, 217.7], [749.9, 216.2], [752.5, 214.6], [755.2, 213.3],
  [757.8, 212.0], [760.5, 210.6], [763.2, 209.3], [765.9, 208.0],
  [768.6, 206.6], [771.3, 205.3], [774.0, 204.1], [776.7, 202.7],
  [779.3, 201.2], [782.0, 199.9], [784.6, 198.6], [787.3, 197.2],
  [790.0, 195.9], [792.7, 194.5], [795.4, 193.2], [798.1, 191.9],
  [800.7, 190.5], [803.4, 189.2], [806.1, 187.8], [808.8, 186.5],
  [811.3, 184.9], [814.0, 183.5], [816.7, 182.1], [819.3, 180.8],
  [822.0, 179.5], [824.7, 178.1], [827.4, 176.8], [830.1, 175.4],
  [832.7, 174.1], [835.4, 172.7], [838.1, 171.4], [840.8, 170.1],
  [843.5, 168.7], [846.2, 167.4], [848.9, 166.0], [851.6, 164.7],
  [854.2, 163.3], [856.9, 162.0], [859.6, 160.7], [862.3, 159.3],
  [865.0, 158.0], [867.6, 156.7], [870.3, 155.3], [873.0, 154.0],
  [875.6, 152.4], [878.3, 151.3], [881.0, 150.0], [883.6, 148.5],
  [886.4, 147.3], [889.0, 145.9], [891.7, 144.6], [894.4, 143.3],
  [897.0, 141.7], [899.6, 140.3], [902.4, 139.2], [905.0, 137.8],
  [907.6, 136.3], [910.3, 135.1], [913.0, 133.8], [915.6, 132.2],
  [918.3, 130.9], [921.1, 129.8], [923.6, 128.2], [926.3, 126.9],
  [929.1, 125.7], [931.7, 124.2], [934.3, 122.9], [937.0, 121.5],
  [939.7, 120.2], [942.4, 118.8], [945.0, 117.4], [947.7, 116.0],
  [950.2, 114.5], [952.9, 113.2], [955.6, 111.8], [958.4, 110.7],
  [961.1, 109.4], [963.9, 108.4], [966.8, 107.8], [969.8, 107.8],
  [972.8, 108.1], [975.5, 109.3], [977.7, 111.3], [979.5, 113.7],
  [980.9, 116.4], [981.8, 119.2], [982.0, 122.2], [981.9, 125.2],
  [981.1, 128.1], [980.0, 130.9], [978.3, 133.3], [976.6, 135.8],
  [974.3, 137.7], [971.9, 139.6], [969.5, 141.4], [967.1, 143.1],
  [964.7, 144.9], [962.4, 146.8], [959.9, 148.4], [957.4, 150.1],
  [955.2, 152.1], [953.0, 154.2], [951.1, 156.5], [949.4, 159.0],
  [948.1, 161.7], [947.2, 164.5], [946.8, 167.5], [946.2, 170.4],
  [946.9, 173.3], [947.4, 176.3], [948.3, 179.1], [949.8, 181.7],
  [951.7, 184.1], [953.9, 186.1], [956.4, 187.8], [959.0, 189.1],
  [961.7, 190.4], [964.5, 191.5], [967.3, 192.5], [970.2, 193.4],
  [973.0, 194.4], [975.8, 195.6], [978.6, 196.7], [981.2, 198.1],
  [983.7, 199.7], [985.9, 201.7], [987.7, 204.2], [989.1, 206.8],
  [990.3, 209.6], [991.2, 212.4], [991.5, 215.4], [992.2, 218.2],
  [993.0, 221.1], [994.2, 223.9], [995.5, 226.6], [997.2, 229.0],
  [999.2, 231.2], [1001.3, 233.4], [1003.6, 235.3], [1006.1, 237.0],
  [1008.6, 238.7], [1011.1, 240.3], [1013.7, 241.8], [1016.2, 243.5],
  [1018.7, 245.0], [1021.3, 246.6], [1023.8, 248.2], [1026.1, 250.0],
  [1028.4, 251.9], [1030.4, 254.3], [1032.4, 256.4], [1034.2, 258.8],
  [1035.8, 261.4], [1037.2, 264.0], [1038.4, 266.8], [1039.6, 269.5],
  [1041.2, 272.1], [1042.5, 274.7], [1043.9, 277.4], [1045.3, 280.0],
  [1046.6, 282.7], [1048.3, 285.2], [1049.7, 287.9], [1051.1, 290.5],
  [1052.3, 293.2], [1053.3, 296.1], [1053.7, 299.0], [1053.7, 302.0],
  [1052.8, 304.9], [1051.5, 307.6], [1049.9, 310.1], [1048.2, 312.5],
  [1045.9, 314.4], [1043.4, 316.2], [1040.8, 317.5], [1037.9, 318.5],
  [1035.0, 318.5], [1032.0, 318.5], [1029.0, 318.5], [1026.0, 318.1],
  [1023.3, 316.8], [1020.7, 315.3], [1018.3, 313.5], [1016.1, 311.5],
  [1014.3, 309.1], [1012.3, 306.9], [1010.5, 304.5], [1008.6, 302.2],
  [1006.9, 299.7], [1005.1, 297.3], [1003.3, 295.0], [1001.4, 292.7],
  [999.4, 290.4], [997.6, 288.1], [995.4, 285.9], [993.3, 283.8],
  [990.9, 282.1], [988.5, 280.2], [986.1, 278.4], [983.6, 276.9],
  [980.9, 275.6], [978.1, 274.5], [975.3, 273.4], [972.4, 272.7],
  [969.4, 272.3], [966.5, 271.6], [963.5, 271.4], [960.7, 271.0],
  [957.8, 271.6], [954.8, 271.7], [951.9, 272.5], [949.0, 273.3],
  [946.2, 274.1], [943.4, 275.0], [940.5, 275.8], [937.7, 276.8],
  [934.9, 277.9], [932.1, 278.9], [929.4, 280.1], [926.5, 281.0],
  [923.7, 281.9], [920.9, 283.1], [918.1, 284.1], [915.3, 285.2],
  [912.5, 285.9], [909.6, 286.9], [906.8, 287.8], [903.9, 288.6],
  [901.0, 289.4], [898.2, 290.4], [895.3, 291.1], [892.5, 292.1],
  [889.6, 292.9], [886.7, 293.7], [883.8, 294.6], [881.0, 295.5],
  [878.1, 296.2], [875.3, 297.1], [872.4, 297.8], [869.6, 298.8],
  [866.7, 299.6], [863.8, 300.2], [860.9, 301.2], [858.0, 301.8],
  [855.2, 302.8], [852.3, 303.5], [849.4, 304.2], [846.5, 305.1],
  [843.6, 305.8], [840.8, 306.6], [837.8, 307.1], [835.0, 308.1],
  [832.1, 308.8], [829.2, 309.4], [826.2, 310.0], [823.3, 310.7],
  [820.5, 311.4], [817.7, 312.5], [814.9, 313.6], [812.2, 314.9],
  [809.6, 316.4], [807.3, 318.3], [805.0, 320.2], [802.9, 322.4],
  [801.0, 324.7], [799.5, 327.3], [797.9, 329.8], [796.5, 332.5],
  [795.5, 335.3], [794.5, 338.1], [793.7, 341.0], [792.9, 343.9],
  [792.3, 346.8], [791.7, 349.7], [791.0, 352.6], [790.8, 355.5],
  [790.0, 358.4], [790.0, 361.4], [789.3, 364.3], [789.2, 367.3],
  [789.4, 370.3], [790.0, 373.2], [790.3, 376.2], [791.1, 379.0],
  [792.1, 381.9], [793.3, 384.6], [794.4, 387.4], [796.1, 389.9],
  [797.9, 392.2], [799.9, 394.4], [802.2, 396.4], [804.6, 398.2],
  [807.1, 399.9], [809.6, 401.5], [812.2, 403.0], [815.0, 404.1],
  [817.6, 405.5], [820.3, 406.8], [823.1, 407.8], [825.9, 409.0],
  [828.7, 410.1], [831.5, 411.1], [834.2, 412.3], [837.1, 413.2],
  [839.9, 414.2], [842.8, 415.1], [845.6, 416.1], [848.5, 417.1],
  [851.2, 418.2], [854.0, 419.1], [856.9, 419.9], [859.8, 420.8],
  [862.6, 421.8], [865.5, 422.7], [868.3, 423.5], [871.2, 424.4],
  [874.0, 425.3], [876.9, 426.2], [879.7, 427.2], [882.6, 427.9],
  [885.4, 428.9], [888.3, 429.7], [891.1, 430.9], [893.9, 431.6],
  [896.8, 432.6], [899.6, 433.6], [902.4, 434.7], [905.2, 435.7],
  [908.1, 436.4], [911.0, 437.3], [913.7, 438.5], [916.5, 439.6],
  [919.2, 440.9], [922.0, 441.9], [924.8, 443.1], [927.6, 444.2],
  [930.1, 445.8], [932.7, 447.3], [935.4, 448.7], [937.9, 450.3],
  [940.4, 452.0], [942.6, 454.0], [944.7, 456.1], [946.7, 458.4],
  [948.4, 460.9], [949.8, 463.5], [951.1, 466.2], [951.9, 469.1],
  [952.1, 472.1], [952.1, 475.1], [952.1, 478.1], [951.9, 481.1],
  [951.3, 484.0], [950.3, 486.8], [949.6, 489.7], [948.6, 492.5],
  [947.7, 495.4], [947.0, 498.2], [946.2, 501.1], [945.8, 504.0],
  [945.3, 507.0], [945.3, 510.0], [945.3, 513.0], [945.7, 515.9],
  [946.9, 518.7], [948.1, 521.4], [949.6, 524.0], [951.4, 526.4],
  [953.4, 528.6], [955.7, 530.5], [958.0, 532.4], [960.5, 534.0],
  [963.2, 535.4], [965.9, 536.8], [968.6, 538.1], [971.3, 539.4],
  [973.9, 540.8], [976.6, 542.2], [979.3, 543.5], [982.1, 544.5],
  [984.8, 545.8], [987.5, 547.2], [990.3, 548.3], [992.9, 549.6],
  [995.7, 550.8], [998.4, 552.2], [1000.9, 553.8], [1003.6, 555.2],
  [1006.1, 556.7], [1008.7, 558.3], [1011.2, 559.9], [1013.7, 561.6],
  [1015.9, 563.6], [1018.4, 565.3], [1020.5, 567.3], [1022.6, 569.5],
  [1024.3, 572.0], [1025.6, 574.7], [1026.8, 577.4], [1027.7, 580.3],
  [1028.1, 583.2], [1027.8, 586.2], [1026.6, 588.9], [1025.2, 591.6],
  [1023.9, 594.2], [1022.3, 596.8], [1020.6, 599.3], [1018.8, 601.6],
  [1017.0, 604.0], [1015.3, 606.5], [1013.4, 608.8], [1011.7, 611.3],
  [1010.1, 613.8], [1008.4, 616.3], [1006.8, 618.8], [1005.1, 621.3],
  [1003.3, 623.7], [1001.8, 626.3], [999.9, 628.6], [998.2, 631.1],
  [996.6, 633.6], [994.7, 636.0], [992.6, 638.1], [990.5, 640.2],
  [988.0, 641.9], [985.4, 643.4], [982.6, 644.5], [979.7, 645.3],
  [976.9, 646.1], [973.9, 646.1], [970.9, 646.1], [967.9, 646.1],
  [964.9, 646.1], [961.9, 645.9], [959.0, 645.3], [956.2, 644.4],
  [953.2, 643.9], [950.3, 643.5], [947.4, 642.7], [944.5, 641.9],
  [941.7, 641.0], [938.8, 640.0], [936.0, 639.2], [933.1, 638.3],
  [930.3, 637.4], [927.5, 636.4], [924.7, 635.4], [921.9, 634.3],
  [919.2, 633.3], [916.4, 632.2], [913.6, 631.0], [910.8, 630.0],
  [908.1, 628.6], [905.4, 627.4], [902.6, 626.3], [900.0, 624.8],
  [897.4, 623.3], [894.9, 621.6], [892.3, 620.2], [889.8, 618.5],
  [887.3, 616.9], [884.8, 615.2], [882.5, 613.4], [880.0, 611.6],
  [877.7, 609.7], [875.4, 607.8], [873.2, 605.8], [870.8, 603.9],
  [868.6, 601.9], [866.5, 599.8], [864.4, 597.6], [862.3, 595.5],
  [860.1, 593.4], [858.0, 591.3], [856.0, 589.1], [854.2, 586.7],
  [852.2, 584.5], [850.3, 582.1], [848.3, 579.9], [846.4, 577.6],
  [844.5, 575.2], [842.5, 573.0], [840.8, 570.6], [839.0, 568.2],
  [837.0, 565.9], [835.3, 563.5], [833.4, 561.2], [831.5, 558.8],
  [829.7, 556.4], [827.9, 554.0], [826.1, 551.6], [824.4, 549.2],
  [822.5, 546.9], [820.7, 544.5], [818.9, 542.0], [817.1, 539.6],
  [815.3, 537.3], [813.4, 534.9], [811.6, 532.6], [809.8, 530.2],
  [808.0, 527.7], [806.2, 525.4], [804.3, 523.1], [802.5, 520.7],
  [800.5, 518.4], [798.5, 516.3], [796.6, 513.9], [794.6, 511.6],
  [792.7, 509.3], [790.8, 507.0], [788.7, 504.9], [786.4, 503.0],
  [784.1, 501.1], [781.9, 499.0], [779.7, 497.0], [777.4, 495.0],
  [775.1, 493.1], [772.7, 491.3], [770.2, 489.7], [767.7, 488.0],
  [765.2, 486.3], [762.7, 484.8], [760.1, 483.3], [757.4, 481.9],
  [754.9, 480.3], [752.1, 479.3], [749.4, 478.0], [746.7, 476.7],
  [743.8, 475.7], [741.1, 474.6], [738.2, 473.6], [735.3, 472.8],
  [732.6, 471.7], [729.6, 471.2], [726.8, 470.3], [723.9, 469.5],
  [721.0, 469.0], [718.0, 468.7], [715.1, 467.9], [712.1, 467.7],
  [709.2, 467.0], [706.2, 467.0], [703.2, 467.0], [700.4, 466.2],
  [697.4, 466.6], [694.5, 467.0], [691.5, 467.0], [688.6, 467.5],
  [685.6, 467.8], [682.7, 468.6], [679.8, 469.0], [676.8, 469.5],
  [673.9, 470.3], [671.1, 471.0], [668.2, 472.0], [665.5, 473.2],
  [662.8, 474.5], [660.0, 475.6], [657.3, 476.8], [654.7, 478.3],
  [651.9, 479.5], [649.2, 480.8], [646.4, 481.9], [643.8, 483.3],
  [641.1, 484.5], [638.4, 485.8], [635.7, 487.1], [632.9, 488.2],
  [630.2, 489.5], [627.5, 490.8], [624.7, 491.9], [622.0, 493.0],
  [619.3, 494.3], [616.5, 495.5], [613.7, 496.5], [610.9, 497.6],
  [608.1, 498.6], [605.3, 499.6], [602.5, 500.7], [599.8, 502.0],
  [597.0, 502.9], [594.2, 503.9], [591.3, 504.8], [588.4, 505.5],
  [585.7, 506.7], [582.9, 507.8], [580.0, 508.6], [577.1, 509.5],
  [574.3, 510.4], [571.4, 511.1], [568.6, 512.1], [565.7, 512.9],
  [562.8, 513.7], [559.9, 514.4], [557.1, 515.4], [554.2, 516.0],
  [551.3, 516.7], [548.4, 517.4], [545.5, 518.2], [542.7, 519.0],
  [539.8, 519.9], [537.0, 520.7], [534.1, 521.5], [531.2, 522.2],
  [528.4, 522.9], [525.4, 523.6], [522.5, 524.1], [519.6, 524.9],
  [516.7, 525.4], [513.7, 525.8], [510.7, 525.8], [507.8, 525.6],
  [505.0, 524.5], [502.4, 522.9], [500.3, 520.8], [499.1, 518.1],
  [498.2, 515.2], [498.2, 512.2], [498.1, 509.2], [497.4, 506.3],
  [496.6, 503.5], [494.8, 501.1], [492.6, 499.1], [489.7, 498.5],
  [486.8, 498.1], [483.9, 498.7], [481.3, 500.3], [478.8, 501.9],
  [476.4, 503.7], [474.0, 505.4], [471.4, 506.9], [470.9, 507.1],
  [469.0, 509.2], [467.0, 511.2], [465.1, 513.3], [463.1, 515.4],
  [461.2, 517.5], [459.2, 519.5], [457.3, 521.6]
];

export const CIRCUIT_MARKERS: readonly CircuitMarker[] = [
  { x: 328.9, y: 510.6, d: 278.4 },
  { x: 758.4, y: 193.2, d: 811.7 },
  { x: 1046.6, y: 338.9, d: 1323.7 },
  { x: 973.7, y: 503.3, d: 1867.7 },
];

/** Total path length in authoring units, flag to flag. */
export const CIRCUIT_LENGTH = 2707.9;

/** Spacing between consecutive points, in authoring units. */
export const CIRCUIT_STEP = 3;

/** The space the path was authored in — the canvas matches it exactly. */
export const CIRCUIT_VIEW = { width: 1440, height: 800 } as const;
```


#### The halftone — 8,004 dots, lit

The dots are the map's landmass, drawn on a canvas that is `absolute inset-0` under the SVG, its
backing store `min(devicePixelRatio, 2)` (1 on a coarse pointer) times the map box's CSS size, and
its coordinate space the map's own `2560×1440`. The resting field is **baked once** into an
offscreen canvas (every dot a `1.75`-radius disc in `--map-dot`) and blitted; per frame only the lit
dots are touched, found by lattice arithmetic. A lit dot **squares up into a chequer** — the square
grows from `0.7` to `1` of the lattice pitch as the light rises past the threshold, and the
lattice's own parity decides whether a cell fills or is cleared. The shipped light source is
**`none`**: the cursor reticle is the only light, and it arms only after the lap has cooled.

The dot data (`map-dots.ts`) and the engine (`season-dots.tsx`) are quoted verbatim below; the
parameters are `threshold 0.34, radius 170, waveSpeed 0.16, fade 0.9, source "none"`. The frame
clock is a looping 2000ms linear tween whose only job is to tick (paused off screen); `dt` is
`min(0.1, elapsed)`. The pointer is read on `window` (`pointermove`, mouse only; not under
`(hover: none)` or reduced motion), converted to map units through the canvas's own rect, and is
"on" only while inside the section's box; `pointerleave` on the document and `blur` put it out.

`map-dots.ts`:

```ts
// 📖 Docs: obsidian/frontend/components/sections.md

/**
 * The halftone, as coordinates.
 *
 * Every dot sits exactly on the lattice the conversion snapped it to — the
 * fit deviates by 0.0000 units — so the field survives as *indices* rather
 * than positions: row, first column, then column deltas. That is 16KB of
 * source for 8,004 dots, and it reconstructs the same geometry the SVG asset
 * drew, because it was parsed straight out of that asset's path.
 *
 * Indices, not coordinates, because a light source has to ask "which dots are
 * near this point" thousands of times a second, and a lattice answers that with
 * arithmetic instead of a search.
 */

/** Lattice pitch and origin, in the map's 2560x1440 space. */
export const DOT_LATTICE = {
  pitchX: 7.8,
  pitchY: 7.7,
  originX: 5.0,
  originY: 16.64,
} as const;

/** Radius the SVG drew them at, so the canvas matches it exactly. */
export const DOT_RADIUS = 1.75;

/** rowDelta:firstColumn,columnDelta,... — see the note above. */
const PACKED =
  "-1:163;1:228;8:233;6:218,1,1,1;1:215,1,1,1,1,1,1,1,1,1,1;1:82,126,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,16;1:206,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1;1:205,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1;1:154,1,21,27,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:151,1,1,1,1,1,1,1,1,1,12,1," +
  "1,1,1,26,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:149,1,1,1,1" +
  ",1,1,2,1,1,1,2,4,2,1,1,1,1,1,1,1,1,1,1,22,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:149,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,24,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ";1:149,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,23,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1;1:150,1,1,1,1,1,1,1,1,1,4,1,1," +
  "1,1,1,1,1,1,1,1,20,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,11,1,1,1,1,1,1," +
  "1,1,1;1:149,1,1,1,1,1,1,1,1,1,1,4,2,1,1,1,2,1,1,1,19,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,7,1,5,1,1,1,1,1,1,1,1;1:143,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,18,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1," +
  "1,4,1,1,1,1,1,1,1,1,1,1;1:141,1,1,1,3,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "17,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,4,1,1,1,1,1,1,1" +
  ",1,1,1;1:141,1,1,1,9,1,1,1,1,1,1,1,1,1,1,2,2,1,1,17,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,1;1:141,1,1,1,9,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,15,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1" +
  ",1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1;1:141,1,1,1,8,1,1,4,1,1,1,1,1,1,1,1" +
  ",1,1,1,14,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,5,1,1," +
  "1,1,1,1,1,1,1,1,1,1;1:140,1,1,1,1,1,6,1,1,5,1,1,1,1,1,2,2,1,1,12,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ";1:139,1,1,1,1,1,1,4,1,1,7,1,1,1,1,1,2,3,1,1,1,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:139,1,1,1" +
  ",1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,9,1,1,1,1,1,1,1,1,1,1,7,1,1,1,4,1,2,1,1,1,1,1;1:137,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,5,1,1,3,1,1,1;1:136,1,1,1,1,1,1" +
  ",1,1,1,1,1,5,1,1,1,2,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,9,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,7,1,4,1,1;1:134,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,5,1,1,1,1,1,1,1,1,1,1,1,11,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,4,1,1,1,1,1,13;1:132,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1" +
  ",1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,1,1,1,1,1,1,1,1,3,1," +
  "1,1,1,1,3,1,1,1,1,1,1,1,7;1:110,21,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,12," +
  "1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,7,1,1,1,1,5,1,1,1,1,1,1," +
  "1,1,1,1,1;1:107,1,1,1,1,16,3,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,8,5,1,1,1" +
  ",1,1,4,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,6,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1;1:104,1,1,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1,7,1,1," +
  "1,1,5,1,1,1,1,1,1,1,2,1,1,1,6,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1," +
  "1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:103,1,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1," +
  "1,1,1,1,1,6,1,1,1,1,1,7,1,1,1,4,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,8,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,1,1,1,1,1,1,1,1,1,1,1;1:102,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,8,1,1,4,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,7,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,11,1,1,1,1,1,1,1,1,1;1:101,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1" +
  ",1,6,1,1,1,1,1,8,1,1,3,1,1,1,1,1,1,1,1,1,1,1,20,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,12,1,1,1,1,1,1,1;1:100,1,1,1,1,1,2,1,1,1,1,1,1" +
  ",1,1,1,6,1,1,1,1,1,1,1,1,1,6,1,2,1,7,1,1,1,1,3,1,1,1,1,1,1,1,1,21,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,13,1,1,1,1,1;1:99,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,6,1,1,1,7,1,1,1,1,1,3," +
  "1,1,1,1,1,1,21,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,10,2,1,1,1,1;1:100,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,14,1,1,1,1,1,1,4,1,1,1,1,1,5,15,1,1,1,1,1,1,1,1,1,13,1,1,1,1,1,1,1,1" +
  ",1,2,1,2,1,1,1,1,1,1,8,1,1,1,1,1,7;1:100,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,3" +
  ",1,1,1,1,1,1,1,1,12,1,1,1,3,1,4,1,1,1,1,4,1,1,1,1,11,1,1,1,1,1,1,1,1,20,2,1," +
  "1,1,1,1,1,1,1,1,1,2,1,1,1,8,1,1,1,1,7,1,1,1;1:98,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",8,1,3,1,1,1,1,1,1,1,1,11,1,10,1,1,1,1,3,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1" +
  ",26,1,1,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,6,1,1,1,1,1,1;1:95,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,12,1,1,1,1,1,1,1,1,22,1,1,1,4,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,3" +
  "1,1,1,1,1,1,1,1,1,1,1,1,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:94,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,22,1,1,1,3,1,1,1,1,1,8,1,1,1,1" +
  ",1,1,1,1,25,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,11,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1" +
  ":94,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,22,1,1,3,1,1,1,1,7" +
  ",1,1,1,1,1,1,1,1,1,28,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1;1:107,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,21,1,1,3,1,1,8,1,1,1," +
  "1,1,1,1,1,33,1,1,2,1,1,1,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:83" +
  ",27,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,20,1,3,1,1,6,1,1,1,1,1,1,1,1,1,36,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,1,1,1,1,1;1:126,1,1,1,1,1,1,1,1" +
  ",18,1,1,4,7,1,1,1,1,1,42,1,1,1,1,1,2,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1;1:127,1,1,1,19,1,2,11,1,1,28,1,1,11,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1," +
  "1,1,1,1,1,1,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:147,1,1,1,1,11,27,1,1,1,1,1,1," +
  "1,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1;1:82,9,1,1,59,1,1,6,25,1,1,1,1,1,4,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:9" +
  "1,1,1,1,65,23,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:90,1,1,1" +
  ",1,63,22,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:90,1," +
  "1,1,1,1,38,1,1,1,4,1,5,9,1,21,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1;1:89,1,1,1,1,1,1,1,37,1,1,1,1,1,1,1,4,9,1,1,20,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,11,1,1,1,1,1,1,1," +
  "1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1;1:89,1,1,1,1,1,1,1,1,36,1,1,1,1,1,1,1,1,10" +
  ",1,1,21,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,16,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1;1:89,1,1,1,1,1,1,1,1,1,14,1" +
  ",1,1,18,1,1,1,1,1,1,1,9,1,1,1,21,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,9,1,1,1,8,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,1,1;1:88,1," +
  "1,1,1,1,1,1,1,1,1,1,11,1,1,1,1,1,1,17,1,1,1,1,1,8,1,1,1,1,25,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,5,1," +
  "1,1,1,1,1,1,1,1;1:90,1,1,1,1,1,1,1,1,1,10,1,1,3,1,17,1,1,1,1,8,1,1,1,1,1,27," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,1,1,1,1,6" +
  ",1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1;1:92,1,1,1,1,1,1,11,1,3,1,1,16,1,1,1,7,1," +
  "1,1,1,1,1,1,29,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,11,1,1,1,1,1,2,1,1," +
  "1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1;1:93,1,1,1,1,1,9,1,1,4,1,1" +
  "7,1,1,7,1,1,1,1,1,1,32,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,11,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1;1:93,1,1,1,1,9,1" +
  ",1,4,1,18,7,1,1,1,1,1,1,35,1,1,1,1,1,1,1,1,1,1,1,1,11,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,3,1,1,1,1,5,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,1;1:93,1,1,1,1,9,6" +
  ",24,1,1,1,1,1,1,39,1,1,1,1,1,1,13,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1," +
  "5,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1;1:93,1,1,1,1,38,1,1,1,1,1,1,40,1,1,1,12,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,1,1,5,1,1,1,1,5,1,1,1,1,1,1,1,1;1:93" +
  ",1,1,1,1,1,35,1,1,46,1,11,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,12,1,1" +
  ",6,6,1,1,1,1,1,1,1,1;1:92,1,1,1,1,1,1,34,1,1,45,1,1,7,1,1,1,2,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,2,1,1,15,1,11,1,1,1,1,1,1,1;1:92,1,1,1,1,17,1,17,1,1,1,4" +
  "5,1,6,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,19,1,8,1,1,1,1,1,1,2;1" +
  ":93,1,1,1,18,1,15,1,1,1,45,1,5,1,1,1,1,1,42,1,1,1,1,1,1,1,1,1,1,3;1:94,1,1,1" +
  "8,1,14,1,1,1,1,44,1,1,5,1,1,1,1,1,42,1,1,1,1,1,1,1;1:94,34,1,1,1,1,1,44,1,1," +
  "4,1,1,1,1,1;1:109,1,1,15,1,1,1,1,1,1,1,44,1,1,4,1,1,1,1;1:107,1,1,1,1,1,1,1," +
  "1,1,1,1,7,1,1,1,1,1,1,1,44,1,1,4,1,1,1,1,1;1:106,1,1,1,1,1,1,1,1,1,1,1,1,1,5" +
  ",1,1,1,1,1,1,1,1,44,1,1,4,1,1,1,1;1:82,23,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1," +
  "1,1,1,1,29,6,10,1,1,4,1,1,1,1;1:105,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1," +
  "46,1,1,3,1,1,1,1,1;1:84,20,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,46,1,1," +
  "4,1,1,1,1;1:82,2,1,1,17,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1,47,1,1,3,1,1,1" +
  ",1,1,1,2;1:84,1,1,1,1,15,1,1,1,1,1,9,1,1,1,1,1,1,1,1,1,1,1,43,4,1,1,1,3,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1;1:85,1,1,1,14,1,1,1,10,1,1,1,1,1,1,1,1,1,1,1,1,44,5," +
  "1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,48;1:86,1,1,1,11,1,1,1,1,8,1,1,1,1,1,1,4" +
  ",1,1,1,1,49,1,1,1,4,1,1,1,1,1,1,1,1,1,1,2,1,1;1:87,1,11,1,1,1,1,7,1,1,1,1,1," +
  "1,7,1,1,51,1,1,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:90,1,7,1,1,1,6,1,1,1,1,1,1,11" +
  ",52,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:10,14,64,1,1,1,1,2,1,1,1,1,1,1,1,5" +
  ",1,1,1,1,1,5,18,13,27,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,17,10," +
  "47,8,21;1:88,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,64,1,1,1,1,1,6,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1;1:88,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,66,1,1,1,1," +
  "1,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,30;1:87,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1," +
  "1,1,1,1,63,3,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:87,1,1,1,1,1," +
  "1,1,1,1,1,1,5,1,1,1,1,1,1,46,16,5,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,20;1:87,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,67,1,1,1,1,1,1" +
  ",1,1,1,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:91,1,1,1,1,1,1,4,1,1,1,1," +
  "1,1,1,1,69,1,1,1,1,1,1,1,1,1,11,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,18;1:92,1,1," +
  "1,1,5,1,1,3,1,1,50,21,1,1,1,1,1,1,1,1,1,1,1,11,1,1,1,1,1,1,1,1,1,1,1,1,1,17;" +
  "1:91,1,1,1,1,5,1,1,5,1,72,1,1,1,1,1,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,1,1,1" +
  "8;1:91,1,1,1,5,1,61,1,1,18,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,11,1,1,1,1;1:90,1,1" +
  ",1,1,5,81,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,10,1,1;1:88,1,1,1,1,1,5,59,1" +
  ",1,1,21,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,2,1,1;1:87,1,1,1,1,1,5,55,1,1,1,1,1," +
  "1,1,1,1,21,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:86,1,1,1,1,1,5,54" +
  ",1,1,1,1,1,1,1,1,1,1,2,1,2,19,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1," +
  "20;1:84,1,1,1,1,1,1,5,51,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,18,3,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:83,1,1,1,1,1,1,5,6,44,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,27,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:8" +
  "2,1,1,1,1,1,1,5,8,41,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,30,1,1,1,1,1,1,1,1,1,1,1,1;1:81,1,1,1,1,1,1,5,9,39,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,13,1,1,1,1,1,1,1,30,1,1,1,1,1,1,1,1,1,1,1,11;1:80,1,1,1,1,2,5,11,37,1,1," +
  "1,1,1,1,1,1,1,1,20,1,1,1,1,33,1,1,1,1,1,1,1,1;1:79,1,1,1,1,1,1,5,1,12,35,1,1" +
  ",1,1,1,1,1,1,1,1,24,1,1,32,1,1,1,1,1,1,1,1,1;1:78,1,1,1,1,1,1,5,49,1,1,1,1,1" +
  ",1,1,9,1,1,1,1,1,1,1,1,1,11,1,32,1,1,1,1,1,1,1,8;1:78,1,1,1,1,1,5,21,1,1,26," +
  "1,1,1,1,1,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,7,1,21,1,8,1,1,1,1,1,1,1,1;1:78," +
  "1,1,2,26,1,2,1,1,21,1,1,1,1,1,10,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,7,1,16," +
  "1,1,1,1,1,6,1,2,1,1,1,1,1,1,1,6,24;1:77,1,1,1,2,5,6,1,8,1,4,1,1,1,1,1,1,1,19" +
  ",1,1,1,1,1,9,1,1,2,1,1,1,1,2,1,1,1,1,1,1,1,1,4,1,1,1,6,17,1,1,1,1,4,1,1,1,1," +
  "1,1,1,1,2,1;1:77,1,2,1,6,3,1,1,1,1,1,5,1,1,1,1,1,1,1,1,5,1,1,16,1,1,1,1,1,1," +
  "9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,23,1,1,1,1,1,1,1,1,2,1,1" +
  ",1,1,1,1,1,1,15;1:85,1,1,1,1,1,1,1,1,1,12,8,1,15,1,1,1,1,10,2,1,1,1,1,1,1,1," +
  "1,1,2,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,23,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,14,1,1," +
  "1,1;1:84,1,1,1,1,1,1,1,1,1,1,21,13,1,1,12,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1," +
  "1,1,1,2,3,1,1,1,1,1,1,1,1,21,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,11,1,1,1,1,1,1;1:" +
  "84,1,1,1,1,1,1,1,1,1,1,21,9,1,1,1,1,12,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,1,12,1,1,1,1,1,1,1,1,1,1,1,1,1,1,11,1" +
  ",1,1,1,1,1;1:83,1,1,1,1,1,1,1,1,1,19,4,1,7,1,11,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,14,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,8,2,1,1,1,1,1,1,1;1:82,1,1,1,1,1,1,1,1,1,20,4,1,1,3,1,11," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,5,1,1,15,1,1,1,1,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,1;1:78" +
  ",4,1,1,1,1,1,1,1,22,5,1,12,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,15,1,1,1,1,1,1,1,1,1," +
  "1,1,1,9,1,1,1,1,1,1,1,1,1,1;1:77,5,1,1,1,1,1,1,23,1,13,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,15,1,1,1," +
  "1,1,1,1,2,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1;1:76,1,4,1,1,1,1,1,11,6,8,1,10,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,24,1,1,1,1,3,1,1,1,1,1,5,16,1,1,1,1" +
  ",1,1,2,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1;1:75,1,4,1,1,1,1,1,10,1,6,9,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,35,1,1,1,1,1,19,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1;1:74,1,1,4,1,1,1,1,10,1,18,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,38,1,1,1,1,1,18,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1;1:72,1,1,1,4,1,1,1,1,9,1,6,15,1,2,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,42,1,1,1,1,1,18,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,9,1,1,1,1,1,1;1:72,1,1,1,4,1,1,1,8,1,1,27,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,45,1,1,1,1,18,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,9,1,1,1,1,1;1:70,1,1,1,1,5," +
  "1,8,1,1,1,20,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,2,1,1,1,49,1,1,1,20,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,9,1,1,1,1;1:69,1,1,1,1,1,4,1,1,7,1,1,21,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,52,1,1,1,21,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,1,1" +
  ";1:68,1,1,1,1,1,5,1,6,1,1,1,22,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,52,1," +
  "1,1,21,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,6;1:67,1,1,1,1,1,1,4,1,4," +
  "2,1,1,1,22,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,57,1,1,25,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,6,1,1,1,2,1,1;1:64,1,1,1,1,1,1,1,1,1,4,5,1,1,1,1,5,17,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,1,1,11,48,1,1,1,14,2,2,1,1,9,1,1,1,1,1,1,1,1,1,1,1," +
  "1,6,1,1,1,1,1;1:64,1,1,1,1,1,1,1,1,4,1,4,1,1,1,6,13,3,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,16,46,1,1,1,13,1,1,1,1,1,1,1,1,10,1,1,1,1,1,1,1,1,1,1,1,5,1,1," +
  "1,1,1;1:57,1,1,1,3,1,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,6,14,1,1,1,1,1,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,18,45,1,1,1,6,7,1,2,1,1,1,1,1,1,1,1,1,9,1,1,1,1,1,1,1," +
  "1,1,4,1,1,1,1,1;1:56,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,6,1,14,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,65,1,1,1,1,5,7,10,1,1,1,10,1,1,1,1,1,1,1,4" +
  ",1,1,1,1,1;1:56,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1,1,6,1,14,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,32,36,1,1,1,1,12,11,1,1,1,1,10,1,1,1,1,1,4,1,1,1,1,1;" +
  "1:57,1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1,1,6,16,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,1,69,1,1,1,1,1,6,16,1,1,1,1,1,1,1,1,8,1,1,1,4,2,1,1,1;1:58,2,1,1,1,1,1,1,1" +
  ",1,1,5,1,1,1,6,1,15,1,1,1,1,1,1,1,1,1,2,1,1,1,1,72,1,1,1,1,1,1,17,5,1,1,1,1," +
  "1,1,1,1,1,1,6,1,5,1,1,1,1,1;1:57,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,6,16,1,1,1," +
  "1,1,1,1,1,1,1,1,1,1,76,1,1,1,1,1,1,1,6,1,8,1,5,1,1,1,1,1,1,1,1,1,1,1,9,1,1,1" +
  ",1,1,1;1:57,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,6,16,1,1,1,1,1,1,1,1,1,1,1,79,1,1," +
  "1,1,1,1,1,1,6,8,1,5,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1;1:56,1,1,2,1,1,1,1,1" +
  ",1,2,5,6,18,1,1,1,1,1,1,1,84,1,1,1,1,1,1,1,1,6,7,1,5,1,1,1,2,1,1,1,1,1,1,8,1" +
  ",1,1,1,1,1,4;1:57,1,1,1,1,1,1,1,1,1,1,1,1,10,18,1,1,1,1,1,1,86,1,1,1,1,1,1,1" +
  ",1,5,6,1,1,5,1,1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1;1:57,1,2,1,1,1,1,1,1,2,10,1" +
  "9,1,1,1,1,1,88,1,1,1,1,1,1,1,10,1,1,5,1,1,1,1,1,1,1,1,1,1,2,7,1,1,1,1,1;1:58" +
  ",2,1,1,1,1,1,1,1,1,1,7,20,1,1,1,1,91,1,1,1,1,1,1,1,1,6,1,1,1,5,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,5,1,1,1,1,1;1:58,1,1,1,1,1,1,1,1,1,1,1,1,5,1,13,1,1,3,1,1,1,1" +
  ",1,94,1,1,1,1,1,1,1,7,1,7,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1;1:58,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,2,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,96,1,1,1,1,1,1,1,1," +
  "13,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1;1:58,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1," +
  "1,7,1,1,1,1,1,1,1,1,1,1,103,1,1,1,1,1,1,1,15,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1" +
  ";1:58,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,10,1,1,1,1,1,105,1,1,1,1,1,1,1,1" +
  ",1,12,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1;1:58,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,1,1,10,1,1,1,107,1,1,1,1,1,1,1,1,1,1,11,1,1,1,7,1,1,1,1,1,1,1,1;1:59,1,1," +
  "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,11,111,1,1,1,1,1,1,1,1,1,1,1,17,1,1,1,1,1," +
  "1,1,1;1:59,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,119,1,1,1,1,1,1,1,1,1,1,1" +
  ",1,12,1,1,1,1,1,1,3;1:61,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,120,1,1,1,1,1" +
  ",1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1;1:62,1,1,1,1,1,1,1,1,1,1,1,1,1,1," +
  "1,7,123,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:64,1,1,1,1,1,1,1,1" +
  ",1,1,1,1,1,1,6,1,124,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:66,1,1,1,1," +
  "1,1,1,1,1,1,1,1,1,6,127,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;1:70,2,1,1,1,1,1,1" +
  ",1,1,137,1,1,1,1,1,1,1,1,1,1,1;1:72,1,1,1,3,1,1,1,1,3,1,1,1,128,1,1,1,1,1,1," +
  "1,1,1,1;1:72,1,1,1,4,1,1,1,1,1,1,1,1,1,128,1,1,1,1,1,1,1,1,1,19;1:82,1,1,1,1" +
  ",1,129,1,1,1,1,1,1,1;1:84,1,1,128,1,1,1,1,1,1,1,1;1:215,1,1,1,1;1:215,1,1;13" +
  ":82;1:82";

export interface DotField {
  /** Interleaved x, y in map units. */
  points: Float32Array;
  /** Lattice column and row per dot, for bucketing. */
  columns: Int16Array;
  rows: Int16Array;
  count: number;
}

/** Unpack once at module load; it is a few thousand integer parses. */
export const DOTS: DotField = (() => {
  const xs: number[] = [];
  const cols: number[] = [];
  const rws: number[] = [];
  let j = 0;
  for (const row of PACKED.split(";")) {
    const [head, body] = row.split(":");
    j += Number(head);
    let i = 0;
    const deltas = body.split(",");
    for (let k = 0; k < deltas.length; k += 1) {
      i = k === 0 ? Number(deltas[k]) : i + Number(deltas[k]);
      xs.push(
        DOT_LATTICE.originX + i * DOT_LATTICE.pitchX,
        DOT_LATTICE.originY + j * DOT_LATTICE.pitchY,
      );
      cols.push(i);
      rws.push(j);
    }
  }
  return {
    points: Float32Array.from(xs),
    columns: Int16Array.from(cols),
    rows: Int16Array.from(rws),
    count: cols.length,
  };
})();
```

`season-dots.tsx` — the engine (constants, the lattice index, the bake, the light, the draw, the frame):

```ts
const MAX_RATIO =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none) and (pointer: coarse)").matches
    ? 1
    : 2;
/** Below this a dot has gone back to being a dot. */
const MIN_LEVEL = 0.02;
/** The wave runs across the map on this heading — along the long straight. */
const WAVE_ANGLE = (-20 * Math.PI) / 180;
/** Frame clock period. The value is unused; only its ticks matter. */
const CLOCK_MS = 2000;
const POINTER_HEAT = 0.95;
/** How far each arm runs from the crossing, in map units, fully open. */
const RETICLE_OPEN = 420;
/**
 * The arms only open when the cursor settles. Above this speed, in map units
 * a second, they are fully retracted and the reticle is just its crossing —
 * so a cursor crossing the map is a point being tracked, and a cursor that
 * stops is a reading being taken. Retracting is quick and opening is not:
 * the reticle should feel like it is acquiring, not like it is flickering.
 */
const RETICLE_SETTLE = 900;
const SPREAD_OPEN = 0.38;
const SPREAD_SHUT = 0.09;
/** Arms sit under the crossing, so the centre still reads as the point. */
const RETICLE_ARM = 0.82;
/** The bloom at the crossing itself. */
const RETICLE_CORE = 54;
/** Seconds for the light to cover most of the gap to the cursor. */
const POINTER_TRAIL = 0.07;
/** Seconds to bring the light up on entry, and to put it out on exit. */
const POINTER_RISE = 0.14;
const POINTER_FALL = 0.3;
/** Exponential approach — frame-rate independent, unlike a flat lerp. */
const approach = (from: number, to: number, dt: number, tau: number) =>
type Rgb = readonly [number, number, number];

const parseHex = (value: string): Rgb | null => {
  const hex = value.trim().replace("#", "");
  if (hex.length !== 6) return null;
  const n = Number.parseInt(hex, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

const css = ([r, g, b]: Rgb) => `rgb(${r} ${g} ${b})`;

/**
 * The lit dot is a **chequer**, not a glyph.
 *
 * It read as ASCII first — the same ramp the lap's head used — and the ramp's
 * bright end is ` + * # `, so the cursor dragged a cluster of crosses over the
 * map. Crosses are the one mark this block cannot spend: the map already has
 * grid axes, a hub and corner ticks, and the reticle's own arms are crosses.
 *
 * A chequer is the thing a race actually ends on, and the block already draws
 * one at the finish. So a dot the light reaches squares up: the square grows
 * with the light, and the lattice's own parity decides whether it fills or
 * clears. At full strength the squares meet edge to edge and the patch is a
 * chequered flag laid over the coastline; below that it is the map dissolving
 * into one. The flag is drawn out of the *map's own dots*, so it stays the
 * geography rather than a panel dropped on top of it.
 */
/** Square side at full light, as a share of the lattice pitch. Over 1 the
 *  squares would overlap and the chequer would close up into a solid. */
const CHEQUER_FILL = 1;
/**
 * And at the threshold. It is **0.7 of the pitch, not the dot's own 0.45**:
 * tied to the dot's size the far half of each reticle arm drew squares barely
 * bigger than the dots they replaced, and the arms read as a faint dotted line
 * rather than as a chequer. The square has to arrive as a square; the light
 * level is carried by its colour, which is where it was carried before.
 */
const CHEQUER_SEED = 0.7;

/** Soft round falloff — the same shape the marker flares use. */
const falloff = (t: number) => {
  if (t >= 1) return 0;
  const u = 1 - t;
  return u * u;
};


// the lattice index (built once)
  const index = useMemo(() => {
    const { columns, rows, points, count } = DOTS;
    let minI = Infinity;
    let maxI = -Infinity;
    let minJ = Infinity;
    let maxJ = -Infinity;
    for (let i = 0; i < count; i += 1) {
      if (columns[i] < minI) minI = columns[i];
      if (columns[i] > maxI) maxI = columns[i];
      if (rows[i] < minJ) minJ = rows[i];
      if (rows[i] > maxJ) maxJ = rows[i];
    }
    const w = maxI - minI + 1;
    const h = maxJ - minJ + 1;
    const cell = new Int32Array(w * h).fill(-1);
    for (let i = 0; i < count; i += 1) {
      cell[(rows[i] - minJ) * w + (columns[i] - minI)] = i;
    }

    const dx = Math.cos(WAVE_ANGLE);
    const dy = Math.sin(WAVE_ANGLE);
    const projection = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      projection[i] = points[i * 2] * dx + points[i * 2 + 1] * dy;
    }
    const order = Array.from({ length: count }, (_, i) => i).sort(
      (a, b) => projection[a] - projection[b],
    );
    const sorted = new Int32Array(order);
    const sortedProjection = Float32Array.from(order, (i) => projection[i]);

    return {
      cell,
      w,
      h,
      minI,
      minJ,
      dx,
      dy,
      sorted,
      sortedProjection,
      projectionMin: sortedProjection[0],
      projectionMax: sortedProjection[count - 1],
    };
  }, []);

// the resting field, baked once per size change
  const bake = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    const ratio = Math.min(window.devicePixelRatio || 1, MAX_RATIO);
    const w = Math.round(width * ratio);
    const h = Math.round(height * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const baked = bakedRef.current ?? document.createElement("canvas");
    bakedRef.current = baked;
    baked.width = w;
    baked.height = h;

    const context = baked.getContext("2d");
    if (!context) return;
    const scale = w / MAP_VIEW.width;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, MAP_VIEW.width, MAP_VIEW.height);

    const { points, count } = DOTS;
    context.fillStyle = css(paletteRef.current.dot);
    context.beginPath();
    for (let i = 0; i < count; i += 1) {
      const x = points[i * 2];
      const y = points[i * 2 + 1];
      context.moveTo(x + DOT_RADIUS, y);
      context.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
    }
    context.fill();

    // Setting the canvas size cleared the visible layer, so put the field back
    // now rather than leaving it blank until the clock's first tick.
    dirtyRef.current = true;
    drawRef.current();
  }, []);

// raise the dots the light reaches
  const light = useCallback(
    (p: HalftoneParams, dt: number) => {
      const level = levelRef.current;
      const active = activeRef.current;
      const inList = inListRef.current;
      const { points } = DOTS;
      const radius = Math.max(1, p.radius);

      const add = (i: number, value: number) => {
        if (value <= MIN_LEVEL) return;
        if (value > level[i]) level[i] = value;
        if (!inList[i]) {
          inList[i] = 1;
          active[activeCountRef.current] = i;
          activeCountRef.current += 1;
        }
      };

      /** A round light at a point: ask the lattice for its rows and columns. */
      const addPoint = (source: HalftoneLight, reach: number) => {
        if (source.heat <= 0.01) return;
        const { cell, w, h, minI, minJ } = index;
        const i0 = Math.floor(
          (source.x - reach - DOT_LATTICE.originX) / DOT_LATTICE.pitchX,
        );
        const i1 = Math.ceil(
          (source.x + reach - DOT_LATTICE.originX) / DOT_LATTICE.pitchX,
        );
        const j0 = Math.floor(
          (source.y - reach - DOT_LATTICE.originY) / DOT_LATTICE.pitchY,
        );
        const j1 = Math.ceil(
          (source.y + reach - DOT_LATTICE.originY) / DOT_LATTICE.pitchY,
        );
        for (
          let j = Math.max(minJ, j0);
          j <= Math.min(minJ + h - 1, j1);
          j += 1
        ) {
          const row = (j - minJ) * w;
          for (
            let i = Math.max(minI, i0);
            i <= Math.min(minI + w - 1, i1);
            i += 1
          ) {
            const idx = cell[row + (i - minI)];
            if (idx < 0) continue;
            const d = Math.hypot(
              points[idx * 2] - source.x,
              points[idx * 2 + 1] - source.y,
            );
            add(idx, falloff(d / reach) * source.heat);
          }
        }
      };

      /**
       * The reticle: the cursor's own lattice row and column, then a bloom
       * where they cross. Both arms are a straight walk of the flat index, so
       * the whole thing costs one row and one column of lookups.
       *
       * The arms fall off **linearly** where the round lights fall off
       * quadratically — a square law puts the far half of each arm under the
       * glyph threshold, and a crosshair that fades out after a third of its
       * length reads as a smudge rather than a line.
       */
      const addReticle = (source: HalftoneLight) => {
        if (source.heat <= 0.01) return;
        const { cell, w, h, minI, minJ } = index;
        const ci = Math.round(
          (source.x - DOT_LATTICE.originX) / DOT_LATTICE.pitchX,
        );
        const cj = Math.round(
          (source.y - DOT_LATTICE.originY) / DOT_LATTICE.pitchY,
        );
        const arm = RETICLE_ARM * source.heat;
        const reach = RETICLE_OPEN * spreadRef.current;

        if (reach > 1 && cj >= minJ && cj < minJ + h) {
          const row = (cj - minJ) * w;
          const span = Math.ceil(reach / DOT_LATTICE.pitchX);
          const from = Math.max(minI, ci - span);
          const to = Math.min(minI + w - 1, ci + span);
          for (let i = from; i <= to; i += 1) {
            const idx = cell[row + (i - minI)];
            if (idx < 0) continue;
            const d = Math.abs(points[idx * 2] - source.x);
            add(idx, (1 - d / reach) * arm);
          }
        }

        if (reach > 1 && ci >= minI && ci < minI + w) {
          const span = Math.ceil(reach / DOT_LATTICE.pitchY);
          const from = Math.max(minJ, cj - span);
          const to = Math.min(minJ + h - 1, cj + span);
          for (let j = from; j <= to; j += 1) {
            const idx = cell[(j - minJ) * w + (ci - minI)];
            if (idx < 0) continue;
            const d = Math.abs(points[idx * 2 + 1] - source.y);
            add(idx, (1 - d / reach) * arm);
          }
        }

        addPoint(source, RETICLE_CORE);
      };

      // The reticle stacks with whichever source the panel has selected —
      // `add` keeps the brighter claim on a dot, so the two never sum into a
      // blown-out patch.
      addReticle(pointerRef.current);

      // `none` ships: the cursor is the only light. See `halftone-store`.
      if (p.source === "none") return;

      if (p.source === "edge") {
        const source = lightRef.current;
        if (source) addPoint(source, radius);
        return;
      }

      // The wave: a band crossing the map, found by binary search on the dots
      // sorted along its heading.
      phaseRef.current = (phaseRef.current + dt * p.waveSpeed) % 1;
      const { sorted, sortedProjection, projectionMin, projectionMax } = index;
      const span = projectionMax - projectionMin + radius * 2;
      const centre = projectionMin - radius + phaseRef.current * span;
      const lo = centre - radius;
      const hi = centre + radius;

      let a = 0;
      let b = sortedProjection.length;
      while (a < b) {
        const m = (a + b) >> 1;
        if (sortedProjection[m] < lo) a = m + 1;
        else b = m;
      }
      for (let k = a; k < sortedProjection.length; k += 1) {
        const projection = sortedProjection[k];
        if (projection > hi) break;
        add(sorted[k], falloff(Math.abs(projection - centre) / radius));
      }
    },
    [index, lightRef],
  );

// the draw: blit the baked field, then the chequer
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const baked = bakedRef.current;
    if (!canvas || !baked || !canvas.width) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const p = paramsRef.current;
    const scale = canvas.width / MAP_VIEW.width;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, MAP_VIEW.width, MAP_VIEW.height);
    context.drawImage(baked, 0, 0, MAP_VIEW.width, MAP_VIEW.height);

    const level = levelRef.current;
    const active = activeRef.current;
    const count = activeCountRef.current;
    const { points, columns, rows } = DOTS;
    const { accent, bright, white } = paletteRef.current;

    // Two passes: every lit dot is lifted out of the baked field first, then
    // the chequer goes down. One pass would let a later dot's clear bite a
    // hole in a square already drawn, because a square at full light is wider
    // than the lattice pitch.
    const box = DOT_RADIUS * 2 + 1;
    const span = 1 - p.threshold || 1;
    let drew = 0;
    for (let k = 0; k < count; k += 1) {
      const idx = active[k];
      if (level[idx] < p.threshold) continue;
      context.clearRect(
        points[idx * 2] - DOT_RADIUS - 0.5,
        points[idx * 2 + 1] - DOT_RADIUS - 0.5,
        box,
        box,
      );
      drew += 1;
    }
    if (!drew) return;

    for (let k = 0; k < count; k += 1) {
      const idx = active[k];
      const value = level[idx];
      if (value < p.threshold) continue;
      // The dark half of the chequer: cleared above and left cleared, so the
      // pattern is drawn as much by what the light *takes* as by what it puts
      // down — which is what stops a lit patch reading as a solid block.
      if ((columns[idx] + rows[idx]) & 1) continue;

      const t = Math.min(1, (value - p.threshold) / span);
      const side =
        DOT_LATTICE.pitchX * (CHEQUER_SEED + (CHEQUER_FILL - CHEQUER_SEED) * t);
      context.fillStyle = css(
        value > 0.8 ? white : value > 0.5 ? bright : mix(accent, bright, value),
      );
      context.fillRect(
        points[idx * 2] - side / 2,
        points[idx * 2 + 1] - side / 2,
        side,
        side,
      );
    }
  }, []);

// the frame, from the 2000ms clock
  const frame = useCallback(() => {
    const now = performance.now();
    const dt = lastRef.current
      ? Math.min(0.1, (now - lastRef.current) / 1000)
      : 0;
    lastRef.current = now;

    const p = paramsRef.current;
    const level = levelRef.current;
    const active = activeRef.current;
    const inList = inListRef.current;

    // Walk the pointer light toward the cursor. The lag is the whole point:
    // a light with a little mass reads as something held over the map, where
    // a light pinned to the cursor reads as a hard mask.
    const pointer = pointerRef.current;
    const target = targetRef.current;
    const wanted = target.on ? POINTER_HEAT : 0;
    if (pointer.heat <= 0.001 && wanted > 0) {
      pointer.x = target.x;
      pointer.y = target.y;
    } else if (dt > 0) {
      const px = pointer.x;
      const py = pointer.y;
      pointer.x = approach(px, target.x, dt, POINTER_TRAIL);
      pointer.y = approach(py, target.y, dt, POINTER_TRAIL);
      // Measured off the light's own travel rather than the raw cursor, so a
      // mouse jumping between two frames does not read as a longer motion
      // than the light actually made.
      const speed = Math.hypot(pointer.x - px, pointer.y - py) / dt;
      const wantedSpread = Math.max(0, 1 - speed / RETICLE_SETTLE);
      spreadRef.current = approach(
        spreadRef.current,
        wantedSpread,
        dt,
        wantedSpread > spreadRef.current ? SPREAD_OPEN : SPREAD_SHUT,
      );
    }
    pointer.heat = approach(
      pointer.heat,
      wanted,
      dt,
      wanted > pointer.heat ? POINTER_RISE : POINTER_FALL,
    );
    // Out means shut: the reticle should acquire on the way back in rather
    // than reappearing already open.
    if (pointer.heat < 0.005) {
      pointer.heat = 0;
      spreadRef.current = 0;
    }

    // Fade what is already lit, and drop whatever has landed back.
    const decay = Math.exp(-dt / Math.max(0.05, p.fade / 3));
    let write = 0;
    for (let k = 0; k < activeCountRef.current; k += 1) {
      const idx = active[k];
      const value = level[idx] * decay;
      if (value > MIN_LEVEL) {
        level[idx] = value;
        active[write] = idx;
        write += 1;
      } else {
        level[idx] = 0;
        inList[idx] = 0;
      }
    }
    const before = activeCountRef.current;
    activeCountRef.current = write;

    light(p, dt);

    // An idle field repaints once and then stops asking for the blit.
    if (activeCountRef.current === 0 && before === 0 && !dirtyRef.current)
      return;
    dirtyRef.current = false;
    draw();
  }, [draw, light]);
```


## 4 — From karts to F1 (the timeline)

`<section>` — `container-type: inline-size; position: relative; isolation: isolate; width: 100%; background: var(--surface-black); color: var(--foreground-on-dark); padding-bottom: var(--bottom-pad)`
where `--gutter: max(2.2222cqw, var(--gutter-min, 0px))`, `--bottom-pad: 10.4167cqw` (150 design px),
`--bottom-pad-narrow: 5cqw`. Below `lg`: `overflow-x: clip` (**not** `hidden` — that would make it a
scroll container and kill the sticky stack) and `--copy-min-size: 17px; --head-min: 6.6667cqw; --head-w-min: 82cqw; --year-min: 30px; --copy-min-w: 200px`; `sm…lg`: `--top-pad-extra: 16cqw; --head-top: var(--bottom-pad)`;
below `sm`: `--head-min: 40px; --top-pad-extra: 15cqw; --copy-min-w: 320px; --gutter-min: 24px`;
from `sm`: `--copy-max-w: 26.9444cqw`. It is the last layer of the stack — `position: relative; z-index: 20`, never pinned.

The chequered dissolve seams it (`carry="light"`, `z-index 30`, phone 0). Then a wrapper
`position: relative; width: 100%; padding-top: calc(var(--top-pad) + var(--top-pad-extra, 0px))`
with `--top-pad: 11.7361cqw` (169) holding the rail, the heading and the seven rows (below `sm` the
wrapper is a column, `gap: 2.5rem; padding: 0 var(--gutter)`).

The geometry module and the plate shape are quoted verbatim below. The frame is 1440×2700: 169 of
top inset, then rows of **462** (centre) and **217** (side) stacked with **no gap at all** —
centre, side, centre, side, centre, side, centre — and 32 below.

### The heading

`<h2>` Oswald 700 uppercase line-height 0.95 `color: var(--accent)`, `font-size: max(3.8194cqw, var(--head-min, 0px))`,
`position: absolute; z-index: 20; top: var(--head-top, var(--gutter)); right: var(--gutter); width: max(20.3472cqw, var(--head-w-min, 0px))`,
right-aligned (`align-items: flex-end; text-align: right; justify-content: flex-end` from `lg`;
centred below; left at the gutter below `sm` where the two lines sit in one row, `gap: 0.28em`).
Two lines — `from karts` / `to f1` — word reveals at `index * 130`, the full stop after the last in
white at `130 + 110`.

### The rail

`position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); z-index: 10; width: 1.1111cqw; top: var(--rail-top)`, hidden below `sm`.
`--rail-top` is `0` (the block's own top edge) from `lg`, and `calc(11.7361cqw + var(--top-pad-extra, 0px))` below it (the first photograph). One SVG,
`viewBox="0 0 16 ${viewH}"` where `viewH = railHeight - origin`, `overflow: visible`, `size: 100%`:

- the track: a line at `x = 8` from `0` to `98` solid, then from `102` to `rest` dashed `6 6`,
  `stroke: var(--timeline-rail); stroke-width 1`;
- a **progress rect** `x 7.5, width 1`, `height = run`, `fill: var(--foreground-on-dark)`;
- a **marker square** of side `9` (`20` below `lg`), `fill` white, `transform = translate(8 ${run}) rotate(${run / rest * 1800})` — **five full turns** over the run.

`run = interpolatedProgress * rest`, scrubbed by a trigger `start "top center" → end "bottom bottom"`
on the rail element (the page ends with this block's stack, so the last half-viewport is
unreachable; `bottom bottom` is what lets the thread finish). `rest` is the resting point: the last
row's middle minus 50, i.e. `restingPoint()` in the geometry — the thread stops **on the last
entry**, not at the foot.

### A row

`position: relative; width: 100%; height: px(462 | 217)`; below `sm` a column `gap: 0.75rem; height: auto`.
Three things, each on its own **parallax layer** — a scrub trigger on the row's whole crossing
(`"top bottom" → "bottom top"`) that moves the layer's content on **`top`** (never a transform) from
`+px(travel)` to `−px(travel)`, so it passes through its design position exactly as the row passes
the middle of the screen. `PARALLAX = { plate: { side: 60, centre: 20 }, copy: 110 }` — in design px,
half-ranges, in `cqw`.

1. **The plate** — `position: absolute; inset-y: 0; width: px(333 | 710)`; a side plate sits at
   `left: var(--gutter)` or `right: var(--gutter)` per `align`, a centre plate at `left: 50%; transform: translateX(-50%)`.
   Below `sm` every plate is `width: 82%; aspect-ratio: 710/462`, alternating `margin-right: auto` /
   `margin-left: auto` by row index. The plate is `TimelinePlate`: a clip to `PLATE_CLIP`
   (`clipPathUnits="objectBoundingBox"`) on an `absolute inset-0; overflow: hidden; background: var(--timeline-fill)`
   fill that **insets to 5% on hover** (`transition: inset 700ms cubic-bezier(0.33,0,0,1)`) while the
   outline stays — `PLATE_OUTLINE` in an `absolute inset-0` SVG `viewBox="0 0 710.995 462.995" preserveAspectRatio="none"`,
   `stroke: var(--timeline-outline); stroke-width 1; vector-effect: non-scaling-stroke`. Inside the
   fill, a second scrub (`"top bottom" → "top center"`) moves the slot's content on `top` from
   `-10%` to `0%`, and the photograph is `object-fit: cover; height: 110%` pinned to the top — the
   overscan *is* the travel. Plate parallax travel: `plate[frame]`.
2. **The year** — `position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 20; pointer-events: none`,
   Oswald 700 uppercase line-height 0.95 `color: var(--accent)`, `font-size: max(px(36), var(--year-min, 0px))`.
   It rides its **plate's** parallax figure (not one of its own). Letter by letter
   (`letterStagger 26`, `YEAR {190, 24}`, mode forward) when the row enters view (`rootMargin 0% 0% -25% 0%`, once).
   On a **centre** row it then settles from `opacity 1` to **`0.4`** after a `2200ms` hold with
   `YEAR_SETTLE {32, 26}`; on a side row it stays at 1. Below `sm` it sits on the picture's middle
   (`position: relative; height: 0; width: 82%; top: -28.8cqw; text-align: center`, same side as the plate).
3. **The copy** (centre rows only) — `<p>` `position: absolute; left: px(1020); top: 50%; transform: translateY(-50%); z-index: 20; pointer-events: none`,
   uppercase, line-height 1.1, white, `width: min(max(px(copyWidth), var(--copy-min-w, 0px)), var(--copy-max-w, 100vw))`,
   `font-size: max(px(18), var(--copy-min-size, 0px))`; the lead sentence bold then the rest. A block
   rise `{0, translateY(0.75rem)} → {1, 0}` with `COPY {110, 26}` at `+220` after the row enters view.
   Its content rides `PARALLAX.copy` — the nearest layer moves most.

**Hovering one plate dims the rest of the block**: with `(hover: hover)`, when any plate is hovered
every row goes to `opacity: 0.3` except the hovered row (`transition: opacity 700ms cubic-bezier(0.33,0,0,1)`).

The seven entries, verbatim (`copyWidth` is the design's own column per row; images are
`timeline/<year>.webp`, all 1420×1016):

| year | frame | align | copy |
|---|---|---|---|
| 2012 | centre | — | **The first kart.** At six, Kimi discovered karting — turning a childhood curiosity into something of his own. (228) — alt "Kimi in kart overalls in the paddock, aged six" |
| 2015 | side | right | — alt "Kimi holding a karting trophy at sunset" |
| 2019 | centre | — | **Finding his people.** Kimi joined the Mercedes Junior Programme, marking his first major step into professional motorsport. (272) — alt "Kimi signing with the Mercedes junior team" |
| 2021 | side | left | — alt "Kimi beside a single-seater in the garage" |
| 2024 | centre | — | **The year everything changed.** Formula 2 brought Kimi closer to F1, while Mercedes confirmed him as their future race driver. (278) — alt "Kimi walking the pit lane in Mercedes kit" |
| 2025 | side | right | — alt "Kimi in the Mercedes garage" |
| 2026 | centre | — | **From karts to f1.** Kimi is now racing at the highest level, with Bologna still his anchor — family, home and life beyond racing. (284) — alt "The Mercedes-AMG F1 car on track" |

The geometry, verbatim:


```ts
// 📖 Docs: obsidian/frontend/components/sections.md

import type { TimelineEntry } from "@/data/mocks/home";

/**
 * The block's measurements, in the design's own pixels, and the unit that
 * carries them.
 *
 * A plain module on purpose. These numbers are read by the Server Component
 * that lays the rows out *and* by the client component that draws the rail, and
 * a value cannot cross a `"use client"` boundary: import a number from a client
 * module into a server one and what arrives is a client reference, not the
 * number. The rail's lead was imported that way and every sum built on it came
 * out `NaN` — silently, since the spring simply wrote `height: NaN%` and the
 * line stayed at zero.
 */

/**
 * One design pixel, as a share of the block's own width.
 *
 * Not `rem`. The project scales the root font size in bands — 1440 up to 1440,
 * then 1920 up to 1920, then a fixed 16px below 1279 — and each band expects a
 * design authored at that base. This frame is authored at 1440 and there is no
 * 1920 one, so rem put the block at 1134 wide inside a 1512 window and blew it
 * off the screen entirely below 1280. `cqw` is a share of the section's own
 * width, so the block is the Figma frame at every viewport.
 */
export const px = (value: number) => `${((value / 1440) * 100).toFixed(4)}cqw`;

/**
 * A design pixel for **type**, with a floor.
 *
 * The same `px()` until the block gets small enough that its smallest labels
 * stop being letters. A **floor**, not a multiplier: anything already above
 * it keeps its exact share of the frame, so the block still reads as the 1440
 * composition scaled and only the type that had fallen under a dozen pixels
 * is lifted. The floor itself is 0 unless a section sets `--type-min`, which
 * they do below `lg` and nowhere else.
 */
export const type = (value: number) =>
  `max(${px(value)}, var(--type-min, 0px))`;

/**
 * The block's masthead, with a floor of its own.
 *
 * The four blocks do not set their mastheads at one size — the frame gives
 * the paddock 96 and the other three 55 — and scaled down that spread reads
 * as three different type systems rather than one: at 768 it is 51.2 against
 * 29.3. The floor closes the gap from below, so every masthead lands on the
 * paddock's size where the block is narrow and each keeps the frame's own
 * number where it is not.
 */
export const masthead = (value: number) =>
  `max(${px(value)}, var(--head-min, 0px))`;
/**
 * The width from which the block runs the design's own 1440 composition.
 *
 * Below it the port is not merely small, it is unreadable: every length here
 * is a share of the block's width, so at 390 the 36px year renders at 9.8 and
 * the 18px copy at 4.9. Tailwind's `xl`, and the number is chosen so the port
 * only runs where its smallest type still clears 16px — 18 x 1280/1440 = 16.
 * Under it every block below the hero lays itself out as a single column.
 */
export const PORT_FROM = 1280;

/**
 * The width under which the block gives up the design's composition and
 * stacks into one column.
 *
 * Tailwind's `sm`, and it used to be `lg` — the column ran all the way up to
 * 1023. That was written for the phone and applied to the tablet by accident:
 * at 768 the frame's own layout still holds together, the centre plate is 379
 * across and the copy column beside it 200, and it is what the block was asked
 * to look like there. Under 640 it genuinely does not — the side plate falls
 * to 148 and the copy column to 126 — so the column stays for the phone.
 *
 * Paired with the `max-sm:` classes through the block; this constant carries
 * the same number to the one decision that cannot be a class (whether the year
 * lands on a photograph or under it). Change one and change the other.
 */
export const COLUMN_UNDER = 640;

/**
 * The width under which the block still runs the design's composition, but
 * small enough that some of its parts have to be sized for the eye rather
 * than scaled off the frame.
 *
 * Tailwind's `lg`, and the pair to the `max-lg:` floors the section sets. Two
 * things read it: where the thread starts, and how big the marker on it is.
 */
export const NARROW_UNDER = 1024;

/**
 * The marker's square below `NARROW_UNDER`, in the rail's own units.
 *
 * The frame's 9 is 9 against a 1440 block — 4.8 real pixels at 768, which is
 * a speck rather than the thing the thread is carrying. 20 puts it back at
 * around eleven, which is what it reads as on the wide frame. Wider than the
 * rail's own 16, so the rail's SVG is drawn `overflow-visible`; the square
 * turns as it travels and its corners swing past that box in any case.
 */
export const MARK_SIZE_NARROW = 20;

export const ROW_HEIGHT = { side: 217, centre: 462 } as const;
export const PLATE_WIDTH = { side: 333, centre: 710 } as const;

/** The gutter, and where the copy column starts. */
export const GUTTER = 32;
/**
 * Where the masthead sits below `xl`. The frame's own 32 is measured against a
 * masthead pinned to the right gutter with the block's whole left half open
 * beside it; centred over the first photograph the same 32 reads as pressed
 * against the top edge.
 */
export const HEAD_TOP_NARROW = 96;
/**
 * What the block leaves below its last plate. The frame's own is the gutter's
 * 32; this adds 118 on top, asked for so the last photograph is not read as
 * running straight into the block that follows.
 */
export const BOTTOM_PAD = GUTTER + 118;
/**
 * The same below `xl`, cut back.
 *
 * The 118 was asked for at 1440, where it separates the last photograph from
 * the block that follows without reading as a hole. Scaled down with the rest
 * of the block it keeps its proportion but loses its job — the plate is
 * narrower there, so the same share of the width is a much taller gap
 * relative to what is above it.
 */
export const BOTTOM_PAD_NARROW = GUTTER + 40;
/**
 * Scroll parallax: how far each layer of a row travels as the row crosses the
 * viewport, in design pixels **either side of its design position**.
 *
 * The layers differ hard so the row reads as floating rather than as one flat
 * card. Relative to the photograph it is built on, the copy slides 180 design
 * pixels across a crossing — that difference, not any single figure, is the
 * effect. Order is a depth order: the copy sits over the photograph on `z-20`
 * and is the nearest thing to the reader, so it moves most; the centre plate
 * is the ground the row is built on and barely moves at all. The year is a
 * plate's marker rather than a layer of its own, so it takes whichever figure
 * its plate does and stays registered on it.
 *
 * **Centred on the design position, not hung off it.** Each layer runs from
 * `+value` to `-value`, so it is exactly where the 1440 frame puts it as the
 * row passes the middle of the screen — which is where a reader judges the
 * composition — and the excursion buys twice the differential for the same
 * distance travelled either way.
 *
 * The ceiling is the stack, which butts with **no gap at all** (see `./index`):
 * this is the one figure in the block that can put two rows on top of each
 * other. The headroom, measured:
 *
 * - A **centre** plate drifting into the side row above it clears that row's
 *   plate — those sit out at the gutters and never overlap a centre plate
 *   horizontally — but the side row's *year* is at its centre, ~109px away.
 * - A **side** plate drifting into the centre row above it clears that plate
 *   for the same reason, and reaches its copy at ~181px: the copy starts at
 *   1020 and a right-aligned side plate at 1075, so those two do overlap.
 * - The **copy** only ever moves inside its own 462-tall row: it sits at the
 *   row's middle, 231px from either edge, and copy is only ever set on centre
 *   rows.
 *
 * Every figure below is inside half of its own limit.
 *
 * Small screens need no separate cap. The travel is in `cqw` off the block's
 * own width like everything else here, so the copy's 110 design pixels are
 * 110 real ones at 1440 and 30 on a 390-wide phone, where the rows stack as a
 * column and have far less room.
 */
export const PARALLAX = {
  plate: { side: 60, centre: 20 },
  copy: 110,
} as const;

export const COPY_LEFT = 1020;
/**
 * The block's own top inset, before the first row.
 *
 * 169 in the updated frame: the masthead sits at 32 and runs 104 tall, so the
 * first plate clears it by 33. The stack then closes the frame exactly —
 * 169 + 4x462 + 3x217 = 2668, and the 2700 frame leaves the usual 32 below.
 */
export const TOP_PAD = 169;
/**
 * The same inset below `xl`, plus air.
 *
 * There the masthead is centred and set on one line rather than pinned to the
 * right gutter over two, so it sits directly above the first photograph
 * instead of beside it — and 169 that reads as generous next to a plate reads
 * as cramped underneath one.
 */
export const TOP_PAD_NARROW = TOP_PAD + 96;

/**
 * How far above its row's middle the design sets a marker. Both of Figma's
 * drawn squares sit here — y 350 against a first-row middle of 400, and y 2387
 * against the last row's 2437 — which is what says they are one marker at two
 * moments rather than two fixtures. It is also where the rail's own line
 * stops: Figma draws it 0 to 2387, so the thread ends under the marker at
 * rest rather than running on to the foot of the block.
 */
export const MARK_RISE = 50;
export const MARK_SIZE = 9;

/**
 * Where the rail begins, measured from the top of the block.
 *
 * **0 — the block's own top edge**, which is where Figma starts it: the frame
 * draws the line from y 0 to y 2387 in a 2700 box. It briefly ran 260 *above*
 * the block, up into the tail of the season section so the thread crossed the
 * seam, and then from the first photograph; the frame's own answer is the top
 * of the block, and that is what this is.
 */
export const RAIL_START = 0;
/** The rail runs solid to here, then a gap, then 6-on 6-off to the end. */
export const RAIL_SOLID = 98;
export const RAIL_GAP = 4;
export const RAIL_DASH = 6;

/** The rail's box, in design px: 16 across so the turning marker fits. */
export const RAIL_WIDTH = 16;

/** The rail's full run, from `RAIL_START` to the foot of the last row. */
export const railHeight = (entries: readonly TimelineEntry[]) =>
  TOP_PAD +
  entries.reduce((total, entry) => total + ROW_HEIGHT[entry.frame], 0) -
  RAIL_START;

/**
 * Where the marker comes to rest, as a share of the rail.
 *
 * The design stops the thread **on the last entry** — 45 above the middle of
 * the final centre row, the offset every one of its drawn markers sits at — not
 * at the bottom of the block. Running it to the end left the marker on the last
 * plate's bottom edge, which is not what the frame shows.
 */
export const restingPoint = (entries: readonly TimelineEntry[]) => {
  const heights = entries.map((entry) => ROW_HEIGHT[entry.frame]);
  const lastTop =
    TOP_PAD + heights.slice(0, -1).reduce((total, height) => total + height, 0);
  const rest = lastTop + heights[heights.length - 1] / 2 - MARK_RISE;
  return (rest - RAIL_START) / railHeight(entries);
};
```

`plate-shape.ts`:

```ts
// 📖 Docs: obsidian/frontend/components/sections.md

/**
 * The timeline plate, as geometry.
 *
 * The design ships this as an exported SVG — a rounded rectangle with a step
 * cut out of its bottom-right edge — and it ships it twice, once per size. The
 * two exports are the same curve at 2.13x, so it survives here as **one** path
 * rather than two assets. It has to be a path rather than an `<img>` anyway:
 * these plates are content frames, and an image of a rectangle cannot hold
 * anything.
 *
 * `PLATE_VIEW` is the larger export's own box, so `PLATE_OUTLINE` is drawn at
 * the coordinates the designer set. `PLATE_CLIP` is the same curve normalised
 * to a unit box, for a `clipPathUnits="objectBoundingBox"` clip that scales
 * with whatever it is put on. The two plate sizes differ in aspect by 0.2%,
 * which is why one normalised curve serves both.
 */
export const PLATE_VIEW = { width: 710.995, height: 462.995 } as const;

/** Stroke width in the export, and the inset its geometry already carries. */
export const PLATE_STROKE = 0.994939;

export const PLATE_OUTLINE =
  "M13.6168 0.497469H697.378C700.858 0.497469 704.195 1.38786 706.655 2.97277C709.115 4.55769 710.498 6.70729 710.498 8.94869V411.208C710.498 413.449 709.115 415.599 706.655 417.183C704.195 418.768 700.858 419.659 697.378 419.659H460.249C454.073 419.659 447.976 420.555 442.411 422.281C436.847 424.008 431.958 426.519 428.107 429.63L399.246 452.95C395.559 455.928 390.878 458.333 385.55 459.986C380.223 461.639 374.385 462.497 368.472 462.497H13.6168C10.1373 462.497 6.80038 461.607 4.34003 460.022C1.87968 458.437 0.497469 456.288 0.497469 454.046V8.94869C0.497469 6.70729 1.87968 4.55769 4.34003 2.97277C6.80038 1.38786 10.1373 0.497469 13.6168 0.497469Z";

export const PLATE_CLIP =
  "M 0.01915,0.00107H 0.98085C 0.98574,0.00107 0.99044,0.00300 0.99390,0.00642C 0.99736,0.00984 0.99930,0.01449 0.99930,0.01933V 0.88815C 0.99930,0.89299 0.99736,0.89763 0.99390,0.90105C 0.99044,0.90448 0.98574,0.90640 0.98085,0.90640H 0.64733C 0.63864,0.90640 0.63007,0.90834 0.62224,0.91206C 0.61442,0.91579 0.60754,0.92122 0.60212,0.92794L 0.56153,0.97830C 0.55635,0.98474 0.54976,0.98993 0.54227,0.99350C 0.53478,0.99707 0.52656,0.99892 0.51825,0.99892H 0.01915C 0.01426,0.99892 0.00956,0.99700 0.00610,0.99358C 0.00264,0.99016 0.00070,0.98551 0.00070,0.98067V 0.01933C 0.00070,0.01449 0.00264,0.00984 0.00610,0.00642C 0.00956,0.00300 0.01426,0.00107 0.01915,0.00107Z";
```


## 5 — From the paddock

`<section>` — `container-type: inline-size; position: relative; isolation: isolate; min-height: var(--block-h, 100lvh); width: 100%; overflow: hidden; background: var(--background); color: var(--foreground)`.
The 1440×800 frame at 1:1 in `cqw`. The stack, bottom up: the contour backdrop, the dark **band**
(`absolute inset-x-0 bottom-0; height: calc(11.7361cqw * var(--band-scale, 1)); background: var(--surface-black)`),
the portrait on a parallax layer (`absolute inset-0; z-index 10`), a gradient that melts the
portrait's foot into the band (`absolute inset-x-0 bottom-0; z-index 10; height: the band's;
background: linear-gradient(to bottom, rgb(9 10 11 / 0) 0%, var(--surface-black) var(--band-fade, 38.685%))`),
the chequered dissolve (`carry="dark"`, `z-index 30`, phone 0), then the intro, the two panels and
the calendar strip.

### The contour backdrop — the hero's field on a 2D canvas

`<canvas>` `absolute inset-0; pointer-events: none`, backing store `× min(devicePixelRatio, 2)`,
redrawn from the shared ticker at **24ms** while in view. Marching squares over a `96`-cell grid
(the long edge; the short edge keeps the cells square), the same field and constants as the
shader — verbatim:

```ts
const LINE_SCALE = 3.8, LINE_COUNT = 2.5, WAVE_AMOUNT = 0.37, WAVE_SPEED = 1.66, LINE_OPACITY = 0.85;
const CELLS = 96;
const field = (x, y, t) => {
  let f = Math.sin(x * 1.0 + t * 0.6) * 0.5;
  f += Math.sin(y * 0.85 - t * 0.45) * 0.45;
  f += Math.sin((x + y) * 0.65 + t * 0.35) * 0.35;
  f += Math.sin((x - y) * 0.95 - t * 0.55) * 0.25;
  return f * 0.5 + 0.5;
};
// draw(): t = (now - start) / 1000 * WAVE_SPEED
const cols = width >= height ? CELLS : Math.max(8, Math.round((CELLS * width) / height));
const rows = Math.max(8, Math.round((cols * height) / width));
const stepX = width / cols, stepY = height / rows, aspect = width / height;
const values = new Float32Array((cols + 1) * (rows + 1));
for (let j = 0; j <= rows; j += 1) for (let i = 0; i <= cols; i += 1) {
  const nx = ((i / cols) * 2 - 1) * aspect * LINE_SCALE;      // NDC, framed the way the hero frames it
  const ny = ((j / rows) * 2 - 1) * LINE_SCALE;
  const qx = nx + Math.sin(ny * 0.8 + t * 0.7) * WAVE_AMOUNT;
  const qy = ny + Math.cos(nx * 0.7 - t * 0.6) * WAVE_AMOUNT;
  values[j * (cols + 1) + i] = field(qx, qy, t) * LINE_COUNT;
}
context.strokeStyle = colour;   // --paddock-contour here; --footer-contour in the footer
context.lineWidth = 1; context.globalAlpha = LINE_OPACITY; context.beginPath();
for (let level = 0.5; level < LINE_COUNT; level += 1)          // halfway between integers, like the shader
  for (let j = 0; j < rows; j += 1) for (let i = 0; i < cols; i += 1) {
    const a = values[j * (cols + 1) + i], b = values[j * (cols + 1) + i + 1];
    const c = values[(j + 1) * (cols + 1) + i + 1], d = values[(j + 1) * (cols + 1) + i];
    const index = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
    if (index === 0 || index === 15) continue;
    const x0 = i * stepX, y0 = j * stepY;
    const top = [x0 + stepX * ((level - a) / (b - a)), y0];
    const right = [x0 + stepX, y0 + stepY * ((level - b) / (c - b))];
    const bottom = [x0 + stepX * ((level - d) / (c - d)), y0 + stepY];
    const left = [x0, y0 + stepY * ((level - a) / (d - a))];
    const segment = (p, q) => { context.moveTo(p[0], p[1]); context.lineTo(q[0], q[1]); };
    switch (index) {
      case 1: case 14: segment(left, bottom); break;
      case 2: case 13: segment(bottom, right); break;
      case 3: case 12: segment(left, right); break;
      case 4: case 11: segment(top, right); break;
      case 6: case 9:  segment(top, bottom); break;
      case 7: case 8:  segment(left, top); break;
      case 5:  segment(left, top); segment(bottom, right); break;    // the saddles
      case 10: segment(left, bottom); segment(top, right); break;
    }
  }
context.stroke(); context.globalAlpha = 1;
```

### The portrait

`paddock/portrait.webp` (1350×1165, alt "Kimi Antonelli in the paddock") —
`position: absolute; bottom: var(--fig-lift, 0px); left: var(--fig-x-override, 65.6917%); transform: translateX(-50%); height: min(calc(102.0363% * var(--fig-fit, 1)), var(--fig-cap, 100000px)); width: auto; aspect-ratio: 1.15881; object-fit: cover; user-select: none`
— sized off the block's **height** (816.29 in an 800 frame, hung 16 above the top so it bleeds off
both ends). Its layer is a scrub over the block's crossing (`"top bottom" → "bottom top"`) moving
`top` from `0cqw` to `−3.3333cqw` — **up only**, 48 design px.

### The intro (left rail)

- `<h2>` `position: absolute; z-index 20; left: var(--head-left, 2.2222cqw); top: var(--head-top, 2.2222cqw)`,
  Oswald 700 uppercase line-height 0.95, `color: var(--foreground)`, `font-size: max(max(6.6667cqw, var(--type-min)), var(--head-min, 0px))` —
  `from the` / `paddock`, word reveals at `index * 130`, the full stop in the **accent** at `130 + 110`.
- A column `position: absolute; z-index 20; left: var(--intro-left, 2.2222cqw); bottom: var(--intro-bottom, calc(11.7361cqw * var(--band-scale, 1) + 2.2222cqw)); width: max(23.4722cqw, var(--intro-min-w, 0px)); gap: var(--intro-gap, 2.7778cqw)` —
  what the design fixes is the 32 between this column's foot and the band. The report:
  `A composed drive through a difficult weekend secured another podium — and kept Kimi at the top of the championship.`
  word by word (`wordStagger 30`, `{150, 24}`, `column-gap 0.22em`, delay `2*130 + 90`), uppercase,
  line-height 1.1, `font-size: max(1.25cqw, var(--copy-min-size))` (white below `sm`, where it lands
  on the figure). Then the button, rising `{0, translateY(0.75rem)} → {1, 0}` at `2*130 + 260`.
- **The button** `read story` → `/stories/hungarian-gp`: `217×50`, chamfer 8, every length a ratio
  of its height `--cta-h` (`3.4722cqw`; `50px` between `sm` and `lg` and below `sm`), width
  `calc(--cta-h * 4.34)`. SVG `viewBox="0 0 217 50"`: the outline
  `M0.5 0.5H216.5V42L209 49.5H0.5Z` **filled `var(--surface-black)`** with `stroke: var(--accent)` 1
  non-scaling — a dark slab with cyan type on this light surface — and the accent flood
  (`scaleX(0) → 1` on hover, 250ms `--ease-plate`, `transform-origin: left`). Label
  `position: absolute; inset-y: 0; left: calc(h * 24/50); gap: calc(h * 32/50); font-size: calc(h * 20/50)`,
  uppercase, line-height 0.9, accent → black on hover; the arrow `M0 5.35H13M8 10.35L13 5.35L8 0.35`
  at `calc(h * 13.71/50) × calc(h * 10.71/50)`, stepping `translateX(0.25rem)` on hover.

### The two panels (right rail) — hidden below `sm`

Both are framed by **corner brackets** drawn as one path four ways (`M0 0.5H10V10.5`,
`viewBox 0 0 10.5 10.5`, `10` design px square, rotations `tl 270 · tr 0 · br 90 · bl 180`), each
corner offset outward by `--bracket-spread` (0 unless something sets it) and the bottom pair moved
alone by `--bracket-stretch`; both `left`/`top` transition over `700ms --ease-plate`. **These two
sets are stroked `var(--foreground)`** (black), not the accent. Their unit `U` is `calc(100cqw / 1440)`
(`1px` between `sm` and `lg`, where the panels are drawn at the hero's 1:1 size).

The text column is anchored to the **right gutter**: `columnWidth = 193U`,
`columnRight = calc(2.2222cqw + 12U)`, `columnLeft = calc(100% - columnRight - columnWidth)`;
the bracket frame runs `FRAME_RIGHT = calc(100% - 2.2222cqw)` to `FRAME_LEFT = FRAME_RIGHT - columnWidth - 25U`.

- **The meeting**: brackets from `y 32U` to `105U` (fading in at **320ms**); the column at
  `left: columnLeft; top: 43U; width: 193U; gap: 6U; font-size: 14U`, uppercase, line-height 0.9,
  rising at `410`: `hungarian gp` (bold), `silverstone`, `july 12, 2026`.
- **The stats**: brackets from `y 137U` to `535U` (at **460ms**); the column at
  `left: calc(100% - columnRight - 193U); top: 147U; width: 193U`. Four rows, each `58U` tall
  (`align-items: flex-end; gap: 24U`): the icon (`31U`, `paddock/icon-{flag,bars,trophy,gauge}.svg`),
  then a label (`12U`, uppercase, tracking `-0.48U`, `--foreground-muted`) over the figure (Oswald
  500, `38U`, line-height 0.72, tracking `-3.04U`) — `last result` / `P4`, `points gained` / `+12`,
  `championship` / `P1`, `points` / `118`. Between rows a 1px rule in `--foreground-muted`,
  `margin: 24U 0 23U`, drawing in from the left (`scaleX 0 → 1`) at `460 + row * 90`; each row
  rises at `+40` after its rule and its figure resolves letter by letter (`letterStagger 24`,
  `FIGURE {200, 24}`) at `+120`.

### The calendar strip (the band)

`position: absolute; inset-x-0 bottom-0; z-index 20; height: calc(11.7361cqw * var(--band-scale, 1))`.
Everything is measured **from the top of the band**; every x is spread about the block's middle by
`--cal-spread` (1 at the frame's own coordinates): `spread(x) = calc(50% + px(x - 720) * var(--cal-spread, 1))`.
The strip's entrance is gated on it entering view (`rootMargin 0% 0% -20% 0%`, once); everything
is `mode forward`.

- **Four dashed connectors** at `top: calc(px(131.5) + var(--cal-mark-drop, 0px))`, 1px tall:
  `{x 416, w 126}`, `{580, 128}`, `{743, 136}`, `{914, 124}`; each a
  `repeating-linear-gradient(to right, var(--foreground-on-dark-muted) 0 px(7), transparent px(7) px(11.45))`
  whose `background-position-x` runs `0 → ±px(11.45)` every **5200ms** linear, looping — the two left
  of the live round crawl **right**, the two right of it crawl **left**, toward the race being
  reported. Each scales in (`scaleX 0 → 1`, `transform-origin: left`) at `560 + index * 90`.
- **Five cards** at `left: calc(spread(x + w/2) - px(w/2)); top: calc(px(43) + var(--cal-card-drop, 0px)); width: var(--cal-card-w, px(w))`,
  centred column, uppercase, `gap: type(12)`; rising `{0, translateY(0.5rem)} → {1, 0}` at `560 + i * 90`:
  the round (`type(12)`, tracking `px(-0.24)`), the name (Oswald 700, line-height 0.95, white,
  `font-size: max(type(18), var(--copy-min-size))`, rising `{0, translateY(0.3em)} → {1, 0}` with
  `NAME {190, 24}` at `+110`), the date (`type(14)`, tracking `px(-0.28)`). Round and date are
  `--foreground-on-dark-muted`, **accent on the live round**.

  | round | name | date | x | width | marker |
  |---|---|---|---|---|---|
  | round 11 | austrian gp | 29 jun | 347 | 100 | `p6` |
  | round 12 | british gp | 12 jul | 511 | 100 | `p4` |
  | round 13 | belgian gp | 27 jul | 675 | 100 | **live** — filled accent dot |
  | round 14 | hungarian gp | 03 aug | 839 | 114 | ring |
  | round 15 | dutch gp | 31 aug | 1017 | 76 | ring |

- **Markers** on the connector run at `top: calc(px(126) + var(--cal-mark-drop, 0px))`, centred on
  each card, fading in at `560 + i * 90 + 60`: a result in Oswald 700 `type(12)` uppercase white, or
  an `11`-unit SVG — `r 5` white ring for rounds to come, `r 5.5` accent disc for the live one.
- **The live pulse**: on the live marker, a ring `r = 5.5 + v * 5.5 * 3.4`, `opacity = 0.5 (1 - v)²`,
  stroke accent 1 non-scaling, `v` 0→1 every **3200ms** ease-out quad, looping (hidden below `sm`).
- **The live bracket** (fading in at `560 + 5 * 90`, `pointer-events: none`): accent brackets from
  `spread(669)` to `spread(781)`, `y 32` to `113` from the band's top. **Hovering the live card opens
  them by 5 design px** (`--bracket-spread: px(5)` on the strip while the live card is hovered).

Below `sm` the strip becomes a three-column grid (`padding: 1.5rem 4%; gap 0.75rem/1.25rem`, a rule
above it in white at 15%) showing only the last three rounds, connectors, markers and bracket hidden.

### The narrow variables (tablet and phone)

Between `sm` and `lg` the section sets: `--type-min: 13px; --copy-min-size: 17px; --stats-row-min: 42px; --fig-cap: 118.75cqw; --fig-x-override: 65.7%; --cta-h: 50px; --band-scale: 1.75; --cal-spread: 1.75; --cal-mark-drop: 8cqw; --cal-card-drop: 1.3cqw; --panel-u: 1px; --stats-rule-top: 16px; --stats-rule-bottom: 11px; --stats-frame-drop: 0px; --stats-drop: 2.86cqw; --stats-col-w: 170px; --intro-min-w: 280px`
and the two panels **trade places** — the stats run down the left under the masthead
(`--stats-left: calc(2.2222cqw + 13px); --stats-frame-left: 2.2222cqw; --stats-frame-right: calc(2.2222cqw + 195px)`;
bracket stretch `calc(var(--panel-u) * -62)`), the meeting takes the top-right corner on the
masthead's cap line (`--meet-frame-left: calc(100% - 2.2222cqw - 131px); --meet-frame-right: calc(100% - 2.2222cqw); --meet-frame-top: 2.8646cqw; --meet-frame-bottom: calc(2.8646cqw + 73px); --meet-left: calc(100% - 2.2222cqw - 118px); --meet-top: calc(2.8646cqw + 11px)`),
and the live bracket takes `--bracket-drop: 1.7cqw; --bracket-stretch: 5.9cqw`.

Below `sm` the block is a **stack** that grows to fit (`PHONE` in the geometry): `--block-h: 1062px; --intro-bottom: 139px; --head-left/--intro-left/--meet-frame-left/--stats-frame-left: 24px; --head-top: 24px; --intro-min-w: 320px; --intro-gap: 24px; --band-fade: 60px; --cta-h: 50px; --panel-u: 1px; --meet-left: 37px; --meet-top: 121px; --meet-frame-top: 110px; --meet-frame-bottom: 183px; --meet-frame-right: 155px; --stats-left: 37px; --stats-frame-right: 369px; --stats-col-w: 320px; --stats-drop: 63px; --fig-cap: 599px; --fig-x-override: 48.5%; --fig-lift: 328px; --band-scale: 8.48; --cal-card-w: 100%; --head-min: 40px` — masthead, the meeting, the four figures two-up, Kimi standing in the strip, the report and its button, then the three-card strip. (The panels are hidden below `sm` in the shipped page; the variables are what the layout would use.)

The geometry module, verbatim:


```ts
// 📖 Docs: obsidian/frontend/components/sections.md

/**
 * The block's measurements, in the design's own pixels.
 *
 * A plain module, like the timeline's: these numbers are read by the Server
 * Component that lays the block out *and* by the client components that animate
 * it, and a value cannot cross a `"use client"` boundary — import a number from
 * a client module into a server one and what arrives is a client reference, not
 * the number.
 */

/** The frame this block was drawn in. */
export const FRAME = { width: 1440, height: 800 } as const;

/**
 * One design pixel, as a share of the block's own width — the same unit the
 * timeline uses, and for the same reason: the project scales the root font in
 * bands, each expecting a design authored at that band's base, and this frame
 * is 1440 only. `cqw` makes the block the Figma frame at every viewport.
 */
export const px = (value: number) =>
  `${((value / FRAME.width) * 100).toFixed(4)}cqw`;

/**
 * A design pixel for **type**, with a floor.
 *
 * The same `px()` until the block gets small enough that its smallest labels
 * stop being letters. A **floor**, not a multiplier: anything already above
 * it keeps its exact share of the frame, so the block still reads as the 1440
 * composition scaled and only the type that had fallen under a dozen pixels
 * is lifted. The floor itself is 0 unless a section sets `--type-min`, which
 * they do below `lg` and nowhere else.
 */
export const type = (value: number) =>
  `max(${px(value)}, var(--type-min, 0px))`;
/** The gutter the whole page shares. */
export const GUTTER = 32;

/**
 * The portrait, as a share of the block's **height** rather than its width.
 *
 * The design draws it 816.29 tall in an 800 frame — 102% — and hangs it 16
 * above the top so it bleeds off both ends. Sized off the height, it keeps
 * doing exactly that however tall the screen is, instead of stranding the head
 * halfway up a taller block.
 */
export const PORTRAIT = {
  heightShare: 816.29 / 800,
  aspect: 945.92 / 816.29,
  /** Its centre, as a share of the frame's width — dead centre, as drawn. */
  centre: (247 + 945.92 / 2) / 1440,
} as const;

/**
 * How far the portrait drifts up as the block crosses the viewport, in design
 * pixels.
 *
 * **Up only, and that is measured rather than chosen.** The figure is sized to
 * fill the block: its foot lands on the block's bottom edge exactly and its
 * crown clears the top by about 14 real pixels. Drifting *down* spends that 14
 * and then opens a strip of bare backdrop above the head; drifting up only
 * lifts the foot further into the dark band, which is solid black and is where
 * the figure fades out anyway. So the design position is where the figure
 * arrives and the travel is all in the other direction — unlike the timeline's
 * rows, which are centred on theirs because they have room either side.
 */
export const PARALLAX_PORTRAIT = 48;

/** The dark band the calendar sits on, and where the portrait melts into it. */
export const BAND = { top: 631, height: 169, fade: 38.685 } as const;

/**
 * The intro column: copy, then the call to action.
 *
 * `fromBand` rather than `y`: the block runs the full height of the screen, so
 * the design's 436 from the top only holds at its own 800. What the design
 * actually fixes is the 32 between this column's foot and the top of the dark
 * band, and that is what travels.
 */
export const INTRO = { x: 32, width: 338, gap: 40, fromBand: 32 } as const;
export const CTA = { width: 217, height: 50, cut: 8, padX: 24, gap: 32 } as const;

/** Both right-hand panels, and the bracket that frames them. */
export const PANEL = { x: 1190, width: 218, inset: 13 } as const;
export const MEET = { y: 32, height: 73, textY: 43, width: 193 } as const;

/**
 * What the stats panel leaves above itself.
 *
 * Taken from the **hero**, which stacks the same two panels: `Frame 46` there
 * runs its next-race group 0 to 192 and its season-stats group from 224, so
 * the gap is 32. This block's own frame leaves 96, which reads as two
 * unrelated panels rather than one instrument stack — and on a 1280x800
 * screen, where the block is a full viewport tall, the second one had drifted
 * most of the way down the column.
 */
export const PANEL_GAP = 32;

export const STATS = {
  y: MEET.y + MEET.height + PANEL_GAP,
  height: 398,
  textY: MEET.y + MEET.height + PANEL_GAP + 10,
  width: 193,
  row: 58,
  pitch: 106,
  icon: 31,
  labelGap: 55,
} as const;
/**
 * How far the stats panel drops below `lg`.
 *
 * The meet panel's 73 is the height of three lines of unboosted 14. Boosted
 * back to a readable size those three lines are half as tall again, and they
 * ran straight into "last result" underneath. This is that difference, in the
 * frame's own pixels. From `lg` it is 0 and the frame's coordinates stand.
 */
export const STATS_DROP = 96;

export const BRACKET = 10;

/**
 * A ceiling on the portrait between `sm` and `lg`, as a share of the block's
 * width.
 *
 * The figure is sized off the block's **height** so it bleeds off both ends
 * however tall the screen is — right at 1.8:1, ruinous at 0.75:1. At 768x1024
 * that came to 1211 wide in a 768 frame: the head filled the block and the
 * copy was left standing on the middle of the face. The ceiling is the tallest
 * the figure can be and still start below the stats column — 722 at 768, so
 * its head comes in just under "points" and its foot stands in the band, the
 * relationship the frame has. Above `lg` it never binds: the block is wider
 * than it is tall there and the frame's own sizing is already smaller.
 */
export const FIG_CAP_NARROW = "118.75cqw";

/**
 * The call to action's height between `sm` and `lg`.
 *
 * **The frame's own 50, unscaled** — the same button the hero carries at this
 * width, which keeps its full size there rather than shrinking with the
 * block. Scaled with the block it was 116x27 with a 13 label, half the size
 * of the identical control one screen above it. Every other length in the
 * button is a ratio of this, so the chamfer and the arrow keep their shape.
 */
export const CTA_H_NARROW = "50px";

/**
 * How far apart the calendar's five rounds are spread between `sm` and `lg`.
 *
 * They sit across the middle 46% of the frame — x 347 to 1055 — which is 350
 * real pixels at 768, and their names, lifted to the site's narrow 17, want
 * 111 each. Spread by 1.75 the row takes 88% of the block and the pitch is
 * 153, which the names clear. **Positions only**: every size in the strip
 * still comes from the same floors the rest of the page uses, which is what
 * a scale on the whole strip could not do — it multiplied the type too and
 * left the round labels at 11 where everything else on the site is 13.
 */
export const CAL_SPREAD_NARROW = 1.75;

/**
 * How far the markers and their connectors drop below the cards, and how much
 * taller the band is to hold them, between `sm` and `lg`.
 *
 * The card is three lines and two gaps: at the frame's own sizes 58 tall, at
 * the floors 65 — past the 67 the frame leaves before the marker run, so the
 * dots landed on the dates, and then on the live round's frame, which wraps
 * the card and reaches lower still. The drop clears both. Both are shares of the width, so the strip keeps
 * its proportions at every width in the band.
 */
export const CAL_MARK_DROP_NARROW = "8cqw";
export const CAL_CARD_DROP_NARROW = "1.3cqw";
export const BAND_SCALE_NARROW = 1.75;

/**
 * One design pixel for the two right-hand panels, between `sm` and `lg`:
 * **a real one**, so they are drawn at the size the hero draws the same pair
 * at rather than scaled down with the block. Figures 38, labels 12, the
 * meeting 14 — and, because every length in them goes through this, the rows,
 * the rules, the icons and the brackets follow without a floor anywhere.
 */
export const PANEL_U_NARROW = "1px";

/**
 * What the rules between stats rows take, top and bottom, between `sm` and
 * `lg` — 8 against the frame's 24 and 23.
 *
 * The type does not move: the rows, the figures and the labels are the hero's
 * own sizes. What changes is how much air stands between them, and it has to:
 * the frame gives the column half of an 800-tall block, and at 1:1 in a
 * 1024-tall one the same 398 sat over the figure's head. Closing the rules
 * lifts the column's foot by 96, which is 96 more of the block for the
 * figure, whose ceiling is exactly where this column ends.
 */
/**
 * What a rule between stats rows takes above and below itself, between `sm`
 * and `lg` — **10 and 6**, not the same number twice.
 *
 * Sixteen and eleven, not eight and eight: even margins do not read as even
 * here, because the two things they separate
 * are not the same shape: the figure above sits in a cap-height box that ends
 * on its own baseline, while the label below carries the leading of a 12
 * line. Eight either side measured equal and looked 9 above against 13 below.
 * The pair sums to the same 17, so the column's height is unchanged.
 */
export const STATS_RULE_TOP_NARROW = "16px";
export const STATS_RULE_BOTTOM_NARROW = "11px";

/**
 * The stats frame's own offset from the column it marks, between `sm` and
 * `lg`, for the same reason: 13 of air above the first label against 10 below
 * the last figure. Two pixels of drop splits the difference.
 */
export const STATS_FRAME_DROP_NARROW = "0px";


/**
 * The stats column's width between `sm` and `lg`. Narrower than the frame's
 * own 193: down the left it has to stay clear of the figure, whose hair comes
 * to 227 at its widest, and 170 still leaves 115 for a label that needs 88.
 */
export const STATS_COL_W_NARROW = "170px";

/**
 * The phone's own set. The block stops being a composition with a figure in
 * it and becomes a **stack**: masthead, the meeting, the four figures two-up,
 * then Kimi, then the report and its button, then the strip. Nothing overlaps
 * anything, which at 390 is the only arrangement that reads — laid out as the
 * tablet's, the face covered every word on the block.
 *
 * The block grows to fit that stack rather than holding a screen: a phone
 * scrolls, and 844 could not hold it without putting type back on the
 * portrait.
 */
export const PHONE = {
  blockH: "1062px",
  /** The report sits above the figure, not beside it: masthead, copy, Kimi. */
  introBottom: "139px",
  gutter: "24px",
  headTop: "24px",
  /** The meeting, under the masthead. */
  meetFrameTop: "110px",
  meetFrameBottom: "183px",
  meetTop: "121px",
  meetFrameRight: "155px",
  /** The four figures, two-up, under it. */
  statsW: "320px",
  statsFrameRight: "369px",
  /** `+63` on the frame's own 147, which puts the first label at 210. */
  statsDrop: "63px",
  /** Two rows instead of four: the frame closes 245 higher. */
  statsStretch: "calc(var(--panel-u) * -245)",
  /** Kimi between the figures and the report. */
  figCap: "599px",
  /** **Standing in the strip**, as the frame has him — not floating above it. */
  figLift: "328px",
  /** The strip holds the cards three-up, so the band is deeper. */
  bandScale: 8.48,
} as const;

/**
 * The two right-hand panels **trade places** between `sm` and `lg`.
 *
 * The frame stacks them in one corner, which is where a 1440 block has the
 * room. Here that corner is also the page's own menu badge, and the stats at
 * the hero's own sizes are the taller of the two by far — so the column of
 * four runs down the left under the masthead, where the block has a whole
 * empty side, and the meeting takes the corner, where three short lines fit
 * beside the badge.
 *
 * `MASTHEAD_FOOT` is 32 above the type plus the 182 its two lines run to;
 * `MASTHEAD_CAP` is where those letters actually start, which is what the
 * corner panel is levelled with. Both are shares of the width, so the pair
 * travels with the masthead.
 */
const MASTHEAD_FOOT = `${((214 / 1440) * 100).toFixed(4)}cqw`;
const MASTHEAD_CAP = `${((22 / 768) * 100).toFixed(4)}cqw`;
const GUTTER_W = `${((32 / 1440) * 100).toFixed(4)}cqw`;
/**
 * The corner panel sits on the block's own right gutter, like everything else
 * down that edge. It briefly stood 51 inside it to clear the page's menu
 * badge, which floats from 704 to 744 — the badge does cross the frame's
 * top-right corner while it is showing.
 */
const BADGE_INSET = "0px";
/** The frame closes on the type: the longest of the three lines is 98. */
const MEET_FRAME_W = 131;

/** The stats column: down the left, 45 under the masthead's foot. */
export const STATS_LEFT_NARROW = `calc(${GUTTER_W} + 13px)`;
export const STATS_FRAME_LEFT_NARROW = GUTTER_W;
export const STATS_FRAME_RIGHT_NARROW = `calc(${GUTTER_W} + 195px)`;

/** The meeting: the corner the stats have left, on the masthead's cap line. */
export const MEET_LEFT_NARROW = `calc(100% - ${GUTTER_W} - ${BADGE_INSET} - ${
  MEET_FRAME_W - 13
}px)`;
export const MEET_TOP_NARROW = `calc(${MASTHEAD_CAP} + 11px)`;
export const MEET_FRAME_LEFT_NARROW = `calc(100% - ${GUTTER_W} - ${BADGE_INSET} - ${MEET_FRAME_W}px)`;
export const MEET_FRAME_RIGHT_NARROW = `calc(100% - ${GUTTER_W} - ${BADGE_INSET})`;
export const MEET_FRAME_TOP_NARROW = MASTHEAD_CAP;
export const MEET_FRAME_BOTTOM_NARROW = `calc(${MASTHEAD_CAP} + 73px)`;

/**
 * Where the figure's middle sits between `sm` and `lg`, as a share of the
 * block — a little right of the frame's own centre.
 *
 * Grown to fill the block below the stats column, the figure's cheek came
 * down on the last line of the copy beside it, and the copy has since been
 * widened twice — the number is whatever keeps its silhouette clear of the
 * column's right edge at the height the copy sits. Nothing above it changes: the
 * column it used to have to clear ends 9 above the top of its head, so the
 * figure is free to move sideways.
 */
export const FIG_X_NARROW = "65.7%";

/**
 * The calendar strip, measured **from the top of the dark band** rather than
 * from the top of the frame. The block runs the full height of the screen, so
 * the design's absolute 674 only holds at its own 800; what it really fixes is
 * where the cards sit inside the band, and the band is anchored to the foot.
 */
export const CALENDAR = {
  /** 674 in the frame, 631 down to the band. */
  y: 43,
  /** 757 in the frame. */
  markY: 126,
  dot: 11,
  /**
   * The connectors between markers: absolute x in the frame, y 762.
   *
   * Read off the rendered frame, **not** off Figma's metadata. The lines carry
   * a 180-degree rotation, so the metadata reports each one's x at its *end* —
   * 542, 708, 879, 1038 — and taking those as starts shifted every connector a
   * whole position right: the first began under P4 instead of after P6, and the
   * last stopped short of the final ring. Sampling the render's own pixels put
   * them at 416, 580, 743 and 914, each sitting ~18 clear of the markers it
   * joins.
   */
  linkY: 131.5,
  links: [
    { x: 416, width: 126 },
    { x: 580, width: 128 },
    { x: 743, width: 136 },
    { x: 914, width: 124 },
  ],
  /**
   * And they are **dashed**, not solid. Counted off the render: 12 runs across
   * the 126-wide first connector, so a 11.45 period — 7 on, 4.45 off.
   */
  linkDash: 7,
  linkGap: 4.45,
  /** The bracket that frames the live round, 663 and 744 in the frame. */
  /**
   * The frame around the live round, measured from the band's top. Figma's
   * rendered corners are 669/781 across and 663/744 down the page; the band
   * starts at 631, so 32 and 113 here. The metadata's own 679 and 744 are the
   * pre-transform boxes — see `PaddockBracket`.
   */
  live: { left: 669, right: 781, top: 32, bottom: 113 },
} as const;

/**
 * The corner bracket, as the design draws it: a right angle 10 across, opening
 * down-right. Every one of the eight in this block is this path rotated, which
 * is why it is a path and not eight exported files.
 */
export const BRACKET_PATH = "M0 0.5H10V10.5";

/** The call to action's outline — chamfered bottom-right, like the plates. */
export const CTA_PATH = `M0.5 0.5H${CTA.width - 0.5}V${CTA.height - CTA.cut}L${
  CTA.width - CTA.cut
} ${CTA.height - 0.5}H0.5Z`;

/** The arrow at its end. */
export const ARROW_PATH = "M0 5.35H13M8 10.35L13 5.35L8 0.35";
```


## 6 — Keep pushing forward (the footer)

`<section>` — `container-type: inline-size; position: relative; isolation: isolate; min-height: var(--foot-h, 100lvh); width: 100%; overflow: hidden; background: var(--accent)`.
A cyan page edge with a near-black panel inset **16** (`1.1111cqw`) on every side:
`position: absolute; inset: 1.1111cqw; overflow: hidden; background: var(--surface-black); color: var(--foreground-on-dark)`,
holding the same **contour backdrop** as the paddock, in `--footer-contour` (white at 10%). No
chequered seam into this block — the accent edge already draws the join.

The figure sits **on the section, not in the panel** (it hangs 9.8 past the foot to cover the accent
edge): a group `absolute inset-0; z-index 10; transform-origin: bottom; scale: var(--fig-scale, 1); translate: var(--fig-shift, 0)`,
hidden below `sm`. Inside it a parallax layer whose window **ends at `bottom bottom`**
(`"top bottom" → "bottom bottom"`, the moment the page is scrolled to its end) moving `top` from
`px(60)` to `0cqw` — the figure rides *back into place* and the resting frame is exact. Two plates,
both sized off the block's **height**, moving as one:

- `footer/body.webp` (1536×1024, suit behind) — `position: absolute; z-index 10; left: 50%; bottom: -1.225%; height: 96.078%; aspect-ratio: 1.15902; transform: translateX(-50%); object-fit: cover`,
  **masked to the suit**: `mask-image: linear-gradient(to bottom, transparent 69%, black 72%)` — the
  export carries the driver's own head and helmet, which must stay hidden behind the plate in front.
- `footer/helmet.webp` (1536×1024, alt "Kimi Antonelli's helmet") — `left: 50%; top: 1.25%; height: 83.364%; aspect-ratio: 1.5; transform: translateX(-50%)`.

The copy sits on the section too (frame-relative coordinates). `G = var(--foot-gutter, 2.2222cqw)`:

- **Logo** — `absolute z-20; left: G; top: G; width: var(--logo-w, 7.3611cqw); height: var(--logo-h, 1.6667cqw); background: var(--accent); mask-image: url(footer/logo-mask.png); mask-size: 100% 100%`
  (the design's own artwork as a mask filled with the accent), `role="img" aria-label="GRID01 Racing Systems"`, fading in at `120`.
- **Masthead** — `<h2>` `absolute z-20; top: var(--foot-head-top, G); right: var(--foot-head-right, G); width: max(25.6944cqw, var(--head-w-min, 0px)); font-size: max(3.8194cqw, var(--foot-head-min, 0px))`,
  Oswald 700 uppercase line-height 0.95, **accent**, right-aligned column (`align-items: flex-end`):
  `keep pushing` / `forward`, word reveals at `index * 130`, the full stop in **white** at `130 + 110`. Hidden below `sm`.
- **Nav** — `absolute z-20; left: 0; margin-left: G; top: var(--nav-mid, 50%); transform: translateY(-50%); width: var(--nav-w, 10.9722cqw); gap: var(--nav-gap, type(12)); font-size: var(--nav-size, type(36))`,
  Oswald 700 uppercase line-height 0.95 white, each link `display: block; width: max-content; height: var(--nav-row, type(34))`,
  hover accent — `driver` / `season` / `journal` / `next race` / `store` (→ `/driver` … `/store`),
  each resolving **letter by letter** (`letterStagger 22`, `ROW {170, 24}`, `column-gap 0.2em`,
  nowrap) at `260 + index * 80`. Below `sm` each is a full-width row with a 15%-white rule under it
  and an accent arrow at its end.
- **The foot row** — all three end **32 above the foot** (`bottom: max(2.2222cqw, var(--foot-bottom-min, 0px))`), rising `{0, translateY(0.75rem)} → {1, 0}` at `640`, `720`, `800`:
  the copyright `© 2026 GRID01 Racing Systems. All rights reserved.` (`left: G; width: max(type(220), var(--foot-copy-min, 0px)); font-size: type(14)`, uppercase, line-height 1.1, `--foreground-on-dark-faint`);
  the button `legal documents` → `/legal` at `left: var(--cta-left, 40.4861cqw)` — `275×50`, chamfer 8.835, **hollow** (`M0.5 0.5H274.5V41.165L266.165 49.5H0.5Z`, `fill none; stroke: var(--accent)` 1 non-scaling, `preserveAspectRatio="none"`), the accent flood on hover, label `left: h * 24/50; gap: h * 32/50; font-size: h * 20/50` accent → black, the same arrow; and the socials
  (`right: var(--social-right, G); width: max(type(206), var(--social-min-w, 0px)); font-size: type(14)`, `justify-content: space-between`, uppercase, white, hover accent): `inst` / `x` / `youtube`.

Narrow variables — below `lg`: `--type-min: 13px; --foot-bottom-min: 5cqw; --head-min: 6.6667cqw; --head-w-min: 44cqw; --foot-head-min: 6.6667cqw`; between `sm` and `lg`: `--foot-h: 104cqw; --fig-scale: 0.87; --fig-shift: 3%; --logo-w: 106px; --logo-h: 24px; --nav-size: 36px; --nav-gap: 12px; --nav-row: 34px; --cta-left: 50%; --cta-shift: -50%; --foot-copy-min: 200px; --cta-h: 50px`; below `sm`: `--foot-gutter: 24px; --foot-h: 680px; --nav-mid: 282px; --cta-bottom: 73px; --social-bottom: 151px; --social-left: 24px; --social-right: auto; --social-min-w: auto; --logo-w: 106px; --logo-h: 24px; --nav-size: 30px; --nav-gap: 18px; --nav-row: auto; --nav-w: calc(100cqw - 48px); --cta-left: 24px; --cta-w: calc(100cqw - 48px); --foot-head-left: 24px; --foot-head-right: auto; --foot-head-top: 78px; --cta-h: 50px; --foot-copy-min: 212px; --foot-head-min: 40px; --head-w-min: 240px`.

The geometry, verbatim:


```ts
// 📖 Docs: obsidian/frontend/components/sections.md

/**
 * The footer's measurements, in the design's own pixels.
 *
 * A plain module, like the other blocks': these are read by the Server
 * Component that lays the block out *and* by the client components that
 * animate it, and a value cannot cross a `"use client"` boundary.
 */

export const FRAME = { width: 1440, height: 800 } as const;

/** One design pixel, as a share of the block's width — see `paddock/geometry`. */
export const px = (value: number) =>
  `${((value / FRAME.width) * 100).toFixed(4)}cqw`;


/**
 * A design pixel for **type**, with a floor.
 *
 * The same `px()` until the block gets small enough that its smallest labels
 * stop being letters. A **floor**, not a multiplier: anything already above
 * it keeps its exact share of the frame, so the block still reads as the 1440
 * composition scaled and only the type that had fallen under a dozen pixels
 * is lifted. The floor itself is 0 unless a section sets `--type-min`, which
 * they do below `lg` and nowhere else.
 */
export const type = (value: number) =>
  `max(${px(value)}, var(--type-min, 0px))`;

/**
 * The block's masthead, with a floor of its own.
 *
 * The four blocks do not set their mastheads at one size — the frame gives
 * the paddock 96 and the other three 55 — and scaled down that spread reads
 * as three different type systems rather than one: at 768 it is 51.2 against
 * 29.3. The floor closes the gap from below, so every masthead lands on the
 * paddock's size where the block is narrow and each keeps the frame's own
 * number where it is not.
 */
export const masthead = (value: number) =>
  `max(${px(value)}, var(--head-min, 0px))`;
/** The cyan page edge, and the panel it frames. */
export const EDGE = 16;
export const GUTTER = 32;

/**
 * The helmet: two plates, the suit behind and the helmet in front, both from
 * the design's `Group 383`. Sized off the block's **height** so the figure
 * keeps filling the panel however tall the screen is.
 */
export const FIGURE = {
  helmet: { heightShare: 666.914 / 800, aspect: 1000.371 / 666.914, centre: 720 / 1440, top: 10 / 800 },
  /**
   * The suit runs to 809.8 in an 800 frame — it hangs **past the bottom** and
   * so covers the accent edge there. That is why the figure is not inside the
   * panel: clipped to it, the edge showed as a cyan strip along the foot that
   * the design does not have.
   */
  body: {
    heightShare: 768.623 / 800,
    aspect: 890.854 / 768.623,
    centre: 720 / 1440,
    bottom: -9.8 / 800,
    /**
     * Only the **suit** of this plate is shown — everything above the collar
     * is masked off, fading in between these two shares of the plate's height.
     *
     * The export is a full portrait: the driver's head, his hair, and his own
     * helmet held beside it, all of it meant to sit *behind* the helmet plate.
     * But the two plates are not to one scale — the suit is sized 0.75 frame
     * px per image px, the helmet 0.65 — so the portrait's head is drawn a
     * seventh larger than the helmet that is supposed to hide it, and its
     * right edge, the visor tab and a curl of hair all showed past the
     * helmet's cheek as a second helmet behind the first (2026-09-08).
     *
     * A mask rather than a rescale: the suit's size and place are the
     * design's, and the helmet already covers the collar down to 0.72 of the
     * plate at its narrowest, so the fade lands entirely under it and the
     * join is never seen. `from` is the neck, `to` the collar's top edge —
     * measured against the helmet's alpha, not eyeballed.
     */
    suitFrom: 0.69,
    suitTo: 0.72,
  },
} as const;

/**
 * How far the figure is displaced when the footer first appears, in design
 * pixels — it rides *back into place* as the page is scrolled to the bottom.
 *
 * The footer is the last block, so it never finishes a crossing: its bottom
 * cannot leave the top of the viewport. A travel hung off the usual
 * `top bottom` → `bottom top` window would therefore stop part-way and leave
 * the figure permanently displaced in the state everyone ends the page on. The
 * window here closes at `bottom bottom` instead — the moment the page is
 * scrolled to its end — and the figure's `to` is its design position, so where
 * a reader comes to rest is exactly the frame.
 *
 * The displacement is **downward** for the same reason the pair is not clipped
 * to the panel: the suit hangs 8 past the foot to cover the accent edge, and
 * lifting the figure by more than that would show the cyan strip along the
 * bottom that the design does not have. Down is free — the section clips it.
 *
 * The helmet and the suit move as **one group**, not as two layers. They are a
 * single figure resting on its own collar; separating them by even a few
 * pixels takes the head off the shoulders, which is the same failure noted on
 * `FIGURE` above for scaling them apart.
 */
export const PARALLAX_FIGURE = 60;

/** The masthead, hard against the right gutter. */
export const HEADLINE = { y: 32, width: 370 } as const;

/** The logo, top left. */
export const LOGO = { x: 32, y: 32, width: 106, height: 24 } as const;

/** The nav column, centred on the block's own middle. */
export const NAV = { x: 32, width: 158, gap: 12, size: 36, row: 34 } as const;

/**
 * The foot: copyright, the call to action, the socials.
 *
 * All three are measured **from the bottom**, not from the top, and that is
 * the whole point of this block's odd numbers. In the design's 800-tall frame
 * they sit at y 734, 718 and 755 with heights 34, 50 and 13 — every one of
 * them ends at 768, a flat 32 above the foot, the same 32 the logo and the
 * masthead keep from the top. The block is `min-h-lvh` rather than 800 tall,
 * so anchoring them by their design `y` left them floating: on a 900-tall
 * screen the row sat 166 above the bottom while the top row kept its 32.
 */
export const FOOT = {
  /** Every item in the row clears the foot by this, as the design has it. */
  bottom: 32,
  copyWidth: 220,
  socialX: 1202,
  socialWidth: 206,
} as const;

export const CTA = {
  x: 583,
  width: 275,
  height: 50,
  cut: 8.835,
  padX: 24,
  gap: 32,
} as const;

/** The call to action's outline — chamfered bottom-right, like the plates. */
export const CTA_PATH = `M0.5 0.5H${CTA.width - 0.5}V${CTA.height - CTA.cut}L${
  CTA.width - CTA.cut
} ${CTA.height - 0.5}H0.5Z`;

/** The arrow at its end — the same one the paddock's button carries. */
export const ARROW_PATH = "M0 5.35H13M8 10.35L13 5.35L8 0.35";
```


## Responsive rules, in one place

| width | hero | season | timeline | paddock | footer |
|---|---|---|---|---|---|
| ≥ 1921 | root scales up, overlay layout | cover fit | 1440 frame in `cqw` | 1440 frame in `cqw` | 1440 frame in `cqw` |
| 1441–1920 | root 1920-based, type ×1920/1440 | same | — | — | — |
| 1280–1440 | overlay layout, root 1440-based | cover fit | — | — | — |
| 1024–1279 | root 16px, stacked, name at `--type-display-lg`, subject stepped right 0.25 world units | cover fit | rail from the first photograph, marker 20, masthead centred one line | panels at 1:1 (`--panel-u: 1px`), calendar spread ×1.75 | figure ×0.87 |
| 640–1023 | figure takes the bottom 70%, rails opposite the identity, `bgRevealOpacity 0` | trace fitted to the width, floors on | floors on | panels trade places | — |
| < 640 | rails hidden, figure 64%, trailer/socials hidden, sweep radius 0.95 | `--season-h 680px`, dissolve behind the copy | column, plates 82% alternating, rail hidden | phone stack, 1062px tall, three-card grid | 680px, list, no figure |

Touch (`hover: none`): the cursor reveal is driven by the idle sweep (`autoSweepAmount 0.76`); the
mobile tier (width < 768, or coarse pointer under 1024) has **no reveal after the burn** and no
wireframe. `prefers-reduced-motion`: the scene plays its entrance and freezes; the map's pointer
light and the plate dims are off.

## Accessibility

One `<h1>` (the driver's name); every block a `<section>` with an `<h2>`; the masthead a `<header>`
with `<nav aria-label="Primary">`; the veil `role="status"`. Every text reveal keeps a
visually-hidden plain copy and hides its animated spans from assistive technology. Decorative
images `alt=""` and `aria-hidden`; the canvases `aria-hidden`. The menu sheet is a
`role="dialog" aria-modal="true"` with focus moved to its close button and `Escape` to close. The
next-race date is a `<time datetime="2026-07-27">`.

## Fixed parameters (bake these in)

Everything numeric appears inline above or in the quoted modules. The ones that live in the React
wrappers rather than in a quoted module: hero entrance delays `nav 0 · identity 180 · panels 900 · actions 1500`
with `REVEAL {90, 26}` from `{opacity 0, translateY(1.25rem)}`; veil `CLEAR_MS 430 · PAUSE_MS 240 · LIFT_TIMEOUT_MS 3000`;
scene gate `COVERED_AFTER 1.15`; sheet stagger `120 + i * 55`; timeline `YEAR_RESTING 0.4 · YEAR_HOLD 2200`;
calendar `CARD_DELAY 560 · CARD_STAGGER 90 · PULSE_MS 3200 · PULSE_REACH 3.4 · CRAWL_MS 5200 · BRACKET_SPREAD 5`;
paddock panels `MEET_DELAY 320 · STATS_DELAY 460 · ROW_STAGGER 90`; footer `NAV_DELAY 260 · NAV_STAGGER 80 · FOOT_DELAY 640`;
season plate `PLATE_DELAY 260 · TYPE_DELAY 430 · ROW_STAGGER 110 · LETTER_STAGGER 22`; globe `SPIN_MS 10000`;
map `DRIFT_MS 7000 · PING_MS 4200 · PING_REACH 86 · GRID_OVERRUN 4000`; stack `RECEDE_SCALE 0.9 · RECEDE_SHADE 0.55`.

## Assets

All fetched from `https://storage.getlayers.ai/assets/kimi-04a9449ab2/`. Set that as one
`ASSET_BASE_URL` constant and build every path from it. Every image and texture read by WebGL or a
canvas is cross-origin — load textures through three's loaders (which request anonymously) and put
`crossorigin="anonymous"` on any `<img>` you draw from.

| file | size | used by |
|---|---|---|
| `hero/scene/helmet3.glb` | 801 KB | the helmet — **Draco-compressed, needs `DRACOLoader`**; carries its own baked base colour / normal / metallic-roughness (WebP) |
| `hero/scene/studio-light.hdr` | 387 KB | the environment — load with **`RGBELoader`**, prefilter with `PMREMGenerator` |
| `hero/scene/noise.webp` | 84 KB | the shared reveal/burn noise (repeat-wrapped), read by the helmet mask and the backdrop |
| `hero/scene/person-diffuse.webp` | 178 KB | the portrait, 2048², sRGB |
| `hero/scene/person-depth.webp` | 5 KB | the portrait's depth map (parallax) |
| `hero/scene/person-alpha.webp` | 26 KB | the portrait's cut-out |
| `hero/scene/person-normal.webp` | 9 KB | the portrait's normals (relight) |
| `hero/ui/grido1-logo.webp` | 17 KB | the masthead logo, 424×97 |
| `hero/ui/flag-italy.webp` · `icon-rookie.svg` · `mercedes-logo.webp` | 0.2 · 2.3 · 3.5 KB | the three meta-row marks |
| `hero/ui/circuit-spa.webp` | 13 KB | the next-race circuit, 312×199 |
| `hero/ui/play-button.svg` | 0.8 KB | the trailer cue |
| `hero/ui/cta-frame.svg` · `arrow-right.svg` | 1 · 0.3 KB | the exported CTA frame and arrow (the paths above are lifted from them; the files are the reference) |
| `hero/ui/helmet-mask.png` | 18 KB | the loading veil's helmet silhouette, 434×512 |
| `hero/ui/backdrop-lines.svg` | 7 KB | the static contour backdrop, 1440×801 — the no-WebGL fallback behind the hero |
| `paddock/portrait.webp` | 177 KB | the paddock figure, 1350×1165 |
| `paddock/icon-flag.svg` · `icon-bars.svg` · `icon-trophy.svg` · `icon-gauge.svg` | 2.7 · 0.9 · 3.8 · 0.8 KB | the four stat rows |
| `timeline/2012.webp` … `2026.webp` (2012, 2015, 2019, 2021, 2024, 2025, 2026) | 64–150 KB each | the seven plates, 1420×1016 |
| `footer/body.webp` | 144 KB | the suit plate, 1536×1024 |
| `footer/helmet.webp` | 91 KB | the helmet plate, 1536×1024 |
| `footer/logo-mask.png` | 11 KB | the footer wordmark mask, 212×48 |

The DRACO decoder comes from the three.js CDN, **not** from this bucket:
`dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.185.0/examples/jsm/libs/draco/gltf/")`.

**A failed asset load must be visible.** Wrap the scene's load (`Promise.all` of the HDR, the four
maps, the GLB and the noise) and every image in a `catch` that puts a banner on the page naming the
URL that failed. This page has three things that would otherwise fail silently: a model that never
decodes leaves the veil up forever at 70%, a portrait map that never arrives leaves an empty stage
behind a finished masthead, and a photograph that never arrives leaves a plate with only its outline.
If WebGL is unavailable, draw `backdrop-lines.svg` behind the hero and `person-diffuse.webp` in the
subject's box instead of the scene, and let the veil lift immediately.