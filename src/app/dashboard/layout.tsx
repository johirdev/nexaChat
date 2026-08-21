import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import AuthProvider from "../AuthProvider";
import QueryProvider from "@/src/lib/providers/QueryProvider";
import SocketProvider from "@/src/lib/providers/SocketProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Phone numbers and timestamps line up better in a monospace face.
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chats",
  // Everything here is behind a session, so a crawler would only ever see the
  // loading screen. Keep it out of the index entirely.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08131f",
  // The composer must not zoom the layout on iOS when it gains focus.
  maximumScale: 1,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} ${jetBrainsMono.variable}`}
      style={{ display: "contents" }}
    >
      <QueryProvider>
        <AuthProvider>
          <SocketProvider>
            <div className="max-h-screen relative overflow-hidden">
              {children}
            </div>
          </SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </div>
  );
}
