import type { Metadata } from "next";

import { PdfToImageToolPage } from "@/features/pdf-to-image/components/tool-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/pdf-to-webp";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF to WebP Converter – Free & Private",
  description:
    "Convert PDF pages to WebP images directly in your browser. Choose image quality and download every page privately without uploading your PDF.",
  path: PATH,
});

export default function PdfToWebpPage() {
  return (
    <PdfToImageToolPage
      path={PATH}
      format="webp"
      heading="Convert PDF to WebP Online"
      intro="Turn each page of a PDF into a WebP image, the compact format built for the web. The conversion runs inside your browser, so this site never receives or uploads your document."
      steps={[
        "Select your PDF, or drag it onto the page.",
        "Choose a WebP quality: Smaller File, Balanced, or Best Quality.",
        "Convert the document. Each page is rendered one at a time.",
        "Download individual pages, or download all WebP images as a ZIP.",
      ]}
      privacy="Most online converters send your file to a server. This tool does not. Your browser reads the PDF, draws each page onto a canvas, and encodes the WebP image locally. There is no upload and no copy is kept on any server. The document exists only in your browser's memory while this page is open."
      formatSection={{
        title: "WebP quality",
        description:
          "WebP typically produces smaller files than JPG at similar visual quality, which makes it a good fit for websites and apps. It is lossy at every setting here, so lower quality trades fine detail for size. Pages are rendered at 150 DPI, so the setting changes compression, not resolution.",
      }}
      faqs={[
        {
          question: "Is my PDF uploaded?",
          answer:
            "No. The PDF is opened and rendered by your browser using PDF.js. This site has no upload endpoint, and the document's contents never leave your device.",
        },
        {
          question: "Why choose WebP over JPG?",
          answer:
            "WebP usually gives a smaller file for the same visual quality, so pages load faster on websites. Most current browsers, image viewers, and content management systems open WebP. If you need to send images to older software, JPG is the safer choice.",
        },
        {
          question: "Can I choose WebP quality?",
          answer:
            "Yes. Pick Smaller File, Balanced, or Best Quality before converting. You can change the setting and convert again without reselecting the file.",
        },
        {
          question: "Can I convert a multi-page PDF?",
          answer:
            "Yes. Every page becomes its own WebP image. Pages are processed one after another so long documents stay within your browser's memory, and you can download them individually or as one ZIP file.",
        },
        {
          question: "Does this work on mobile?",
          answer:
            "Yes. On phones and tablets the Choose PDF button opens the normal file picker. Your browser must be able to create WebP images; current versions of Chrome, Firefox, Safari, and Edge can, and the tool tells you if yours cannot.",
        },
        {
          question: "What happens to my file after conversion?",
          answer:
            "Nothing is stored. The PDF and the WebP images exist only in your browser's memory while this page is open. Choosing another file, pressing Remove, or closing the tab releases them.",
        },
      ]}
    />
  );
}
