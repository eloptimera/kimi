// Bundles src/ into one self-contained index.html. three and lenis stay
// external and resolve through the import map, as the spec requires.
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
mkdirSync("dist", { recursive: true });

const local = process.argv.includes("--local");
const ASSET = "https://storage.getlayers.ai/assets/kimi-04a9449ab2";
const result = await build({
  entryPoints: ["src/main.js"],
  bundle: true,
  format: "esm",
  target: "es2022",
  write: false,
  external: ["three", "three/addons/*", "lenis"],
  legalComments: "none",
});
let js = result.outputFiles[0].text.replaceAll("</script", "<\\/script");
const css = readFileSync("src/tokens.css", "utf8") + "\n" + readFileSync("src/site.css", "utf8");
const body = readFileSync("src/body.html", "utf8").replaceAll("{{A}}", ASSET);
const map = local
  ? { three: "/vendor/three/build/three.module.js", "three/addons/": "/vendor/three/examples/jsm/", lenis: "/vendor/lenis/dist/lenis.mjs" }
  : {
      three: "https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.185.0/examples/jsm/",
      lenis: "https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.mjs",
    };
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KIMI — GRIDO1 Racing Systems / Kimi Antonelli</title>
<meta name="description" content="Kimi Antonelli, driver_012 of GRIDO1 Racing Systems — rookie season 2026 with the Mercedes-AMG F1 Team.">
<script>history.scrollRestoration = "manual"; window.scrollTo(0, 0);</script>
<script type="importmap">
${JSON.stringify({ imports: map }, null, 2)}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
${body}
<script>
// If the module never boots (CDN for three/lenis unreachable), lift the veil and say so.
setTimeout(function () {
  if (window.__kimiBooted) return;
  var v = document.querySelector("[data-veil]"); if (v) v.remove();
  var f = document.querySelector("[data-hero-fallback]"); if (f) f.style.display = "block";
  var b = document.createElement("div"); b.id = "asset-errors"; b.setAttribute("role", "alert");
  b.textContent = "Failed to load the page scripts (three.js / Lenis from cdn.jsdelivr.net).";
  document.body.appendChild(b);
  document.documentElement.classList.add("boot-failed");
}, 8000);
</script>
<script type="module">
${js}
</script>
</body>
</html>
`;
const out = local ? html.replaceAll(ASSET, "/assets") : html;
writeFileSync(local ? "dist/local.html" : "index.html", out);
console.log(local ? "dist/local.html" : "index.html", (html.length / 1024).toFixed(0) + " KB");
