# KIMI — GRIDO1 Racing Systems / Kimi Antonelli

A one-page driver site, built from the spec in [`PROMPT.md`](PROMPT.md).

**`index.html` is the deliverable** — one self-contained file. three.js and Lenis load from jsDelivr through an import map; everything else (spring solver, ticker, scroll triggers, text reveals, sticky stack, circuit trace, halftone, chequered dissolves, contour fields, loader) is in the file. Open it from any static host (GitHub Pages works as-is).

## Editing

The file is generated. Edit `src/` and rebuild:

```sh
npm install
npm run build        # → index.html (CDN import map, live asset bucket)
npm run build:local  # → dist/local.html (three/lenis from /vendor, assets from /assets) for offline testing
```

The spec's verbatim modules live in `src/` as they were given (`hero/scene.ts`, `hero/tier.ts`, `season/map-vector.ts`, `season/circuit-path.ts`, `season/map-dots.ts`, the `geometry.ts` files, `timeline/plate-shape.ts`); esbuild strips the types and inlines them into one module.

## Where this departs from the spec, and why

The spec had gaps that would have broken the page if followed literally:

- **`scene.ts` was truncated** — it ended without the class's closing brace. Added.
- **`approach()` in the halftone engine had no body.** Filled with the exponential approach its comment describes: `from + (to − from)·(1 − e^(−dt/τ))`.
- **The halftone engine was React (`useMemo`/`useCallback`/refs)** although the spec forbids frameworks. Ported mechanically to plain functions over one state object; the logic is unchanged.
- **`scene.ts` swallowed load failures** (`void this.load()`), which the spec separately requires to be visible. Added an `onError` hook and made each loader report its URL; a failure shows a banner, the static fallback, and lifts the veil.
- **No plan for the CDN itself failing.** If three/Lenis never load, a watchdog lifts the veil after 8 s, shows the page at rest and a banner.

## Not yet verified against the real assets

The build sandbox could not reach `storage.getlayers.ai` or jsDelivr. The page was tested in headless Chrome with local copies of three@0.185.0 / lenis@1.3.26 and generated stand-in assets (a sphere for the helmet, flat-colour images). The WebGL scene, burn, reveal mask, wireframe wave, backdrop contours, lap trace, halftone, timeline, paddock and footer all run without console errors at 1440, 1024 and 390 px — but the real Draco helmet, the HDR and the cut-out portraits have not been seen in place. Check those first.
