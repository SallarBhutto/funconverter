import type { Metadata } from "next";

import { ImageToPdfToolPage } from "@/features/image-to-pdf/components/tool-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/png-to-pdf";

export const metadata: Metadata = buildPageMetadata({
  title: "PNG to PDF Converter – Free & Private",
  description:
    "Convert PNG images to PDF directly in your browser. Combine multiple PNGs, keep their full quality, arrange pages, and download without uploading files.",
  path: PATH,
});

export default function PngToPdfPage() {
  return (
    <ImageToPdfToolPage
      path={PATH}
      format="png"
      heading="Convert PNG to PDF Online"
      intro="Turn one or many PNG images into a single PDF without losing a pixel. Choose the order, page size, and margins. Everything runs inside your browser, so your images are never uploaded."
      steps={[
        "Choose your PNG images, or drag them onto the page. You can add more at any time.",
        "Arrange the order by dragging cards or using the move buttons. Each image becomes one page.",
        "Pick a page size, orientation, and margin.",
        "Press Create PDF, then download the finished file.",
      ]}
      privacy="Your images are read and placed into the PDF by your browser. No file is sent to a server or stored remotely. Your images exist only in your browser's memory while this page is open."
      formatSection={{
        title: "How PNG images are placed",
        description:
          "PNG is lossless, and the PDF keeps it that way: the original PNG data is embedded directly, so screenshots, diagrams, and line art stay pixel-exact. Transparent areas are placed over the white page.",
        points: [
          {
            title: "Lossless source, lossless PDF",
            body: "No re-compression. Sharp text and flat colours in screenshots stay crisp.",
          },
          {
            title: "Transparency on white",
            body: "PDF pages are white, so transparent regions appear white. The transparency itself is preserved inside the file.",
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
          question: "What happens to transparent PNGs?",
          answer:
            "The image is placed on a white page, so transparent areas look white. The PDF still stores the transparency, which matters if you later place the page on another background.",
        },
        {
          question: "Can I combine several PNGs into one PDF?",
          answer:
            "Yes. Select as many as you like, or add more later. Each image becomes its own page, in the order shown in the list.",
        },
        {
          question: "Does the PDF keep full quality?",
          answer:
            "Yes. PNG data is embedded without re-encoding. The PDF will be roughly the combined size of your images.",
        },
        {
          question: "Which page size should I choose?",
          answer:
            "A4 and Letter give you standard printable pages. Fit to image makes each page exactly the shape of its image, which suits screenshots and graphics.",
        },
        {
          question: "What is the name of the PDF?",
          answer:
            "A single image keeps its own name, so diagram.png becomes diagram.pdf. Several images produce images.pdf.",
        },
      ]}
    />
  );
}
