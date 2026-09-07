import type { Metadata } from "next";

import { PdfToImageToolPage } from "@/features/pdf-to-image/components/tool-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/pdf-to-jpg";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF to JPG Converter – Free & Private",
  description:
    "Convert PDF pages to high-quality JPG images directly in your browser. Free, private, and no file uploads required.",
  path: PATH,
});

export default function PdfToJpgPage() {
  return (
    <PdfToImageToolPage
      path={PATH}
      format="jpeg"
      heading="Convert PDF to JPG Online"
      intro="Turn each page of a PDF into a JPG image. The conversion runs inside your browser, so this site never receives or uploads your document."
      steps={[
        "Select your PDF, or drag it onto the page.",
        "Choose a JPG quality: Smaller File, Balanced, or Best Quality.",
        "Convert the document. Each page is rendered one at a time.",
        "Download individual pages, or download all JPGs as a ZIP.",
      ]}
      privacy="Most online converters send your file to a server. This tool does not. Your browser reads the PDF, draws each page onto a canvas, and encodes the JPG locally. There is no upload and no copy is kept on any server. The document exists only in your browser's memory while this page is open."
      formatSection={{
        title: "JPG quality",
        description:
          "JPG is a lossy format: lower quality settings discard more fine detail in exchange for smaller files. Pages are rendered at 150 DPI, so the setting changes compression, not resolution.",
      }}
      faqs={[
        {
          question: "Is my PDF uploaded?",
          answer:
            "No. The PDF is opened and rendered by your browser using PDF.js. This site has no upload endpoint, and the document's contents never leave your device.",
        },
        {
          question: "Can I convert a multi-page PDF?",
          answer:
            "Yes. Every page is converted into its own JPG. Pages are processed one after another so long documents stay within your browser's memory, and you can download them individually or as one ZIP file.",
        },
        {
          question: "Can I choose JPG quality?",
          answer:
            "Yes. Pick Smaller File, Balanced, or Best Quality before converting. You can change the setting and convert again without reselecting the file.",
        },
        {
          question: "Does this work on mobile?",
          answer:
            "Yes. On phones and tablets the Choose PDF button opens the normal file picker. Very large documents may be slower on mobile devices because they have less memory available.",
        },
        {
          question: "What happens to my file after conversion?",
          answer:
            "Nothing is stored. The PDF and the JPG images exist only in your browser's memory while this page is open. Choosing another file, pressing Remove, or closing the tab releases them.",
        },
        {
          question: "Can I convert a password-protected PDF?",
          answer:
            "Not yet. Encrypted PDFs are detected and reported with a clear message. Remove the password in your PDF application first, then convert the unlocked copy.",
        },
      ]}
    />
  );
}
