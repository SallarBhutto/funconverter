import type { Metadata } from "next";

import { PdfCompressionToolPage } from "@/features/pdf-compression/components/tool-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/compress-pdf";

export const metadata: Metadata = buildPageMetadata({
  title: "Compress PDF Online – Free & Private",
  description:
    "Reduce PDF file size directly in your browser. Choose document-preserving or maximum compression without uploading your PDF.",
  path: PATH,
});

export default function CompressPdfPage() {
  return (
    <PdfCompressionToolPage
      path={PATH}
      heading="Compress PDF Online"
      intro="Make a PDF smaller without sending it anywhere. Choose Preserve to keep every feature of the document, Balanced to also recompress embedded images, or Maximum to flatten pages into images for the smallest file. The work happens in your browser."
      steps={[
        "Select your PDF, or drag it onto the page.",
        "Choose a mode. Balanced suits most documents; Preserve keeps everything exactly; Maximum trades text and links for size.",
        "Press Compress PDF and wait for the result.",
        "Compare the sizes, then download the compressed PDF.",
      ]}
      privacy="Preserve and Balanced run qpdf as WebAssembly inside a Web Worker on your device. Maximum renders pages with PDF.js and rebuilds the file with jsPDF, also on your device. No byte of your PDF is sent to a server or stored remotely. The document exists only in your browser's memory while this page is open."
      faqs={[
        {
          question: "Is my PDF uploaded?",
          answer:
            "No. Every mode runs entirely in your browser. This site has no upload endpoint, and the document never leaves your device.",
        },
        {
          question: "Which compression mode should I use?",
          answer:
            "Start with Balanced: it keeps text, links and forms while recompressing images, which is where most of the size usually is. Use Preserve when the file must stay byte-for-byte faithful in appearance, for example for print. Use Maximum for scans and image-heavy documents where you only need something that looks the same.",
        },
        {
          question: "Why did my PDF not get smaller?",
          answer:
            "Many PDFs are already compressed by the tool that made them. When a mode cannot beat the original, this tool keeps your original and labels it already optimized rather than giving you a larger file. Try Balanced or Maximum if the document contains images.",
        },
        {
          question: "Does Maximum preserve selectable text?",
          answer:
            "No. Maximum converts each page into a JPEG image, so text can no longer be selected or searched. Page count, size and orientation are preserved. Use Preserve or Balanced if you need searchable text.",
        },
        {
          question: "Will compression preserve links and forms?",
          answer:
            "Preserve and Balanced keep links, form fields and annotations because they rewrite the file without touching page content. Maximum flattens pages to images and removes them.",
        },
        {
          question: "Will compression preserve digital signatures?",
          answer:
            "No. Rewriting a signed PDF in any mode changes the bytes the signature was computed over, which invalidates existing signatures. Keep the original if signature validity matters.",
        },
        {
          question: "Can I compress a password-protected PDF?",
          answer:
            "Not yet. Encrypted PDFs are detected and reported with a clear message. Remove the password in your PDF application first, then compress the unlocked copy.",
        },
      ]}
    />
  );
}
