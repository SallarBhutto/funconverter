import type { Metadata } from "next";

import { ImageToPdfToolPage } from "@/features/image-to-pdf/components/tool-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/webp-to-pdf";

export const metadata: Metadata = buildPageMetadata({
  title: "WebP to PDF Converter – Free & Private",
  description:
    "Convert WebP images to PDF directly in your browser. Combine multiple WebP files into one standard PDF and download it without uploading anything.",
  path: PATH,
});

export default function WebpToPdfPage() {
  return (
    <ImageToPdfToolPage
      path={PATH}
      format="webp"
      heading="Convert WebP to PDF Online"
      intro="Turn WebP images saved from the web into a standard PDF that opens anywhere. Combine as many as you need, set the order and page layout, and download. Everything runs inside your browser."
      steps={[
        "Choose your WebP images, or drag them onto the page. You can add more at any time.",
        "Arrange the order by dragging cards or using the move buttons. Each image becomes one page.",
        "Pick a page size, orientation, and margin.",
        "Press Create PDF, then download the finished file.",
      ]}
      privacy="Your images are decoded and placed into the PDF by your browser. No file is sent to a server or stored remotely. Your images exist only in your browser's memory while this page is open."
      formatSection={{
        title: "How WebP images are placed",
        description:
          "PDF has no built-in WebP support, so your browser decodes each image and stores it in the PDF as a high-quality JPEG. The result opens in every PDF reader, including ones that have never heard of WebP.",
        points: [
          {
            title: "Standard output",
            body: "Images are stored as JPEG at quality 92, a level where differences from the source are hard to see.",
          },
          {
            title: "Transparency on white",
            body: "JPEG has no transparency, so transparent WebP regions are filled white, matching the white page.",
          },
          {
            title: "One image per page",
            body: "Each image is scaled to fit its page without cropping or stretching and centred within the margin.",
          },
        ],
      }}
      faqs={[
        {
          question: "Are my images uploaded?",
          answer:
            "No. The PDF is assembled entirely in your browser. This site has no upload endpoint, and your images never leave your device.",
        },
        {
          question: "Why convert WebP to PDF?",
          answer:
            "WebP is common on websites but not everywhere else. A PDF is easy to share, print, and open in older software that cannot display WebP.",
        },
        {
          question: "Can I combine several WebP files into one PDF?",
          answer:
            "Yes. Select as many as you like, or add more later. Each image becomes its own page, in the order shown in the list.",
        },
        {
          question: "Is quality preserved?",
          answer:
            "Images are re-encoded as JPEG at a high quality setting because PDF cannot store WebP directly. For photos and web graphics the difference is not noticeable.",
        },
        {
          question: "Does this work on mobile?",
          answer:
            "Yes. Your browser must be able to decode WebP, which current versions of Chrome, Firefox, Safari, and Edge can. The tool tells you if a file cannot be read.",
        },
        {
          question: "What is the name of the PDF?",
          answer:
            "A single image keeps its own name, so banner.webp becomes banner.pdf. Several images produce images.pdf.",
        },
      ]}
    />
  );
}
