import {
  CONFIG, FADE, RISE, Spring, lenis, motion, reducedMotion, reportFailure,
  splitText, subscribe, watchInView,
} from "../engine.js";
import { ASSET_BASE_URL } from "../config.js";
import { DEFAULT_PARAMS, HeroScene, fitSubjectToBox } from "./scene.ts";

const CLEAR_MS = 430;
const PAUSE_MS = 240;
const LIFT_TIMEOUT_MS = 3000;
const COVERED_AFTER = 1.15;

export const initHero = () => {
  const section = document.querySelector("[data-hero]");
  const q = (s) => section.querySelector(s);

  /* ---------------------------------------------------------- entrance */
  const mast = motion(q("[data-masthead]"), ...RISE("1.25rem"));
  const id = motion(q("[data-driver-id]"), ...FADE);
  const name = splitText(q("[data-hero-name]"), { by: "word", stagger: 110, config: CONFIG.REVEAL });
  const meta = [...section.querySelectorAll("[data-meta]")].map((el) => motion(el, ...RISE("0.75rem")));
  const panels = motion(q("[data-hero-panels]"), ...RISE("1.25rem"));
  const figs = [...section.querySelectorAll("[data-hero-fig]")].map((el) =>
    splitText(el, { by: "letter", stagger: 26, config: CONFIG.FIGURE }),
  );
  const actions = motion(q("[data-actions]"), ...RISE("1.25rem"));
  const entrance = () => {
    mast.play(0);
    id.play(180);
    name.play(180);
    meta.forEach((m, i) => m.play(180 + 260 + i * 130));
    panels.play(900);
    figs.forEach((f, i) => f.play(900 + i * 90));
    actions.play(1500);
  };

  /* -------------------------------------------------------------- veil */
  const veil = q("[data-veil]");
  const fill = q("[data-veil-fill]");
  const bar = q("[data-veil-bar]");
  const progress = new Spring(0, {
    config: CONFIG.PROGRESS_WAIT,
    precision: 0.001,
    onChange: (v) => {
      fill.style.transform = `scaleY(${v})`;
      bar.style.transform = `scaleX(${v})`;
    },
  });
  progress.to(0.7);
  motion(q("[data-veil-name]"), ...RISE("0.6rem"), { config: CONFIG.LABEL }).play(260);
  const clearInner = motion(q("[data-veil-inner]"), { opacity: 1, y: [0, "rem"] }, { opacity: 0, y: [-0.75, "rem"] }, { config: CONFIG.CLEAR });
  const clearMeter = motion(q("[data-veil-meter]"), { opacity: 1 }, { opacity: 0 }, { config: CONFIG.CLEAR });
  const lift = motion(veil, { opacity: 1 }, { opacity: 0 }, { config: CONFIG.VEIL });

  let lifted = false;
  const handover = (scene, immediate = false) => {
    if (lifted) return;
    lifted = true;
    veil.style.pointerEvents = "none";
    veil.setAttribute("aria-label", "Loaded");
    progress.to(1, { config: CONFIG.PROGRESS_READY });
    clearInner.play();
    clearMeter.play();
    const go = () => {
      lift.play();
      scene?.beginRise();
      entrance();
      const t0 = performance.now();
      const unsub = subscribe((time) => {
        const o = Number(getComputedStyle(veil).opacity);
        if (o <= 0.004 || time - t0 > LIFT_TIMEOUT_MS) {
          unsub();
          veil.remove();
        }
      });
    };
    if (immediate) go();
    else setTimeout(go, CLEAR_MS + PAUSE_MS);
  };

  /* -------------------------------------------------------------- menu */
  initSheet();

  /* ------------------------------------------------------------- scene */
  const holder = q("[data-hero-canvas]");
  const canvas = holder.querySelector("canvas");
  const box = q("[data-fitbox]");
  const showFallback = () => {
    holder.style.display = "none";
    const fb = q("[data-hero-fallback]");
    fb.style.display = "block";
    if (!fb.querySelector(".person")) {
      const img = new Image();
      img.className = "person";
      img.alt = "";
      img.src = `${ASSET_BASE_URL}/hero/scene/person-diffuse.webp`;
      img.onerror = () => reportFailure(img.src);
      fb.append(img);
    }
  };

  let scene;
  try {
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("no webgl");
    scene = new HeroScene(canvas);
  } catch {
    showFallback();
    handover(null, true);
    return;
  }

  scene.onError = (error) => {
    reportFailure(error?.message || "hero scene asset");
    showFallback();
    handover(null);
  };
  scene.onReady = () => handover(scene);

  const applyFit = () => {
    const s = section.getBoundingClientRect();
    const fit = box.offsetParent !== null;
    const b = box.getBoundingClientRect();
    scene.setParams({
      ...DEFAULT_PARAMS,
      ...(fit ? fitSubjectToBox(DEFAULT_PARAMS, { top: b.top - s.top, height: b.height }, holder.clientHeight) : null),
      ...(window.matchMedia("(max-width: 1023px)").matches ? { bgRevealOpacity: 0 } : null),
      ...(window.matchMedia("(hover: none)").matches ? { autoSweepAmount: 0.76 } : null),
      ...(window.matchMedia("(max-width: 639px)").matches ? { sweepRadius: 0.95, sweepWarp: 0.18, autoSweepAmount: 0.55 } : null),
      ...(scene.tier.reveal ? null : { autoSweepAmount: 0 }),
    });
  };

  const onPointer = (e) =>
    scene.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
  let pointerBound = false;
  const bindPointer = () => {
    const want = scene.tier.pointerEnabled;
    if (want && !pointerBound) window.addEventListener("pointermove", onPointer, { passive: true });
    if (!want && pointerBound) window.removeEventListener("pointermove", onPointer);
    pointerBound = want;
  };
  bindPointer();

  const resize = () => {
    scene.resize(holder.clientWidth, holder.clientHeight);
    applyFit();
  };
  resize();

  const coarse = window.matchMedia("(hover: none) and (pointer: coarse)");
  let lastWidth = holder.clientWidth;
  let queued = false;
  new ResizeObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const w = holder.clientWidth;
      // Height-only changes on a coarse pointer are the iOS URL bar.
      if (coarse.matches && w === lastWidth) return;
      if (w !== lastWidth) {
        scene.retune();
        bindPointer();
      }
      lastWidth = w;
      resize();
    });
  }).observe(holder);
  coarse.addEventListener("change", () => {
    scene.retune();
    bindPointer();
    resize();
  });

  const gate = watchInView(section);
  subscribe(
    (time) => {
      if (!gate.running()) return;
      if (document.hidden) return;
      if (window.scrollY > innerHeight * COVERED_AFTER) return;
      scene.update(time);
    },
    () => scene.tier.frameInterval,
  );
};

const initSheet = () => {
  const sheet = document.querySelector("[data-sheet]");
  const burger = document.querySelector("[data-burger]");
  const close = sheet.querySelector("[data-sheet-close]");
  const items = [...sheet.querySelectorAll("[data-sheet-item]")];
  let open = false;
  const fade = new Spring(0, {
    config: CONFIG.SHEET,
    precision: 0.001,
    onChange: (v) => (sheet.style.opacity = `${v}`),
  });
  const itemMotions = items.map((el) => motion(el, ...RISE("0.75rem"), { config: CONFIG.ITEM }));
  const show = () => {
    if (open) return;
    open = true;
    sheet.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    fade.to(1);
    itemMotions.forEach((m, i) => {
      m.spring.set(0);
      m.play(120 + i * 55);
    });
    lenis?.stop();
    document.documentElement.classList.add("locked");
    close.focus();
  };
  const hide = () => {
    if (!open) return;
    open = false;
    burger.setAttribute("aria-expanded", "false");
    fade.to(0, { onRest: () => (sheet.hidden = true) });
    lenis?.start();
    document.documentElement.classList.remove("locked");
    burger.focus();
  };
  burger.addEventListener("click", show);
  close.addEventListener("click", hide);
  sheet.querySelector("[data-sheet-logo]").addEventListener("click", hide);
  sheet.querySelectorAll("nav a").forEach((a) => a.addEventListener("click", hide));
  document.addEventListener("keydown", (e) => e.key === "Escape" && hide());
  window.matchMedia("(min-width: 1280px)").addEventListener("change", (e) => e.matches && hide());
  void reducedMotion;
};
