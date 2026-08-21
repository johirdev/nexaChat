import type { Metadata } from "next";
import HomeLandingPage, {
  FAQ,
} from "../components/HomeLandingPage/HomeLandingPage";
import JsonLd from "../components/Seo/JsonLd";
import {
  absoluteUrl,
  siteDescription,
  siteName,
  siteTagline,
} from "@/src/lib/seo";

const title = `${siteName} — ${siteTagline}`;

export const metadata: Metadata = {
  // `absolute` keeps the home page off the "%s | NexaChat" template.
  title: { absolute: title },
  description: siteDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    title,
    description: siteDescription,
  },
  twitter: { title, description: siteDescription },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: siteName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/nexaChat.png"),
    description: siteDescription,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "johirulislam574206@gmail.com",
      areaServed: "BD",
      availableLanguage: ["English", "Bengali"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: siteName,
    url: absoluteUrl("/"),
    description: siteDescription,
    inLanguage: "en",
    publisher: { "@id": absoluteUrl("/#organization") },
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "CommunicationApplication",
    operatingSystem: "Web browser",
    url: absoluteUrl("/"),
    description: siteDescription,
    featureList: [
      "One-to-one direct messages",
      "Group conversations with admins",
      "Realtime delivery over WebSocket",
      "Phone-number sign-in with no password",
      "Searchable people directory",
      "Message history with infinite scroll",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": absoluteUrl("/#faq"),
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
];

export default function Home() {
  return (
    <>
      <JsonLd data={structuredData} />
      <HomeLandingPage />
    </>
  );
}
