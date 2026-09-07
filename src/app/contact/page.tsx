import type { Metadata } from "next";
import Link from "next/link";

import { TextPage, TextSection } from "@/components/content/text-page";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site-config";

const PATH = "/contact";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Get in touch with FileHush by email for questions, feedback, bug reports or privacy requests.",
  path: PATH,
});

export default function ContactPage() {
  return (
    <TextPage
      heading="Contact"
      intro="For questions, feedback, bug reports or privacy-related requests, you can email FileHush. There is no contact form; one address handles everything."
    >
      <TextSection id="email" title="Email">
        <p>
          <Link
            href={`mailto:${siteConfig.contactEmail}`}
            className="text-lg font-medium text-accent underline underline-offset-4"
          >
            {siteConfig.contactEmail}
          </Link>
        </p>
        <p>
          FileHush is run personally by {siteConfig.operator}, so replies may take a few days.
        </p>
      </TextSection>

      <TextSection
        id="files"
        title="Please do not send us your files"
        body={[
          "FileHush processes files in your browser and never receives them, so support almost never needs your document. Please do not email confidential or sensitive files just to ask a question — send them only if we have agreed that a specific file is genuinely needed to investigate a problem, and only if you are comfortable sharing it.",
          "Unlike the file tools, email is not processed on your device. Anything you send arrives in an ordinary inbox.",
        ]}
      />

      <TextSection
        id="bug-reports"
        title="Reporting a problem"
        body={[
          "A bug report is usually easy to act on without the file itself. What helps most:",
          [
            "which tool you were using, or the page address;",
            "your browser and operating system, including the version if you know it;",
            "the size and rough type of the file, for example a 40-page scanned PDF;",
            "what you expected to happen, and what happened instead, including any message shown.",
          ],
        ]}
      />

      <TextSection
        id="privacy-requests"
        title="Privacy requests"
        body={[
          "Privacy questions and requests go to the same address. FileHush holds no account data and never receives the files you convert, so in most cases there is nothing about you for us to look up.",
        ]}
      >
        <p>
          The{" "}
          <Link href="/privacy" className="text-accent underline underline-offset-4">
            Privacy Policy
          </Link>{" "}
          sets out what the site does and does not receive, including what happens to the emails you
          send us.
        </p>
      </TextSection>
    </TextPage>
  );
}
