// 📖 Docs: obsidian/frontend/components/sections.md

/**
 * The footer's measurements, in the design's own pixels.
 *
 * A plain module, like the other blocks': these are read by the Server
 * Component that lays the block out *and* by the client components that
 * animate it, and a value cannot cross a `"use client"` boundary.
 */

export const FRAME = { width: 1440, height: 800 } as const;

/** One design pixel, as a share of the block's width — see `paddock/geometry`. */
export const px = (value: number) =>
  `${((value / FRAME.width) * 100).toFixed(4)}cqw`;


/**
 * A design pixel for **type**, with a floor.
 *
 * The same `px()` until the block gets small enough that its smallest labels
 * stop being letters. A **floor**, not a multiplier: anything already above
 * it keeps its exact share of the frame, so the block still reads as the 1440
 * composition scaled and only the type that had fallen under a dozen pixels
 * is lifted. The floor itself is 0 unless a section sets `--type-min`, which
 * they do below `lg` and nowhere else.
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
/** The cyan page edge, and the panel it frames. */
export const EDGE = 16;
export const GUTTER = 32;

/**
 * The helmet: two plates, the suit behind and the helmet in front, both from
 * the design's `Group 383`. Sized off the block's **height** so the figure
 * keeps filling the panel however tall the screen is.
 */
export const FIGURE = {
  helmet: { heightShare: 666.914 / 800, aspect: 1000.371 / 666.914, centre: 720 / 1440, top: 10 / 800 },
  /**
   * The suit runs to 809.8 in an 800 frame — it hangs **past the bottom** and
   * so covers the accent edge there. That is why the figure is not inside the
   * panel: clipped to it, the edge showed as a cyan strip along the foot that
   * the design does not have.
   */
  body: {
    heightShare: 768.623 / 800,
    aspect: 890.854 / 768.623,
    centre: 720 / 1440,
    bottom: -9.8 / 800,
    /**
     * Only the **suit** of this plate is shown — everything above the collar
     * is masked off, fading in between these two shares of the plate's height.
     *
     * The export is a full portrait: the driver's head, his hair, and his own
     * helmet held beside it, all of it meant to sit *behind* the helmet plate.
     * But the two plates are not to one scale — the suit is sized 0.75 frame
     * px per image px, the helmet 0.65 — so the portrait's head is drawn a
     * seventh larger than the helmet that is supposed to hide it, and its
     * right edge, the visor tab and a curl of hair all showed past the
     * helmet's cheek as a second helmet behind the first (2026-09-08).
     *
     * A mask rather than a rescale: the suit's size and place are the
     * design's, and the helmet already covers the collar down to 0.72 of the
     * plate at its narrowest, so the fade lands entirely under it and the
     * join is never seen. `from` is the neck, `to` the collar's top edge —
     * measured against the helmet's alpha, not eyeballed.
     */
    suitFrom: 0.69,
    suitTo: 0.72,
  },
} as const;

/**
 * How far the figure is displaced when the footer first appears, in design
 * pixels — it rides *back into place* as the page is scrolled to the bottom.
 *
 * The footer is the last block, so it never finishes a crossing: its bottom
 * cannot leave the top of the viewport. A travel hung off the usual
 * `top bottom` → `bottom top` window would therefore stop part-way and leave
 * the figure permanently displaced in the state everyone ends the page on. The
 * window here closes at `bottom bottom` instead — the moment the page is
 * scrolled to its end — and the figure's `to` is its design position, so where
 * a reader comes to rest is exactly the frame.
 *
 * The displacement is **downward** for the same reason the pair is not clipped
 * to the panel: the suit hangs 8 past the foot to cover the accent edge, and
 * lifting the figure by more than that would show the cyan strip along the
 * bottom that the design does not have. Down is free — the section clips it.
 *
 * The helmet and the suit move as **one group**, not as two layers. They are a
 * single figure resting on its own collar; separating them by even a few
 * pixels takes the head off the shoulders, which is the same failure noted on
 * `FIGURE` above for scaling them apart.
 */
export const PARALLAX_FIGURE = 60;

/** The masthead, hard against the right gutter. */
export const HEADLINE = { y: 32, width: 370 } as const;

/** The logo, top left. */
export const LOGO = { x: 32, y: 32, width: 106, height: 24 } as const;

/** The nav column, centred on the block's own middle. */
export const NAV = { x: 32, width: 158, gap: 12, size: 36, row: 34 } as const;

/**
 * The foot: copyright, the call to action, the socials.
 *
 * All three are measured **from the bottom**, not from the top, and that is
 * the whole point of this block's odd numbers. In the design's 800-tall frame
 * they sit at y 734, 718 and 755 with heights 34, 50 and 13 — every one of
 * them ends at 768, a flat 32 above the foot, the same 32 the logo and the
 * masthead keep from the top. The block is `min-h-lvh` rather than 800 tall,
 * so anchoring them by their design `y` left them floating: on a 900-tall
 * screen the row sat 166 above the bottom while the top row kept its 32.
 */
export const FOOT = {
  /** Every item in the row clears the foot by this, as the design has it. */
  bottom: 32,
  copyWidth: 220,
  socialX: 1202,
  socialWidth: 206,
} as const;

export const CTA = {
  x: 583,
  width: 275,
  height: 50,
  cut: 8.835,
  padX: 24,
  gap: 32,
} as const;

/** The call to action's outline — chamfered bottom-right, like the plates. */
export const CTA_PATH = `M0.5 0.5H${CTA.width - 0.5}V${CTA.height - CTA.cut}L${
  CTA.width - CTA.cut
} ${CTA.height - 0.5}H0.5Z`;

/** The arrow at its end — the same one the paddock's button carries. */
export const ARROW_PATH = "M0 5.35H13M8 10.35L13 5.35L8 0.35";