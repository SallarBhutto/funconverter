import type { Metadata } from "next";

import { ImageCompressionToolPage } from "@/features/image-compression/components/tool-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/compress-png";

export const metadata: Metadata = buildPageMetadata({
  title: "Compress PNG Online – Free & Private",
  description:
    "Compress PNG images privately in your browser with lossless optimization and no file uploads.",
  path: PATH,
});

export default function CompressPngPage() {
  return (
    <ImageCompressionToolPage
      path={PATH}
      format="png"
      heading="Compress PNG Online"
      intro="Make PNG files smaller without changing a single pixel. Transparency, colours, and dimensions stay exactly as they are; only the way the data is packed improves. Nothing is uploaded."
      steps={[
        "Choose your PNG images, or drag them onto the page. You can add more at any time.",
        "Press Compress PNG. There is no quality setting because nothing is thrown away.",
        "Compare the sizes. Files that were already optimized are kept unchanged.",
        "Download each image or all of them as a ZIP.",
      ]}
      privacy="Your images are optimized by your browser using a WebAssembly build of OxiPNG. No file is sent to a server or stored remotely. Your images exist only in your browser's memory while this page is open."
      formatSection={{
        title: "Why PNG savings are smaller",
        description:
          "PNG uses lossless compression, so savings may be smaller than JPG or WebP. This tool re-packs the existing pixel data with better filters and deflate settings, and drops nothing you can see. Typical results range from a few percent to around a third for screenshots and graphics exported without optimization; a PNG that was already optimized may not shrink at all, and in that case the original is kept.",
        points: [
          {
            title: "Lossless",
            body: "Every pixel and every level of transparency is identical before and after.",
          },
          {
            title: "Honest results",
            body: "If the optimizer cannot beat the original, you get the original back, marked as already optimized. Never a larger file.",
          },
          {
            title: "Same dimensions",
            body: "Width and height never change. Resizing is a separate feature.",
          },
        ],
      }}
      faqs={[
        {
          question: "Are my images uploaded?",
          answer:
            "No. Optimization runs entirely in your browser. This site has no upload endpoint, and your images never leave your device.",
        },
        {
          question: "Why is there no quality slider?",
          answer:
            "PNG compression here is lossless, so there is no quality to trade away. A slider would imply a choice that does not exist for this format.",
        },
        {
          question: "Does transparency survive?",
          answer:
            "Yes. The optimizer works on the PNG data itself rather than redrawing the image, so alpha channels are preserved exactly.",
        },
        {
          question: "Why did some files not get smaller?",
          answer:
            "Design tools and other optimizers often save PNGs that are already tightly packed. When the result would not be smaller, the tool keeps your original and labels it already optimized instead of giving you a bigger file.",
        },
        {
          question: "Is metadata removed?",
          answer:
            "Text chunks and similar metadata may be dropped as part of optimization. Image data is never touched.",
        },
        {
          question: "What is the output file called?",
          answer:
            "The original name with -compressed added, so logo.png becomes logo-compressed.png. A batch downloads as compressed-png.zip.",
        },
      ]}
    />
  );
}
