import { CONFIG, FADE, RISE, between, forwardGate, motion, reportFailure, scrub, splitText } from "../engine.js";
import { initHeading } from "../shared.js";
import { initContours } from "../paddock/paddock.js";
import { px } from "./geometry.ts";

const NAV_DELAY = 260;
const NAV_STAGGER = 80;
const FOOT_DELAY = 640;

export const initFooter = () => {
  const section = document.querySelector("[data-foot]");
  const q = (s) => section.querySelector(s);
  initContours(q("[data-contours]"));
  initHeading(q("[data-heading]"), section);
  section.querySelectorAll("img").forEach((img) => img.addEventListener("error", () => reportFailure(img.src)));

  // The figure rides back into place as the page bottoms out.
  const par = q("[data-foot-parallax]");
  scrub(section, { start: "top bottom", end: "bottom bottom", onProgress: (p) => (par.style.top = between(px(60), "0cqw", p)) });

  const logo = motion(q("[data-foot-logo]"), ...FADE);
  const links = [...section.querySelectorAll("[data-foot-link]")].map((el) =>
    splitText(el, { by: "letter", stagger: 22, config: CONFIG.ROW, gap: "0.2em" }),
  );
  const rows = [...section.querySelectorAll("[data-foot-row]")].map((el) => motion(el, ...RISE("0.75rem")));
  forwardGate(section, () => {
    logo.play(120);
    links.forEach((l, i) => l.play(NAV_DELAY + i * NAV_STAGGER));
    rows.forEach((r, i) => r.play(FOOT_DELAY + i * 80));
  });
};
