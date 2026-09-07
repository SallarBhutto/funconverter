import type { Metadata } from "next";
import Link from "next/link";

import { TextPage, TextSection, type TextBlock } from "@/components/content/text-page";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site-config";

const PATH = "/privacy";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How FileHush handles your files and your visit. Conversion and compression run locally in your browser; files are not uploaded to or stored by FileHush.",
  path: PATH,
});

interface Section {
  id: string;
  title: string;
  body: readonly TextBlock[];
}

const sections: readonly Section[] = [
  {
    id: "files",
    title: "Your files stay on your device",
    body: [
      "Every FileHush converter and compressor runs inside the web page you have open, using ordinary browser technology: JavaScript, canvas, Web Workers and WebAssembly. When you select a PDF or an image:",
      [
        "the file is read by the page, on your own device;",
        "the conversion or compression is performed there, in your browser's memory;",
        "the result is written to your device only when you choose to download or save it.",
      ],
      "FileHush has no upload endpoint and no server-side conversion service. The files you select are not sent to us for processing and are not stored by us. Because the work happens in the page, we cannot see the contents of the files you process, their names, or how many of them there are.",
      "This describes what FileHush itself does. It is not a statement about everything else running on your device. Your operating system, your browser's own features, any browser extensions you have installed, and other software on your device or network are outside our control.",
    ],
  },
  {
    id: "information-received",
    title: "Information this website may receive",
    body: [
      "Serving a website still involves ordinary web requests. When your browser loads a FileHush page or one of its files, the infrastructure that serves it may process technical request information, including:",
      [
        "your IP address;",
        "browser and device information, such as the user-agent string;",
        "the page or file requested;",
        "the date and time of the request;",
        "other diagnostic, security and server log data.",
      ],
      "This is the information any web server receives in order to return a page and to protect itself from abuse. It is separate from the files you convert, it does not reveal their contents, and FileHush does not use it to build a profile of you.",
    ],
  },
  {
    id: "infrastructure",
    title: "Hosting",
    body: [
      "FileHush is hosted on Vercel, which provides the servers and content delivery for the site. As part of delivering and protecting the site, Vercel may process the kind of request information described above, under its own terms and privacy practices.",
      "The pages, scripts, fonts and processing components the site uses are served from the FileHush domain itself, as is the Vercel Web Analytics script described below. Beyond Vercel, FileHush does not currently embed a third-party service that would receive information about your visit.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    body: [
      "FileHush does not require or provide user accounts. There is no sign-up, no login and no user profile, so there are no account details for us to collect or hold.",
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    body: [
      "FileHush uses Vercel Web Analytics to count visits and see which tools people use. It records a page view when you open a page: the page address, the referring page if there is one, and coarse technical details such as approximate country, device type, operating system and browser.",
      "It is aggregate traffic measurement, not tracking. It sets no cookies, stores nothing in your browser, and does not build a profile of you or follow you to other websites. Vercel derives a visitor count without retaining your IP address for that purpose.",
      "It measures pages, not the work you do on them. The files you convert or compress are never sent anywhere, so no filename, file content, file size or conversion result is available to analytics or to us.",
      "If we change how we measure usage, or add marketing analytics, this policy will be updated to describe the relevant data practices.",
    ],
  },
  {
    id: "advertising",
    title: "Advertising",
    body: [
      "FileHush does not currently display advertising and does not use advertising or cross-site tracking technologies.",
      "If advertising is introduced in the future, this policy will be updated to describe it.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    body: [
      "The FileHush file tools do not need cookies to work. The site sets no cookies of its own, and it does not use local storage, session storage or similar browser storage to identify or track you. The analytics described above are cookieless and leave nothing on your device, so there is no consent banner to click through.",
      "Your browser and the hosting infrastructure may still use ordinary technical mechanisms of their own, such as caching or protective measures applied by the host. FileHush does not control those and does not use them to identify you.",
    ],
  },
  {
    id: "email",
    title: "If you email us",
    body: [
      `If you write to ${siteConfig.contactEmail}, your message reaches an ordinary email inbox, operated through an email provider. Email is not processed in your browser, so the local-processing description above does not apply to it.`,
      "Your email address, the contents of your message and anything you attach may be kept for as long as needed to reply to you, to deal with the issue you raised, to prevent abuse, or to keep records where that is necessary. Please send only what you need to; the Contact page explains what usually helps.",
    ],
  },
  {
    id: "children",
    title: "Children",
    body: [
      "FileHush is a general-purpose file utility and is not directed at children. It does not ask for a name, an age or any other personal detail in order to work, and it does not knowingly collect personal information from children.",
    ],
  },
  {
    id: "security",
    title: "Security",
    body: [
      "Because the tools run locally, using FileHush does not require you to transmit your documents to us at all, which removes a common source of risk. The site is served over HTTPS.",
      "No website, browser or network can be guaranteed to be completely secure, and we do not claim otherwise. Treat sensitive documents with the same care you would apply to any other software on your device.",
    ],
  },
  {
    id: "international",
    title: "Where information is handled",
    body: [
      "FileHush is available worldwide, and you can use it from any country. Your files are processed on your own device, wherever you are.",
      "The infrastructure that serves the website operates in several regions, so the technical request information described above may be handled on servers in a country other than your own, in the locations where the provider operates.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "This policy describes how FileHush works today. If that changes — for example if analytics, advertising, accounts or any server-side handling of files is introduced — this page will be updated and the effective date at the top will change with it.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <TextPage
      heading="Privacy Policy"
      intro="FileHush converts and compresses files inside your browser. This page explains what happens to those files, and what limited information the website itself receives."
      effectiveDate={siteConfig.legalEffectiveDate}
    >
      {sections.map((section) => (
        <TextSection key={section.id} id={section.id} title={section.title} body={section.body} />
      ))}

      <TextSection
        id="contact"
        title="Contact"
        body={[
          `FileHush is operated by ${siteConfig.operator} as an individual, not through a registered company.`,
        ]}
      >
        <p>
          For privacy questions or requests, email{" "}
          <Link
            href={`mailto:${siteConfig.contactEmail}`}
            className="font-medium text-accent underline underline-offset-4"
          >
            {siteConfig.contactEmail}
          </Link>
          . The <Link href="/contact" className="text-accent underline underline-offset-4">Contact page</Link>{" "}
          has a little more detail on what to send.
        </p>
      </TextSection>
    </TextPage>
  );
}
