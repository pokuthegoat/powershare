"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { PRIVY_APP_ID } from "@/lib/config";

/**
 * App-wide client providers. Server components passed as `children` stay server-rendered.
 * Accounts are created by connecting an existing wallet (external-wallet login only, the same as GameStock): no embedded
 * wallets are created and no chain is chosen here. The login methods here must match the Privy dashboard.
 * Without an App ID Privy is skipped entirely and the sign-up buttons show a placeholder.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) return <>{children}</>;

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["wallet"],
        appearance: { theme: "dark", accentColor: "#2450e6", showWalletLoginFirst: true },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
