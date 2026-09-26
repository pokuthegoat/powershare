import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/config";
import { Providers } from "@/components/Providers";
import { SmoothScroll } from "@/components/SmoothScroll";

/** Headlines: Geist Sans (a variable font, so any weight is available), set light and tight. Body: Instrument Sans. Labels, numbers, nav and buttons: JetBrains Mono. */
const display = Geist({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "PowerShare: Your GPU is sitting idle. Make it work.",
  description:
    "Download the PowerShare app, connect your GPU, contribute while it's idle and earn rewards you can cash out for stocks.",
  openGraph: {
    title: "PowerShare",
    description: "Your GPU is sitting idle. Make it work. GPU power for stocks.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Providers>{children}</Providers>
        <SmoothScroll />
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
