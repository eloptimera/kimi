import { ACESFilmicToneMapping, Box3, BufferGeometry, Color, FrontSide, Group, LinearMipmapLinearFilter, Matrix4, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PMREMGenerator, RepeatWrapping, Scene, ShaderMaterial, SRGBColorSpace, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer } from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { getSceneTier, type SceneTier } from "./tier";
import { ASSET_BASE_URL, DRACO_PATH } from "../config";
const ASSETS = ASSET_BASE_URL + "/hero/scene";

/**
 * Resolves a Tier-2 design token to a concrete colour. A custom property read
 * straight off `:root` can still be an unsubstituted `var()` chain, so the
 * value is bounced through a probe element's computed `color` instead.
 */
const readToken = (token: string): string => {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${token})`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
};

/** World height of the head plane — everything else is sized relative to it. */
const HEAD_HEIGHT = 5.4;

const DEG = Math.PI / 180;

/**
 * The helmet's cursor rotation, one axis at a time: the angle it reaches when
 * the cursor is at the **edge of the window** (`ampDeg`, signed — the sign is
 * the direction), and how it gets there (`curve`).
 *
 * The amplitude is the whole instrument. Until 2026-09-08 each axis was a gain
 * on the pointer, and the pitch had a cap on its *input* on top (`helmetRotX`
 * × `tiltLimit`); the angle a reader actually saw was the product of the two,
 * in radians of input, and the yaw had no ceiling at all. Nobody could say
 * how far the helmet turned without doing the sum, and once the gain sat at
 * its slider's floor there was no way to ask for more. Now the slider *is*
 * the answer: the degrees at the edge of the sweep, per axis.
 *
 * `curve` is the shape between the centre and that edge, and it is
 * **normalised** — `tanh(curve·v) / tanh(curve)` — so it reaches exactly the
 * amplitude at `|v| = 1` whatever its value: 0 is a straight line, higher
 * saturates earlier, which keeps the response steep through the middle of the
 * frame (where a reader's pointer actually lives) and eases it off toward the
 * edges. `tanh` rather than a clamp because a clamp leaves a corner where the
 * turn stops dead, and that corner sits exactly where a cursor crossing the
 * frame is moving fastest — the helmet would visibly freeze mid-sweep and then
 * start again. This has no such point: the response only ever thins.
 *
 * Sizing the pitch needs the crown's **on-screen** travel, which is not the
 * obvious number. Tilting about a horizontal axis moves the crown almost
 * entirely in **z**: `y' = h·cos(theta)` changes only in theta squared, while
 * `z' = h·sin(theta)` is first-order. So `h·sin(theta)` — the tempting figure —
 * is the crown's *depth* swing, and what a reader sees is the much smaller
 * second-order drop plus what perspective makes of the depth. Measured
 * properly (project the crown through the real camera), visible travel across
 * a full cursor sweep at 1440x900 comes to about **2.4px per degree** of
 * amplitude, near enough linear over the range the slider offers: 4.4° is
 * 10.7px, 7.2° is 17.5px, 8.6° is 20.9px. For scale, `subjectParallax` moves
 * the whole composition 8.8px over that same sweep.
 */
const swing = (v: number, ampDeg: number, curve: number) => {
  const amp = ampDeg * DEG;
  if (curve < 1e-3) return amp * v;
  return (amp * Math.tanh(curve * v)) / Math.tanh(curve);
};

/**
 * Where the helmet's own centre sits once it is worn, relative to the group
 * that carries the composition's placement. Dropped so the visor opening
 * frames the eyes (photo eye-line ~ y -0.4) and pushed forward so it sits in
 * front of the portrait plane rather than through it.
 */
const HELMET_WORN_OFFSET = new Vector3(0, -0.56, 0.35);

/**
 * Extra plane height added below the portrait, as a fraction of HEAD_HEIGHT.
 *
 * The framing puts the plane's bottom edge ~14px above the viewport bottom,
 * which showed as a white strip under the suit. The plane is grown downwards
 * and the extra band samples the texture's clamped bottom row — which is a
 * near-uniform dark suit spanning most of the width, so it reads as the suit
 * running off the frame exactly as the design has it. Growing the *subject*
 * instead would have re-broken the framing the owner just signed off.
 */
const HEAD_EXTEND = 0.14;


/**
 * Where the cursor is assumed to be when there is none (touch, reduced
 * motion). Screen space, y down — it resolves to the right half of the face.
 */
const STATIC_POSE = { x: 0.3, y: 0.1 };

/**
 * Camera constants, exported because the subject's on-screen size is a
 * function of them and of the canvas height — anything outside the scene that
 * wants to keep the subject a fixed pixel size while the canvas is resized has
 * to do that arithmetic. See `fitSubjectToBox`.
 */
export const CAMERA_FOV = 35;
export const CAMERA_Y = 0.1;

/**
 * World-space height visible at the subject's depth. The camera's vertical
 * field of view is fixed, so this — not the canvas width — is what a pixel is
 * measured against.
 */
export const visibleWorldHeight = (cameraZ: number) =>
  2 * cameraZ * Math.tan((CAMERA_FOV * Math.PI) / 360);

/**
 * Keeps the subject at the size and place a *box* would have given it, while
 * the canvas itself is some other size — which is how the backdrop can be
 * stretched over the whole block without the portrait growing with it.
 *
 * The subject scales about its own origin and the world-to-pixel factor is
 * proportional to canvas height, so the size term is the plain ratio of the
 * two heights. The position term is the box's centre moving relative to the
 * canvas's, converted back into world units.
 *
 * With `box` equal to the canvas both terms collapse to identity, so a
 * full-bleed scene is unaffected.
 */
export const fitSubjectToBox = (
  params: Pick<HeroSceneParams, "subjectScale" | "subjectY" | "cameraZ">,
  box: { top: number; height: number },
  canvasHeight: number,
): Pick<HeroSceneParams, "subjectScale" | "subjectY"> => {
  if (canvasHeight <= 0 || box.height <= 0) {
    return { subjectScale: params.subjectScale, subjectY: params.subjectY };
  }
  const ratio = box.height / canvasHeight;
  const world = visibleWorldHeight(params.cameraZ);
  const centreShift = canvasHeight / 2 - (box.top + box.height / 2);
  return {
    subjectScale: params.subjectScale * ratio,
    subjectY:
      CAMERA_Y +
      (params.subjectY - CAMERA_Y) * ratio +
      (centreShift * world) / canvasHeight,
  };
};

/**
 * How many recent pointer samples a reveal trail is built from — chosen per
 * tier (`SceneTier.trailSamples`), not fixed, because it is the loop bound of
 * a per-fragment mask evaluated over a full-screen plane twice per frame. A
 * phone runs a little over a third of the desktop count.
 *
 * The history lives on the CPU and is passed as a uniform array rather than
 * accumulated in a ping-pong render target. A target that main-scene
 * materials sample can still be bound to a texture unit when the next frame
 * renders into it, which ANGLE reports as a framebuffer feedback loop and
 * then drops the draw — the whole scene goes blank. Sampling an array costs
 * one extra pass less and cannot feed back at all.
 *
 * Because it sizes a uniform array and a loop bound, it must be baked into
 * the shader source at construction; it cannot become a uniform.
 */

/**
 * Ceiling on outline waves in flight at once. The loop breaks as soon as a
 * spawn is older than its period, so this only bounds the shader — the real
 * count is `outlinePeriod / outlineStagger`.
 */
const OUTLINE_MAX_WAVES = 8;

/** Depth of the backdrop plane — behind everything the subject group holds. */
const BACKDROP_Z = -3;

/**
 * The figure is measured against the **shape of the window**, not its width.
 *
 * The copy is laid out in shares of the width — the masthead always ends at
 * 31.2% and the socials always start at 82.7%, at every size. The figure is
 * world units against a camera with a fixed vertical field of view, so its
 * size is tied to the *height*. Their ratio is therefore governed by the
 * window's aspect and by nothing else: 1280x800 and 1440x900 are the same
 * 1.600 and render identically, while a 1440x1080 window at 1.333 puts a
 * figure 20% larger against exactly the same text.
 *
 * `REFERENCE_ASPECT` is the shape the block is signed off at — a 1440-wide
 * window on a 16:9 display, once browser chrome is taken off. Anything
 * squarer than that gets the figure scaled back to the share of the width it
 * has there, which is what re-opens the masthead's column.
 *
 * Above `PORT_WIDTH` this does nothing at all, by construction: that frame is
 * finished and is not to be touched.
 */
const REFERENCE_ASPECT = 1.778;
const PORT_WIDTH = 1440;
/**
 * How far the figure is ever allowed to shrink. A squarer window keeps making
 * it larger against the copy without limit, and at 1024x768 the unclamped
 * ratio took it to 0.75 — small enough that the subject stopped being the
 * subject. 0.9 is exactly what 1280x800 already resolves to, so clamping here
 * cannot move that width.
 */
const MIN_FIT = 0.9;
/**
 * How far the figure steps right below `PORT_WIDTH`, in world units.
 *
 * Only there. At 1280 and up the masthead is set in the block's own scale and
 * clears the head on its own; below that the root font size is pinned at 16
 * and the name keeps growing against a viewport that is not, until
 * "antonelli" runs into the hair. A step of about 50 screen pixels opens that
 * back up without reaching the panels on the right, which start at 1190 of
 * the frame.
 */
const NARROW_STEP = 0.25;
/**
 * The width the step starts under. **Not** `PORT_WIDTH`: 1280 is signed off
 * and must not move, so the step begins strictly below it.
 */
const STEP_UNDER = 1280;

/**
 * Waypoints of the idle sweep, in pointer space (x −1…1, y −1…1 with y down).
 *
 * Four points, so three strokes: right, back left, right again, each one
 * descending. It is deliberately a path rather than an orbit — the effect
 * reads as somebody dragging the cursor across the face, which is exactly the
 * gesture the reveal was built to respond to. A circle would betray itself as
 * a machine immediately.
 */
const AUTO_SWEEP_PATH = [
  { x: -0.85, y: -0.62 },
  { x: 0.78, y: -0.2 },
  { x: -0.7, y: 0.2 },
  { x: 0.82, y: 0.6 },
] as const;

/**
 * One reveal-mask evaluation, emitted once per trail.
 *
 * There are two independent trails — the cursor and the idle sweep — and they
 * must be able to run at the same time, so each needs its own history, bounds
 * and pace. GLSL ES cannot take a uniform array as a function parameter, so
 * the body is generated per trail instead of branching inside one copy.
 */
const revealTrailFunction = (
  name: string,
  trail: string,
  boundsMin: string,
  boundsMax: string,
  pace: string,
  warp: string,
  length: string,
  radius: string,
  samples: number,
) => /* glsl */ `
  float ${name}(vec2 ndc) {
    // Cheapest rejection first. Below the gate this trail contributes nothing
    // at all, so skipping here removes the entire loop for whichever trail is
    // resting — which, for the cursor, is most of the time.
    float gate = smoothstep(uGateStart, uGateStart + uGateWidth, ${pace});
    if (gate <= 0.0) return 0.0;

    // Then reject anything outside this trail's bounding box. The backdrop is
    // full-screen, so without this the mask would run its loop over every
    // pixel of the frame; a trail only ever covers a small part of it. The
    // bounds already carry the brush radius and the warp's reach as margin.
    vec2 bounded = vec2(ndc.x * uAspect, ndc.y);
    if (any(lessThan(bounded, ${boundsMin})) || any(greaterThan(bounded, ${boundsMax}))) {
      return 0.0;
    }

    // Displace the point being measured, not the result. Warping the sample
    // position bends the whole shape — so a parked cursor still shows a blob
    // that kneads itself rather than a perfect disc — whereas nudging the
    // final value only shifts the threshold and leaves the silhouette round.
    //
    // Branched, because the two texture fetches are the expensive part and a
    // trail with no warp should not pay for them at all.
    vec2 point = bounded;
    if (${warp} > 0.001) {
      vec2 noiseUv = ndc * 0.5 + 0.5;
      float nx = texture2D(uNoiseTex, noiseUv * uWarpScale + vec2(uTime * 0.07, uTime * 0.05)).r;
      float ny = texture2D(uNoiseTex, noiseUv * uWarpScale * 1.4 - vec2(uTime * 0.06, uTime * 0.09)).r;
      point += (vec2(nx, ny) - 0.5) * ${warp} * 0.22;
    }

    // Speed drives the shape: barely moving gives a small tight blob, a fast
    // sweep widens the brush and flattens the age falloff so the whole path
    // stays above threshold as one long trail.
    float radius = ${radius} * mix(uIdleScale, 1.0, ${pace});
    float taper = uTaper * mix(uTaperIdle, uTaperFast, ${pace});

    // Sweep a capsule along every link of the recent path and keep the
    // strongest. Linking successive samples — rather than stamping a dot per
    // sample — is what keeps the stroke unbroken when the point being tracked
    // outruns the frame rate.
    float span = max(${length} * float(${samples} - 1), 1.0);
    float ceiling = uThreshold + uEdge;
    float trail = 0.0;
    for (int i = 0; i < ${samples} - 1; i++) {
      // Links past this trail's length contribute nothing, so stop rather than
      // multiplying by zero — this is what keeps a long history affordable.
      if (float(i) >= span) break;
      float weight = pow(1.0 - float(i) / span, taper);

      // Two exact early exits. Neither changes a pixel; both cut the common
      // case hard, which matters because this loop now runs twice per
      // fragment over a full-screen plane.
      //
      // 1. A link's contribution is weight * smoothstep(...), and smoothstep
      //    tops out at 1 — so weight is its ceiling. weight decreases
      //    monotonically with age, so once it drops to what we already have,
      //    no remaining link can beat it. This fires almost immediately in
      //    the solid core of a stroke.
      if (weight <= trail) break;

      vec2 a = vec2(${trail}[i].x * uAspect, ${trail}[i].y);
      vec2 b = vec2(${trail}[i + 1].x * uAspect, ${trail}[i + 1].y);
      float r = radius * weight;
      trail = max(trail, weight * smoothstep(r, r * 0.35, revealSegment(point, a, b)));

      // 2. Past the upper threshold edge the final smoothstep saturates, so
      //    a larger trail value is indistinguishable from this one.
      if (trail >= ceiling) break;
    }

    return smoothstep(uThreshold - uEdge, uThreshold + uEdge, trail) * gate;
  }
`;

/**
 * Uniform block + helpers for the reveal, shared verbatim by the helmet
 * materials and the backdrop plane.
 *
 * Sharing the *source* is the requirement, not just the uniforms: the mask is
 * evaluated from clip-space NDC, so the same code on two different meshes
 * resolves to the same shape for the same screen pixel. That is what lets the
 * grey backdrop reveal meet the helmet reveal exactly at the silhouette
 * instead of the two drifting apart at their edges.
 *
 * `revealTrail` is the union of the two trails, so a cursor stroke and an idle
 * sweep can be open at once and simply overlap.
 */
const buildRevealDeclarations = (samples: number) => /* glsl */ `
  uniform vec2 uTrail[${samples}];
  uniform vec2 uTrailMin;
  uniform vec2 uTrailMax;
  uniform float uPace;
  uniform vec2 uSweep[${samples}];
  uniform vec2 uSweepMin;
  uniform vec2 uSweepMax;
  uniform float uSweepPace;
  uniform float uSweepWarp;
  uniform float uSweepLength;
  uniform float uSweepRadius;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uIdleScale;
  uniform float uTaper;
  uniform float uTaperIdle;
  uniform float uTaperFast;
  uniform float uLength;
  uniform float uGateStart;
  uniform float uGateWidth;
  uniform float uWarpScale;
  uniform float uTime;
  uniform float uEdge;
  uniform float uThreshold;
  uniform float uWarp;
  uniform float uRevealMix;
  uniform sampler2D uNoiseTex;

  /** Distance from p to the segment a-b — one link of a trail. */
  float revealSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
  }

  ${revealTrailFunction("revealCursorTrail", "uTrail", "uTrailMin", "uTrailMax", "uPace", "uWarp", "uLength", "uRadius", samples)}
  ${revealTrailFunction("revealSweepTrail", "uSweep", "uSweepMin", "uSweepMax", "uSweepPace", "uSweepWarp", "uSweepLength", "uSweepRadius", samples)}

  float revealTrail(vec2 ndc) {
    // Short-circuit rather than max(): where the cursor already reveals fully
    // the sweep cannot add anything, so its whole loop is skipped. Exactly the
    // region where both trails overlap — which is the case that was costing.
    float cursor = revealCursorTrail(ndc);
    if (cursor >= 1.0) return 1.0;
    return max(cursor, revealSweepTrail(ndc));
  }
`;

/**
 * Every knob of the effect, one named constant each.
 * Defaults are the shipped look.
 */
export interface HeroSceneParams {
  cameraZ: number;
  /** Uniform scale of the head + helmet pair, about the world origin. */
  subjectScale: number;
  /** Vertical placement of that pair, so it frames like the Figma hero. */
  /**
   * Horizontal placement of the whole subject, in world units. 0 puts the
   * head plane on the camera axis — dead centre of the canvas. The pose in
   * the photograph is not symmetric, so the optical centre can sit a little
   * off the geometric one; this is the lever for that.
   */
  subjectX: number;
  subjectY: number;
  /**
   * How far the composition rises into place on load, in **CSS pixels** — a
   * screen-space distance, so it reads the same on any viewport rather than
   * scaling with the world. Converted against the frustum each frame.
   */
  riseDistance: number;
  /** Seconds the rise takes, easing out to a stop. */
  riseDuration: number;
  /**
   * How far the whole composition — portrait and helmet together — slides
   * with the cursor. Distinct from `headParallax`, which shifts the
   * portrait's UVs against its own depth map, and from `helmetFollow`, which
   * moves only the helmet. This one moves the pair bodily.
   */
  subjectParallax: number;
  headScale: number;
  headY: number;
  headParallax: number;
  /** Strength of the cursor-driven relight read off the portrait's normals. */
  headRelight: number;
  helmetScale: number;
  helmetX: number;
  helmetY: number;
  helmetZ: number;
  helmetFollow: number;
  /**
   * Pitch — the turn about x — the helmet reaches with the cursor at the top
   * or bottom edge of the window, in **degrees**. Signed: negative looks up
   * as the cursor goes down. See `swing`.
   */
  helmetAmpX: number;
  /** Shape of the pitch between centre and edge: 0 linear, higher steeper. */
  helmetCurveX: number;
  /** Yaw — the turn about y — at the left or right edge, in degrees. */
  helmetAmpY: number;
  helmetCurveY: number;
  /** Brightness multiplier on the helmet shell's baked base colour. */
  helmetBrightness: number;
  /** Brush size of the cursor trail that masks the helmet in. */
  trailRadius: number;
  /** Fraction of `trailRadius` the brush shrinks to at rest. */
  trailIdleScale: number;
  /** Base taper exponent — higher thins the tail faster. */
  trailTaper: number;
  /** Taper multiplier at rest (short tail → a blob). */
  trailTaperIdle: number;
  /** Taper multiplier at full pace (long tail → a streak). */
  trailTaperFast: number;
  /** Fraction of the sample history that contributes, 0–1. */
  trailLength: number;
  /** Trail value at which the helmet becomes solid. */
  revealThreshold: number;
  revealEdge: number;
  /** How far the noise displaces the sample point — the blob's wobble. */
  revealWarp: number;
  /** Frequency of that noise; higher is a finer, busier edge. */
  revealWarpScale: number;
  revealSpeed: number;
  pointerLerp: number;
  /** Pointer speed (NDC/frame) counted as fully "fast". */
  pacePeak: number;
  /** Easing toward a rising pace — the trail swelling. */
  paceAttack: number;
  /** Easing toward a falling pace — the trail draining. */
  paceRelease: number;
  /** Pace below which nothing is revealed at all. */
  paceThreshold: number;
  /** Pace range over which the reveal fades up past that threshold. */
  paceRamp: number;
  /** Seconds for one crown-to-chin pass of a single outline wave. */
  outlinePeriod: number;
  /**
   * The idle sweep's own warp and history length, kept separate from the
   * cursor's. It runs unattended and constantly, so it is the trail worth
   * making cheap — and nobody is watching its edge closely enough to miss
   * the detail. 0 warp skips two texture fetches per fragment outright.
   */
  sweepWarp: number;
  sweepLength: number;
  /** Brush size of the idle sweep, independent of the cursor's. */
  sweepRadius: number;
  /** Seconds between wave starts. Below `outlinePeriod`, waves overlap. */
  outlineStagger: number;
  /** Peak opacity at the centre of the wave. */
  outlineOpacity: number;
  /** Thickness of the wave, as a fraction of the helmet's height. */
  outlineWidth: number;
  /** Opacity of the wireframe outside the wave — 0 keeps the helmet hidden. */
  outlineBase: number;
  /** Lifts the outline from the foreground token toward white. 0 = token. */
  outlineLightness: number;
  /** Spatial frequency of the backdrop contours. */
  bgLineScale: number;
  /** How many contour bands the noise field is sliced into. */
  bgLineCount: number;
  /** Stroke width of each contour, in screen-derivative units. */
  bgLineThickness: number;
  bgLineOpacity: number;
  /** Amplitude of the rolling wave displacement. */
  bgWaveAmount: number;
  bgWaveSpeed: number;
  /** Grey level of the backdrop half of the reveal. 0 = black, 1 = white. */
  bgRevealLightness: number;
  /** The alternate grey, used in every other band between the lines. */
  bgRevealLightnessAlt: number;
  bgRevealOpacity: number;
  /** Seconds the entrance takes, from prewarmed scene to cursor control. */
  introDuration: number;
  /** Point in the entrance (0–1) where the helmet starts burning away. */
  burnStart: number;
  /** Width of the burn's dissolve front. */
  burnSoftness: number;
  /** Brightness of the glowing edge that leads the burn. */
  burnGlow: number;
  /** Extent of the idle sweep's path. 0 turns the whole thing off. */
  autoSweepAmount: number;
  /** Seconds between the start of one idle sweep and the next. */
  autoSweepPeriod: number;
  /** Seconds one stroke takes to travel its leg. */
  autoSweepStroke: number;
  /** Seconds held still between strokes. */
  autoSweepHold: number;
}

/** The shipped look — the shipped look, tuned by the owner
 *  (2026-08-04) and pasted back here via "copy values". */
export const DEFAULT_PARAMS: HeroSceneParams = {
  cameraZ: 6.5,
  subjectScale: 1.15,
  // The photograph is not symmetric: the head sits ~43px left of the 2048px
  // texture's centre while the shoulders sit ~14px right of it, so the figure
  // reads as leaning left. 0.09 world units (~19px at an 800px-tall canvas)
  // puts the head back on the axis.
  subjectX: 0,
  subjectY: 0.42,
  subjectParallax: 0.02,
  riseDistance: 200,
  riseDuration: 2,
  headScale: 0.8,
  headY: 0.58,
  headParallax: 0.005,
  headRelight: 0.32,
  helmetScale: 0.69,
  helmetX: -0.08,
  helmetY: 0.45,
  helmetZ: 0,
  helmetFollow: 0.01,
  // The owner's pass on the degree sliders (2026-09-08, second tune of the
  // day): a small, **linear** turn on both axes, and the pitch now goes *with*
  // the cursor — positive looks down as the cursor goes down. Before it, the
  // shipped tilt was −8.6° at curve 6.67 (the old `−1 × 0.15 rad` restated),
  // steep through the middle and held at the ends; that read as too much
  // helmet, and once the angle was a number on a slider the owner took it to
  // a fraction. About 6px of crown travel across a full sweep at 1440×900 —
  // under the whole composition's own `subjectParallax`, which is the point:
  // the helmet is worn, it is not looking around.
  helmetAmpX: 2.5,
  helmetCurveX: 0,
  helmetAmpY: 2.1,
  helmetCurveY: 0,
  helmetBrightness: 1,
  trailRadius: 0.46,
  trailIdleScale: 0.28,
  trailTaper: 1.9,
  trailTaperIdle: 1.6,
  trailTaperFast: 1.25,
  trailLength: 0.64,
  revealThreshold: 0.08,
  revealEdge: 0.005,
  revealWarp: 1.29,
  revealWarpScale: 2.9,
  revealSpeed: 1.25,
  pointerLerp: 0.17,
  pacePeak: 0.029,
  paceAttack: 0.09,
  paceRelease: 0.205,
  paceThreshold: 0.06,
  paceRamp: 0.15,
  outlinePeriod: 3.1,
  sweepWarp: 0.86,
  sweepLength: 0.67,
  sweepRadius: 0.33,
  outlineStagger: 1.2,
  outlineOpacity: 0.09,
  outlineWidth: 0.15,
  outlineBase: 0,
  outlineLightness: 0.64,
  bgLineScale: 3.8,
  // 1 slices the noise field into a single band, so the backdrop draws one
  // sparse iso-line rather than a dense contour map.
  bgLineCount: 2.5,
  bgLineThickness: 1.4,
  bgLineOpacity: 0.85,
  bgWaveAmount: 0.37,
  bgWaveSpeed: 1.66,
  // Linear, so the sRGB encode lands this near mid grey — close to the lit
  // helmet's on-screen value, which is what makes the two halves read as one.
  bgRevealLightness: 0.62,
  bgRevealLightnessAlt: 0.44,
  bgRevealOpacity: 1,
  introDuration: 4,
  burnStart: 0.14,
  burnSoftness: 0.02,
  burnGlow: 4,
  // **Off.** The idle sweep is a second, synthetic cursor that runs on its own
  // cycle whether or not anyone is pointing at the scene, so the helmet kept
  // revealing itself with the mouse nowhere near it. The reveal is a hover
  // effect and nothing else. The slider still brings it back — 0.76 was the
  // tuned extent, if it is ever wanted.
  autoSweepAmount: 0,
  autoSweepPeriod: 5,
  autoSweepStroke: 0.45,
  autoSweepHold: 0,
};

/**
 * Wireframe wave over the helmet's own geometry. The helmet is invisible by
 * default; a soft band travels crown-to-chin once per `uPeriod` and is the
 * only thing that ever draws it, so the shape fades up as the wave arrives
 * and fades out behind it.
 *
 * The band is a gaussian, not the reference's `pow(fract(...), 4.)`. That
 * form is a repeating sawtooth: it snaps from full to nothing at the wrap,
 * which reads as a hard scan line rather than a wave. Centring a gaussian and
 * starting it *above* the crown / ending it *below* the chin means the only
 * fade in and out are the wave's own tails — no discontinuity to hide.
 *
 * `uMinY`/`uRangeY` normalise local Y from the merged geometry's bounds, so
 * one wave spans the helmet regardless of the model's own scale.
 */
const outlineVertex = /* glsl */ `
  varying float vHeight;
  uniform float uMinY;
  uniform float uRangeY;
  void main() {
    vHeight = (position.y - uMinY) / max(uRangeY, 0.0001);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const outlineFragment = /* glsl */ `
  varying float vHeight;
  uniform float uTime;
  uniform float uPeriod;
  uniform float uStagger;
  uniform float uOpacity;
  uniform float uBase;
  uniform float uWidth;
  uniform float uLightness;
  uniform float uRevealMix;
  uniform vec3 uColor;

  void main() {
    float width = max(uWidth, 0.0001);
    float period = max(uPeriod, 0.0001);
    float stagger = max(uStagger, 0.0001);

    // Enter three widths above the crown, leave three below the chin, so a
    // wave is fully faded at both ends of its travel.
    float start = 1.0 + width * 3.0;
    float travel = 1.0 + width * 6.0;

    // A wave is *spawned* every uStagger seconds and lives uPeriod seconds,
    // so several are in flight at once whenever stagger < period — that is
    // the wave train. Walking back from the most recent spawn means the loop
    // costs only as many iterations as there are live waves; set stagger >=
    // period and it collapses to the single-wave behaviour.
    float wave = 0.0;
    for (int i = 0; i < ${OUTLINE_MAX_WAVES}; i++) {
      float age = mod(uTime, stagger) + float(i) * stagger;
      if (age > period) break;
      float centre = start - (age / period) * travel;
      float d = (vHeight - centre) / width;
      // max, not sum: waves all travel the same way at the same speed so they
      // never actually meet, and summing would blow out if they ever did.
      wave = max(wave, exp(-d * d));
    }

    // Lift off the foreground token toward white, so the token stays the
    // source of the colour and this is only a tuning offset from it.
    vec3 stroke = mix(uColor, vec3(1.0), uLightness);
    gl_FragColor = vec4(stroke, (uBase + wave * uOpacity) * uRevealMix);
  }
`;

/**
 * The backdrop: animated contour lines, plus the grey half of the cursor
 * reveal.
 *
 * Both live on one plane behind the subject because they are one surface. The
 * reveal here calls the same `revealTrail` the helmet does, so where the
 * cursor crosses the silhouette the grey shape and the helmet shape are the
 * same shape — the helmet simply occludes its half. Drawing the grey on a
 * separate quad with its own maths would leave a seam at every edge.
 *
 * The lines are procedural rather than the Figma backdrop SVG: that asset is
 * a flat vector sitting behind an opaque canvas, so it was never visible on
 * desktop, and rasterising it would make "thicker" a dilate and "wavier" a
 * per-frame re-render. Contours of a scrolling noise field give thickness and
 * motion as two uniforms, and read as the same organic curves.
 */
const backdropVertex = /* glsl */ `
  varying vec4 vBackdropClip;
  void main() {
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vBackdropClip = clip;
    gl_Position = clip;
  }
`;

const buildBackdropFragment = (samples: number) => /* glsl */ `
  varying vec4 vBackdropClip;
  uniform vec3 uBackground;
  uniform vec3 uLineColor;
  uniform vec3 uRevealColor;
  uniform vec3 uRevealColorAlt;
  uniform float uLineScale;
  uniform float uLineCount;
  uniform float uLineThickness;
  uniform float uLineOpacity;
  uniform float uWaveAmount;
  uniform float uWaveSpeed;
  uniform float uRevealOpacity;
  ${buildRevealDeclarations(samples)}

  /**
   * Smooth analytic field the contours are sliced from.
   *
   * Four sines at incommensurate frequencies, two of them diagonal. This
   * replaced a noise-texture lookup: the texture is low-resolution and
   * tiling, so its contours came out ragged and broken up — "messy". An
   * analytic field is continuous everywhere and infinitely magnifiable, so
   * every iso-line is one unbroken solid curve however far it is scaled.
   */
  float backdropField(vec2 p, float t) {
    float f = sin(p.x * 1.00 + t * 0.60) * 0.50;
    f += sin(p.y * 0.85 - t * 0.45) * 0.45;
    f += sin((p.x + p.y) * 0.65 + t * 0.35) * 0.35;
    f += sin((p.x - p.y) * 0.95 - t * 0.55) * 0.25;
    return f * 0.5 + 0.5;
  }

  void main() {
    vec2 ndc = vBackdropClip.xy / vBackdropClip.w;
    vec2 p = vec2(ndc.x * uAspect, ndc.y) * uLineScale;

    // Two out-of-phase displacements, one per axis: a single sine reads as a
    // flag rippling, crossing them makes the whole field roll.
    float t = uTime * uWaveSpeed;
    vec2 q = p;
    q.x += sin(p.y * 0.8 + t * 0.7) * uWaveAmount;
    q.y += cos(p.x * 0.7 - t * 0.6) * uWaveAmount;

    float scaled = backdropField(q, t) * uLineCount;

    // Derivative of the *unwrapped* field, never of fract(): fract's jump at
    // each integer makes fwidth spike there and punches holes in the stroke.
    float w = max(fwidth(scaled) * uLineThickness, 1e-5);
    float line = 1.0 - smoothstep(0.0, w, abs(fract(scaled) - 0.5));

    vec3 color = mix(uBackground, uLineColor, line * uLineOpacity * uRevealMix);

    // The lines sit halfway between integers, so flooring the half-offset
    // field numbers the bands they enclose. Alternating two greys by that
    // band's parity makes the reveal read as the lines dividing it, rather
    // than as a flat shape laid over the top of them.
    float parity = mod(floor(scaled + 0.5), 2.0);
    vec3 revealShade = mix(uRevealColor, uRevealColorAlt, parity);

    // Skipped outright where the grey reveal is switched off — which is every
    // touch width (see applyFit's bgRevealOpacity). A uniform branch is
    // coherent across the whole draw, so it costs nothing; without it the
    // sweep's loop ran over every fragment of a full-screen plane on a phone
    // only to be multiplied by zero. On a 390×844 screen that was ~6M
    // segment distances per frame for no pixel.
    if (uRevealOpacity > 0.001) {
      color = mix(
        color,
        revealShade,
        revealTrail(ndc) * uRevealMix * uRevealOpacity
      );
    }

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

/** Fake-depth parallax shader for the photographic head plane. */
const headVertex = /* glsl */ `
  uniform float uExtend;
  varying vec2 vUv;
  void main() {
    // Top edge stays pinned to v = 1; the plane's extra height at the bottom
    // runs v negative, which the texture's clamp-to-edge turns into a repeat
    // of the last row. See HEAD_EXTEND.
    vUv = vec2(uv.x, 1.0 - (1.0 - uv.y) * (1.0 + uExtend));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Displaces the portrait's UVs by its depth map, then relights it with the
 * normal map derived from that same depth. The relight is what sells the
 * volume: the light direction is the cursor, so brow, nose and cheekbones
 * catch and lose it as the pointer moves — parallax alone reads as a photo
 * sliding, not a face turning. Both terms are pure texture work; there is no
 * lit material and no extra draw.
 */
const headFragment = /* glsl */ `
  uniform sampler2D uDiffuse;
  uniform sampler2D uDepth;
  uniform sampler2D uAlpha;
  uniform sampler2D uNormal;
  uniform vec2 uParallax;
  uniform float uReveal;
  uniform float uDepthScale;
  uniform float uRelight;
  varying vec2 vUv;
  void main() {
    float depth = texture2D(uDepth, vUv).r;
    vec2 offset = uParallax * (depth - 0.5) * uDepthScale;
    vec2 uv = vUv + offset;
    vec4 color = texture2D(uDiffuse, uv);
    float alpha = texture2D(uAlpha, uv).r;

    vec3 normal = normalize(texture2D(uNormal, uv).rgb * 2.0 - 1.0);
    vec3 lightDir = normalize(vec3(uParallax * 1.6, 1.0));
    // Signed around the flat-normal response so the relight brightens the
    // slopes facing the cursor and shades the ones turning away, instead of
    // washing the whole portrait lighter.
    float lambert = max(dot(normal, lightDir), 0.0) - 0.72;
    vec3 lit = color.rgb * (1.0 + lambert * uRelight);

    gl_FragColor = vec4(clamp(lit, 0.0, 1.0), alpha * uReveal);

    // uDiffuse is an sRGB texture, so the sampler hands back linear values.
    // Without this encode the portrait is written to an sRGB framebuffer
    // still linear and reads several stops too dark — three only injects the
    // chunk automatically for its built-in materials, not a ShaderMaterial.
    #include <colorspace_fragment>
  }
`;

/** Uniforms injected into the masked materials — the cursor-following
 *  liquid reveal. All params-driven values are written each frame. */
interface RevealUniforms {
  /** Newest-first pointer history in NDC — see `SceneTier.trailSamples`. */
  uTrail: { value: Vector2[] };
  /** Screen-space bounds of the active trail, inflated by brush + warp. */
  uTrailMin: { value: Vector2 };
  uTrailMax: { value: Vector2 };
  /** The idle sweep's own history and bounds — see `revealTrailFunction`. */
  uSweep: { value: Vector2[] };
  uSweepMin: { value: Vector2 };
  uSweepMax: { value: Vector2 };
  uSweepPace: { value: number };
  uSweepWarp: { value: number };
  uSweepLength: { value: number };
  uSweepRadius: { value: number };
  uAspect: { value: number };
  uRadius: { value: number };
  uIdleScale: { value: number };
  uTaper: { value: number };
  uTaperIdle: { value: number };
  uTaperFast: { value: number };
  uLength: { value: number };
  /** Eased pointer speed, 0–1 — see `pacePeak`. */
  uPace: { value: number };
  uGateStart: { value: number };
  uGateWidth: { value: number };
  uWarpScale: { value: number };
  uTime: { value: number };
  uThreshold: { value: number };
  uEdge: { value: number };
  uWarp: { value: number };
  uRevealMix: { value: number };
  uNoiseTex: { value: Texture };
  /** Entrance progress 0–1; drives the helmet's burn-off. */
  uIntro: { value: number };
  uBurnStart: { value: number };
  uBurnSoft: { value: number };
  uBurnGlow: { value: number };
  uBurnColor: { value: Color };
}

/**
 * The immersive hero scene — depth-parallax head, glass helmet shell, the
 * gold helmet revealed liquid-style around the cursor, and wireframe
 * circuit outlines. Plain three.js class; the React wrapper drives
 * update/resize/dispose through the project's shared ticker loop.
 */
export class HeroScene {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 50);
  private headMaterial: ShaderMaterial | null = null;
  private headMesh: Mesh | null = null;
  private shellMaterial: MeshStandardMaterial | null = null;
  /** The shell's own maps, unpacked from the GLB — prewarmed like the rest. */
  private helmetTextures: Texture[] = [];
  private revealUniforms: RevealUniforms | null = null;
  private outlineMaterial: ShaderMaterial | null = null;
  /** The wireframe itself — kept so `retune()` can show or hide it per tier. */
  private outlineMesh: Mesh | null = null;
  /** How many samples each trail keeps — from the tier. */
  private readonly samples: number;
  /** Pointer history in NDC, newest first — the reveal mask's input. */
  private readonly trail: Vector2[];
  /** Placement and scale of the worn helmet — no rotation of its own. */
  private helmetGroup = new Group();
  /**
   * The helmet's own centre, and the node the cursor tilt turns.
   *
   * This exists because rotating `helmetGroup` does not turn the helmet, it
   * *orbits* it: the mesh sits `HELMET_WORN_OFFSET` away from that group's
   * origin, ~0.66 units, so a tilt swung the helmet through an arc of that
   * radius and dragged it along z. Under a perspective camera a z-swing is an
   * apparent size change, so the helmet lunged toward the viewer and grew on
   * one side of centre and receded on the other — the same `rot x` magnitude
   * reading far stronger negative than positive. Carrying the offset here and
   * turning this node instead makes the rotation a rotation.
   */
  private helmetPivot = new Group();
  /** Head plane + helmet, so the pair scales and moves as one composition. */
  private subjectGroup = new Group();
  private backdropMesh: Mesh | null = null;
  private backdropMaterial: ShaderMaterial | null = null;
  private params: HeroSceneParams = { ...DEFAULT_PARAMS };
  private pointer = { x: 0, y: 0 };
  private smoothed = { x: 0, y: 0 };
  private lastSmoothed = { x: 0, y: 0 };
  /**
   * Whether a real cursor position has ever been seen. Until one has, the
   * three above hold (0, 0) — the centre of the window, where the cursor
   * almost certainly is not. See `setPointer`.
   */
  private pointerSeen = false;
  /**
   * The tilt's own follower, one filter downstream of `smoothed`.
   *
   * A single lerp is at its fastest the instant its target moves and decays
   * from there, so the helmet left every gesture at full speed and coasted in
   * — a lurch, whatever the amplitude. Running the tilt through a second
   * filter makes its velocity start at zero and ramp, which is the difference
   * between a snap and a lean. Costs about 0.2s of extra settle, which is what
   * a helmet with weight should cost.
   *
   * Both are the **angle itself**, in radians, not the pointer input that
   * produced it — `swing` runs upstream of the filter, so the filter smooths
   * what is drawn.
   */
  private tilt = 0;
  /**
   * The yaw's, the same one filter downstream. It went without while its gain
   * was under a degree at the edge — nothing to lurch with — but the amplitude
   * is a slider now, and a yaw raised to match the pitch needs the same weight.
   */
  private yaw = 0;
  /** Eased 0–1 pointer speed feeding the reveal's blob-to-trail response. */
  private pace = 0;
  /** Seconds-since-start at which the scene finished prewarming. */
  private readyAt: number | null = null;
  /** Entrance progress 0–1 — helmet whole, then burned away. */
  private intro = 0;
  /** Canvas height in CSS pixels, for pixel-denominated distances. */
  private viewportHeight = 1;
  private viewportWidth = 1;
  /** Set when the loader hands over; the rise is clocked from there. */
  private riseStarted = false;
  private riseAt: number | null = null;
  /**
   * The idle sweep's own pointer, history and pace — a complete second copy
   * of the cursor's state. It runs unconditionally and in parallel with the
   * real cursor rather than taking it over, so both reveals can be open at
   * once and simply overlap.
   */
  private sweepPointer: { x: number; y: number } = {
    x: AUTO_SWEEP_PATH[0].x,
    y: AUTO_SWEEP_PATH[0].y,
  };
  private sweepSmoothed: { x: number; y: number } = { ...this.sweepPointer };
  private sweepLast: { x: number; y: number } = { ...this.sweepPointer };
  private sweepPace = 0;
  /** Previous frame's position within the sweep period, to detect the wrap. */
  private sweepCycle = 0;
  private readonly sweepTrail: Vector2[];
  private aspect = 1;
  private reveal = 0;
  private settled = false;
  private disposed = false;
  private startTime: number | null = null;

  /**
   * The live tier. Replaced by `retune()` when the container's width or the
   * pointer class changes; what is baked into the context or the shaders
   * (`antialias`, `trailSamples`) is carried over from the tier the scene was
   * built under, so those two fields always describe what is actually drawn.
   */
  private _tier: SceneTier;
  get tier(): SceneTier {
    return this._tier;
  }

  /** Flips to true once every async asset is in the scene and prewarmed. */
  ready = false;
  onReady: (() => void) | null = null;
  /** Added for the spec's "a failed asset load must be visible" rule. */
  onError: ((error: Error) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this._tier = getSceneTier();
    this.samples = this._tier.trailSamples;
    this.trail = Array.from(
      { length: this.samples },
      () => new Vector2(STATIC_POSE.x, -STATIC_POSE.y),
    );
    this.sweepTrail = Array.from(
      { length: this.samples },
      () => new Vector2(AUTO_SWEEP_PATH[0].x, -AUTO_SWEEP_PATH[0].y),
    );
    this.renderer = new WebGLRenderer({
      canvas,
      // Opaque canvas — cheaper compositing than alpha; the clear colour is
      // read from the page so the brand token stays the single source.
      alpha: false,
      antialias: this._tier.antialias,
      stencil: false,
      powerPreference: this._tier.mobile ? "default" : "high-performance",
    });
    this.renderer.setClearColor(
      new Color(getComputedStyle(document.body).backgroundColor),
    );
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, this._tier.maxDpr),
    );
    this.renderer.toneMapping = ACESFilmicToneMapping;

    // Touch devices never move a cursor, so the mask would sit dead-centre and
    // read as a smudge over the nose. Park it where the Figma frame puts the
    // helmet instead — over the right half of the face — and let the same
    // constant give the parallax its fixed off-axis pose.
    if (!this._tier.pointerEnabled) this.parkPointer();

    // z 6.5 (was 7.5) scales the whole composition ~15% up in frame.
    this.camera.position.set(0, CAMERA_Y, 6.5);
    this.helmetGroup.add(this.helmetPivot);
    this.subjectGroup.add(this.helmetGroup);
    this.scene.add(this.subjectGroup);

    this.load().catch((error) => this.onError?.(error));
  }

  /**
   * Re-reads the device tier and applies everything that can change without
   * a rebuild: the pixel-ratio cap, the frame budget, whether the wireframe
   * draws, whether the pointer is parked, and whether a frozen scene resumes.
   * Returns the tier so the React wrapper can follow it — the frame budget
   * into the ticker, the pointer flag into its listener.
   *
   * Called when the container's width changes or the pointer class flips. A
   * desktop window dragged across a breakpoint genuinely changes tier, and
   * so does a device emulator switched off: until 2026-09-08 the second case
   * was never handled, because touch-class devices were excluded from the
   * resize path wholesale, so a page opened under emulation and returned to
   * a desktop viewport kept a phone's canvas size, budget and parked pointer
   * for the rest of the session. The skill's "read the tier once" rule is
   * about a *device* not changing class mid-session, which still holds — the
   * iOS URL bar only ever changes the height, and the wrapper ignores that.
   *
   * `trailSamples` and `antialias` deliberately do **not** update: one is
   * baked into the shader source and the other into the GL context, so
   * honouring them would mean recompiling every material or rebuilding the
   * context mid-session. A window dragged from phone-width to desktop keeps
   * the shorter trail and no MSAA until reload — a slightly stubbier reveal,
   * and nothing else.
   */
  retune(): SceneTier {
    const fresh = getSceneTier();
    const previous = this._tier;
    const tier: SceneTier = {
      ...fresh,
      antialias: previous.antialias,
      trailSamples: previous.trailSamples,
    };
    this._tier = tier;

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, tier.maxDpr),
    );
    if (this.outlineMesh) this.outlineMesh.visible = tier.outline;

    // The pointer follows the tier's class: parked where there is none, and
    // un-parked — waiting for the first real event to snap to — where one
    // has appeared. Leaving a parked pose under a live cursor would hold the
    // reveal at the static pose until the next `pointermove`, which is fine;
    // leaving a live pose under no cursor is not, since nothing would ever
    // move it again and the mask would sit wherever the pointer last was.
    if (!tier.pointerEnabled) this.parkPointer();
    else if (!previous.pointerEnabled) this.pointerSeen = false;

    // A scene frozen on a settled frame under a saver phone must draw again
    // once it is a desktop; the wrapper's next `setParams` clears `settled`
    // too, but not every retune carries one.
    if (!tier.freeze) this.settled = false;

    return tier;
  }

  /**
   * Parks the cursor at `STATIC_POSE` and settles every follower on it, so a
   * scene with no pointer — touch, reduced motion, or a tier that has just
   * lost its cursor — holds the composition's fixed off-axis pose rather than
   * whatever the last real event left behind.
   */
  private parkPointer() {
    this.pointer = { ...STATIC_POSE };
    this.smoothed = { ...STATIC_POSE };
    this.lastSmoothed = { ...STATIC_POSE };
    this.tilt = this.pitchFor(STATIC_POSE.y);
    this.yaw = this.yawFor(STATIC_POSE.x);
    this.pointerSeen = false;
  }

  /**
   * Starts the composition's rise into place. Called the moment the loader's
   * veil begins to fade, so the two read as one movement — the page opening
   * *onto* something already arriving, rather than a curtain lifting on a
   * static frame.
   */
  beginRise() {
    this.riseStarted = true;
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;

    // The first event is a *discovery*, not a movement. Before it the scene
    // assumes (0, 0) — dead centre — because there is no API to ask where the
    // cursor is; the pointer is wherever the reader left it, commonly high in
    // the window. Easing from the assumption to the truth animates a journey
    // that never happened: the helmet swings up out of level the moment the
    // mouse twitches, the pace term reads that jump as a huge velocity and
    // blooms the reveal with it, and the trail draws a stroke across the
    // middle of the screen. Snap the whole chain instead, so the first frame
    // after discovery is simply correct and there is nothing to catch up.
    if (!this.pointerSeen) {
      this.pointerSeen = true;
      this.smoothed.x = x;
      this.smoothed.y = y;
      this.lastSmoothed.x = x;
      this.lastSmoothed.y = y;
      this.tilt = this.pitchFor(y);
      this.yaw = this.yawFor(x);
    }
  }

  /** The pitch the cursor's vertical position asks for, in radians. */
  private pitchFor(y: number) {
    return swing(y, this.params.helmetAmpX, this.params.helmetCurveX);
  }

  /** The yaw its horizontal position asks for. */
  private yawFor(x: number) {
    return swing(x, this.params.helmetAmpY, this.params.helmetCurveY);
  }

  /** Live-apply a partial set of effect parameters. */
  setParams(partial: Partial<HeroSceneParams>) {
    Object.assign(this.params, partial);
    this.settled = false;
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    // Kept so a distance expressed in CSS pixels can be converted to world
    // units — see `riseDistance`.
    this.viewportHeight = Math.max(height, 1);
    this.viewportWidth = Math.max(width, 1);
    this.aspect = width / height;
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();
    // The trail brush is measured in screen space, so it needs the aspect to
    // stay round rather than stretching with the viewport.
    if (this.revealUniforms) this.revealUniforms.uAspect.value = this.aspect;
  }

  update(time: number) {
    if (this.disposed || this.settled) return;
    if (this.startTime === null) this.startTime = time;
    const t = (time - this.startTime) / 1000;

    const p = this.params;

    // Frozen tiers (reduced motion, or an energy-constrained phone): play the
    // entrance, render the settled frame, stop drawing entirely.
    // WebGL keeps the last frame on the canvas, so a frozen scene is free.
    // The intro has to be finished too, or the scene freezes mid-burn with
    // the helmet half-eaten.
    if (this._tier.freeze && this.reveal > 0.995 && this.intro >= 1) {
      this.settled = true;
    }

    // Idle sweep — a second cursor that never stops. It drives its own
    // pointer rather than borrowing the real one, so moving the mouse and a
    // sweep can be in flight at the same time and their reveals just overlap.
    const autoEnabled =
      p.autoSweepAmount > 0 && !this._tier.freeze && this.intro >= 1;
    if (autoEnabled) {
      const cycle = t % Math.max(p.autoSweepPeriod, 0.001);

      // The cycle restarting means the path teleports from its last waypoint
      // back to its first. Left alone, the smoothing would glide across that
      // gap and draw a fourth stroke back up the diagonal. Snap every piece
      // of the sweep's state — including its history — so the next cycle
      // begins from nothing.
      if (cycle < this.sweepCycle) this.resetSweep();
      this.sweepCycle = cycle;

      // Each leg is a stroke followed by a hold. The pause is what separates
      // the three into distinct gestures — run back to back they read as one
      // long drag however they are eased. Holds sit *between* strokes, so a
      // three-stroke sequence spans 3·stroke + 2·hold and the remainder of
      // the period is dead time before the next one.
      const legs = AUTO_SWEEP_PATH.length - 1;
      const stroke = Math.max(p.autoSweepStroke, 0.05);
      const slot = stroke + Math.max(p.autoSweepHold, 0);
      const leg = Math.floor(cycle / slot);

      if (leg < legs) {
        const local = Math.min(1, (cycle - leg * slot) / stroke);
        // Ease-out quad: leaves fast and arrives slow, like a hand throwing
        // the cursor across and letting it settle. Smoothstep eases *in* too,
        // which made every stroke start apologetically.
        const eased = 1 - (1 - local) * (1 - local);

        const from = AUTO_SWEEP_PATH[leg];
        const to = AUTO_SWEEP_PATH[leg + 1];
        this.sweepPointer.x =
          (from.x + (to.x - from.x) * eased) * p.autoSweepAmount;
        this.sweepPointer.y =
          (from.y + (to.y - from.y) * eased) * p.autoSweepAmount;
      }
    }

    this.sweepSmoothed.x +=
      (this.sweepPointer.x - this.sweepSmoothed.x) * p.pointerLerp;
    this.sweepSmoothed.y +=
      (this.sweepPointer.y - this.sweepSmoothed.y) * p.pointerLerp;

    const sweepStep = Math.hypot(
      this.sweepSmoothed.x - this.sweepLast.x,
      this.sweepSmoothed.y - this.sweepLast.y,
    );
    const sweepTarget = autoEnabled
      ? Math.min(1, sweepStep / Math.max(p.pacePeak, 1e-5))
      : 0;
    this.sweepPace +=
      (sweepTarget - this.sweepPace) *
      (sweepTarget > this.sweepPace ? p.paceAttack : p.paceRelease);
    this.sweepLast.x = this.sweepSmoothed.x;
    this.sweepLast.y = this.sweepSmoothed.y;

    const oldestSweep = this.sweepTrail.pop();
    if (oldestSweep) {
      oldestSweep.set(this.sweepSmoothed.x, -this.sweepSmoothed.y);
      this.sweepTrail.unshift(oldestSweep);
    }

    // Ease the pointer without keyframes — plain lerp toward the target.
    // `reveal` is deliberately *not* eased; see where it is set in load().
    this.smoothed.x += (this.pointer.x - this.smoothed.x) * p.pointerLerp;
    this.smoothed.y += (this.pointer.y - this.smoothed.y) * p.pointerLerp;

    // Entrance clock. It starts at `ready` — that is, after every texture is
    // uploaded and every program compiled — so the burn always plays at full
    // rate instead of stuttering through the first frames.
    if (this.ready) {
      if (this.readyAt === null) this.readyAt = t;
      this.intro = Math.min(
        1,
        (t - this.readyAt) / Math.max(p.introDuration, 0.001),
      );
      // Nothing to reveal for someone who asked for no motion.
      if (this._tier.freeze) this.intro = 1;
    }

    this.camera.position.z = p.cameraZ;

    // One transform for the whole subject, so head and helmet can never
    // drift apart when the composition is resized, re-framed, or slid with
    // the cursor. Moving the group is also one matrix update rather than a
    // per-child walk (optimize-3d-scene §9).
    this.subjectGroup.scale.setScalar(p.subjectScale * this.narrowFit());
    this.subjectGroup.position.x =
      p.subjectX +
      // Landscape only. On a portrait screen the copy sits above the figure
      // rather than beside it, so there is nothing to step away from — and
      // stepping anyway put him off the block's centre line.
      (this.viewportWidth < STEP_UNDER && this.aspect >= 1.2 ? NARROW_STEP : 0) +
      this.smoothed.x * p.subjectParallax;
    // `smoothed.y` is screen-space, y down; world y is up.
    this.subjectGroup.position.y =
      p.subjectY - this.smoothed.y * p.subjectParallax - this.riseOffset(t, p);

    if (this.headMaterial) {
      this.headMaterial.uniforms.uParallax.value.set(
        this.smoothed.x,
        -this.smoothed.y,
      );
      this.headMaterial.uniforms.uReveal.value = this.reveal;
      this.headMaterial.uniforms.uDepthScale.value = p.headParallax;
      this.headMaterial.uniforms.uRelight.value = p.headRelight;
    }
    if (this.headMesh) {
      this.headMesh.scale.setScalar(p.headScale);
      // The geometry grew downwards around its own centre, so drop the mesh by
      // half the added height to leave the portrait itself where it was.
      this.headMesh.position.y =
        -0.55 + p.headY - (HEAD_HEIGHT * HEAD_EXTEND * p.headScale) / 2;
    }

    // The helmet is worn — it tracks the head's parallax, gently, so it
    // never detaches from the face.
    // Turned about the helmet's own centre — see `helmetPivot`. The group
    // below carries where the helmet *is*; this node carries where it looks.
    //
    // Both axes run through their own second filter rather than through
    // `pointerLerp`, which every other reader of the cursor shares: the reveal
    // brush is *meant* to leave instantly — that snap is the effect — and
    // slowing the shared value to settle the helmet would take the trail down
    // with it.
    this.tilt += (this.pitchFor(this.smoothed.y) - this.tilt) * p.pointerLerp;
    this.yaw += (this.yawFor(this.smoothed.x) - this.yaw) * p.pointerLerp;
    this.helmetPivot.rotation.x = this.tilt;
    this.helmetPivot.rotation.y = this.yaw;
    this.helmetGroup.position.x = p.helmetX + this.smoothed.x * p.helmetFollow;
    this.helmetGroup.position.y =
      p.helmetY - this.smoothed.y * p.helmetFollow * 0.8;
    this.helmetGroup.position.z = p.helmetZ;
    this.helmetGroup.scale.setScalar(p.helmetScale);

    // Pointer speed, eased. Rising quickly and falling slowly is deliberate:
    // the trail should swell the instant the cursor moves and relax back to a
    // blob gradually, not flicker between the two on every jitter.
    const step = Math.hypot(
      this.smoothed.x - this.lastSmoothed.x,
      this.smoothed.y - this.lastSmoothed.y,
    );
    if (this._tier.pointerEnabled) {
      const target = Math.min(1, step / Math.max(p.pacePeak, 1e-5));
      this.pace +=
        (target - this.pace) *
        (target > this.pace ? p.paceAttack : p.paceRelease);
    } else if (!autoEnabled && this.intro >= 1 && this._tier.reveal) {
      // No cursor to measure *and* no sweep running: the pace gate would sit
      // at zero and hide the helmet permanently. Touch devices normally get
      // their movement from the sweep; this only catches the case where it
      // has been switched off by hand. Not on a tier with the reveal off —
      // there the helmet dissolving for good is the intended end state, and
      // forcing the gate open would park a warped blob over the face and
      // charge the full trail loop for it every frame.
      this.pace = 1;
    }
    this.lastSmoothed.x = this.smoothed.x;
    this.lastSmoothed.y = this.smoothed.y;

    // Push the smoothed pointer onto the history, oldest sample falling off
    // the end. Rotating in place keeps the same Vector2 objects, so the
    // uniform array is never reallocated.
    const oldest = this.trail.pop();
    if (oldest) {
      oldest.set(this.smoothed.x, -this.smoothed.y);
      this.trail.unshift(oldest);
    }

    if (this.revealUniforms) {
      this.revealUniforms.uAspect.value = this.aspect;
      this.revealUniforms.uRadius.value = p.trailRadius;
      this.revealUniforms.uIdleScale.value = p.trailIdleScale;
      this.revealUniforms.uTaper.value = p.trailTaper;
      this.revealUniforms.uTaperIdle.value = p.trailTaperIdle;
      this.revealUniforms.uTaperFast.value = p.trailTaperFast;
      this.revealUniforms.uLength.value = p.trailLength;
      this.revealUniforms.uPace.value = this.pace;
      this.revealUniforms.uGateStart.value = p.paceThreshold;
      this.revealUniforms.uGateWidth.value = p.paceRamp;
      this.revealUniforms.uWarpScale.value = p.revealWarpScale;
      this.revealUniforms.uTime.value = t * p.revealSpeed;
      this.revealUniforms.uRevealMix.value = this.reveal;
      this.revealUniforms.uThreshold.value = p.revealThreshold;
      this.revealUniforms.uEdge.value = p.revealEdge;
      this.revealUniforms.uWarp.value = p.revealWarp;
      this.revealUniforms.uIntro.value = this.intro;
      this.revealUniforms.uBurnStart.value = p.burnStart;
      this.revealUniforms.uBurnSoft.value = p.burnSoftness;
      this.revealUniforms.uBurnGlow.value = p.burnGlow;

      this.revealUniforms.uSweepPace.value = this.sweepPace;
      this.revealUniforms.uSweepWarp.value = p.sweepWarp;
      this.revealUniforms.uSweepLength.value = p.sweepLength;
      this.revealUniforms.uSweepRadius.value = p.sweepRadius;

      this.writeTrailBounds(
        this.trail,
        p.trailLength,
        p.revealWarp,
        p.trailRadius,
        this.revealUniforms.uTrailMin.value,
        this.revealUniforms.uTrailMax.value,
      );
      this.writeTrailBounds(
        this.sweepTrail,
        p.sweepLength,
        p.sweepWarp,
        p.sweepRadius,
        this.revealUniforms.uSweepMin.value,
        this.revealUniforms.uSweepMax.value,
      );
    }

    if (this.backdropMesh && this.backdropMaterial) {
      // Sized from the frustum each frame so it always fills the view, even
      // as `cameraZ` changes.
      const distance = this.camera.position.z - BACKDROP_Z;
      const height =
        2 * distance * Math.tan((this.camera.fov * Math.PI) / 360) * 1.06;
      this.backdropMesh.scale.set(height * this.aspect, height, 1);

      const bg = this.backdropMaterial.uniforms;
      bg.uLineScale.value = p.bgLineScale;
      bg.uLineCount.value = p.bgLineCount;
      bg.uLineThickness.value = p.bgLineThickness;
      bg.uLineOpacity.value = p.bgLineOpacity;
      bg.uWaveAmount.value = p.bgWaveAmount;
      bg.uWaveSpeed.value = p.bgWaveSpeed;
      bg.uRevealOpacity.value = p.bgRevealOpacity;
      (bg.uRevealColor.value as Color).setScalar(p.bgRevealLightness);
      (bg.uRevealColorAlt.value as Color).setScalar(p.bgRevealLightnessAlt);
    }

    if (this.outlineMaterial) {
      const outline = this.outlineMaterial.uniforms;
      outline.uTime.value = t;
      outline.uPeriod.value = p.outlinePeriod;
      outline.uStagger.value = p.outlineStagger;
      outline.uOpacity.value = p.outlineOpacity;
      outline.uWidth.value = p.outlineWidth;
      outline.uLightness.value = p.outlineLightness;
      outline.uBase.value = p.outlineBase;
      // Held back until the burn has actually consumed the shell.
      //
      // The outline exists to disclose an *invisible* helmet. Drawn over a
      // solid one — which is exactly what the entrance shows for its first
      // second — it is a wireframe laid across opaque paint and reads as raw
      // polygons, worst of all through the semi-transparent visor. Fading it
      // in on the burn's own curve means the two hand over rather than
      // overlap: the shell dissolves, the outline takes its place.
      outline.uRevealMix.value = this.reveal * this.burnProgress(p);
    }

    // `color` multiplies the base-colour map, so this is a live brightness
    // dial over the baked grey without regenerating the atlas.
    this.shellMaterial?.color.setScalar(p.helmetBrightness);

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * World-space drop still to be travelled by the composition's entrance.
   *
   * `riseDistance` is given in CSS pixels so it stays the same apparent
   * movement on every screen; converting it needs the frustum height at the
   * subject's depth, which changes with `cameraZ`, so it is resolved per
   * frame rather than baked once.
   *
   * Holds at the full drop until `beginRise()` — the loader covers that, and
   * settling into place before the veil lifts would waste the whole gesture.
   */
  private riseOffset(t: number, p: HeroSceneParams): number {
    // Nothing to animate for someone who asked for no motion.
    if (this._tier.freeze || p.riseDistance === 0) return 0;

    let remaining = 1;
    if (this.riseStarted) {
      if (this.riseAt === null) this.riseAt = t;
      const u = Math.min(
        1,
        (t - this.riseAt) / Math.max(p.riseDuration, 0.001),
      );
      // Ease-out quad: leaves at speed and coasts to a stop, so the arrival
      // is the part you notice.
      remaining = 1 - (1 - (1 - u) * (1 - u));
    }
    if (remaining <= 0) return 0;

    const visible =
      2 * p.cameraZ * Math.tan((this.camera.fov * Math.PI) / 360);
    return remaining * p.riseDistance * (visible / this.viewportHeight);
  }

  /**
   * How far the entrance burn has progressed, 0 before it starts and 1 once
   * the shell is gone. Mirrors the `smoothstep(uBurnStart, 1.0, uIntro)` the
   * burn shader uses, so anything keyed off it stays in step with the front.
   */
  private burnProgress(p: HeroSceneParams): number {
    const span = Math.max(1 - p.burnStart, 1e-4);
    const x = Math.min(1, Math.max(0, (this.intro - p.burnStart) / span));
    return x * x * (3 - 2 * x);
  }

  /** Collapses the sweep back to its first waypoint with no motion recorded. */
  private resetSweep() {
    const start = AUTO_SWEEP_PATH[0];
    const amount = this.params.autoSweepAmount;
    const x = start.x * amount;
    const y = start.y * amount;
    this.sweepPointer.x = x;
    this.sweepPointer.y = y;
    this.sweepSmoothed.x = x;
    this.sweepSmoothed.y = y;
    this.sweepLast.x = x;
    this.sweepLast.y = y;
    this.sweepPace = 0;
    for (const sample of this.sweepTrail) sample.set(x, -y);
  }

  /**
   * How much the figure gives back on a narrow screen, and how far right it
   * steps, as the viewport closes on the masthead.
   *
   * The masthead is set in rem and the figure in world units against a fixed
   * camera, so the two do not shrink together: below 1440 the name keeps its
   * share of the width while the figure keeps its share of the *height*, and
   * on a 1280x800 screen the helmet had closed on "antonelli" until the last
   * letters were reading through the glass. At 1440 and above both are
   * identities — 1 and 0 — so the frame the block is drawn at is untouched.
   */
  private narrowFit() {
    if (this.viewportWidth >= PORT_WIDTH) return 1;
    // **Landscape only.** On a portrait screen the React side already sizes
    // the subject to a real box — `fitSubjectToBox`, fed by the bottom-
    // anchored element in `hero/index.tsx` — and applying this on top of that
    // shrank an already-fitted figure a second time: at 768x1024 it came out
    // half the size of its own box and floating in the middle of the screen
    // instead of standing on the foot of it. Returning 1 hands the decision
    // to the box, which is the thing that actually knows the layout.
    if (this.aspect < 1.2) return 1;
    return Math.max(MIN_FIT, Math.min(1, this.aspect / REFERENCE_ASPECT));
  }

  /**
   * Screen-space bounding box of the samples the shader will actually visit,
   * inflated by the widest brush and the warp's reach so nothing inside the
   * mask is ever clipped by the early-out. Written in place — this runs twice
   * a frame and must not allocate.
   */
  private writeTrailBounds(
    trail: Vector2[],
    length: number,
    warp: number,
    radius: number,
    min: Vector2,
    max: Vector2,
  ) {
    // Length and warp differ per trail, and the box has to match the loop it
    // guards — too small and it clips the mask, too large and it stops
    // rejecting anything.
    const active = Math.min(
      trail.length,
      Math.ceil(length * (this.samples - 1)) + 1,
    );
    const margin = radius + warp * 0.22 + 0.05;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < active; i++) {
      const sample = trail[i];
      const x = sample.x * this.aspect;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (sample.y < minY) minY = sample.y;
      if (sample.y > maxY) maxY = sample.y;
    }
    min.set(minX - margin, minY - margin);
    max.set(maxX + margin, maxY + margin);
  }

  dispose() {
    this.disposed = true;
    this.scene.traverse((object) => {
      const mesh = object as Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const material of materials) {
        if (!material) continue;
        for (const value of Object.values(material)) {
          if (value instanceof Texture) value.dispose();
        }
        material.dispose();
      }
    });
    this.renderer.dispose();
  }

  private async load() {
    const textureLoader = new TextureLoader();
    const loadTexture = (file: string, srgb = false, forGltf = false) =>
      new Promise<Texture>((resolve, reject) => {
        textureLoader.load(
          `${ASSETS}/${file}`,
          (texture) => {
            if (srgb) texture.colorSpace = SRGBColorSpace;
            if (forGltf) texture.flipY = false;
            // Mipmapped (three's default), deliberately. These were
            // `LinearFilter`, which drops the mip chain — and the portrait's
            // diffuse and alpha are 2048² drawn onto a plane some 300px wide
            // on a phone: a 7× minification sampled from the full-size level,
            // where neighbouring fragments read texels 7 apart and every
            // fetch misses the cache. That is the texture-thrash stutter the
            // skill's §12 describes, and a mip chain is the whole fix: the
            // sampler reads the level that matches the footprint. Every map
            // here is power-of-two, so the chain is free to generate.
            texture.minFilter = LinearMipmapLinearFilter;
            texture.generateMipmaps = true;
            resolve(texture);
          },
          undefined,
          () => reject(new Error(`${ASSETS}/${file}`)),
        );
      });

    // The source GLBs are Draco-compressed; the decoder ships with three and
    // is served from public/ (see AGENTS rule — assets per section).
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_PATH);
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    const [env, headMaps, helmetGltf, noise] = await Promise.all([
      new RGBELoader().loadAsync(`${ASSETS}/studio-light.hdr`).catch(() => { throw new Error(`${ASSETS}/studio-light.hdr`); }),
      // Derived from the source portrait by scripts/generate-person-maps.mjs
      // — the cut-out PNG carries neither depth nor normals.
      Promise.all([
        loadTexture("person-diffuse.webp", true),
        loadTexture("person-depth.webp"),
        loadTexture("person-alpha.webp"),
        loadTexture("person-normal.webp"),
      ]),
      // helmet3.glb ships its own baked PBR set — base colour, normal and
      // metallic-roughness painted into the model's own UV layout, embedded
      // as WebP. That is exactly the input ADR-0022 said the old helmet had
      // never been given, so there is no external livery atlas to load any
      // more: the shell keeps the material the GLB arrives with. See ADR-0027.
      gltfLoader.loadAsync(`${ASSETS}/helmet3.glb`).catch(() => { throw new Error(`${ASSETS}/helmet3.glb`); }),
      // Not a helmet map — the shared reveal/burn noise, read by both the
      // helmet mask and the backdrop's copy of it.
      loadTexture("noise.webp"),
    ]);
    if (this.disposed) return;

    const pmrem = new PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromEquirectangular(env).texture;
    env.dispose();
    pmrem.dispose();

    // Order matters: buildHelmet creates the shared reveal uniforms that the
    // backdrop's copy of the mask reads from.
    this.buildHead(headMaps[0], headMaps[1], headMaps[2], headMaps[3]);
    this.buildHelmet(helmetGltf.scene, noise);
    this.buildBackdrop(noise);

    // Opaque from the first frame. This used to ramp 0 → 1 over about a
    // second once ready, which was both pointless and a visible bug: the
    // loader covers the whole ramp, so nobody ever saw the fade — but if the
    // veil lifted while it was still running, the helmet was caught at
    // partial alpha. Its shell and visor are `transparent` with
    // `depthWrite: false`, so a partly-transparent helmet shows its own back
    // faces through itself and reads as loose polygons. The entrance the
    // scene actually needs is the burn, which starts from a solid helmet.
    //
    // Set before the prewarm render so that throwaway frame is drawn at the
    // real alpha, and every blend path it touches is compiled too.
    this.reveal = 1;

    // Prewarm while the poster still owns the screen: upload every texture,
    // compile every program, and render one throwaway frame so the first
    // visible frame allocates nothing (optimize-3d-scene §3).
    // The helmet's maps come out of the GLB rather than off the network, but
    // they are uploaded on first draw just the same, so they belong here too.
    for (const texture of [...headMaps, noise, ...this.helmetTextures]) {
      this.renderer.initTexture(texture);
    }
    await this.renderer.compileAsync(this.scene, this.camera);
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);

    this.ready = true;
    this.onReady?.();
  }

  private buildHead(
    diffuse: Texture,
    depth: Texture,
    alpha: Texture,
    normal: Texture,
  ) {
    this.headMaterial = new ShaderMaterial({
      vertexShader: headVertex,
      fragmentShader: headFragment,
      uniforms: {
        uDiffuse: { value: diffuse },
        uDepth: { value: depth },
        uAlpha: { value: alpha },
        uNormal: { value: normal },
        uParallax: { value: new Vector2() },
        uReveal: { value: 0 },
        uDepthScale: { value: DEFAULT_PARAMS.headParallax },
        uRelight: { value: DEFAULT_PARAMS.headRelight },
        uExtend: { value: HEAD_EXTEND },
      },
      transparent: true,
    });
    const geometry = new PlaneGeometry(
      HEAD_HEIGHT,
      HEAD_HEIGHT * (1 + HEAD_EXTEND),
    );
    const head = new Mesh(geometry, this.headMaterial);
    head.position.set(0, -0.55, 0);
    this.headMesh = head;
    this.subjectGroup.add(head);
  }

  private buildHelmet(root: Group, noise: Texture) {
    noise.wrapS = RepeatWrapping;
    noise.wrapT = RepeatWrapping;

    // Shared by every masked material, written once per frame in update().
    this.revealUniforms = {
      uTrail: { value: this.trail },
      uTrailMin: { value: new Vector2(-1e3, -1e3) },
      uTrailMax: { value: new Vector2(1e3, 1e3) },
      uSweep: { value: this.sweepTrail },
      uSweepMin: { value: new Vector2(-1e3, -1e3) },
      uSweepMax: { value: new Vector2(1e3, 1e3) },
      uSweepPace: { value: 0 },
      uSweepWarp: { value: DEFAULT_PARAMS.sweepWarp },
      uSweepLength: { value: DEFAULT_PARAMS.sweepLength },
      uSweepRadius: { value: DEFAULT_PARAMS.sweepRadius },
      uAspect: { value: this.aspect },
      uRadius: { value: DEFAULT_PARAMS.trailRadius },
      uIdleScale: { value: DEFAULT_PARAMS.trailIdleScale },
      uTaper: { value: DEFAULT_PARAMS.trailTaper },
      uTaperIdle: { value: DEFAULT_PARAMS.trailTaperIdle },
      uTaperFast: { value: DEFAULT_PARAMS.trailTaperFast },
      uLength: { value: DEFAULT_PARAMS.trailLength },
      uPace: { value: 0 },
      uGateStart: { value: DEFAULT_PARAMS.paceThreshold },
      uGateWidth: { value: DEFAULT_PARAMS.paceRamp },
      uWarpScale: { value: DEFAULT_PARAMS.revealWarpScale },
      uTime: { value: 0 },
      uThreshold: { value: DEFAULT_PARAMS.revealThreshold },
      uEdge: { value: DEFAULT_PARAMS.revealEdge },
      uWarp: { value: DEFAULT_PARAMS.revealWarp },
      uRevealMix: { value: 0 },
      uNoiseTex: { value: noise },
      uIntro: { value: 0 },
      uBurnStart: { value: DEFAULT_PARAMS.burnStart },
      uBurnSoft: { value: DEFAULT_PARAMS.burnSoftness },
      uBurnGlow: { value: DEFAULT_PARAMS.burnGlow },
      uBurnColor: { value: new Color(readToken("--accent")) },
    };

    root.traverse((object) => {
      if (!(object as Mesh).isMesh) return;
      const mesh = object as Mesh;

      // The supplied helmet is a single mesh under one material, not the old
      // helmet/glass/plastic split, so there is nothing to match by name and
      // nothing to hide. The material it arrives with is already the right
      // one — a MeshStandardMaterial carrying the baked base colour, normal
      // and metallic-roughness in the model's own UVs — so the shell is that
      // material, adjusted for the reveal rather than rebuilt from an atlas.
      const shell = mesh.material as MeshStandardMaterial;

      // FrontSide whatever the export declares. The exporter marks this
      // material double-sided, and a double-sided pass that is `transparent`
      // with `depthWrite: false` — which the liquid reveal requires — shows
      // the helmet's own back faces through itself and reads as loose
      // polygons. Same failure the entrance burn was fixed for.
      shell.side = FrontSide;
      shell.transparent = true;
      shell.depthWrite = false;
      // The baked maps set metalness and roughness per texel; only the
      // environment weight is a look decision, and it is the value the
      // previous lacquered shell was tuned to.
      shell.envMapIntensity = 1.3;

      this.injectRevealMask(shell);
      mesh.renderOrder = 1;
      this.shellMaterial = shell;

      // Kept so the prewarm can upload them before the loader lifts.
      for (const map of [
        shell.map,
        shell.normalMap,
        shell.roughnessMap,
        shell.metalnessMap,
      ]) {
        if (map && !this.helmetTextures.includes(map)) {
          this.helmetTextures.push(map);
        }
      }
    });

    // Normalise so the helmet is worn: sized to the head plane's face area.
    const bounds = new Box3().setFromObject(root);
    const size = bounds.getSize(new Vector3());
    const scale = (HEAD_HEIGHT * 0.56) / size.y;
    root.scale.setScalar(scale);
    bounds.setFromObject(root);
    const center = bounds.getCenter(new Vector3());
    // Centred on the pivot's origin, so turning the pivot turns the helmet in
    // place. The offset that actually wears it lives on the pivot itself, one
    // level up, where the tilt cannot reach it.
    root.position.sub(center);
    this.helmetPivot.position.copy(HELMET_WORN_OFFSET);

    this.helmetPivot.add(root);
    this.helmetGroup.updateMatrixWorld(true);
    this.buildOutline(root);
  }

  /**
   * The scanning wireframe. Built from the helmet's own geometries merged into
   * one mesh so the scan is a single draw rather than one per shell, and
   * parented to the same node as the shell — the pivot — so it inherits every
   * transform including the tilt; a separately-placed copy drifts out of
   * register the moment the helmet follows the pointer.
   */
  private buildOutline(root: Group) {
    // Bake each mesh into the pivot's local space. Using `matrixWorld`
    // directly would fold in that node's own transform and then have it
    // applied a second time when the outline is parented back to it.
    const toGroupLocal = this.helmetPivot.matrixWorld.clone().invert();

    const geometries: BufferGeometry[] = [];
    root.traverse((object) => {
      const mesh = object as Mesh;
      // Only the shell and visor — the hidden plastic hardware would scan too.
      if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return;
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(
        new Matrix4().multiplyMatrices(toGroupLocal, mesh.matrixWorld),
      );
      // The merge needs an identical attribute set across inputs.
      for (const name of Object.keys(geometry.attributes)) {
        if (name !== "position") geometry.deleteAttribute(name);
      }
      geometries.push(geometry);
    });
    if (!geometries.length) return;

    const merged = mergeGeometries(geometries, false);
    for (const geometry of geometries) geometry.dispose();
    if (!merged) return;

    // A full triangle wireframe, not crease edges: the shell is a smooth dome,
    // so any workable crease threshold throws the silhouette away and leaves
    // only the visor brim floating. Density is handled with opacity instead —
    // each line is faint enough that the overlap reads as a ghosted surface
    // rather than the solid grey mass a higher alpha collapses into.
    merged.computeBoundingBox();
    const bounds = merged.boundingBox;
    const minY = bounds?.min.y ?? 0;
    const rangeY = bounds ? bounds.max.y - bounds.min.y : 1;

    this.outlineMaterial = new ShaderMaterial({
      vertexShader: outlineVertex,
      fragmentShader: outlineFragment,
      wireframe: true,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uPeriod: { value: DEFAULT_PARAMS.outlinePeriod },
        uStagger: { value: DEFAULT_PARAMS.outlineStagger },
        uOpacity: { value: DEFAULT_PARAMS.outlineOpacity },
        uWidth: { value: DEFAULT_PARAMS.outlineWidth },
        uLightness: { value: DEFAULT_PARAMS.outlineLightness },
        uBase: { value: DEFAULT_PARAMS.outlineBase },
        uRevealMix: { value: 0 },
        uColor: { value: new Color(readToken("--foreground")) },
        uMinY: { value: minY },
        uRangeY: { value: rangeY },
      },
    });

    const outline = new Mesh(merged, this.outlineMaterial);
    outline.renderOrder = 3;
    // Per tier — off on a phone, where 113k mostly sub-pixel lines are the
    // most expensive draw in the frame for the least visible thing in it.
    // See `SceneTier.outline`. Built regardless, and compiled in the prewarm,
    // so a tier change can switch it on without a mid-session compile.
    outline.visible = this._tier.outline;
    this.outlineMesh = outline;
    // `root` already carries the fit transform, and the merge baked each
    // mesh's world matrix in — so the outline goes beside root, not inside it.
    // On the pivot, though, or the wireframe stays put while the shell tilts.
    this.helmetPivot.add(outline);
  }

  /**
   * Injects the liquid reveal into a material's alpha.
   *
   * The mask is the cursor's recent *path* (see `SceneTier.trailSamples`), not a falloff
   * around its current position: the helmet floods along the way the pointer
   * came and drains behind it. The threshold is deliberately narrow —
   * `uEdge` is a few hundredths — because a hard boundary is what makes the
   * surface read as liquid metal instead of a soft spotlight; the softness
   * that keeps it from looking cut out comes from `uWarp` displacing the
   * lookup with scrolling noise, so the edge crawls.
   *
   * Shares one uniforms object across every masked material (shell + visor).
   */
  private injectRevealMask(material: MeshStandardMaterial) {
    const uniforms = this.revealUniforms;
    if (!uniforms) return;

    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec4 vRevealClip;",
        )
        .replace(
          "#include <project_vertex>",
          "#include <project_vertex>\nvRevealClip = gl_Position;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec4 vRevealClip;
           uniform float uIntro;
           uniform float uBurnStart;
           uniform float uBurnSoft;
           uniform float uBurnGlow;
           uniform vec3 uBurnColor;
           ${buildRevealDeclarations(this.samples)}`,
        )
        .replace(
          "#include <alphamap_fragment>",
          `#include <alphamap_fragment>
           vec2 revealNdc = vRevealClip.xy / vRevealClip.w;

           // Entrance: the helmet arrives whole, then burns off.
           //
           // Every pixel gets a threshold from a noise lookup biased by
           // height, and the burn front sweeps that threshold from 0 to 1.
           // Pure noise dissolves as an even speckle; pure height is a flat
           // wipe. Mixing them gives a ragged front that still travels
           // crown-to-chin, which is the direction the outline wave runs.
           float burnFront = smoothstep(uBurnStart, 1.0, uIntro);
           float burnNoise = texture2D(uNoiseTex, revealNdc * 0.5 + 0.5).r;
           float burnHeight = 1.0 - (revealNdc.y * 0.5 + 0.5);
           float burnAt = mix(burnHeight, burnNoise, 0.45);
           // 1 where the shell is still intact, 0 where the burn has passed.
           float intact = smoothstep(
             burnFront - uBurnSoft,
             burnFront + uBurnSoft,
             burnAt
           );

           // Union, so the cursor can already be carving the helmet back in
           // while the tail of the burn is still finishing.
           float mask = max(revealTrail(revealNdc), intact);
           diffuseColor.a *= mask * uRevealMix;

           // The dissolve front itself glows — without it the shell just
           // thins out and the burn reads as a fade, not a burn.
           //
           // Derived from intact rather than from a second gaussian over
           // burnAt, which is what made the burn flicker. That form had its
           // own width (uBurnSoft) applied to a *noisy* field, so at a tight
           // setting the glowing pixels were a scatter that re-rolled every
           // frame as the front crept — sparkle, not a moving edge. This peaks
           // at exactly intact == 0.5, so it is pinned to the real dissolve
           // boundary however ragged that is, and can never be noisier than
           // the dissolve already is.
           float burnEdge = 4.0 * intact * (1.0 - intact);

           // No step() gate either: that snapped the glow off the instant
           // uIntro reached 1 and popped. intact is already 0 once the burn
           // has passed, so the term retires on its own.
           diffuseColor.rgb += uBurnColor * burnEdge * uBurnGlow * uRevealMix;`,
        );
    };
  }

  /**
   * The backdrop plane — animated contour lines plus the grey half of the
   * cursor reveal. Sits behind everything and is re-scaled to the frustum
   * each frame, so it fills the view at any aspect or camera distance.
   *
   * It replaces the circuit-outline `LineSegments` that used to sit here.
   * Those could not do what was asked of them: `LineBasicMaterial.linewidth`
   * is ignored by every WebGL backend, so "a little thicker" was impossible
   * without pulling in fat-line geometry, and they were five draws for art
   * that a single shader now produces and animates.
   */
  private buildBackdrop(noise: Texture) {
    const uniforms = this.revealUniforms;
    if (!uniforms) return;

    this.backdropMaterial = new ShaderMaterial({
      vertexShader: backdropVertex,
      fragmentShader: buildBackdropFragment(this.samples),
      depthWrite: false,
      uniforms: {
        ...uniforms,
        uNoiseTex: { value: noise },
        uBackground: { value: new Color(readToken("--background")) },
        uLineColor: { value: new Color(readToken("--surface-soft")) },
        uRevealColor: {
          value: new Color().setScalar(DEFAULT_PARAMS.bgRevealLightness),
        },
        uRevealColorAlt: {
          value: new Color().setScalar(DEFAULT_PARAMS.bgRevealLightnessAlt),
        },
        uLineScale: { value: DEFAULT_PARAMS.bgLineScale },
        uLineCount: { value: DEFAULT_PARAMS.bgLineCount },
        uLineThickness: { value: DEFAULT_PARAMS.bgLineThickness },
        uLineOpacity: { value: DEFAULT_PARAMS.bgLineOpacity },
        uWaveAmount: { value: DEFAULT_PARAMS.bgWaveAmount },
        uWaveSpeed: { value: DEFAULT_PARAMS.bgWaveSpeed },
        uRevealOpacity: { value: DEFAULT_PARAMS.bgRevealOpacity },
      },
    });

    const backdrop = new Mesh(new PlaneGeometry(1, 1), this.backdropMaterial);
    backdrop.position.z = BACKDROP_Z;
    backdrop.renderOrder = -1;
    this.backdropMesh = backdrop;
    this.scene.add(backdrop);
  }
}
