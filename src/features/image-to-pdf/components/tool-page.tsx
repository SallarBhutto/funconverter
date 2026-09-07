import {
  FaqList,
  HowToSteps,
  PointGrid,
  ToolPageSection,
  ToolPageShell,
  type FaqItem,
  type PointItem,
} from "@/components/tool/tool-page-shell";

import { getImageInputFormat, type ImageInputFormat } from "../formats";
import { MARGIN_OPTIONS, ORIENTATION_OPTIONS, PAGE_SIZE_OPTIONS } from "../layout";
import { ImageToPdfConverter } from "./image-to-pdf-converter";

export interface ImageToPdfToolPageProps {
  path: string;
  format: ImageInputFormat;
  heading: string;
  intro: string;
  steps: readonly string[];
  privacy: string;
  /** Format-specific explanation shown before the page-layout section. */
  formatSection: {
    title: string;
    description: string;
    points?: readonly PointItem[];
  };
  faqs: readonly FaqItem[];
}

const LAYOUT_POINTS: readonly PointItem[] = [
  {
    title: "Page size",
    body: PAGE_SIZE_OPTIONS.map((option) => `${option.label}: ${option.description}`).join(" "),
  },
  {
    title: "Orientation",
    body: ORIENTATION_OPTIONS.map((option) => `${option.label}: ${option.description}`).join(" "),
  },
  {
    title: "Margin",
    body: MARGIN_OPTIONS.map((option) => `${option.label}: ${option.description}`).join(" "),
  },
];

/**
 * Server-rendered content for the image-to-PDF tool pages. Every piece of
 * SEO content arrives as props from the route; the layout explanation is
 * derived from the same option definitions the converter uses.
 */
export function ImageToPdfToolPage({
  path,
  format,
  heading,
  intro,
  steps,
  privacy,
  formatSection,
  faqs,
}: ImageToPdfToolPageProps) {
  const config = getImageInputFormat(format);

  return (
    <ToolPageShell
      path={path}
      heading={heading}
      intro={intro}
      converterLabel={`${config.label} to PDF converter`}
      converter={<ImageToPdfConverter format={format} />}
    >
      <ToolPageSection id="how-to-heading" title={`How to convert ${config.label} to PDF`} first>
        <HowToSteps steps={steps} />
      </ToolPageSection>

      <ToolPageSection id="privacy-heading" title="Private image conversion" description={privacy} />

      <ToolPageSection
        id="format-heading"
        title={formatSection.title}
        description={formatSection.description}
      >
        {formatSection.points ? <PointGrid points={formatSection.points} /> : null}
      </ToolPageSection>

      <ToolPageSection
        id="layout-heading"
        title="Page layout"
        description="Every image is placed on its own page, scaled to fit without cropping or stretching, and centred. Pages are white, so transparent areas show as white."
      >
        <PointGrid points={LAYOUT_POINTS} />
      </ToolPageSection>

      <ToolPageSection id="faq-heading" title="Frequently asked questions">
        <FaqList faqs={faqs} />
      </ToolPageSection>
    </ToolPageShell>
  );
}
