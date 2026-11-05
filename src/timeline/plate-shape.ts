// 📖 Docs: obsidian/frontend/components/sections.md

/**
 * The timeline plate, as geometry.
 *
 * The design ships this as an exported SVG — a rounded rectangle with a step
 * cut out of its bottom-right edge — and it ships it twice, once per size. The
 * two exports are the same curve at 2.13x, so it survives here as **one** path
 * rather than two assets. It has to be a path rather than an `<img>` anyway:
 * these plates are content frames, and an image of a rectangle cannot hold
 * anything.
 *
 * `PLATE_VIEW` is the larger export's own box, so `PLATE_OUTLINE` is drawn at
 * the coordinates the designer set. `PLATE_CLIP` is the same curve normalised
 * to a unit box, for a `clipPathUnits="objectBoundingBox"` clip that scales
 * with whatever it is put on. The two plate sizes differ in aspect by 0.2%,
 * which is why one normalised curve serves both.
 */
export const PLATE_VIEW = { width: 710.995, height: 462.995 } as const;

/** Stroke width in the export, and the inset its geometry already carries. */
export const PLATE_STROKE = 0.994939;

export const PLATE_OUTLINE =
  "M13.6168 0.497469H697.378C700.858 0.497469 704.195 1.38786 706.655 2.97277C709.115 4.55769 710.498 6.70729 710.498 8.94869V411.208C710.498 413.449 709.115 415.599 706.655 417.183C704.195 418.768 700.858 419.659 697.378 419.659H460.249C454.073 419.659 447.976 420.555 442.411 422.281C436.847 424.008 431.958 426.519 428.107 429.63L399.246 452.95C395.559 455.928 390.878 458.333 385.55 459.986C380.223 461.639 374.385 462.497 368.472 462.497H13.6168C10.1373 462.497 6.80038 461.607 4.34003 460.022C1.87968 458.437 0.497469 456.288 0.497469 454.046V8.94869C0.497469 6.70729 1.87968 4.55769 4.34003 2.97277C6.80038 1.38786 10.1373 0.497469 13.6168 0.497469Z";

export const PLATE_CLIP =
  "M 0.01915,0.00107H 0.98085C 0.98574,0.00107 0.99044,0.00300 0.99390,0.00642C 0.99736,0.00984 0.99930,0.01449 0.99930,0.01933V 0.88815C 0.99930,0.89299 0.99736,0.89763 0.99390,0.90105C 0.99044,0.90448 0.98574,0.90640 0.98085,0.90640H 0.64733C 0.63864,0.90640 0.63007,0.90834 0.62224,0.91206C 0.61442,0.91579 0.60754,0.92122 0.60212,0.92794L 0.56153,0.97830C 0.55635,0.98474 0.54976,0.98993 0.54227,0.99350C 0.53478,0.99707 0.52656,0.99892 0.51825,0.99892H 0.01915C 0.01426,0.99892 0.00956,0.99700 0.00610,0.99358C 0.00264,0.99016 0.00070,0.98551 0.00070,0.98067V 0.01933C 0.00070,0.01449 0.00264,0.00984 0.00610,0.00642C 0.00956,0.00300 0.01426,0.00107 0.01915,0.00107Z";