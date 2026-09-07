import type { Metadata } from "next";

import { ImageCompressionToolPage } from "@/features/image-compression/components/tool-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/compress-webp";

export const metadata: Metadata = buildPageMetadata({
  title: "Compress WebP Online – Free & Private",
  description:
    "Reduce WebP image size directly in your browser. Choose your quality level and compress files without uploading them.",
  path: PATH,
});

export default function CompressWebpPage() {
  return (
    <ImageCompressionToolPage
      path={PATH}
      format="webp"
      heading="Compress WebP Online"
      intro="Make WebP images lighter for faster pages while choosing how much quality to keep. Transparency is preserved, dimensions stay the same, and nothing is uploaded."
      steps={[
        "Choose your WebP images, or drag them onto the page. You can add more at any time.",
        "Pick a quality preset: Smaller File, Balanced, or Best Quality.",
        "Press Compress WebP. Each image is processed one after another.",
        "Compare the sizes, then download each image or all of them as a ZIP.",
      ]}
      privacy="Your images are decoded and re-encoded by your browser's own WebP encoder. No file is sent to a server or stored remotely. Your images exist only in your browser's memory while this page is open."
      formatSection={{
        title: "How WebP compression works here",
        description:
          "Each image is decoded and encoded again as WebP at the quality you choose, so the encoder can discard detail you are unlikely to notice. Transparent areas stay transparent. Metadata is not carried over. If re-encoding would not make a file smaller, the original is kept and marked as already optimized. Your browser must be able to create WebP images; current versions of Chrome, Firefox, Safari, and Edge can, and the tool tells you if yours cannot.",
      }}
      faqs={[
        {
          question: "Are my images uploaded?",
          answer:
            "No. Compression runs entirely in your browser. This site has no upload endpoint, and your images never leave your device.",
        },
        {
          question: "Is transparency preserved?",
          answer:
            "Yes. The image is redrawn onto a transparent canvas and encoded as WebP with its alpha channel intact.",
        },
        {
          question: "Will the image dimensions change?",
          answer:
            "No. Width and height stay exactly the same. Only the amount of compression changes.",
        },
        {
          question: "Does this work with lossless WebP files?",
          answer:
            "Yes, but the output is always lossy WebP at the chosen quality. For graphics that must stay pixel-exact, keep the original; the tool will hand it back unchanged if re-encoding would not save space.",
        },
        {
          question: "Can I compress many images at once?",
          answer:
            "Yes. Select as many as you like, or add more later. Each is compressed in turn with a progress indicator, and Download All packs the results into one ZIP.",
        },
        {
          question: "What is the output file called?",
          answer:
            "The original name with -compressed added, so hero.webp becomes hero-compressed.webp. A batch downloads as compressed-webp.zip.",
        },
      ]}
    />
  );
}
