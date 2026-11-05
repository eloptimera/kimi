import {
  CONFIG, RISE, Spring, easeInOutSine, easeOutCubic, easeOutQuad, forwardGate,
  loopClock, motion, reducedMotion, splitText, subscribe, tokenRgb, watchInView,
} from "../engine.js";
import { initDissolve, initHeading } from "../shared.js";
import {
  CORNER_MARKS, CORNER_MARK_SIZE, FLAG_CUT, FLAG_DIAMONDS, GRID_AXES_X, GRID_AXIS_Y,
  GRID_DASH, GRID_STROKE, HUB, LAP_CENTRELINE, LAP_LENGTH, LAP_MASK_WIDTH, RINGS,
  TRACK_RIBBON, TURNS, TURN_POINTS,
} from "./map-vector.ts";
import { CIRCUIT_PATH } from "./circuit-path.ts";
import { COOL_MS, LAP_MS, TOTAL, distanceAtTime, render, setHeat, setLapContext } from "./lap.js";
import { createDots } from "./dots.ts";
import { MAP_VIEW } from "./map-vector.ts";

const PLATE_DELAY = 260;
const TYPE_DELAY = 430;
const ROW_STAGGER = 110;
const LETTER_STAGGER = 22;
const SPIN_MS = 10000;
const DRIFT_MS = 7000;
const PING_MS = 4200;
const PING_REACH = 86;
const GRID_OVERRUN = 4000;

const NS = "http://www.w3.org/2000/svg";
const el = (name, attrs = {}, parent) => {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  parent?.append(n);
  return n;
};

const buildMap = (svg) => {
  const defs = el("defs", {}, svg);
  const cut = el("mask", { id: "flag-cut", maskUnits: "userSpaceOnUse", x: "-5000", y: "-5000", width: "12560", height: "11440" }, defs);
  el("rect", { x: "-5000", y: "-5000", width: "12560", height: "11440", fill: "#fff" }, cut);
  el("rect", {
    x: `${FLAG_CUT.x - FLAG_CUT.along / 2}`, y: `${FLAG_CUT.y - FLAG_CUT.across / 2}`,
    width: `${FLAG_CUT.along}`, height: `${FLAG_CUT.across}`, fill: "#000",
    transform: `rotate(${FLAG_CUT.angle} ${FLAG_CUT.x} ${FLAG_CUT.y})`,
  }, cut);
  const lap = el("mask", { id: "lap-mask", maskUnits: "userSpaceOnUse", x: "0", y: "0", width: "2560", height: "1440" }, defs);
  const lapPath = el("path", {
    d: LAP_CENTRELINE, fill: "none", stroke: "#fff", "stroke-width": `${LAP_MASK_WIDTH}`,
    "stroke-linecap": "round", "stroke-linejoin": "round",
    "stroke-dasharray": `${LAP_LENGTH + 60}`, "stroke-dashoffset": `${60 + LAP_LENGTH}`,
  }, lap);

  const grid = el("g", { id: "grid" }, svg);
  const axes = [];
  for (const x of GRID_AXES_X) axes.push(el("line", { x1: x, x2: x, y1: -GRID_OVERRUN, y2: 1440 + GRID_OVERRUN }, grid));
  axes.push(el("line", { x1: -GRID_OVERRUN, x2: 2560 + GRID_OVERRUN, y1: GRID_AXIS_Y, y2: GRID_AXIS_Y }, grid));
  for (const a of axes) {
    a.setAttribute("stroke", "var(--map-grid)");
    a.setAttribute("stroke-width", `${GRID_STROKE}`);
    a.setAttribute("stroke-dasharray", GRID_DASH);
  }
  for (const r of RINGS) el("circle", { cx: HUB.x, cy: HUB.y, r: r.r, fill: "none", stroke: r.ghost ? "var(--map-grid-ghost)" : "var(--map-grid)", "stroke-width": r.width }, grid);
  const ping = el("circle", { cx: HUB.x, cy: HUB.y, r: HUB.r, fill: "none", stroke: "var(--accent)", "stroke-width": GRID_STROKE, opacity: 0 }, grid);
  for (const [x, y] of CORNER_MARKS) el("rect", { x: x - CORNER_MARK_SIZE / 2, y: y - CORNER_MARK_SIZE / 2, width: CORNER_MARK_SIZE, height: CORNER_MARK_SIZE, fill: "var(--map-mark)" }, grid);
  el("circle", { cx: HUB.x, cy: HUB.y, r: HUB.r, fill: "var(--map-mark)" }, grid);

  const track = el("g", { mask: "url(#flag-cut)" }, svg);
  el("path", { d: TRACK_RIBBON, fill: "var(--foreground-on-dark)" }, track);
  el("path", { d: TRACK_RIBBON, fill: "var(--accent)", mask: "url(#lap-mask)" }, track);

  const markers = el("g", { id: "markers" }, svg);
  for (const t of TURNS) el("polygon", { points: TURN_POINTS, fill: "var(--accent)", transform: `translate(${t.x} ${t.y}) rotate(${t.angle})` }, markers);
  el("path", { d: FLAG_DIAMONDS, fill: "var(--map-mark)" }, markers);
  return { axes, ping, lapPath };
};

// The lap path's bounding box padded 46, for the narrow fit.
const TRACK_BOX = (() => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of CIRCUIT_PATH) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x: x0 - 46, y: y0 - 46, width: x1 - x0 + 92, height: y1 - y0 + 92 };
})();

export const initSeason = () => {
  const section = document.querySelector("[data-season]");
  const q = (s) => section.querySelector(s);
  const frame = q("[data-stage-frame]");
  const stage = q("[data-stage]");
  const gate = watchInView(section);

  initDissolve(q("[data-dissolve]"));

  /* ---------------------------------------------------- left rail */
  initHeading(q("[data-heading]"), section);
  const rule = motion(q("[data-rule]"), { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1 });
  const intro = splitText(q("[data-intro]"), { by: "word", stagger: 34, config: CONFIG.COPY_FAST, gap: "0.22em" });
  /* ---------------------------------------------------- the plate */
  const plate = motion(q("[data-splate]"), ...RISE("0.75rem"));
  const plateType = [...section.querySelectorAll("[data-plate-type]")].map((e) => splitText(e, { by: "letter", stagger: LETTER_STAGGER, config: CONFIG.TYPE }));
  const plateFigs = [...section.querySelectorAll("[data-plate-fig]")].map((e) => splitText(e, { by: "letter", stagger: LETTER_STAGGER, config: CONFIG.TYPE }));
  const plateWords = [...section.querySelectorAll("[data-plate-word]")].map((e) => splitText(e, { by: "letter", stagger: LETTER_STAGGER, config: CONFIG.TYPE }));
  forwardGate(section, () => {
    rule.play(2 * 130);
    intro.play(2 * 130 + 90);
    plate.play(PLATE_DELAY);
    plateType[0].play(TYPE_DELAY);
    plateType[1].play(TYPE_DELAY + 60);
    plateFigs.forEach((f, r) => f.play(TYPE_DELAY + r * ROW_STAGGER));
    plateWords.forEach((w, r) => w.play(TYPE_DELAY + r * ROW_STAGGER + 70));
  }, () => {
    [rule, plate].forEach((m) => m.reverse());
    [intro, ...plateType, ...plateFigs, ...plateWords].forEach((t) => t.reverse());
  });

  const meridian = q("[data-meridian]");
  loopClock(SPIN_MS, gate, (v) => meridian.setAttribute("rx", `${Math.max(0.5, Math.abs(Math.cos(v * Math.PI * 2)) * 18)}`));

  /* ---------------------------------------------------- the map */
  const { axes, ping, lapPath } = buildMap(q("[data-map]"));
  loopClock(DRIFT_MS, gate, (v) => axes.forEach((a) => a.setAttribute("stroke-dashoffset", `${v * 20.5}`)));
  loopClock(PING_MS, gate, (t) => {
    const v = easeOutQuad(t);
    ping.setAttribute("r", `${HUB.r + v * PING_REACH}`);
    ping.setAttribute("opacity", `${0.4 * (1 - v) ** 2}`);
  });

  /* ---------------------------------------------------- stage fit */
  const fit = () => {
    const w = frame.clientWidth;
    const h = frame.clientHeight;
    let s, tx, ty;
    if (w >= 1024) {
      s = Math.max(w / 1440, h / 800);
      tx = (w - 1440 * s) / 2;
      ty = (h - 800 * s) / 2;
    } else {
      s = w / TRACK_BOX.width;
      const cx = TRACK_BOX.x + TRACK_BOX.width / 2;
      const cy = TRACK_BOX.y + TRACK_BOX.height / 2;
      tx = w / 2 - cx * s;
      ty = h / 2 - cy * s;
    }
    stage.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
  };
  new ResizeObserver(fit).observe(frame);
  fit();

  /* ---------------------------------------------------- the lap */
  const coarse = matchMedia("(hover: none) and (pointer: coarse)").matches;
  const maxRatio = coarse ? 1 : 2;
  const trace = q("[data-trace]");
  const ctx = trace.getContext("2d");
  const accent = tokenRgb("--accent");
  const white = tokenRgb("--foreground-on-dark");
  const bright = accent.map((c, i) => Math.round(c + (white[i] - c) * 0.55));
  setLapContext(ctx, { accent, white, bright });
  const sizeTrace = () => {
    const ratio = Math.min(devicePixelRatio || 1, maxRatio);
    trace.width = 1440 * ratio;
    trace.height = 800 * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  sizeTrace();
  let lap = 0;
  const paint = () => {
    render(lap);
    const reveal = 1 - distanceAtTime(lap) / TOTAL;
    lapPath.setAttribute("stroke-dashoffset", `${60 + reveal * LAP_LENGTH}`);
  };
  paint();

  /* ---------------------------------------------------- halftone */
  const dotsCanvas = q("[data-dots]");
  const dots = createDots(dotsCanvas, { dot: tokenRgb("--map-dot"), accent, bright, white });
  dots.bake();
  new ResizeObserver(() => dots.bake()).observe(dotsCanvas);
  let reticleArmed = false;

  const armReticle = () => {
    if (reticleArmed || reducedMotion() || matchMedia("(hover: none)").matches) return;
    reticleArmed = true;
    const inSection = (e) => {
      const r = section.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = dotsCanvas.getBoundingClientRect();
      dots.S.target.x = ((e.clientX - r.left) / r.width) * MAP_VIEW.width;
      dots.S.target.y = ((e.clientY - r.top) / r.height) * MAP_VIEW.height;
      dots.S.target.on = inSection(e);
    }, { passive: true });
    const out = () => (dots.S.target.on = false);
    document.addEventListener("pointerleave", out);
    window.addEventListener("blur", out);
    loopClock(2000, gate, () => dots.frame());
  };

  let started = false;
  const io = new IntersectionObserver((entries) => {
    if (started || !entries.some((e) => e.isIntersecting)) return;
    started = true;
    io.disconnect();
    if (reducedMotion()) {
      lap = 1;
      setHeat(0);
      paint();
      return;
    }
    const tween = new Spring(0, {
      config: { duration: LAP_MS, easing: easeInOutSine },
      onChange: (v) => { lap = v; paint(); },
    });
    tween.to(1, {
      onRest: () => {
        const cool = new Spring(1, {
          config: { duration: COOL_MS, easing: easeOutCubic },
          onChange: (h) => { setHeat(h); paint(); },
        });
        cool.to(0, { onRest: armReticle });
      },
    });
  }, { threshold: 0.35 });
  io.observe(frame);
  void subscribe;
};
