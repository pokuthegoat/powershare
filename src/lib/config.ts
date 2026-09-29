export const SITE = {
  name: "SubPad",
  tagline: "Coins for the subreddits you're already in.",
  contactEmail: "subpad.hq@gmail.com",
  url: "https://subpad.app",
} as const;

/** Public Privy identifier. With no App ID the sign-up buttons stay as a "Coming soon" placeholder. */
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || undefined;

/** The only wallet that can see /admin. Public by nature (it's just an address), checked server-side on every admin request — see adminAuth.server.ts. */
export const ADMIN_WALLET = (process.env.NEXT_PUBLIC_ADMIN_WALLET || undefined)?.toLowerCase();

/** Default creator tax suggested at launch, and the protocol's cap. */
export const DEFAULT_CREATOR_TAX = 3;
export const MAX_CREATOR_TAX = 10;

export const NAV_LINKS = [
  { label: "Launch", href: "/launch" },
  { label: "Claim", href: "/claim" },
  { label: "Subreddits", href: "/subreddits" },
  { label: "Help", href: "/help" },
] as const;
