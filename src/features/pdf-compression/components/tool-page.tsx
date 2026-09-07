import {
  FaqList,
  HowToSteps,
  PointGrid,
  ToolPageSection,
  ToolPageShell,
  type FaqItem,
} from "@/components/tool/tool-page-shell";

import { PDF_COMPRESSION_MODES, PDF_COMPRESSION_MODE_ORDER } from "../modes";
import { PdfCompressionConverter } from "./pdf-compression-converter";

export interface PdfCompressionToolPageProps {
  path: string;
  heading: string;
  intro: string;
  steps: readonly string[];
  privacy: string;
  faqs: readonly FaqItem[];
}

const MODE_POINTS = PDF_COMPRESSION_MODE_ORDER.map((id) => ({
  title: PDF_COMPRESSION_MODES[id].label,
  body: PDF_COMPRESSION_MODES[id].explanation,
}));

/**
 * Server-rendered content for /compress-pdf. The mode explanations derive
 * from the same definitions the converter uses, so copy and behaviour cannot
 * drift apart.
 */
export function PdfCompressionToolPage({
  path,
  heading,
  intro,
  steps,
  privacy,
  faqs,
}: PdfCompressionToolPageProps) {
  return (
    <ToolPageShell
      path={path}
      heading={heading}
      intro={intro}
      converterLabel="PDF compressor"
      converter={<PdfCompressionConverter />}
    >
      <ToolPageSection id="how-to-heading" title="How to compress a PDF" first>
        <HowToSteps steps={steps} />
      </ToolPageSection>

      <ToolPageSection
        id="modes-heading"
        title="Compression modes"
        description="Three modes cover the usual trade-off between file size and keeping the document intact. Whatever the mode, if the result would not be smaller you get the original back, labelled already optimized."
      >
        <PointGrid points={MODE_POINTS} />
      </ToolPageSection>

      <ToolPageSection id="privacy-heading" title="Private browser processing" description={privacy} />

      <ToolPageSection id="faq-heading" title="Frequently asked questions">
        <FaqList faqs={faqs} />
      </ToolPageSection>
    </ToolPageShell>
  );
}
