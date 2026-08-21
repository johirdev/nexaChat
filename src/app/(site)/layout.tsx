import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "../globals.css";

import Navbar from "../Layout/Client/Navbar/Navbar";
import Footer from "../Layout/Client/Footer/Footer";
import AuthProvider from "../AuthProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal"],
  variable: "--font-montserrat",
  display: "swap",
});

const siteUrl = "https://nexaChat.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "NexaChat | conversations in motion",
    template: "%s | NexaChat",
  },
  description: "A clearer, faster way to stay close to your people.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07111f",
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${montserrat.variable} min-h-full flex flex-col font-montserrat`}
    >
      <AuthProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </AuthProvider>
    </div>
  );
}
