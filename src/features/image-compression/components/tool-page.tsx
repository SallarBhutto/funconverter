import {
  FaqList,
  HowToSteps,
  PointGrid,
  ToolPageSection,
  ToolPageShell,
  type FaqItem,
  type PointItem,
} from "@/components/tool/tool-page-shell";

import { getCompressibleFormat, type CompressibleFormat } from "../formats";
import { ImageCompressionConverter } from "./image-compression-converter";

export interface ImageCompressionToolPageProps {
  path: string;
  format: CompressibleFormat;
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
 * Server-rendered content for the compression tool pages. Every piece of
 * SEO content arrives as props from the route, so each page stays explicit
 * while the structure and converter island are defined once.
 */
export function ImageCompressionToolPage({
  path,
  format,
  heading,
  intro,
  steps,
  privacy,
  formatSection,
  faqs,
}: ImageCompressionToolPageProps) {
  const config = getCompressibleFormat(format);

  return (
    <ToolPageShell
      path={path}
      heading={heading}
      intro={intro}
      converterLabel={`${config.label} compressor`}
      converter={<ImageCompressionConverter format={format} />}
    >
      <ToolPageSection id="how-to-heading" title={`How to compress ${config.label} images`} first>
        <HowToSteps steps={steps} />
      </ToolPageSection>

      <ToolPageSection id="privacy-heading" title="Private image compression" description={privacy} />

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
