/** PDF user space: 72 points per inch. */
const POINTS_PER_INCH = 72;
const POINTS_PER_MM = POINTS_PER_INCH / 25.4;

/** CSS reference density used to map image pixels to page points in "Fit to image". */
export const PIXELS_PER_INCH = 96;
const POINTS_PER_PIXEL = POINTS_PER_INCH / PIXELS_PER_INCH;

/** Longest page side the PDF specification (and Acrobat) accept: 200 inches. */
export const MAX_PAGE_SIDE_PT = 14400;
/** Smallest page side we will emit, so a 1 px image still yields a valid page. */
export const MIN_PAGE_SIDE_PT = 3;

export type PageSizeId = "a4" | "letter" | "fit";
export type OrientationId = "auto" | "portrait" | "landscape";
export type MarginId = "none" | "small" | "medium";

export interface PageSettings {
  pageSize: PageSizeId;
  orientation: OrientationId;
  margin: MarginId;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  pageSize: "a4",
  orientation: "auto",
  margin: "small",
};

export interface OptionDefinition<T extends string> {
  id: T;
  label: string;
  description: string;
}

export const PAGE_SIZE_OPTIONS: readonly OptionDefinition<PageSizeId>[] = [
  { id: "a4", label: "A4", description: "210 × 297 mm, the standard everywhere except North America." },
  { id: "letter", label: "Letter", description: "8.5 × 11 in, the standard in the US and Canada." },
  {
    id: "fit",
    label: "Fit to image",
    description: "Each page takes the exact shape of its image, plus the margin.",
  },
];

export const ORIENTATION_OPTIONS: readonly OptionDefinition<OrientationId>[] = [
  { id: "auto", label: "Auto", description: "Landscape for wide images, portrait for tall ones." },
  { id: "portrait", label: "Portrait", description: "Every page is taller than it is wide." },
  { id: "landscape", label: "Landscape", description: "Every page is wider than it is tall." },
];

export const MARGIN_OPTIONS: readonly OptionDefinition<MarginId>[] = [
  { id: "none", label: "None", description: "The image reaches the page edge." },
  { id: "small", label: "Small", description: "10 mm of white space around the image." },
  { id: "medium", label: "Medium", description: "20 mm of white space around the image." },
];

/** Portrait dimensions in points. */
const FIXED_PAGE_SIZES: Record<Exclude<PageSizeId, "fit">, { width: number; height: number }> = {
  a4: { width: 210 * POINTS_PER_MM, height: 297 * POINTS_PER_MM },
  letter: { width: 8.5 * POINTS_PER_INCH, height: 11 * POINTS_PER_INCH },
};

const MARGIN_POINTS: Record<MarginId, number> = {
  none: 0,
  small: 10 * POINTS_PER_MM,
  medium: 20 * POINTS_PER_MM,
};

export function marginInPoints(margin: MarginId): number {
  return MARGIN_POINTS[margin];
}

export type ResolvedOrientation = "portrait" | "landscape";

/** "auto" follows the image; square images count as portrait. */
export function resolveOrientation(
  orientation: OrientationId,
  imageWidth: number,
  imageHeight: number,
): ResolvedOrientation {
  if (orientation !== "auto") return orientation;
  return imageWidth > imageHeight ? "landscape" : "portrait";
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Scales an image to fit inside `availableWidth × availableHeight` without
 * distortion and centres it. Upscaling is allowed: placement is a vector
 * transform in the PDF, so small images fill the page cleanly.
 */
export function containFit(
  availableWidth: number,
  availableHeight: number,
  imageWidth: number,
  imageHeight: number,
): Box {
  const safeWidth = Math.max(1, imageWidth);
  const safeHeight = Math.max(1, imageHeight);
  const scale = Math.min(availableWidth / safeWidth, availableHeight / safeHeight);
  const width = safeWidth * scale;
  const height = safeHeight * scale;
  return {
    x: (availableWidth - width) / 2,
    y: (availableHeight - height) / 2,
    width,
    height,
  };
}

export interface PageLayout {
  pageWidth: number;
  pageHeight: number;
  orientation: ResolvedOrientation;
  /** Image placement in points from the top-left of the page. */
  image: Box;
}

/**
 * "Fit to image": the page is the image at 96 px/in plus the margin. The
 * whole page is scaled down uniformly if a side would exceed the PDF limit,
 * so aspect ratio is always preserved. Orientation follows the image.
 */
export function computeFitToImagePage(
  imageWidth: number,
  imageHeight: number,
  margin: MarginId,
): PageLayout {
  const marginPt = marginInPoints(margin);
  const safeWidth = Math.max(1, imageWidth);
  const safeHeight = Math.max(1, imageHeight);

  let imagePtWidth = safeWidth * POINTS_PER_PIXEL;
  let imagePtHeight = safeHeight * POINTS_PER_PIXEL;
  let effectiveMargin = marginPt;

  const longestPage = Math.max(imagePtWidth, imagePtHeight) + 2 * marginPt;
  if (longestPage > MAX_PAGE_SIDE_PT) {
    const scale = MAX_PAGE_SIDE_PT / longestPage;
    imagePtWidth *= scale;
    imagePtHeight *= scale;
    effectiveMargin *= scale;
  }

  const pageWidth = Math.max(MIN_PAGE_SIDE_PT, imagePtWidth + 2 * effectiveMargin);
  const pageHeight = Math.max(MIN_PAGE_SIDE_PT, imagePtHeight + 2 * effectiveMargin);

  return {
    pageWidth,
    pageHeight,
    orientation: pageWidth > pageHeight ? "landscape" : "portrait",
    image: { x: effectiveMargin, y: effectiveMargin, width: imagePtWidth, height: imagePtHeight },
  };
}

/**
 * Computes the page and image placement for one image under the chosen
 * settings. Fixed sizes use contain-fit inside the margins; "fit" delegates
 * to computeFitToImagePage and ignores the orientation setting, since the
 * page shape is already dictated by the image.
 */
export function computePageLayout(
  settings: PageSettings,
  imageWidth: number,
  imageHeight: number,
): PageLayout {
  if (settings.pageSize === "fit") {
    return computeFitToImagePage(imageWidth, imageHeight, settings.margin);
  }

  const base = FIXED_PAGE_SIZES[settings.pageSize];
  const orientation = resolveOrientation(settings.orientation, imageWidth, imageHeight);
  const pageWidth = orientation === "landscape" ? base.height : base.width;
  const pageHeight = orientation === "landscape" ? base.width : base.height;

  const marginPt = marginInPoints(settings.margin);
  const availableWidth = Math.max(1, pageWidth - 2 * marginPt);
  const availableHeight = Math.max(1, pageHeight - 2 * marginPt);
  const fit = containFit(availableWidth, availableHeight, imageWidth, imageHeight);

  return {
    pageWidth,
    pageHeight,
    orientation,
    image: { ...fit, x: fit.x + marginPt, y: fit.y + marginPt },
  };
}
