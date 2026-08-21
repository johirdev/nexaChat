import { Hind_Siliguri, Inter } from "next/font/google";
import "../globals.css";

import Navbar from "../Layout/Client/Navbar/Navbar";
import Footer from "../Layout/Client/Footer/Footer";
import AuthProvider from "../AuthProvider";

// Inter carries the Latin text; Hind Siliguri covers Bengali so a mixed line
// keeps one optical weight instead of falling back to a system face.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

/* Metadata, viewport and the social card all live in the root layout so there
   is a single canonical definition; pages below override only their own title,
   description and canonical URL. */

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${inter.variable} ${hindSiliguri.variable} ln-site min-h-full flex flex-col`}
    >
      {/* Public pages: read the session, never redirect on the absence of one. */}
      <AuthProvider requireAuth={false}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </AuthProvider>
    </div>
  );
}
