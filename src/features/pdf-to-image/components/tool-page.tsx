import {
  FaqList,
  HowToSteps,
  PointGrid,
  ToolPageSection,
  ToolPageShell,
  type FaqItem,
  type PointItem,
} from "@/components/tool/tool-page-shell";

import { getRasterFormat, type RasterOutputFormat } from "../formats";
import { PdfToImageConverter } from "./pdf-to-image-converter";

export interface PdfToImageToolPageProps {
  path: string;
  format: RasterOutputFormat;
  heading: string;
  intro: string;
  steps: readonly string[];
  privacy: string;
  /** Format-specific explanation. Quality presets are listed automatically when the format has them. */
  formatSection: {
    title: string;
    description: string;
    points?: readonly PointItem[];
  };
  faqs: readonly FaqItem[];
}

/**
 * Server-rendered content for the PDF-to-image tool pages. Every piece of
 * SEO content arrives as props from the route, so each page stays explicit
 * while the structure and converter island are defined once.
 */
export function PdfToImageToolPage({
  path,
  format,
  heading,
  intro,
  steps,
  privacy,
  formatSection,
  faqs,
}: PdfToImageToolPageProps) {
  const config = getRasterFormat(format);

  return (
    <ToolPageShell
      path={path}
      heading={heading}
      intro={intro}
      converterLabel={`PDF to ${config.label} converter`}
      converter={<PdfToImageConverter format={format} />}
    >
      <ToolPageSection id="how-to-heading" title={`How to convert PDF to ${config.label}`} first>
        <HowToSteps steps={steps} />
      </ToolPageSection>

      <ToolPageSection id="privacy-heading" title="Private PDF conversion" description={privacy} />

      <ToolPageSection
        id="format-heading"
        title={formatSection.title}
        description={formatSection.description}
      >
        {formatSection.points ? <PointGrid points={formatSection.points} /> : null}
        {config.qualityPresets ? (
          <PointGrid
            points={config.qualityPresets.map((preset) => ({
              title: preset.label,
              body: preset.description,
            }))}
          />
        ) : null}
      </ToolPageSection>

      <ToolPageSection id="faq-heading" title="Frequently asked questions">
        <FaqList faqs={faqs} />
      </ToolPageSection>
    </ToolPageShell>
  );
}
