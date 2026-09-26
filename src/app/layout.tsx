import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "@fontsource-variable/dm-sans";
import "./globals.css";
import { SITE } from "@/lib/config";
import { Providers } from "@/components/Providers";
import { SmoothScroll } from "@/components/SmoothScroll";

/** The heading face (see --font-heading in globals.css); body text stays DM Sans. Self-hosted by next/font. */
const geist = Geist({ subsets: ["latin"], weight: "700", variable: "--font-geist", display: "swap" });

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
  themeColor: "#040b2c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
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
