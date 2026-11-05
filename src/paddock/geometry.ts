// 📖 Docs: obsidian/frontend/components/sections.md

/**
 * The block's measurements, in the design's own pixels.
 *
 * A plain module, like the timeline's: these numbers are read by the Server
 * Component that lays the block out *and* by the client components that animate
 * it, and a value cannot cross a `"use client"` boundary — import a number from
 * a client module into a server one and what arrives is a client reference, not
 * the number.
 */

/** The frame this block was drawn in. */
export const FRAME = { width: 1440, height: 800 } as const;

/**
 * One design pixel, as a share of the block's own width — the same unit the
 * timeline uses, and for the same reason: the project scales the root font in
 * bands, each expecting a design authored at that band's base, and this frame
 * is 1440 only. `cqw` makes the block the Figma frame at every viewport.
 */
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
/** The gutter the whole page shares. */
export const GUTTER = 32;

/**
 * The portrait, as a share of the block's **height** rather than its width.
 *
 * The design draws it 816.29 tall in an 800 frame — 102% — and hangs it 16
 * above the top so it bleeds off both ends. Sized off the height, it keeps
 * doing exactly that however tall the screen is, instead of stranding the head
 * halfway up a taller block.
 */
export const PORTRAIT = {
  heightShare: 816.29 / 800,
  aspect: 945.92 / 816.29,
  /** Its centre, as a share of the frame's width — dead centre, as drawn. */
  centre: (247 + 945.92 / 2) / 1440,
} as const;

/**
 * How far the portrait drifts up as the block crosses the viewport, in design
 * pixels.
 *
 * **Up only, and that is measured rather than chosen.** The figure is sized to
 * fill the block: its foot lands on the block's bottom edge exactly and its
 * crown clears the top by about 14 real pixels. Drifting *down* spends that 14
 * and then opens a strip of bare backdrop above the head; drifting up only
 * lifts the foot further into the dark band, which is solid black and is where
 * the figure fades out anyway. So the design position is where the figure
 * arrives and the travel is all in the other direction — unlike the timeline's
 * rows, which are centred on theirs because they have room either side.
 */
export const PARALLAX_PORTRAIT = 48;

/** The dark band the calendar sits on, and where the portrait melts into it. */
export const BAND = { top: 631, height: 169, fade: 38.685 } as const;

/**
 * The intro column: copy, then the call to action.
 *
 * `fromBand` rather than `y`: the block runs the full height of the screen, so
 * the design's 436 from the top only holds at its own 800. What the design
 * actually fixes is the 32 between this column's foot and the top of the dark
 * band, and that is what travels.
 */
export const INTRO = { x: 32, width: 338, gap: 40, fromBand: 32 } as const;
export const CTA = { width: 217, height: 50, cut: 8, padX: 24, gap: 32 } as const;

/** Both right-hand panels, and the bracket that frames them. */
export const PANEL = { x: 1190, width: 218, inset: 13 } as const;
export const MEET = { y: 32, height: 73, textY: 43, width: 193 } as const;

/**
 * What the stats panel leaves above itself.
 *
 * Taken from the **hero**, which stacks the same two panels: `Frame 46` there
 * runs its next-race group 0 to 192 and its season-stats group from 224, so
 * the gap is 32. This block's own frame leaves 96, which reads as two
 * unrelated panels rather than one instrument stack — and on a 1280x800
 * screen, where the block is a full viewport tall, the second one had drifted
 * most of the way down the column.
 */
export const PANEL_GAP = 32;

export const STATS = {
  y: MEET.y + MEET.height + PANEL_GAP,
  height: 398,
  textY: MEET.y + MEET.height + PANEL_GAP + 10,
  width: 193,
  row: 58,
  pitch: 106,
  icon: 31,
  labelGap: 55,
} as const;
/**
 * How far the stats panel drops below `lg`.
 *
 * The meet panel's 73 is the height of three lines of unboosted 14. Boosted
 * back to a readable size those three lines are half as tall again, and they
 * ran straight into "last result" underneath. This is that difference, in the
 * frame's own pixels. From `lg` it is 0 and the frame's coordinates stand.
 */
export const STATS_DROP = 96;

export const BRACKET = 10;

/**
 * A ceiling on the portrait between `sm` and `lg`, as a share of the block's
 * width.
 *
 * The figure is sized off the block's **height** so it bleeds off both ends
 * however tall the screen is — right at 1.8:1, ruinous at 0.75:1. At 768x1024
 * that came to 1211 wide in a 768 frame: the head filled the block and the
 * copy was left standing on the middle of the face. The ceiling is the tallest
 * the figure can be and still start below the stats column — 722 at 768, so
 * its head comes in just under "points" and its foot stands in the band, the
 * relationship the frame has. Above `lg` it never binds: the block is wider
 * than it is tall there and the frame's own sizing is already smaller.
 */
export const FIG_CAP_NARROW = "118.75cqw";

/**
 * The call to action's height between `sm` and `lg`.
 *
 * **The frame's own 50, unscaled** — the same button the hero carries at this
 * width, which keeps its full size there rather than shrinking with the
 * block. Scaled with the block it was 116x27 with a 13 label, half the size
 * of the identical control one screen above it. Every other length in the
 * button is a ratio of this, so the chamfer and the arrow keep their shape.
 */
export const CTA_H_NARROW = "50px";

/**
 * How far apart the calendar's five rounds are spread between `sm` and `lg`.
 *
 * They sit across the middle 46% of the frame — x 347 to 1055 — which is 350
 * real pixels at 768, and their names, lifted to the site's narrow 17, want
 * 111 each. Spread by 1.75 the row takes 88% of the block and the pitch is
 * 153, which the names clear. **Positions only**: every size in the strip
 * still comes from the same floors the rest of the page uses, which is what
 * a scale on the whole strip could not do — it multiplied the type too and
 * left the round labels at 11 where everything else on the site is 13.
 */
export const CAL_SPREAD_NARROW = 1.75;

/**
 * How far the markers and their connectors drop below the cards, and how much
 * taller the band is to hold them, between `sm` and `lg`.
 *
 * The card is three lines and two gaps: at the frame's own sizes 58 tall, at
 * the floors 65 — past the 67 the frame leaves before the marker run, so the
 * dots landed on the dates, and then on the live round's frame, which wraps
 * the card and reaches lower still. The drop clears both. Both are shares of the width, so the strip keeps
 * its proportions at every width in the band.
 */
export const CAL_MARK_DROP_NARROW = "8cqw";
export const CAL_CARD_DROP_NARROW = "1.3cqw";
export const BAND_SCALE_NARROW = 1.75;

/**
 * One design pixel for the two right-hand panels, between `sm` and `lg`:
 * **a real one**, so they are drawn at the size the hero draws the same pair
 * at rather than scaled down with the block. Figures 38, labels 12, the
 * meeting 14 — and, because every length in them goes through this, the rows,
 * the rules, the icons and the brackets follow without a floor anywhere.
 */
export const PANEL_U_NARROW = "1px";

/**
 * What the rules between stats rows take, top and bottom, between `sm` and
 * `lg` — 8 against the frame's 24 and 23.
 *
 * The type does not move: the rows, the figures and the labels are the hero's
 * own sizes. What changes is how much air stands between them, and it has to:
 * the frame gives the column half of an 800-tall block, and at 1:1 in a
 * 1024-tall one the same 398 sat over the figure's head. Closing the rules
 * lifts the column's foot by 96, which is 96 more of the block for the
 * figure, whose ceiling is exactly where this column ends.
 */
/**
 * What a rule between stats rows takes above and below itself, between `sm`
 * and `lg` — **10 and 6**, not the same number twice.
 *
 * Sixteen and eleven, not eight and eight: even margins do not read as even
 * here, because the two things they separate
 * are not the same shape: the figure above sits in a cap-height box that ends
 * on its own baseline, while the label below carries the leading of a 12
 * line. Eight either side measured equal and looked 9 above against 13 below.
 * The pair sums to the same 17, so the column's height is unchanged.
 */
export const STATS_RULE_TOP_NARROW = "16px";
export const STATS_RULE_BOTTOM_NARROW = "11px";

/**
 * The stats frame's own offset from the column it marks, between `sm` and
 * `lg`, for the same reason: 13 of air above the first label against 10 below
 * the last figure. Two pixels of drop splits the difference.
 */
export const STATS_FRAME_DROP_NARROW = "0px";


/**
 * The stats column's width between `sm` and `lg`. Narrower than the frame's
 * own 193: down the left it has to stay clear of the figure, whose hair comes
 * to 227 at its widest, and 170 still leaves 115 for a label that needs 88.
 */
export const STATS_COL_W_NARROW = "170px";

/**
 * The phone's own set. The block stops being a composition with a figure in
 * it and becomes a **stack**: masthead, the meeting, the four figures two-up,
 * then Kimi, then the report and its button, then the strip. Nothing overlaps
 * anything, which at 390 is the only arrangement that reads — laid out as the
 * tablet's, the face covered every word on the block.
 *
 * The block grows to fit that stack rather than holding a screen: a phone
 * scrolls, and 844 could not hold it without putting type back on the
 * portrait.
 */
export const PHONE = {
  blockH: "1062px",
  /** The report sits above the figure, not beside it: masthead, copy, Kimi. */
  introBottom: "139px",
  gutter: "24px",
  headTop: "24px",
  /** The meeting, under the masthead. */
  meetFrameTop: "110px",
  meetFrameBottom: "183px",
  meetTop: "121px",
  meetFrameRight: "155px",
  /** The four figures, two-up, under it. */
  statsW: "320px",
  statsFrameRight: "369px",
  /** `+63` on the frame's own 147, which puts the first label at 210. */
  statsDrop: "63px",
  /** Two rows instead of four: the frame closes 245 higher. */
  statsStretch: "calc(var(--panel-u) * -245)",
  /** Kimi between the figures and the report. */
  figCap: "599px",
  /** **Standing in the strip**, as the frame has him — not floating above it. */
  figLift: "328px",
  /** The strip holds the cards three-up, so the band is deeper. */
  bandScale: 8.48,
} as const;

/**
 * The two right-hand panels **trade places** between `sm` and `lg`.
 *
 * The frame stacks them in one corner, which is where a 1440 block has the
 * room. Here that corner is also the page's own menu badge, and the stats at
 * the hero's own sizes are the taller of the two by far — so the column of
 * four runs down the left under the masthead, where the block has a whole
 * empty side, and the meeting takes the corner, where three short lines fit
 * beside the badge.
 *
 * `MASTHEAD_FOOT` is 32 above the type plus the 182 its two lines run to;
 * `MASTHEAD_CAP` is where those letters actually start, which is what the
 * corner panel is levelled with. Both are shares of the width, so the pair
 * travels with the masthead.
 */
const MASTHEAD_FOOT = `${((214 / 1440) * 100).toFixed(4)}cqw`;
const MASTHEAD_CAP = `${((22 / 768) * 100).toFixed(4)}cqw`;
const GUTTER_W = `${((32 / 1440) * 100).toFixed(4)}cqw`;
/**
 * The corner panel sits on the block's own right gutter, like everything else
 * down that edge. It briefly stood 51 inside it to clear the page's menu
 * badge, which floats from 704 to 744 — the badge does cross the frame's
 * top-right corner while it is showing.
 */
const BADGE_INSET = "0px";
/** The frame closes on the type: the longest of the three lines is 98. */
const MEET_FRAME_W = 131;

/** The stats column: down the left, 45 under the masthead's foot. */
export const STATS_LEFT_NARROW = `calc(${GUTTER_W} + 13px)`;
export const STATS_FRAME_LEFT_NARROW = GUTTER_W;
export const STATS_FRAME_RIGHT_NARROW = `calc(${GUTTER_W} + 195px)`;

/** The meeting: the corner the stats have left, on the masthead's cap line. */
export const MEET_LEFT_NARROW = `calc(100% - ${GUTTER_W} - ${BADGE_INSET} - ${
  MEET_FRAME_W - 13
}px)`;
export const MEET_TOP_NARROW = `calc(${MASTHEAD_CAP} + 11px)`;
export const MEET_FRAME_LEFT_NARROW = `calc(100% - ${GUTTER_W} - ${BADGE_INSET} - ${MEET_FRAME_W}px)`;
export const MEET_FRAME_RIGHT_NARROW = `calc(100% - ${GUTTER_W} - ${BADGE_INSET})`;
export const MEET_FRAME_TOP_NARROW = MASTHEAD_CAP;
export const MEET_FRAME_BOTTOM_NARROW = `calc(${MASTHEAD_CAP} + 73px)`;

/**
 * Where the figure's middle sits between `sm` and `lg`, as a share of the
 * block — a little right of the frame's own centre.
 *
 * Grown to fill the block below the stats column, the figure's cheek came
 * down on the last line of the copy beside it, and the copy has since been
 * widened twice — the number is whatever keeps its silhouette clear of the
 * column's right edge at the height the copy sits. Nothing above it changes: the
 * column it used to have to clear ends 9 above the top of its head, so the
 * figure is free to move sideways.
 */
export const FIG_X_NARROW = "65.7%";

/**
 * The calendar strip, measured **from the top of the dark band** rather than
 * from the top of the frame. The block runs the full height of the screen, so
 * the design's absolute 674 only holds at its own 800; what it really fixes is
 * where the cards sit inside the band, and the band is anchored to the foot.
 */
export const CALENDAR = {
  /** 674 in the frame, 631 down to the band. */
  y: 43,
  /** 757 in the frame. */
  markY: 126,
  dot: 11,
  /**
   * The connectors between markers: absolute x in the frame, y 762.
   *
   * Read off the rendered frame, **not** off Figma's metadata. The lines carry
   * a 180-degree rotation, so the metadata reports each one's x at its *end* —
   * 542, 708, 879, 1038 — and taking those as starts shifted every connector a
   * whole position right: the first began under P4 instead of after P6, and the
   * last stopped short of the final ring. Sampling the render's own pixels put
   * them at 416, 580, 743 and 914, each sitting ~18 clear of the markers it
   * joins.
   */
  linkY: 131.5,
  links: [
    { x: 416, width: 126 },
    { x: 580, width: 128 },
    { x: 743, width: 136 },
    { x: 914, width: 124 },
  ],
  /**
   * And they are **dashed**, not solid. Counted off the render: 12 runs across
   * the 126-wide first connector, so a 11.45 period — 7 on, 4.45 off.
   */
  linkDash: 7,
  linkGap: 4.45,
  /** The bracket that frames the live round, 663 and 744 in the frame. */
  /**
   * The frame around the live round, measured from the band's top. Figma's
   * rendered corners are 669/781 across and 663/744 down the page; the band
   * starts at 631, so 32 and 113 here. The metadata's own 679 and 744 are the
   * pre-transform boxes — see `PaddockBracket`.
   */
  live: { left: 669, right: 781, top: 32, bottom: 113 },
} as const;

/**
 * The corner bracket, as the design draws it: a right angle 10 across, opening
 * down-right. Every one of the eight in this block is this path rotated, which
 * is why it is a path and not eight exported files.
 */
export const BRACKET_PATH = "M0 0.5H10V10.5";

/** The call to action's outline — chamfered bottom-right, like the plates. */
export const CTA_PATH = `M0.5 0.5H${CTA.width - 0.5}V${CTA.height - CTA.cut}L${
  CTA.width - CTA.cut
} ${CTA.height - 0.5}H0.5Z`;

/** The arrow at its end. */
export const ARROW_PATH = "M0 5.35H13M8 10.35L13 5.35L8 0.35";