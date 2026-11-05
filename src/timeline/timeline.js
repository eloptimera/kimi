import { CONFIG, RISE, Spring, between, motion, onceInView, scrub, splitText } from "../engine.js";
import { initDissolve, initHeading } from "../shared.js";
import { ASSET_BASE_URL } from "../config.js";
import {
  MARK_SIZE, MARK_SIZE_NARROW, NARROW_UNDER, PARALLAX, RAIL_DASH, RAIL_GAP, RAIL_SOLID,
  RAIL_START, TOP_PAD, px, railHeight, restingPoint,
} from "./geometry.ts";
import { PLATE_CLIP, PLATE_OUTLINE, PLATE_VIEW } from "./plate-shape.ts";
import { reportFailure } from "../engine.js";

const YEAR_RESTING = 0.4;
const YEAR_HOLD = 2200;

export const TIMELINE = [
  { year: "2012", frame: "centre", lead: "The first kart.", rest: "At six, Kimi discovered karting — turning a childhood curiosity into something of his own.", copyWidth: 228, alt: "Kimi in kart overalls in the paddock, aged six" },
  { year: "2015", frame: "side", align: "right", alt: "Kimi holding a karting trophy at sunset" },
  { year: "2019", frame: "centre", lead: "Finding his people.", rest: "Kimi joined the Mercedes Junior Programme, marking his first major step into professional motorsport.", copyWidth: 272, alt: "Kimi signing with the Mercedes junior team" },
  { year: "2021", frame: "side", align: "left", alt: "Kimi beside a single-seater in the garage" },
  { year: "2024", frame: "centre", lead: "The year everything changed.", rest: "Formula 2 brought Kimi closer to F1, while Mercedes confirmed him as their future race driver.", copyWidth: 278, alt: "Kimi walking the pit lane in Mercedes kit" },
  { year: "2025", frame: "side", align: "right", alt: "Kimi in the Mercedes garage" },
  { year: "2026", frame: "centre", lead: "From karts to f1.", rest: "Kimi is now racing at the highest level, with Bologna still his anchor — family, home and life beyond racing.", copyWidth: 284, alt: "The Mercedes-AMG F1 car on track" },
];

let clipId = 0;
const plateMarkup = (entry) => {
  const id = `plate-clip-${clipId++}`;
  return `
    <div class="plate">
      <svg width="0" height="0" style="position:absolute" aria-hidden="true"><clipPath id="${id}" clipPathUnits="objectBoundingBox"><path d="${PLATE_CLIP}"/></clipPath></svg>
      <div class="fill" style="clip-path:url(#${id})"><div class="slot" data-slot>
        <img src="${ASSET_BASE_URL}/timeline/${entry.year}.webp" width="1420" height="1016" alt="${entry.alt}" loading="lazy" decoding="async">
      </div></div>
      <svg viewBox="0 0 ${PLATE_VIEW.width} ${PLATE_VIEW.height}" preserveAspectRatio="none" aria-hidden="true"><path d="${PLATE_OUTLINE}"/></svg>
    </div>`;
};

export const initTimeline = () => {
  const section = document.querySelector("[data-timeline]");
  const wrap = section.querySelector("[data-tl-wrap]");
  initDissolve(section.querySelector("[data-dissolve]"));
  initHeading(section.querySelector("[data-heading]"), section);

  TIMELINE.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = `tl-row ${entry.frame}${entry.align ? ` ${entry.align}` : ""}`;
    const travel = PARALLAX.plate[entry.frame];
    row.innerHTML = `
      <div class="tl-layer"><div class="shift" data-par="${travel}"><div class="tl-plate">${plateMarkup(entry)}</div></div></div>
      <div class="tl-layer tl-year-layer"><div class="shift" data-par="${travel}"><div class="tl-year display" data-year>${entry.year}</div></div></div>
      ${entry.lead ? `<div class="tl-layer"><div class="shift" data-par="${PARALLAX.copy}"><p class="tl-copy" data-copy style="width:min(max(${px(entry.copyWidth)}, var(--copy-min-w, 0px)), var(--copy-max-w, 100vw))"><b>${entry.lead}</b> ${entry.rest}</p></div></div>` : ""}`;
    wrap.append(row);

    const img = row.querySelector("img");
    img.addEventListener("error", () => reportFailure(img.src));

    // three parallax layers, each on `top`, centred on the design position
    const phone = matchMedia("(max-width: 639px)");
    const shifts = [...row.querySelectorAll("[data-par]")];
    scrub(row, {
      start: "top bottom",
      end: "bottom top",
      onProgress: (p) => {
        for (const s of shifts) {
          const t = Number(s.dataset.par);
          s.style.top = phone.matches ? "" : between(px(t), px(-t), p);
        }
      },
    });
    const slot = row.querySelector("[data-slot]");
    scrub(row, { start: "top bottom", end: "top center", onProgress: (p) => (slot.style.top = between("-10%", "0%", p)) });

    // the year: letter by letter, then (centre rows) settles back to 40%
    const yearEl = row.querySelector("[data-year]");
    const year = splitText(yearEl, { by: "letter", stagger: 26, config: CONFIG.YEAR });
    const copyEl = row.querySelector("[data-copy]");
    const copy = copyEl ? motion(copyEl, ...RISE("0.75rem"), { config: CONFIG.COPY }) : null;
    onceInView(row, () => {
      year.play(0);
      copy?.play(220);
      if (entry.frame === "centre") {
        const settle = new Spring(1, { config: CONFIG.YEAR_SETTLE, precision: 0.001, onChange: (v) => (yearEl.style.opacity = `${v}`) });
        settle.to(YEAR_RESTING, { delay: YEAR_HOLD + 26 * entry.year.length });
      }
    }, "0% 0% -25% 0%");

    // hovering one plate dims the rest
    const plate = row.querySelector(".plate");
    if (matchMedia("(hover: hover)").matches) {
      plate.addEventListener("mouseenter", () => { wrap.classList.add("dim"); row.classList.add("hot"); });
      plate.addEventListener("mouseleave", () => { wrap.classList.remove("dim"); row.classList.remove("hot"); });
    }
    void index;
  });

  /* -------------------------------------------------------------- rail */
  const rail = section.querySelector("[data-rail]");
  const total = railHeight(TIMELINE);
  const restShare = restingPoint(TIMELINE);
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("preserveAspectRatio", "xMidYMin meet");
  svg.style.overflow = "visible";
  rail.append(svg);
  let draw = () => {};
  const build = () => {
    const narrow = innerWidth < NARROW_UNDER;
    const origin = narrow ? TOP_PAD - RAIL_START : 0;
    const viewH = total - origin;
    const rest = restShare * total - origin;
    const side = narrow ? MARK_SIZE_NARROW : MARK_SIZE;
    svg.setAttribute("viewBox", `0 0 16 ${viewH}`);
    svg.innerHTML = `
      <line x1="8" x2="8" y1="0" y2="${RAIL_SOLID}" stroke="var(--timeline-rail)" stroke-width="1"/>
      <line x1="8" x2="8" y1="${RAIL_SOLID + RAIL_GAP}" y2="${rest}" stroke="var(--timeline-rail)" stroke-width="1" stroke-dasharray="${RAIL_DASH} ${RAIL_DASH}"/>
      <rect data-run x="7.5" width="1" y="0" height="0" fill="var(--foreground-on-dark)"/>
      <rect data-mark x="${-side / 2}" y="${-side / 2}" width="${side}" height="${side}" fill="var(--foreground-on-dark)"/>`;
    const runEl = svg.querySelector("[data-run]");
    const markEl = svg.querySelector("[data-mark]");
    draw = (p) => {
      const run = p * rest;
      runEl.setAttribute("height", `${run}`);
      markEl.setAttribute("transform", `translate(8 ${run}) rotate(${(run / rest) * 1800})`);
    };
  };
  build();
  let lastP = 0;
  addEventListener("resize", () => { build(); draw(lastP); });
  scrub(rail, { start: "top center", end: "bottom bottom", smooth: true, onProgress: (_r, s) => { lastP = s; draw(s); } });
};
