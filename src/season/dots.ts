// The halftone engine — season-dots.tsx from the spec, ported off React hooks.
import { DOTS, DOT_LATTICE, DOT_RADIUS } from "./map-dots.ts";
import { MAP_VIEW } from "./map-vector.ts";
type HalftoneLight = { x: number; y: number; heat: number };
type HalftoneParams = { threshold: number; radius: number; waveSpeed: number; fade: number; source: string };
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
  from + (to - from) * (1 - Math.exp(-dt / Math.max(tau, 1e-4)));
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



export const createDots = (canvas: HTMLCanvasElement, palette: { dot: Rgb; accent: Rgb; bright: Rgb; white: Rgb }) => {
  const S: any = {
    canvas, palette, baked: null, dirty: true,
    level: new Float32Array(DOTS.count), active: new Int32Array(DOTS.count), inList: new Uint8Array(DOTS.count), activeCount: 0,
    pointer: { x: 0, y: 0, heat: 0 }, target: { x: 0, y: 0, on: false }, spread: 0, phase: 0, light: null, last: 0,
    params: { threshold: 0.34, radius: 170, waveSpeed: 0.16, fade: 0.9, source: "none" },
    draw: () => {},
  };
  const lightRef = { get current() { return S.light; } };
// the lattice index (built once)
  const index = (() => {
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
  })();

// the resting field, baked once per size change
  const bake = (() => {
    const canvas = S.canvas;
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

    const baked = S.baked ?? document.createElement("canvas");
    S.baked = baked;
    baked.width = w;
    baked.height = h;

    const context = baked.getContext("2d");
    if (!context) return;
    const scale = w / MAP_VIEW.width;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, MAP_VIEW.width, MAP_VIEW.height);

    const { points, count } = DOTS;
    context.fillStyle = css(S.palette.dot);
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
    S.dirty = true;
    S.draw();
  });

// raise the dots the light reaches
  const light = ((p: HalftoneParams, dt: number) => {
      const level = S.level;
      const active = S.active;
      const inList = S.inList;
      const { points } = DOTS;
      const radius = Math.max(1, p.radius);

      const add = (i: number, value: number) => {
        if (value <= MIN_LEVEL) return;
        if (value > level[i]) level[i] = value;
        if (!inList[i]) {
          inList[i] = 1;
          active[S.activeCount] = i;
          S.activeCount += 1;
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
        const reach = RETICLE_OPEN * S.spread;

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
      addReticle(S.pointer);

      // `none` ships: the cursor is the only light. See `halftone-store`.
      if (p.source === "none") return;

      if (p.source === "edge") {
        const source = S.light;
        if (source) addPoint(source, radius);
        return;
      }

      // The wave: a band crossing the map, found by binary search on the dots
      // sorted along its heading.
      S.phase = (S.phase + dt * p.waveSpeed) % 1;
      const { sorted, sortedProjection, projectionMin, projectionMax } = index;
      const span = projectionMax - projectionMin + radius * 2;
      const centre = projectionMin - radius + S.phase * span;
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
    });

// the draw: blit the baked field, then the chequer
  const draw = (() => {
    const canvas = S.canvas;
    const baked = S.baked;
    if (!canvas || !baked || !canvas.width) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const p = S.params;
    const scale = canvas.width / MAP_VIEW.width;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, MAP_VIEW.width, MAP_VIEW.height);
    context.drawImage(baked, 0, 0, MAP_VIEW.width, MAP_VIEW.height);

    const level = S.level;
    const active = S.active;
    const count = S.activeCount;
    const { points, columns, rows } = DOTS;
    const { accent, bright, white } = S.palette;

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
  });

// the frame, from the 2000ms clock
  const frame = (() => {
    const now = performance.now();
    const dt = S.last
      ? Math.min(0.1, (now - S.last) / 1000)
      : 0;
    S.last = now;

    const p = S.params;
    const level = S.level;
    const active = S.active;
    const inList = S.inList;

    // Walk the pointer light toward the cursor. The lag is the whole point:
    // a light with a little mass reads as something held over the map, where
    // a light pinned to the cursor reads as a hard mask.
    const pointer = S.pointer;
    const target = S.target;
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
      S.spread = approach(
        S.spread,
        wantedSpread,
        dt,
        wantedSpread > S.spread ? SPREAD_OPEN : SPREAD_SHUT,
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
      S.spread = 0;
    }

    // Fade what is already lit, and drop whatever has landed back.
    const decay = Math.exp(-dt / Math.max(0.05, p.fade / 3));
    let write = 0;
    for (let k = 0; k < S.activeCount; k += 1) {
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
    const before = S.activeCount;
    S.activeCount = write;

    light(p, dt);

    // An idle field repaints once and then stops asking for the blit.
    if (S.activeCount === 0 && before === 0 && !S.dirty)
      return;
    S.dirty = false;
    draw();
  });
  S.draw = draw;
  return { S, bake, frame, draw };
};
