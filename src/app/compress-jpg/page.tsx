import type { Metadata } from "next";

import { ImageCompressionToolPage } from "@/features/image-compression/components/tool-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/compress-jpg";

export const metadata: Metadata = buildPageMetadata({
  title: "Compress JPG Online – Free & Private",
  description:
    "Compress JPG images directly in your browser. Reduce JPEG file size while keeping control of image quality, with no uploads required.",
  path: PATH,
});

export default function CompressJpgPage() {
  return (
    <ImageCompressionToolPage
      path={PATH}
      format="jpeg"
      heading="Compress JPG Online"
      intro="Shrink one or many JPG photos to a fraction of their size while choosing how much quality to keep. Dimensions stay the same, and nothing is uploaded: your browser does the work."
      steps={[
        "Choose your JPG images, or drag them onto the page. You can add more at any time.",
        "Pick a quality preset: Smaller File, Balanced, or Best Quality.",
        "Press Compress JPG. Each image is processed one after another.",
        "Compare the sizes, then download each image or all of them as a ZIP.",
      ]}
      privacy="Your photos are decoded and re-encoded by your browser. No file is sent to a server or stored remotely. Your images exist only in your browser's memory while this page is open. The tool works the same on a phone as on a desktop."
      formatSection={{
        title: "How JPG compression works here",
        description:
          "JPG is a lossy format: each image is decoded and encoded again at the quality you choose, so the encoder can discard detail you are unlikely to notice. Camera metadata such as EXIF is not carried over, which removes a little more size, and photos taken on a phone come out upright because the rotation is baked into the pixels. If re-encoding would not make a file smaller, the original is kept and marked as already optimized.",
      }}
      faqs={[
        {
          question: "Are my photos uploaded?",
          answer:
            "No. Compression runs entirely in your browser. This site has no upload endpoint, and your images never leave your device.",
        },
        {
          question: "Will the image dimensions change?",
          answer:
            "No. Width and height stay exactly the same. Only the amount of compression changes. Resizing is a separate feature.",
        },
        {
          question: "How much smaller will my JPG be?",
          answer:
            "It depends on how the original was saved. Photos straight from a camera or phone often shrink by half or more on Balanced. A JPG that was already heavily compressed may barely change, in which case the tool keeps the original rather than handing you a larger file.",
        },
        {
          question: "Is EXIF data kept?",
          answer:
            "No. Location, camera model, and other metadata are removed as part of re-encoding. If you need to keep that data, do not compress the file here.",
        },
        {
          question: "Can I compress many photos at once?",
          answer:
            "Yes. Select as many as you like, or add more later. Each is compressed in turn with a progress indicator, and Download All packs the results into one ZIP.",
        },
        {
          question: "What is the output file called?",
          answer:
            "The original name with -compressed added, so holiday.jpg becomes holiday-compressed.jpg. A batch downloads as compressed-jpg.zip.",
        },
      ]}
    />
  );
}
