window.__kimiBooted = true;
import { reportFailure, startLenis, startStack } from "./engine.js";
import { initHero } from "./hero/hero.js";
import { initSeason } from "./season/season.js";
import { initTimeline } from "./timeline/timeline.js";
import { initPaddock } from "./paddock/paddock.js";
import { initFooter } from "./footer/footer.js";

// Above 1920 the root keeps scaling up.
const scaleRoot = () => {
  document.documentElement.style.fontSize = innerWidth > 1920 ? `${(16 * innerWidth) / 1920}px` : "";
};
scaleRoot();
addEventListener("resize", scaleRoot);

startLenis();

const layers = [...document.querySelectorAll("[data-stack] > .layer")];
startStack(
  layers
    .filter((l) => l.hasAttribute("data-pin"))
    .map((l, i) => ({ inner: l.querySelector(":scope > .inner"), shade: l.querySelector(":scope > .shade"), next: layers[i + 1] })),
);

// Every static <img> reports a failed load.
document.querySelectorAll("img[data-asset]").forEach((img) => {
  if (img.complete && img.naturalWidth === 0 && img.currentSrc) reportFailure(img.src);
  img.addEventListener("error", () => reportFailure(img.src));
});

const run = (name, fn) => {
  try { fn(); } catch (error) { console.error(`[${name}]`, error); }
};
run("hero", initHero);
run("season", initSeason);
run("timeline", initTimeline);
run("paddock", initPaddock);
run("footer", initFooter);
