import { CONFIG, FADE, Spring, forwardGate, motion, scrub, splitText, tokenCss } from "./engine.js";

/* ------------------------------------------------- the chequered dissolve */
const SOLID_UNTIL = 0.16;
const LIFT = 2;
const ACCENT_SHARE = 0.06;
const noise = (x, y) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const clamp01 = (v) => Math.min(1, Math.max(0, v));

export const initDissolve = (canvas) => {
  const carry = canvas.dataset.dissolve;
  const ctx = canvas.getContext("2d");
  let progress = 0;
  const render = () => {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const w = Math.round(width * ratio);
    const h = Math.round(height * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const cell = parseFloat(getComputedStyle(canvas).getPropertyValue("--flag-cell")) || 24;
    const surface = tokenCss(carry === "light" ? "--background" : "--surface-black");
    const accent = tokenCss("--accent");
    const columns = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    const lift = progress * LIFT;
    for (let y = 0; y < rows; y += 1) {
      const depth = y / Math.max(1, rows - 1) + lift;
      if (depth > 1) break;
      const solid = depth <= SOLID_UNTIL;
      const fade = clamp01(1 - (depth - SOLID_UNTIL) / (1 - SOLID_UNTIL));
      if (!solid && fade <= 0) break;
      for (let x = 0; x < columns; x += 1) {
        if (!solid) {
          if ((x + y) % 2 !== 0) continue;
          if (noise(x, y) > fade) continue;
        }
        ctx.fillStyle = !solid && noise(x + 101, y + 57) < ACCENT_SHARE ? accent : surface;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  };
  scrub(canvas, {
    start: "top bottom",
    end: "top top",
    smooth: true,
    onProgress: (_raw, smoothed) => {
      progress = smoothed;
      render();
    },
  });
  new ResizeObserver(render).observe(canvas);
};

/* ----------------------------------------------------- block mastheads */
/** Two authored lines, word reveals at index*130, the full stop at 130+110. */
export const initHeading = (el, gateEl = el) => {
  const lines = [...el.querySelectorAll("[data-line]")].map((line) =>
    splitText(line, { by: "word", stagger: 110, config: CONFIG.REVEAL }),
  );
  const stop = el.querySelector("[data-stop]");
  const stopM = stop ? motion(stop, ...FADE) : null;
  forwardGate(gateEl, () => {
    lines.forEach((l, i) => l.play(i * 130));
    stopM?.play(130 + 110);
  }, () => {
    lines.forEach((l) => l.reverse());
    stopM?.reverse();
  });
};

/* ------------------------------------------------ contour backdrop (2D) */
const LINE_SCALE = 3.8, LINE_COUNT = 2.5, WAVE_AMOUNT = 0.37, WAVE_SPEED = 1.66, LINE_OPACITY = 0.85;
const CELLS = 96;
const field = (x, y, t) => {
  let f = Math.sin(x * 1.0 + t * 0.6) * 0.5;
  f += Math.sin(y * 0.85 - t * 0.45) * 0.45;
  f += Math.sin((x + y) * 0.65 + t * 0.35) * 0.35;
  f += Math.sin((x - y) * 0.95 - t * 0.55) * 0.25;
  return f * 0.5 + 0.5;
};

export const drawContours = (context, width, height, t, colour) => {
  const cols = width >= height ? CELLS : Math.max(8, Math.round((CELLS * width) / height));
  const rows = Math.max(8, Math.round((cols * height) / width));
  const stepX = width / cols, stepY = height / rows, aspect = width / height;
  const values = new Float32Array((cols + 1) * (rows + 1));
  for (let j = 0; j <= rows; j += 1) for (let i = 0; i <= cols; i += 1) {
    const nx = ((i / cols) * 2 - 1) * aspect * LINE_SCALE;
    const ny = ((j / rows) * 2 - 1) * LINE_SCALE;
    const qx = nx + Math.sin(ny * 0.8 + t * 0.7) * WAVE_AMOUNT;
    const qy = ny + Math.cos(nx * 0.7 - t * 0.6) * WAVE_AMOUNT;
    values[j * (cols + 1) + i] = field(qx, qy, t) * LINE_COUNT;
  }
  context.strokeStyle = colour;
  context.lineWidth = 1; context.globalAlpha = LINE_OPACITY; context.beginPath();
  for (let level = 0.5; level < LINE_COUNT; level += 1)
    for (let j = 0; j < rows; j += 1) for (let i = 0; i < cols; i += 1) {
      const a = values[j * (cols + 1) + i], b = values[j * (cols + 1) + i + 1];
      const c = values[(j + 1) * (cols + 1) + i + 1], d = values[(j + 1) * (cols + 1) + i];
      const index = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      if (index === 0 || index === 15) continue;
      const x0 = i * stepX, y0 = j * stepY;
      const top = [x0 + stepX * ((level - a) / (b - a)), y0];
      const right = [x0 + stepX, y0 + stepY * ((level - b) / (c - b))];
      const bottom = [x0 + stepX * ((level - d) / (c - d)), y0 + stepY];
      const left = [x0, y0 + stepY * ((level - a) / (d - a))];
      const segment = (p, q) => { context.moveTo(p[0], p[1]); context.lineTo(q[0], q[1]); };
      switch (index) {
        case 1: case 14: segment(left, bottom); break;
        case 2: case 13: segment(bottom, right); break;
        case 3: case 12: segment(left, right); break;
        case 4: case 11: segment(top, right); break;
        case 6: case 9: segment(top, bottom); break;
        case 7: case 8: segment(left, top); break;
        case 5: segment(left, top); segment(bottom, right); break;
        case 10: segment(left, bottom); segment(top, right); break;
      }
    }
  context.stroke(); context.globalAlpha = 1;
};

export { Spring };
