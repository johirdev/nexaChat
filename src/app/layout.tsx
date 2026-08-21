import type { Metadata, Viewport } from "next";
import "./globals.css";
import {
  absoluteUrl,
  siteDescription,
  siteKeywords,
  siteName,
  siteTagline,
  siteUrl,
} from "@/src/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — ${siteTagline}`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/nexaChat.png", type: "image/png" }],
    apple: [{ url: "/nexaChat.png" }],
  },
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    url: absoluteUrl("/"),
    title: `${siteName} — ${siteTagline}`,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — ${siteTagline}`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false },
  category: "communication",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070c1a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      {/* Browser extensions commonly stamp attributes onto <body> before React
          hydrates; suppressing here avoids a spurious mismatch warning. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
