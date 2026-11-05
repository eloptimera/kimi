// 📖 Docs: obsidian/frontend/components/sections.md

type TimelineEntry = { frame: "side" | "centre" };

/**
 * The block's measurements, in the design's own pixels, and the unit that
 * carries them.
 *
 * A plain module on purpose. These numbers are read by the Server Component
 * that lays the rows out *and* by the client component that draws the rail, and
 * a value cannot cross a `"use client"` boundary: import a number from a client
 * module into a server one and what arrives is a client reference, not the
 * number. The rail's lead was imported that way and every sum built on it came
 * out `NaN` — silently, since the spring simply wrote `height: NaN%` and the
 * line stayed at zero.
 */

/**
 * One design pixel, as a share of the block's own width.
 *
 * Not `rem`. The project scales the root font size in bands — 1440 up to 1440,
 * then 1920 up to 1920, then a fixed 16px below 1279 — and each band expects a
 * design authored at that base. This frame is authored at 1440 and there is no
 * 1920 one, so rem put the block at 1134 wide inside a 1512 window and blew it
 * off the screen entirely below 1280. `cqw` is a share of the section's own
 * width, so the block is the Figma frame at every viewport.
 */
export const px = (value: number) => `${((value / 1440) * 100).toFixed(4)}cqw`;

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
/**
 * The width from which the block runs the design's own 1440 composition.
 *
 * Below it the port is not merely small, it is unreadable: every length here
 * is a share of the block's width, so at 390 the 36px year renders at 9.8 and
 * the 18px copy at 4.9. Tailwind's `xl`, and the number is chosen so the port
 * only runs where its smallest type still clears 16px — 18 x 1280/1440 = 16.
 * Under it every block below the hero lays itself out as a single column.
 */
export const PORT_FROM = 1280;

/**
 * The width under which the block gives up the design's composition and
 * stacks into one column.
 *
 * Tailwind's `sm`, and it used to be `lg` — the column ran all the way up to
 * 1023. That was written for the phone and applied to the tablet by accident:
 * at 768 the frame's own layout still holds together, the centre plate is 379
 * across and the copy column beside it 200, and it is what the block was asked
 * to look like there. Under 640 it genuinely does not — the side plate falls
 * to 148 and the copy column to 126 — so the column stays for the phone.
 *
 * Paired with the `max-sm:` classes through the block; this constant carries
 * the same number to the one decision that cannot be a class (whether the year
 * lands on a photograph or under it). Change one and change the other.
 */
export const COLUMN_UNDER = 640;

/**
 * The width under which the block still runs the design's composition, but
 * small enough that some of its parts have to be sized for the eye rather
 * than scaled off the frame.
 *
 * Tailwind's `lg`, and the pair to the `max-lg:` floors the section sets. Two
 * things read it: where the thread starts, and how big the marker on it is.
 */
export const NARROW_UNDER = 1024;

/**
 * The marker's square below `NARROW_UNDER`, in the rail's own units.
 *
 * The frame's 9 is 9 against a 1440 block — 4.8 real pixels at 768, which is
 * a speck rather than the thing the thread is carrying. 20 puts it back at
 * around eleven, which is what it reads as on the wide frame. Wider than the
 * rail's own 16, so the rail's SVG is drawn `overflow-visible`; the square
 * turns as it travels and its corners swing past that box in any case.
 */
export const MARK_SIZE_NARROW = 20;

export const ROW_HEIGHT = { side: 217, centre: 462 } as const;
export const PLATE_WIDTH = { side: 333, centre: 710 } as const;

/** The gutter, and where the copy column starts. */
export const GUTTER = 32;
/**
 * Where the masthead sits below `xl`. The frame's own 32 is measured against a
 * masthead pinned to the right gutter with the block's whole left half open
 * beside it; centred over the first photograph the same 32 reads as pressed
 * against the top edge.
 */
export const HEAD_TOP_NARROW = 96;
/**
 * What the block leaves below its last plate. The frame's own is the gutter's
 * 32; this adds 118 on top, asked for so the last photograph is not read as
 * running straight into the block that follows.
 */
export const BOTTOM_PAD = GUTTER + 118;
/**
 * The same below `xl`, cut back.
 *
 * The 118 was asked for at 1440, where it separates the last photograph from
 * the block that follows without reading as a hole. Scaled down with the rest
 * of the block it keeps its proportion but loses its job — the plate is
 * narrower there, so the same share of the width is a much taller gap
 * relative to what is above it.
 */
export const BOTTOM_PAD_NARROW = GUTTER + 40;
/**
 * Scroll parallax: how far each layer of a row travels as the row crosses the
 * viewport, in design pixels **either side of its design position**.
 *
 * The layers differ hard so the row reads as floating rather than as one flat
 * card. Relative to the photograph it is built on, the copy slides 180 design
 * pixels across a crossing — that difference, not any single figure, is the
 * effect. Order is a depth order: the copy sits over the photograph on `z-20`
 * and is the nearest thing to the reader, so it moves most; the centre plate
 * is the ground the row is built on and barely moves at all. The year is a
 * plate's marker rather than a layer of its own, so it takes whichever figure
 * its plate does and stays registered on it.
 *
 * **Centred on the design position, not hung off it.** Each layer runs from
 * `+value` to `-value`, so it is exactly where the 1440 frame puts it as the
 * row passes the middle of the screen — which is where a reader judges the
 * composition — and the excursion buys twice the differential for the same
 * distance travelled either way.
 *
 * The ceiling is the stack, which butts with **no gap at all** (see `./index`):
 * this is the one figure in the block that can put two rows on top of each
 * other. The headroom, measured:
 *
 * - A **centre** plate drifting into the side row above it clears that row's
 *   plate — those sit out at the gutters and never overlap a centre plate
 *   horizontally — but the side row's *year* is at its centre, ~109px away.
 * - A **side** plate drifting into the centre row above it clears that plate
 *   for the same reason, and reaches its copy at ~181px: the copy starts at
 *   1020 and a right-aligned side plate at 1075, so those two do overlap.
 * - The **copy** only ever moves inside its own 462-tall row: it sits at the
 *   row's middle, 231px from either edge, and copy is only ever set on centre
 *   rows.
 *
 * Every figure below is inside half of its own limit.
 *
 * Small screens need no separate cap. The travel is in `cqw` off the block's
 * own width like everything else here, so the copy's 110 design pixels are
 * 110 real ones at 1440 and 30 on a 390-wide phone, where the rows stack as a
 * column and have far less room.
 */
export const PARALLAX = {
  plate: { side: 60, centre: 20 },
  copy: 110,
} as const;

export const COPY_LEFT = 1020;
/**
 * The block's own top inset, before the first row.
 *
 * 169 in the updated frame: the masthead sits at 32 and runs 104 tall, so the
 * first plate clears it by 33. The stack then closes the frame exactly —
 * 169 + 4x462 + 3x217 = 2668, and the 2700 frame leaves the usual 32 below.
 */
export const TOP_PAD = 169;
/**
 * The same inset below `xl`, plus air.
 *
 * There the masthead is centred and set on one line rather than pinned to the
 * right gutter over two, so it sits directly above the first photograph
 * instead of beside it — and 169 that reads as generous next to a plate reads
 * as cramped underneath one.
 */
export const TOP_PAD_NARROW = TOP_PAD + 96;

/**
 * How far above its row's middle the design sets a marker. Both of Figma's
 * drawn squares sit here — y 350 against a first-row middle of 400, and y 2387
 * against the last row's 2437 — which is what says they are one marker at two
 * moments rather than two fixtures. It is also where the rail's own line
 * stops: Figma draws it 0 to 2387, so the thread ends under the marker at
 * rest rather than running on to the foot of the block.
 */
export const MARK_RISE = 50;
export const MARK_SIZE = 9;

/**
 * Where the rail begins, measured from the top of the block.
 *
 * **0 — the block's own top edge**, which is where Figma starts it: the frame
 * draws the line from y 0 to y 2387 in a 2700 box. It briefly ran 260 *above*
 * the block, up into the tail of the season section so the thread crossed the
 * seam, and then from the first photograph; the frame's own answer is the top
 * of the block, and that is what this is.
 */
export const RAIL_START = 0;
/** The rail runs solid to here, then a gap, then 6-on 6-off to the end. */
export const RAIL_SOLID = 98;
export const RAIL_GAP = 4;
export const RAIL_DASH = 6;

/** The rail's box, in design px: 16 across so the turning marker fits. */
export const RAIL_WIDTH = 16;

/** The rail's full run, from `RAIL_START` to the foot of the last row. */
export const railHeight = (entries: readonly TimelineEntry[]) =>
  TOP_PAD +
  entries.reduce((total, entry) => total + ROW_HEIGHT[entry.frame], 0) -
  RAIL_START;

/**
 * Where the marker comes to rest, as a share of the rail.
 *
 * The design stops the thread **on the last entry** — 45 above the middle of
 * the final centre row, the offset every one of its drawn markers sits at — not
 * at the bottom of the block. Running it to the end left the marker on the last
 * plate's bottom edge, which is not what the frame shows.
 */
export const restingPoint = (entries: readonly TimelineEntry[]) => {
  const heights = entries.map((entry) => ROW_HEIGHT[entry.frame]);
  const lastTop =
    TOP_PAD + heights.slice(0, -1).reduce((total, height) => total + height, 0);
  const rest = lastTop + heights[heights.length - 1] / 2 - MARK_RISE;
  return (rest - RAIL_START) / railHeight(entries);
};