import type { Metadata } from "next";
import GuidePage, { STEPS, TROUBLE } from "../../components/Guide/GuidePage";
import JsonLd from "../../components/Seo/JsonLd";
import { absoluteUrl, siteName } from "@/src/lib/seo";

const title = "User guide — your first five minutes with NexaChat";
const description =
  "A six-step walkthrough of NexaChat: sign in with your phone number, find people, send your first message, start a group, manage members and admins, and take it with you.";

export const metadata: Metadata = {
  title: "User guide",
  description,
  alternates: { canonical: "/guide" },
  openGraph: {
    type: "article",
    url: absoluteUrl("/guide"),
    title,
    description,
  },
  twitter: { title, description },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "User guide",
        item: absoluteUrl("/guide"),
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use NexaChat",
    description,
    url: absoluteUrl("/guide"),
    totalTime: "PT5M",
    inLanguage: "en",
    supply: [
      { "@type": "HowToSupply", name: "A phone number" },
      { "@type": "HowToSupply", name: "Any modern web browser" },
    ],
    step: STEPS.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.heading,
      text: step.body,
      url: `${absoluteUrl("/guide")}#walkthrough`,
      image: absoluteUrl(step.image),
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": absoluteUrl("/guide#troubleshooting"),
    name: `${siteName} troubleshooting`,
    mainEntity: TROUBLE.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
];

export default function Guide() {
  return (
    <>
      <JsonLd data={structuredData} />
      <GuidePage />
    </>
  );
}
