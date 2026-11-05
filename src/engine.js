// The page's motion engine: one rAF loop, react-spring's damped spring, the
// text engine, scroll triggers, in-view gates and the sticky stack.
import Lenis from "lenis";

export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------- ticker */

const subscribers = new Set();
let rafId = 0;
const loop = (time) => {
  for (const sub of [...subscribers]) {
    if (!subscribers.has(sub)) continue;
    if (time - sub.last > sub.getFramerate()) {
      sub.last = time;
      sub.callback(time);
    }
  }
  rafId = subscribers.size ? requestAnimationFrame(loop) : 0;
};
/** Reference-counted: starts on the first subscriber, cancels on the last. */
export const subscribe = (callback, getFramerate = () => 0) => {
  const sub = { callback, getFramerate, last: -Infinity };
  subscribers.add(sub);
  if (!rafId) rafId = requestAnimationFrame(loop);
  return () => {
    subscribers.delete(sub);
    if (!subscribers.size && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
};

/* ----------------------------------------------------------------- lenis */

export let lenis = null;
export const startLenis = () => {
  if (reducedMotion()) return null;
  lenis = new Lenis({ smoothWheel: true });
  // Registered first, so every scroll reader this frame sees this frame's scrollY.
  subscribe((time) => lenis.raf(time), () => 0);
  return lenis;
};

/* ---------------------------------------------------------------- spring */

export const CONFIG = {
  REVEAL: { tension: 90, friction: 26 },
  ROW: { tension: 170, friction: 24 },
  ITEM: { tension: 170, friction: 24 },
  SHEET: { tension: 190, friction: 26 },
  FIGURE: { tension: 200, friction: 24 },
  TYPE: { tension: 210, friction: 24 },
  YEAR: { tension: 190, friction: 24 },
  COPY: { tension: 110, friction: 26 },
  COPY_FAST: { tension: 150, friction: 24 },
  NAME: { tension: 190, friction: 24 },
  VEIL: { tension: 70, friction: 24 },
  CLEAR: { tension: 140, friction: 26 },
  LABEL: { tension: 110, friction: 26 },
  PROGRESS_WAIT: { tension: 10, friction: 30 },
  PROGRESS_READY: { tension: 170, friction: 26 },
  YEAR_SETTLE: { tension: 32, friction: 26 },
  TRIGGER: { tension: 140, friction: 30 },
};

const active = new Set();
let unsubSprings = null;
const springTick = (time) => {
  for (const s of [...active]) s.step(time);
  if (!active.size && unsubSprings) {
    unsubSprings();
    unsubSprings = null;
  }
};
const wake = (spring) => {
  active.add(spring);
  if (!unsubSprings) unsubSprings = subscribe(springTick, () => 0);
};

/**
 * react-spring's solver: 1ms substeps up to a 64ms frame cap, mass 1. A config
 * of `{ duration, easing }` is a plain tween instead.
 */
export class Spring {
  constructor(value, { config = CONFIG.REVEAL, precision = 0.01, onChange } = {}) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.config = config;
    this.precision = precision;
    this.onChange = onChange;
    this.startAt = 0;
    this.last = null;
    this.tween = null;
    this.onRest = null;
  }
  to(target, { delay = 0, config, onRest } = {}) {
    if (config) this.config = config;
    this.target = target;
    this.onRest = onRest ?? null;
    const now = performance.now();
    this.startAt = now + delay;
    this.last = null;
    if (this.config.duration != null) {
      this.tween = { from: this.value, start: this.startAt };
    } else this.tween = null;
    wake(this);
    return this;
  }
  set(value) {
    this.value = this.target = value;
    this.velocity = 0;
    active.delete(this);
    this.onChange?.(value);
  }
  step(time) {
    if (time < this.startAt) return;
    if (this.tween) {
      const { duration, easing = (t) => t } = this.config;
      const u = duration <= 0 ? 1 : Math.min(1, (time - this.tween.start) / duration);
      this.value = this.tween.from + (this.target - this.tween.from) * easing(u);
      this.onChange?.(this.value);
      if (u >= 1) this.rest();
      return;
    }
    const last = this.last ?? time - 16;
    this.last = time;
    const dt = Math.min(64, Math.max(0, time - last));
    const { tension, friction } = this.config;
    let x = this.value;
    let v = this.velocity; // units per ms
    for (let i = 0; i < Math.ceil(dt); i += 1) {
      const spring = -tension * 0.000001 * (x - this.target);
      const damping = -friction * 0.001 * v;
      v += spring + damping;
      x += v;
    }
    this.value = x;
    this.velocity = v;
    if (Math.abs(v) < this.precision / 10 && Math.abs(this.target - x) < this.precision) {
      this.value = this.target;
      this.velocity = 0;
      this.onChange?.(this.value);
      this.rest();
      return;
    }
    this.onChange?.(this.value);
  }
  rest() {
    active.delete(this);
    const cb = this.onRest;
    this.onRest = null;
    cb?.();
  }
}

/* ---------------------------------------------------- element animation */

const lerp = (a, b, t) => a + (b - a) * t;
/**
 * Drives an element between two style states with one spring on progress.
 * A spring is linear in its target, so springing p and interpolating each
 * property is the same motion as springing every property on its own.
 *   state: { opacity, y: [n, unit], x: [n, unit], scaleX, scaleY }
 */
export const motion = (el, from, to, { config = CONFIG.REVEAL, extra } = {}) => {
  const apply = (p) => {
    const tf = [];
    if (from.y) tf.push(`translateY(${lerp(from.y[0], to.y[0], p)}${from.y[1]})`);
    if (from.x) tf.push(`translateX(${lerp(from.x[0], to.x[0], p)}${from.x[1]})`);
    if (from.scaleX != null) tf.push(`scaleX(${lerp(from.scaleX, to.scaleX, p)})`);
    if (from.scaleY != null) tf.push(`scaleY(${lerp(from.scaleY, to.scaleY, p)})`);
    if (extra) tf.unshift(extra);
    if (tf.length) el.style.transform = tf.join(" ");
    if (from.opacity != null) el.style.opacity = `${lerp(from.opacity, to.opacity, p)}`;
  };
  const spring = new Spring(0, { config, precision: 0.001, onChange: apply });
  apply(0);
  return {
    spring,
    play: (delay = 0, onRest) => spring.to(1, { delay, onRest }),
    reverse: (delay = 0) => spring.to(0, { delay }),
    finish: () => spring.set(1),
  };
};

export const RISE = (amount = "0.75rem") => {
  const [n, unit] = [parseFloat(amount), amount.replace(/[-\d.]/g, "")];
  return [{ opacity: 0, y: [n, unit] }, { opacity: 1, y: [0, unit] }];
};
export const FADE = [{ opacity: 0 }, { opacity: 1 }];

/* ------------------------------------------------------------ in-view gate */

/** Fires once when the element enters the viewport inset by `rootMargin`. */
export const onceInView = (el, cb, rootMargin = "0px") => {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { rootMargin },
  );
  io.observe(el);
};

/**
 * Loop-in-view: true while the element intersects, and for ten more frames
 * after it leaves.
 */
export const watchInView = (el, onChange) => {
  const state = { visible: false, grace: 0 };
  const io = new IntersectionObserver((entries) => {
    const v = entries[entries.length - 1].isIntersecting;
    state.visible = v;
    if (!v) state.grace = 10;
    onChange?.(v);
  });
  io.observe(el);
  state.running = () => {
    if (state.visible) return true;
    if (state.grace > 0) {
      state.grace -= 1;
      return true;
    }
    return false;
  };
  return state;
};

/* ---------------------------------------------------------------- modes */

/**
 * `forward`: plays in while the gate is on; once the element's top has passed
 * the viewport top it holds `to` instead of reversing.
 */
export const forwardGate = (el, onEnable, onDisable, rootMargin = "0px") => {
  let enabled = false;
  const io = new IntersectionObserver(
    (entries) => {
      const v = entries[entries.length - 1].isIntersecting;
      if (v && !enabled) {
        enabled = true;
        onEnable();
      } else if (!v && enabled) {
        const scrolledDown = el.getBoundingClientRect().top <= 0;
        if (scrolledDown) return;
        enabled = false;
        onDisable?.();
      }
    },
    { rootMargin },
  );
  io.observe(el);
};

/* ----------------------------------------------------------- text engine */

const WORD = [{ opacity: 0, y: [0.35, "em"] }, { opacity: 1, y: [0, "em"] }];
const LETTER = [{ opacity: 0, y: [0.3, "em"] }, { opacity: 1, y: [0, "em"] }];

/**
 * Splits an element's text into words or letters, each an inline-block span
 * with its own spring. Keeps a visually-hidden plain copy for assistive tech.
 * Returns { play(delayIn), reverse(), finish() }.
 */
export const splitText = (
  el,
  { by = "word", stagger = 110, config = CONFIG.REVEAL, gap } = {},
) => {
  const text = el.textContent.trim().replace(/\s+/g, " ");
  el.textContent = "";
  el.classList.add("split");
  if (gap != null) el.style.columnGap = gap;
  const sr = document.createElement("span");
  sr.className = "sr-only";
  sr.textContent = text;
  el.append(sr);
  const units = [];
  const words = text.split(" ");
  words.forEach((word, wi) => {
    if (by === "word") {
      const s = document.createElement("span");
      s.className = "unit";
      s.setAttribute("aria-hidden", "true");
      s.textContent = word;
      el.append(s);
      units.push(motion(s, WORD[0], WORD[1], { config }));
    } else {
      const w = document.createElement("span");
      w.className = "unit-word";
      w.setAttribute("aria-hidden", "true");
      for (const ch of word) {
        const s = document.createElement("span");
        s.className = "unit";
        s.textContent = ch;
        w.append(s);
        units.push(motion(s, LETTER[0], LETTER[1], { config }));
      }
      el.append(w);
    }
    void wi;
  });
  return {
    play: (delayIn = 0) => units.forEach((u, i) => u.play(delayIn + i * stagger)),
    reverse: () => units.forEach((u) => u.reverse()),
    finish: () => units.forEach((u) => u.finish()),
    count: units.length,
  };
};

/* --------------------------------------------------------- scroll triggers */

const poseOf = (bb, vh) => ({
  top_top: bb.top,
  center_top: bb.top + bb.height / 2,
  bottom_top: bb.bottom,
  top_bottom: bb.top - vh,
  center_bottom: bb.top + bb.height / 2 - vh,
  bottom_bottom: bb.bottom - vh,
  top_center: bb.top - vh / 2,
  center_center: bb.top + bb.height / 2 - vh / 2,
  bottom_center: bb.bottom - vh / 2,
});

export const triggerProgress = (el, start, end) => {
  const vh = window.innerHeight;
  const poses = poseOf(el.getBoundingClientRect(), vh);
  const scrollStart = poses[start.replace(" ", "_")];
  const scrollEnd = poses[end.replace(" ", "_")];
  const length = Math.abs(scrollStart - scrollEnd) || 1;
  return Math.min(Math.max(0, 1 - (scrollStart + length) / length), 1);
};

/**
 * A scrub trigger: hands `onProgress(raw, smoothed)` each tick while the
 * element is in view (plus ten frames).
 */
export const scrub = (el, { start, end, onProgress, smooth = false }) => {
  const gate = watchInView(el);
  const smoothed = smooth
    ? new Spring(0, {
        config: CONFIG.TRIGGER,
        precision: 0.001,
        onChange: (v) => onProgress(last, v),
      })
    : null;
  let last = -1;
  const tick = () => {
    if (!gate.running()) return;
    const p = triggerProgress(el, start, end);
    if (p === last) return;
    last = p;
    if (smoothed) smoothed.to(p);
    else onProgress(p, p);
  };
  // first value now, so a block that loads mid-page is in the right place
  requestAnimationFrame(() => {
    last = triggerProgress(el, start, end);
    if (smoothed) smoothed.set(last);
    onProgress(last, last);
  });
  subscribe(tick, () => 10);
};

/** Interpolates a "<n><unit>" pair by progress. */
export const between = (from, to, p) => {
  const a = parseFloat(from);
  const b = parseFloat(to);
  const unit = String(from).replace(/[-\d.]/g, "") || String(to).replace(/[-\d.]/g, "");
  return `${a + (b - a) * p}${unit}`;
};

/* ------------------------------------------------------------ sticky stack */

const RECEDE_SCALE = 0.9;
const RECEDE_SHADE = 0.55;
export const startStack = (pinned) => {
  const phone = window.matchMedia("(max-width: 639px)");
  const apply = () => {
    const view = window.innerHeight || 1;
    const shrink = phone.matches ? 0 : 1 - RECEDE_SCALE;
    for (const { inner, shade, next } of pinned) {
      const p = Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / view));
      // No transform at rest — scale(1) would make the layer the containing
      // block for the hero's position:fixed loader.
      inner.style.transform = p > 0 && shrink > 0 ? `scale(${1 - shrink * p})` : "";
      inner.style.willChange = p > 0 && shrink > 0 ? "transform" : "";
      shade.style.opacity = `${RECEDE_SHADE * p}`;
      inner.style.visibility = p >= 1 ? "hidden" : "visible";
    }
  };
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      apply();
    });
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  apply();
};

/* ---------------------------------------------------------------- utils */

/** Resolves a CSS custom property to rgb through a probe's computed colour. */
export const tokenRgb = (token) => {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${token})`;
  document.body.appendChild(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  const m = c.match(/[\d.]+/g) || [0, 0, 0];
  return [Number(m[0]), Number(m[1]), Number(m[2])];
};
export const tokenCss = (token) => {
  const [r, g, b] = tokenRgb(token);
  return `rgb(${r} ${g} ${b})`;
};

export const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
export const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeOutCubic = (t) => 1 - (1 - t) ** 3;

/** A looping linear clock that only ticks while `gate.running()`. */
export const loopClock = (period, gate, cb, framerate = 0) => {
  let origin = performance.now();
  let paused = 0;
  let wasRunning = true;
  subscribe((time) => {
    const running = gate ? gate.running() : true;
    if (!running) {
      if (wasRunning) paused = time;
      wasRunning = false;
      return;
    }
    if (!wasRunning) origin += time - paused;
    wasRunning = true;
    cb(((time - origin) % period) / period, time);
  }, () => framerate);
};

/** Banner for any failed asset load. */
export const reportFailure = (url) => {
  let bar = document.getElementById("asset-errors");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "asset-errors";
    bar.setAttribute("role", "alert");
    document.body.append(bar);
  }
  const line = document.createElement("div");
  line.textContent = `Failed to load: ${url}`;
  bar.append(line);
  console.error("[asset]", url);
};
