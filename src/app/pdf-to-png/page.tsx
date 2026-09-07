import type { Metadata } from "next";

import { PdfToImageToolPage } from "@/features/pdf-to-image/components/tool-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/pdf-to-png";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF to PNG Converter – Free & Private",
  description:
    "Convert PDF pages to high-quality PNG images directly in your browser. Free, private, and no file uploads required.",
  path: PATH,
});

export default function PdfToPngPage() {
  return (
    <PdfToImageToolPage
      path={PATH}
      format="png"
      heading="Convert PDF to PNG Online"
      intro="Turn each page of a PDF into a lossless PNG image. The conversion runs inside your browser, so this site never receives or uploads your document."
      steps={[
        "Select your PDF, or drag it onto the page.",
        "Convert the document. Each page is rendered one at a time; PNG needs no quality setting.",
        "Preview the pages as they finish.",
        "Download individual pages, or download all PNGs as a ZIP.",
      ]}
      privacy="Most online converters send your file to a server. This tool does not. Your browser reads the PDF, draws each page onto a canvas, and encodes the PNG locally. There is no upload and no copy is kept on any server. The document exists only in your browser's memory while this page is open."
      formatSection={{
        title: "When to choose PNG",
        description:
          "PNG is lossless, so every page is stored exactly as rendered with no compression artifacts. That fidelity comes at a cost: PNG files are usually much larger than JPG or WebP versions of the same page. Pages are rendered at 150 DPI on a white background, matching how PDF viewers display them.",
        points: [
          {
            title: "Exact reproduction",
            body: "Text edges, thin lines, and flat colour stay crisp. There is no quality slider because nothing is thrown away.",
          },
          {
            title: "Best for fidelity",
            body: "Use PNG when the image will be edited further, placed in a document, or archived, and file size matters less than accuracy.",
          },
          {
            title: "Larger files",
            body: "Photographic pages in particular can be several times bigger as PNG. If size matters, JPG or WebP is usually the better choice.",
          },
        ],
      }}
      faqs={[
        {
          question: "Is my PDF uploaded?",
          answer:
            "No. The PDF is opened and rendered by your browser using PDF.js. This site has no upload endpoint, and the document's contents never leave your device.",
        },
        {
          question: "Why is there no quality option?",
          answer:
            "PNG is a lossless format, so there is nothing to trade off. Every page is saved at full rendered quality. If you want smaller files, use the PDF to JPG or PDF to WebP tool instead.",
        },
        {
          question: "Is the background transparent?",
          answer:
            "No. PDF pages are treated as opaque paper, which is how PDF viewers and PDF.js itself display them. Each PNG has a white background so the page looks the same as it does in a viewer.",
        },
        {
          question: "Can I convert a multi-page PDF?",
          answer:
            "Yes. Every page becomes its own PNG. Pages are processed one after another so long documents stay within your browser's memory, and you can download them individually or as one ZIP file.",
        },
        {
          question: "Does this work on mobile?",
          answer:
            "Yes. On phones and tablets the Choose PDF button opens the normal file picker. PNG files are larger, so very long documents may take more memory on mobile devices.",
        },
        {
          question: "What happens to my file after conversion?",
          answer:
            "Nothing is stored. The PDF and the PNG images exist only in your browser's memory while this page is open. Choosing another file, pressing Remove, or closing the tab releases them.",
        },
      ]}
    />
  );
}
