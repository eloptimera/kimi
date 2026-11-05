// 📖 Docs: obsidian/frontend/components/sections.md

/**
 * The season block's measurements, in the design's own pixels.
 *
 * `cqw` — a share of the block's own width — which is what the timeline, the
 * paddock and the footer use. It was written in **rem** because it shares the
 * page's gutters with the hero, and that is exactly what made its type the
 * odd one out: below 1280 the root font size is pinned at 16, so a 55 here
 * stayed 55 while the same 55 in the timeline scaled with the viewport. At
 * 768 the two headlines came out 55 and 29.3 side by side. On `cqw` all four
 * blocks scale as one, and at 1440 nothing moves — a rem *is* a design pixel
 * there.
 */
export const px = (value: number) =>
  `${((value / 1440) * 100).toFixed(4)}cqw`;

/**
 * A design pixel for **type**, with a floor — the same helper the timeline,
 * the paddock and the footer carry, so the four blocks size their type by one
 * rule. Anything above the floor keeps its exact share of the frame.
 */
export const type = (value: number) =>
  `max(${px(value)}, var(--type-min, 0px))`;

/**
 * The block's masthead, with a floor of its own.
 *
 * The four blocks do not set their mastheads at one size — the frame gives
 * the paddock 96 and the other three 55 — and scaled down that spread reads
 * as three different type systems rather than one: at 768 it is 51.2 against
 * 29.3. The floor closes the gap from below, so every masthead lands on the
 * paddock's size where the block is narrow and each keeps the frame's own
 * number where it is not.
 */
export const masthead = (value: number) =>
  `max(${px(value)}, var(--head-min, 0px))`;

/** The block's own gutter, the same 32 every other block sets. */
export const GUTTER = 32;

/** The left rail: the cyan rule under the headline, then the intro. */
export const RULE = { top: 28, width: 24, height: 2 } as const;
export const INTRO = { top: 30, width: 232 } as const;

/** The standings plate, and the cells inside it. */
export const PLATE = {
  width: 277,
  height: 78,
  /** The cyan divider, which is also the badge cell's width. */
  divider: 83,
  cut: 9,
  /** Globe over wordmark, inside the badge cell. */
  badgeGap: 11,
  globe: { width: 37, height: 23 },
  /** The figures cell: its inset from the divider, and its row rhythm. */
  statsLeft: 16,
  statsGap: 8,
} as const;