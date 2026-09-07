import type { Metadata } from "next";

import { ImageToPdfToolPage } from "@/features/image-to-pdf/components/tool-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/jpg-to-pdf";

export const metadata: Metadata = buildPageMetadata({
  title: "JPG to PDF Converter – Free & Private",
  description:
    "Convert JPG images to PDF directly in your browser. Combine multiple images, arrange pages, and download your PDF without uploading files.",
  path: PATH,
});

export default function JpgToPdfPage() {
  return (
    <ImageToPdfToolPage
      path={PATH}
      format="jpeg"
      heading="Convert JPG to PDF Online"
      intro="Combine one or many JPG photos into a single PDF, in the order you choose, with the page size and margins you want. Everything happens inside your browser; your photos are never uploaded."
      steps={[
        "Choose your JPG images, or drag them onto the page. You can add more at any time.",
        "Arrange the order by dragging cards or using the move buttons. Each image becomes one page.",
        "Pick a page size, orientation, and margin.",
        "Press Create PDF, then download the finished file.",
      ]}
      privacy="Your images are read and placed into the PDF by your browser. No file is sent to a server or stored remotely. Your images exist only in your browser's memory while this page is open. The tool works the same on a phone as on a desktop."
      formatSection={{
        title: "How JPG photos are placed",
        description:
          "JPG data is copied into the PDF as-is, so there is no second round of compression and no quality loss. Phone photos that rely on an orientation flag are straightened first so the PDF matches what you see on screen.",
        points: [
          {
            title: "No re-compression",
            body: "The original JPEG bytes are embedded directly. A 3 MB photo adds about 3 MB to the PDF.",
          },
          {
            title: "Correct orientation",
            body: "EXIF-rotated photos are rotated to their upright view before being placed on the page.",
          },
          {
            title: "One image per page",
            body: "Each photo is scaled to fit its page without cropping or stretching and centred within the margin.",
          },
        ],
      }}
      faqs={[
        {
          question: "Are my photos uploaded?",
          answer:
            "No. The PDF is assembled entirely in your browser. This site has no upload endpoint, and your images never leave your device.",
        },
        {
          question: "Can I combine several JPGs into one PDF?",
          answer:
            "Yes. Select as many as you like, or add more later. Each image becomes its own page, in the order shown in the list.",
        },
        {
          question: "How do I change the page order?",
          answer:
            "Drag a card to a new position, or use the up and down arrows on each card. The arrows also work with a keyboard.",
        },
        {
          question: "Which page size should I choose?",
          answer:
            "A4 and Letter give you standard printable pages with the photo fitted inside. Fit to image makes each page exactly the shape of its photo, which is best for screens.",
        },
        {
          question: "Will the PDF reduce photo quality?",
          answer:
            "No. JPG data is embedded unchanged. Only photos that need rotating are re-encoded, at high quality.",
        },
        {
          question: "What is the name of the PDF?",
          answer:
            "A single image keeps its own name, so holiday.jpg becomes holiday.pdf. Several images produce images.pdf. You can rename the file after downloading.",
        },
      ]}
    />
  );
}
