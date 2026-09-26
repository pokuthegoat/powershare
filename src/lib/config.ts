export const SITE = {
  name: "PowerShare",
  tagline: "GPU power for stocks.",
  contactEmail: "hello@powershare.app",
  url: "https://powershare.app",
} as const;

/** Public Privy identifier. With no App ID the sign-up buttons stay as a "Coming soon" placeholder. */
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || undefined;

/** Where the Download button points. Until the Windows build is published it jumps to the app section. */
export const DOWNLOAD_URL = process.env.NEXT_PUBLIC_DOWNLOAD_URL || "/#the-app";

/** 90 minutes connected = $1. */
export const MINUTES_PER_DOLLAR = 90;

export const NAV_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "What It Pays", href: "/#what-it-pays" },
  { label: "The App", href: "/#the-app" },
  { label: "FAQ", href: "/#faq" },
] as const;

/** Example reward tickers. */
export const REWARD_TICKERS = [
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "MSFT", name: "Microsoft" },
] as const;
