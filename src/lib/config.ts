export const SITE = {
  name: "SubPad",
  tagline: "Coins for the subreddits you're already in.",
  contactEmail: "subpad.hq@gmail.com",
  url: "https://subpad.app",
} as const;

/** Public Privy identifier. With no App ID the sign-up buttons stay as a "Coming soon" placeholder. */
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || undefined;

/** Default creator tax suggested at launch, and the protocol's cap. */
export const DEFAULT_CREATOR_TAX = 3;
export const MAX_CREATOR_TAX = 10;

export const NAV_LINKS = [
  { label: "Launch", href: "/launch" },
  { label: "Claim", href: "/claim" },
  { label: "Subreddits", href: "/subreddits" },
  { label: "Help", href: "/help" },
] as const;

/** Example subreddit coins for the landing page marquee. Not live data. */
export const EXAMPLE_COINS = [
  { symbol: "NBA", name: "r/nba" },
  { symbol: "WSB", name: "r/wallstreetbets" },
  { symbol: "GAMING", name: "r/gaming" },
  { symbol: "MOVIES", name: "r/movies" },
  { symbol: "CATS", name: "r/cats" },
  { symbol: "DIY", name: "r/DIY" },
] as const;
