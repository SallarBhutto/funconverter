import type { Metadata } from "next";
import Link from "next/link";

import { TextPage, TextSection, type TextBlock } from "@/components/content/text-page";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site-config";

const PATH = "/terms";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use",
  description:
    "The terms that apply to FileHush, a free set of browser-based file conversion and compression tools. What the service does, what you are responsible for, and what is not guaranteed.",
  path: PATH,
});

interface Section {
  id: string;
  title: string;
  body: readonly TextBlock[];
}

const sections: readonly Section[] = [
  {
    id: "acceptance",
    title: "Agreeing to these terms",
    body: [
      "By using the FileHush website and its tools, you agree to these terms. If you do not agree with them, please do not use the site.",
    ],
  },
  {
    id: "service",
    title: "What FileHush provides",
    body: [
      "FileHush is a collection of tools for converting and compressing PDF and image files. The tools run in your web browser and process the files you select on your own device; the files are not uploaded to FileHush for conversion. There is no account, and no part of the site requires you to register.",
    ],
  },
  {
    id: "your-files",
    title: "Your files are your responsibility",
    body: [
      "You decide which files to process, and you are responsible for them. In particular, you should:",
      [
        "have the rights and permissions you need to use and process each file;",
        "check every output file before you rely on it;",
        "keep backups of anything important, and keep your originals until you have confirmed the result.",
      ],
      "Because there is no upload, FileHush does not receive, review, moderate or store the files you process. Nothing in these terms should be read as FileHush having inspected or approved them.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: [
      "You must not use FileHush or this website to:",
      [
        "break any law that applies to you;",
        "infringe copyright, trade marks, privacy or other rights;",
        "attack, overload, probe or otherwise interfere with the website or the infrastructure that serves it;",
        "gain or attempt to gain unauthorised access to any part of the service, or to circumvent its security measures or technical limits;",
        "distribute malicious software, or otherwise use the service to harm others.",
      ],
      "Ordinary personal and commercial use of the tools is fine.",
    ],
  },
  {
    id: "results",
    title: "Results are not guaranteed",
    body: [
      "Converting and compressing a file changes it. Depending on the tool, the options you choose, your browser and the file you start with, the result may:",
      [
        "differ in visual quality from the original;",
        "lose metadata the original carried;",
        "change layout, colour or formatting;",
        "come out differently on another browser or device;",
        "fail entirely for files that are damaged, encrypted, unsupported, or too large to process in a browser.",
      ],
      "Some options are deliberately lossy, and the tool says so before you run it. The strongest PDF compression mode, for example, converts pages into images, which removes selectable text, links, form fields and other document features. Check the output before you delete an original or rely on a converted file.",
    ],
  },
  {
    id: "availability",
    title: "Availability",
    body: [
      "FileHush is provided on an as-available basis. Tools and features may be added, changed, suspended or removed, and the site may be unavailable at times, whether for maintenance or for reasons outside our control. There is no uptime commitment.",
    ],
  },
  {
    id: "cost",
    title: "Cost",
    body: [
      "The tools are currently offered free of charge, with no account and no watermark. That is the current position rather than a promise that every tool will always be free; if it changes, the site will say so.",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: [
      "The FileHush name, branding, website design, page content and original software belong to the operator or to the relevant licensors.",
      "You may not use the FileHush name, branding or other protected materials in a way that suggests affiliation, sponsorship or endorsement without permission. Third-party and open-source components remain subject to their respective licences.",
      "Your files remain yours. Processing a file with FileHush does not transfer ownership of the file or grant FileHush any rights in it.",
    ],
  },
  {
    id: "third-party-software",
    title: "Third-party and open-source software",
    body: [
      "FileHush is built with open-source and other third-party software components, each used under its own licence. Those projects belong to their respective authors. Nothing here claims any right in them, and their inclusion does not imply that they endorse FileHush.",
    ],
  },
  {
    id: "disclaimer",
    title: "Provided as is",
    body: [
      "To the maximum extent permitted by applicable law, FileHush is provided on an “as is” and “as available” basis, without warranties of any kind, whether express or implied. This includes implied warranties of merchantability, fitness for a particular purpose and non-infringement.",
      "We do not warrant that the site will be uninterrupted or error-free, or that any particular file will convert successfully or to any particular standard.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: [
      "To the maximum extent permitted by applicable law, the operator of FileHush is not liable for any indirect, incidental, special or consequential loss arising from your use of the site, and is not liable for:",
      [
        "loss of, or damage to, files or data;",
        "corrupted, incomplete or unusable output;",
        "metadata, text, links or formatting lost during conversion or compression;",
        "output that is not compatible with other software;",
        "business interruption or lost profits;",
        "decisions made, or actions taken, in reliance on a converted or compressed file.",
      ],
      "FileHush is a free tool that never receives your files, so it cannot recover them for you. Please keep your originals until you are satisfied with the result.",
    ],
  },
  {
    id: "mandatory-rights",
    title: "Rights that cannot be excluded",
    body: [
      "Nothing in these terms excludes or limits any right or remedy that cannot lawfully be excluded or limited under the law that applies to you. Where a limitation in these terms is not permitted by that law, it applies only to the extent that it is permitted.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: [
      "These terms may be updated as FileHush changes. The version on this page is always the current one, and the effective date at the top shows when it last changed. Continuing to use the site after an update means you accept the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <TextPage
      heading="Terms of Use"
      intro="These terms cover your use of the FileHush website and its file tools. FileHush is a free browser-based utility, and the terms are written for that — plainly, and no longer than they need to be."
      effectiveDate={siteConfig.legalEffectiveDate}
    >
      {sections.map((section) => (
        <TextSection key={section.id} id={section.id} title={section.title} body={section.body} />
      ))}

      <TextSection
        id="contact"
        title="Contact"
        body={[`FileHush is operated by ${siteConfig.operator}.`]}
      >
        <p>
          Questions about these terms can be sent to{" "}
          <Link
            href={`mailto:${siteConfig.contactEmail}`}
            className="font-medium text-accent underline underline-offset-4"
          >
            {siteConfig.contactEmail}
          </Link>
          . How your files and your visit are handled is described in the{" "}
          <Link href="/privacy" className="text-accent underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </TextSection>
    </TextPage>
  );
}
