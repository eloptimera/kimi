import {
  CONFIG, FADE, RISE, between, forwardGate, loopClock, easeOutQuad, motion, onceInView,
  scrub, splitText, subscribe, tokenCss, watchInView, reportFailure,
} from "../engine.js";
import { drawContours, initDissolve, initHeading } from "../shared.js";
import { ASSET_BASE_URL } from "../config.js";
import { BRACKET_PATH, CALENDAR, px } from "./geometry.ts";

const CARD_DELAY = 560;
const CARD_STAGGER = 90;
const PULSE_MS = 3200;
const PULSE_REACH = 3.4;
const CRAWL_MS = 5200;
const MEET_DELAY = 320;
const STATS_DELAY = 460;
const ROW_STAGGER = 90;

/* ------------------------------------------------------- contour runner */
export const initContours = (canvas) => {
  const ctx = canvas.getContext("2d");
  const colour = tokenCss(canvas.dataset.contours);
  const gate = watchInView(canvas);
  const start = performance.now();
  const size = () => {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  size();
  new ResizeObserver(size).observe(canvas);
  const draw = (now) => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    drawContours(ctx, w, h, ((now - start) / 1000) * 1.66, colour);
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(draw);
    return;
  }
  subscribe((now) => gate.running() && draw(now), () => 24);
};

/* ------------------------------------------------------------ brackets */
const ROT = { tl: 270, tr: 0, br: 90, bl: 180 };
/** Four corner brackets around a box given as CSS lengths. */
export const brackets = (parent, { left, right, top, bottom, size, cls = "brk" }) => {
  const sp = "var(--bracket-spread, 0px)";
  const st = "var(--bracket-stretch, 0px)";
  const pos = {
    tl: [`calc(${left} - ${sp})`, `calc(${top} - ${sp})`],
    tr: [`calc(${right} - ${size} + ${sp})`, `calc(${top} - ${sp})`],
    br: [`calc(${right} - ${size} + ${sp})`, `calc(${bottom} - ${size} + ${sp} + ${st})`],
    bl: [`calc(${left} - ${sp})`, `calc(${bottom} - ${size} + ${sp} + ${st})`],
  };
  for (const [k, [l, t]] of Object.entries(pos)) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 10.5 10.5");
    s.setAttribute("class", cls);
    s.setAttribute("aria-hidden", "true");
    s.style.left = l;
    s.style.top = t;
    s.style.width = size;
    s.style.height = size;
    s.style.transform = `rotate(${ROT[k]}deg)`;
    s.innerHTML = `<path d="${BRACKET_PATH}"/>`;
    parent.append(s);
  }
};

const STATS = [
  { icon: "flag", label: "last result", value: "P4" },
  { icon: "bars", label: "points gained", value: "+12" },
  { icon: "trophy", label: "championship", value: "P1" },
  { icon: "gauge", label: "points", value: "118" },
];

const ROUNDS = [
  { round: "round 11", name: "austrian gp", date: "29 jun", x: 347, w: 100, mark: "p6" },
  { round: "round 12", name: "british gp", date: "12 jul", x: 511, w: 100, mark: "p4" },
  { round: "round 13", name: "belgian gp", date: "27 jul", x: 675, w: 100, live: true },
  { round: "round 14", name: "hungarian gp", date: "03 aug", x: 839, w: 114 },
  { round: "round 15", name: "dutch gp", date: "31 aug", x: 1017, w: 76 },
];

const spread = (x) => `calc(50% + ${px(x - 720)} * var(--S))`;

export const initPaddock = () => {
  const section = document.querySelector("[data-paddock]");
  const q = (s) => section.querySelector(s);
  initContours(q("[data-contours]"));
  initDissolve(q("[data-dissolve]"));
  initHeading(q("[data-heading]"), section);

  const fig = q(".pd-fig");
  fig.addEventListener("error", () => reportFailure(fig.src));
  const par = q("[data-pd-parallax]");
  scrub(section, { start: "top bottom", end: "bottom top", onProgress: (p) => (par.style.top = between("0cqw", "-3.3333cqw", p)) });

  const report = splitText(q("[data-report]"), { by: "word", stagger: 30, config: CONFIG.COPY_FAST, gap: "0.22em" });
  const read = motion(q("[data-read]"), ...RISE("0.75rem"));

  /* -------------------------------------------------------- panels */
  const U = (n) => `calc(${n} * var(--U))`;
  brackets(q("[data-brk-meet]"), {
    left: "var(--meet-frame-left, var(--frameL))", right: "var(--meet-frame-right, var(--frameR))",
    top: `var(--meet-frame-top, ${U(32)})`, bottom: `var(--meet-frame-bottom, ${U(105)})`, size: U(10),
  });
  brackets(q("[data-brk-stats]"), {
    left: "var(--stats-frame-left, var(--frameL))", right: "var(--stats-frame-right, var(--frameR))",
    top: `calc(${U(137)} + var(--stats-drop, 0px) + var(--stats-frame-drop, 0px))`,
    bottom: `calc(${U(535)} + var(--stats-drop, 0px))`, size: U(10),
  });
  const pstats = q("[data-pstats]");
  pstats.innerHTML = STATS.map((s, i) => `
    ${i ? '<div class="prule" data-prule></div>' : ""}
    <div class="prow" data-prow>
      <img src="${ASSET_BASE_URL}/paddock/icon-${s.icon}.svg" alt="" aria-hidden="true">
      <div><div class="lbl">${s.label}</div><div class="fig" data-pfig>${s.value}</div></div>
    </div>`).join("");
  pstats.querySelectorAll("img").forEach((img) => img.addEventListener("error", () => reportFailure(img.src)));
  const meetBrk = motion(q("[data-brk-meet]"), ...FADE);
  const meet = motion(q("[data-meet]"), ...RISE("0.75rem"));
  const statsBrk = motion(q("[data-brk-stats]"), ...FADE);
  const rules = [...pstats.querySelectorAll("[data-prule]")].map((el) => motion(el, { scaleX: 0 }, { scaleX: 1 }));
  const rows = [...pstats.querySelectorAll("[data-prow]")].map((el) => motion(el, ...RISE("0.75rem")));
  const figs = [...pstats.querySelectorAll("[data-pfig]")].map((el) => splitText(el, { by: "letter", stagger: 24, config: CONFIG.FIGURE }));

  forwardGate(section, () => {
    report.play(2 * 130 + 90);
    read.play(2 * 130 + 260);
    meetBrk.play(MEET_DELAY);
    meet.play(MEET_DELAY + 90);
    statsBrk.play(STATS_DELAY);
    rows.forEach((r, i) => {
      const at = STATS_DELAY + i * ROW_STAGGER;
      if (i) rules[i - 1].play(at);
      r.play(at + 40);
      figs[i].play(at + 120);
    });
  });

  /* -------------------------------------------------------- calendar */
  const cal = q("[data-cal]");
  const liveIndex = ROUNDS.findIndex((r) => r.live);
  const links = CALENDAR.links.map((l, i) => {
    const d = document.createElement("div");
    d.className = "cal-link";
    d.style.left = spread(l.x);
    d.style.width = `calc(${px(l.width)} * var(--S))`;
    d.dataset.dir = i < liveIndex ? "1" : "-1";
    cal.append(d);
    return d;
  });
  const cards = ROUNDS.map((r, i) => {
    const c = document.createElement("div");
    c.className = `cal-card${r.live ? " live" : ""}${i < 2 ? " early" : ""}`;
    c.style.left = `calc(${spread(r.x + r.w / 2)} - ${px(r.w / 2)})`;
    c.style.width = `var(--cal-card-w, ${px(r.w)})`;
    c.innerHTML = `<span class="round">${r.round}</span><span class="name">${r.name}</span><span class="date">${r.date}</span>`;
    cal.append(c);
    const m = document.createElement("div");
    m.className = "cal-mark";
    m.style.left = spread(r.x + r.w / 2);
    m.innerHTML = r.mark
      ? `<b>${r.mark}</b>`
      : r.live
        ? `<svg viewBox="0 0 11 11" aria-hidden="true"><circle data-pulse cx="5.5" cy="5.5" r="5.5" fill="none" stroke="var(--accent)" vector-effect="non-scaling-stroke" opacity="0"/><circle cx="5.5" cy="5.5" r="5.5" fill="var(--accent)"/></svg>`
        : `<svg viewBox="0 0 11 11" aria-hidden="true"><circle cx="5.5" cy="5.5" r="5" fill="none" stroke="#fff" vector-effect="non-scaling-stroke"/></svg>`;
    cal.append(m);
    return { c, m, live: r.live };
  });
  const liveBrk = document.createElement("div");
  liveBrk.className = "cal-live-brk";
  cal.append(liveBrk);
  brackets(liveBrk, {
    left: spread(CALENDAR.live.left), right: spread(CALENDAR.live.right),
    top: `calc(${px(CALENDAR.live.top)} + var(--bracket-drop, 0px))`, bottom: `calc(${px(CALENDAR.live.bottom)} + var(--bracket-drop, 0px))`,
    size: "0.6944cqw",
  });
  liveBrk.style.setProperty("--bracket-spread", "var(--bs)");
  const liveCard = cards[liveIndex].c;
  liveCard.addEventListener("mouseenter", () => cal.classList.add("hot"));
  liveCard.addEventListener("mouseleave", () => cal.classList.remove("hot"));

  const linkM = links.map((l) => motion(l, { scaleX: 0 }, { scaleX: 1 }));
  const cardM = cards.map(({ c }) => motion(c, { opacity: 0, y: [0.5, "rem"] }, { opacity: 1, y: [0, "rem"] }));
  const nameM = cards.map(({ c }) => motion(c.querySelector(".name"), { opacity: 0, y: [0.3, "em"] }, { opacity: 1, y: [0, "em"] }, { config: CONFIG.NAME }));
  const markM = cards.map(({ m }) => motion(m, ...FADE, { extra: "translateX(-50%)" }));
  const brkM = motion(liveBrk, ...FADE);
  onceInView(cal, () => {
    linkM.forEach((m, i) => m.play(CARD_DELAY + i * CARD_STAGGER));
    cardM.forEach((m, i) => m.play(CARD_DELAY + i * CARD_STAGGER));
    nameM.forEach((m, i) => m.play(CARD_DELAY + i * CARD_STAGGER + 110));
    markM.forEach((m, i) => m.play(CARD_DELAY + i * CARD_STAGGER + 60));
    brkM.play(CARD_DELAY + 5 * CARD_STAGGER);
  }, "0% 0% -20% 0%");

  const gate = watchInView(section);
  loopClock(CRAWL_MS, gate, (v) => {
    for (const l of links) l.style.backgroundPositionX = `calc(${px(11.45)} * ${v * Number(l.dataset.dir)})`;
  });
  const pulse = cal.querySelector("[data-pulse]");
  if (pulse && !matchMedia("(max-width: 639px)").matches) {
    loopClock(PULSE_MS, gate, (t) => {
      const v = easeOutQuad(t);
      pulse.setAttribute("r", `${5.5 + v * 5.5 * PULSE_REACH}`);
      pulse.setAttribute("opacity", `${0.5 * (1 - v) ** 2}`);
    });
  }
};
