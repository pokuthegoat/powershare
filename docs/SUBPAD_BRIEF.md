# SubPad: project brief for a new Claude session

Paste this whole file at the start of a session. It replaces `PROJECT_BRIEF.md` (PowerShare) — the user decided on 2026-09-28 to stop working on PowerShare and repurpose this same repo/site into a new product, SubPad. PowerShare's brief is kept in this folder for reference only; do not resume PowerShare work or assume it's active.

## 1. What SubPad is

Permissionless "subreddit treasury coins," modeled directly on an existing product called **FundPad** (fundpad.org), which does the identical thing for GoFundMe fundraisers. SubPad is the same mechanic, but for subreddits instead of fundraisers.

**The loop:**
1. Anyone launches a coin for any existing subreddit — no mod involvement or permission needed. The launcher pays the launch fee + gas themselves and cannot route fees to themselves.
2. Every buy/sell of the coin pays a creator tax (0–10%, set at launch), which accumulates automatically in an on-chain fee escrow tied to that specific subreddit.
3. A moderator of that subreddit proves ownership (see verification, section 4) and can then request the accumulated fees be paid out to their wallet.
4. The site owner (the user) manually sends the payout when they're next online — no automated release.

This is **not** a from-scratch crypto build. It's built directly on top of an existing, public, permissionless token-launch protocol (**Pons v2**, live on **Robinhood Chain**), the same protocol FundPad itself is built on. SubPad's actual job is small: a launch form, a way to prove subreddit ownership, and a claim queue — not tokenomics, not a DEX, not an escrow contract.

## 2. Where this came from / how it was scoped

This brief is the output of a single long planning conversation on 2026-09-28. The process was: look at FundPad's real, live site and docs to understand exactly how it works and what it's built on, then deliberately cut every piece that wasn't essential. Key research findings that shaped the plan:

- **FundPad doesn't build a chart or trading UI at all.** After a coin launches, it just links out to Pons's own hosted page (`ponsfamily.com/launchpad/<address>`) for buy/sell/charting. No Dexscreener or other embed anywhere in FundPad's stack (confirmed by inspecting live network requests) — though Dexscreener/GeckoTerminal/DEXTools do independently index Robinhood Chain/Pons pairs on their own sites, unrelated to FundPad.
- **Pons v2 is not FundPad's own tech.** It's a separate, public, permissionless launchpad protocol (fair-launch bonding curve, Uniswap v4 hook fee routing, live on Robinhood Chain, chain id **4663**). FundPad is a thin app layer on top of it — no bonding curve, DEX, or escrow contract was built by FundPad themselves, and none needs to be built by us either.
- **Pons's Fee Escrow contract pools balances by asset (ETH) per recipient address, not per token.** If every subreddit shared one recipient wallet, `claim()` would return one lump sum across every subreddit combined, with no way to tell whose money is whose. Fix: **a distinct recipient address per subreddit**, derived from one seed — confirmed this is exactly what FundPad itself does ("an address derived from the fundraiser").
- Read Pons v2's actual technical docs (not just marketing copy) to get real function names/mechanics — see section 5.

## 3. Reference project: GameStock (`D:\gamestock`)

Same as PowerShare's brief before it — reuse GameStock's account/points/payout/admin patterns, specifically its manual `requested → paid` payout flow, which is the direct model for SubPad's claim queue (see section 4). It's a Next.js app using `@libsql/client`, `jose`, and Privy with `PRIVY_APP_SECRET`. Read it before reusing anything; not yet deeply re-verified for this pivot.

## 4. Final settled design (2026-09-28)

**Launch flow:**
- Our own custom form on our own site (subreddit, coin name, ticker, description, image, creator tax — default ~3%, cap 10%), with a pre-sign cost/preview screen (fee routing target, tax %, launch fee, gas estimate, total).
- On submit, our frontend calls Pons v2's `launchToken(TokenParams, configId, pairToken)` directly (using a library like `viem` — confirmed this is literally what FundPad's own frontend does), signed by the user's connected wallet. No embed, no iframe — Pons is a smart contract, not a UI.
- `creatorFeeRecipient` in `TokenParams` is set to **our** per-subreddit derived address (see below), not the launcher's.
- **Explicitly rejected:** deep-linking to Pons's own `/launchpad/create` page instead of building our own form. Risk: if their create UI defaults the fee recipient to whoever's launching, it silently breaks the whole point of the product. Not worth the shortcut without confirming Pons's page supports setting a third-party recipient (not checked, so not used).

**Trading / charts:** we build none of it. After launch, link straight out to Pons's own page (`ponsfamily.com/launchpad/<token address>`) for buy/sell and the price chart, exactly like FundPad's "View on Pons" links.

**Fee tracking — per-subreddit derived address:** each subreddit gets its own dedicated recipient address (HD-derived from one seed we control), not a shared wallet, so `balanceOf(that address)` on Pons's escrow cleanly gives that one subreddit's accrued balance. Avoids needing to build a trade-event indexer.

**Verification — no Reddit OAuth login flow.** Instead of a full OAuth consent/redirect integration: the mod posts a short code somewhere only a moderator can edit (subreddit sidebar/description, or a stickied post) — same mechanic as FundPad's code-in-bio trick for GoFundMe — and we cross-check it against Reddit's **public** moderator list for that subreddit (readable without user login). Simpler to build than FundPad's own version, and arguably stronger since we cross-reference the public mod list rather than trusting the code alone. Likely still want a free, self-serve, read-only Reddit app registration (client ID/secret) for reliable API access, but not a login/OAuth flow for users.

**Claiming — custodial, manual, no automation.** This is a deliberate simplification from FundPad's own model (FundPad transfers on-chain fee-recipient ownership to the verified party so they self-claim trustlessly; we do not). Instead:
- We hold the wallet(s) that are `creatorFeeRecipient` at launch time.
- A verified mod clicks "Claim fees" → creates a pending request.
- The user (site owner) manually sends the payout whenever they're next online — identical in spirit to GameStock's `requested → paid` flow. No public announcement step, no waiting period, no automation.
- **Trade-off accepted knowingly:** this makes SubPad a trusted custodian of escrowed funds (technically capable of running off with them) rather than FundPad's "structurally nobody can touch it, including FundPad" pitch. Acceptable because the user already runs GameStock this way and is comfortable with manual-trust payout models.
- An earlier idea (publicly announce the payout wallet + wait a day before sending, mirroring FundPad's own safety ceremony) was discussed and explicitly dropped in favor of the simpler manual queue.

**Scope cut for v1:** build only Launch and Claim. Explicitly deferred (not core to the loop, add later): leaderboard, browse-all-subreddits page, share-card generator, dedicated docs/redirect pages.

## 5. Pons v2 technical reference (confirmed from docs.ponsfamily.com/v2)

**Contracts (Robinhood Chain, mainnet, chain id 4663):**
- Factory: `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e`
- Fee Escrow: `0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e`
- Buyback Vault: `0x42df2a798f82289E177311362e8f5ccC45c1219c`

**Key functions:**
- Launch: `launchToken(TokenParams, configId, pairToken)` — `creatorFeeRecipient` in `TokenParams` can be any address; a zero address defaults to the caller.
- Claim (native/ETH): `claim()` — pooled across every token where the caller is recipient, paid in ETH.
- Claim (custom quote asset): `claimToken(address token)` — separate ledger per quote asset.
- Redirect (not used in our custodial model, but available if we ever move to a trustless model later): `transferCreatorFeeRecipient(token, newRecipient)` — callable only by the *current* recipient, takes effect immediately, no timelock, does not move already-accrued balances.
- Read balances: `balanceOf(recipient)` (pooled native total) / `balanceOfToken(recipient, token)` (per quote asset).
- Separate protocol-level "community takeover" mechanism exists for abandoned tokens (3-day public proposal + 3-day execution window) — not relevant to our flow, only triggered by Pons themselves.

**Risk disclosures FundPad itself makes about Pons v2 (inherited by anyone building on it, including us):**
- The Pons protocol owner has a standing power to reassign any launch's fee recipient after a public 3-day timelock (a Pons-level admin power, separate from the above).
- Whoever holds the signing key for the recipient address effectively controls the funds — "a stolen signing key is the worst thing that can happen," in FundPad's own words. This is our own custody wallet's key, and needs real security discipline.

## 6. Costs (decided 2026-09-28: cut to the minimum, no testnet, no local fork testing)

- We do **not** pay Pons's launch fee (~0.0005 ETH) — whoever launches a coin pays it themselves, with their own wallet.
- Our only real expense: **bridging a small amount of ETH onto Robinhood Chain** to cover **our own gas** for `claim()` + payout-forwarding transactions. Not strictly one-time — more like "keep a small balance topped up as needed." Roughly $10–15 to start is plenty (bridging itself ~$1–3 in gas at current rates, Pons launch fee is not ours to pay, Robinhood Chain gas is cents per transaction).
- Explicitly decided against: emailing Pons for testnet contract access, and setting up local-fork testing infrastructure (e.g. Anvil/Foundry) — both considered "insane amount of work" relative to the payoff by the user. Plan instead: build carefully, review before anything touches a real transaction, test for real directly on mainnet with small amounts.

## 7. What's needed before/while building (setup tasks, not open decisions)

1. Register a free, self-serve, read-only Reddit app (client ID/secret) for the public mod-list/sidebar API reads.
2. Bridge a small amount of ETH (~$10–15) onto Robinhood Chain for our custody wallet's gas.
3. Generate the seed/wallet scheme for our per-subreddit derived custody addresses, and decide where it's stored securely (not yet created).
4. Pull Pons v2's exact ABI/`TokenParams` struct fields from their docs/SDK when writing the actual `launchToken()` call (we have the function signature shape, not the full struct definition yet).

**Not actually a concern (checked and ruled out):** whether Privy supports Robinhood Chain. Privy supports arbitrary EVM chains via configuration (RPC URL, chain ID, etc.) — Robinhood Chain is a standard EVM chain (Arbitrum Orbit L2), so this is just a normal config step, not a real risk.

## 8. Reused as-is from the existing PowerShare build

- Next.js 16.3 site shell (App Router, Turbopack), the black/white/beige design system, fonts, layout, Vercel deploy pipeline.
- **Privy wallet-only login** (connect wallet, no email/password/accounts) — matches FundPad's own identity model exactly, carries over directly.
- All GPU/points/payout-specific copy, sections, and the planned Electron desktop app are dropped — not reused, not relevant to SubPad.

## 8b. Progress: Pons v2 launch integration (2026-09-28)

`/launch` now makes a real, working call to Pons v2's `launchToken()` — not a stub. What's in place:
- `src/lib/robinhoodChain.ts` — hand-written viem `Chain` for Robinhood Chain (id 4663; not a viem built-in).
- `src/lib/pons.ts` — Factory address, ABI (via `parseAbi` with `struct` syntax), and `prepareLaunch()`, which reads the live `launchFee()` and `previewLaunchEconomics()` digest and builds the `TokenParams` struct.
- `src/components/LaunchForm.tsx` — real submit handler: `useWallets()` (Privy) → `wallet.switchChain` → `wallet.getEthereumProvider()` → viem `createWalletClient` → `writeContract`. Shows a live-read launch fee, and a tx-hash success screen linking to the block explorer on success.

**Verified against the real, bytecode-matched, verified contract source** (not just docs prose) via Robinhood Chain's block explorer (`robinhoodchain.blockscout.com/address/0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e`, contract `PonsV2LaunchFactory`, verified Aug 4 2026) — specifically the `TokenParams` struct fields/types and the exact `launchToken()` / `previewLaunchEconomics()` signatures, found by searching the source in the explorer's built-in code viewer. `launchFee()` and `maxCreatorTaxBps()` are taken from docs as simple getters, not re-verified line-by-line — low risk since they're plain reads.

**Note for later:** the deployed contract's constructor set `initialLaunchFee` to 0.005 ETH — 10x FundPad's quoted "0.0005 ETH today" figure. This is exactly why the fee is read live via `launchFee()` in code rather than hardcoded; don't reintroduce a hardcoded fee constant.

**Update, same session: fixed to derive a unique address per subreddit instead of one shared wallet.** The user caught that the first pass used a single fixed `PONS_FEE_RECIPIENT` for every coin — which reintroduces exactly the "Pons pools by wallet, not by token" problem the per-subreddit-address plan (section 4) existed to solve. Fixed:
- Generated a random 32-byte `PONS_MASTER_SEED` and appended it to `.env.local` (gitignored, server-only, no `NEXT_PUBLIC_` prefix — never sent to the browser). The value itself was never printed in chat.
- `src/lib/ponsRecipient.server.ts` (guarded with the `server-only` package) derives a subreddit's escrow address as `privateKeyToAccount(HMAC-SHA256(masterSeed, "subpad-v1:<subreddit>"))` — deterministic, no per-subreddit database entry needed, only the one master seed to protect.
- `src/app/api/subreddit-recipient/route.ts` — a Route Handler the browser calls with `?subreddit=`, returning only the **address**, never the key or seed.
- `LaunchForm.tsx` now fetches this address at submit time and uses it as `creatorFeeRecipient`, instead of reading a fixed client-visible constant.
- Verified end-to-end via curl: same subreddit → same address every time; different subreddits → different addresses; missing param → clean error.

This closes the loop — launching is now actually usable (no missing-config block), and each subreddit's fees are cleanly separable via `balanceOf()` on its own derived address. The private-key half of this (`subredditFeeRecipientPrivateKey`) exists in the same server file for the future claim/payout implementation, not used yet.

**Also found:** `robinhoodchain.blockscout.com` is flagged by the user's local ESET antivirus as "potentially unwanted content" — the user allowed it manually to let this research happen. Worth knowing if a future session hits the same block.

A minor bug was introduced and fixed in the same pass: `LaunchForm`'s wallet-gate originally returned a blank page while Privy's SDK was still loading (`if (!ready) return null`), instead of showing the connect card with a disabled button like the original sign-up page does. Fixed to always render the card. Worth double-checking any new Privy-gated component follows the same "always render something" pattern.

**Update, same session: Claim page now reads the real on-chain escrow balance.** `PONS_FEE_ESCROW_ADDRESS`/`PONS_FEE_ESCROW_ABI` added to `src/lib/pons.ts` (`balanceOf(address recipient) external view returns (uint256)`, confirmed against the verified `PonsV2FeeEscrow.sol` source the same way as the factory). `ClaimFlow.tsx`'s "claim" step now fetches the subreddit's derived address, then reads its real balance — no more hardcoded "0.0412 ETH" example. Verified the whole read path actually works against the live chain with a standalone Node script (not just that it compiles): `balanceOf` for r/nba's derived address returned a real, correctly-decoded `0` (expected, since nothing has ever been launched against it).

**Verification model changed, 2026-09-28: dropped Reddit OAuth entirely, in favor of manual admin-side verification.** This was a real back-and-forth, not a quick call — worth recording why:
- The user first wanted verification to be "user side" (real "Login with Reddit" OAuth, the moderator logs in themselves) rather than our backend scraping Reddit's public mod-list API, specifically because Reddit's **Responsible Builder Policy** (support.reddithelp.com, confirmed live) requires "express written approval" for **commercial** use of Reddit data, and threatens enforcement up to "suspending associated accounts, bots, domains, or subreddits" — a real risk given SubPad is explicitly commercial. Standard per-user "Login with Reddit" OAuth (the user consents to share their own data) is a different, more sanctioned category than bulk scraping, so it looked like the safer path.
- Researched whether a third-party service could avoid registering our own Reddit app at all (Auth.js/NextAuth, Clerk, Auth0, niche mod-verification scrapers) — confirmed no shortcut exists; every option still requires our own registered Reddit app and direct exposure to Reddit's policy.
- Then hit real, current (2026) friction actually registering the app: reddit.com/prefs/apps is confirmed still the right URL, but its "create app" button is a **documented, widely-reported broken flow in 2026** (silent failures, HTTP 500s, CAPTCHA loops) — separately, **Reddit now routes new OAuth token requests through a manual approval process** and is deliberately restricting external API access while pushing developers toward its own hosted "Devvit" platform instead. So even a working registration might hit another approval wall with no clear timeline.
- Given that friction, the user agreed to fall back to **manual verification as the permanent design, not a placeholder**: a mod provides their subreddit + Reddit username, gets a short code, posts it somewhere only a mod can edit (sidebar/description/stickied post) — same as before — then requests a claim. A real person (the user, during the same `/admin` review where payouts get approved) manually checks the code and cross-references the given username against the subreddit's public moderator list on reddit.com themselves, before sending anything. No Reddit API, no OAuth, no registration needed at all.
- `ClaimFlow.tsx` updated accordingly: added a Reddit username field (so the reviewer knows which account to check), and all copy now accurately describes manual review rather than implying automated verification.
- **Implication for `/admin` (not yet built):** each claim request needs to show the subreddit, the claiming Reddit username, the verification code that was issued, and ideally a direct link to `reddit.com/r/<subreddit>/about/moderators` so the review step is fast — plus the escrow balance and destination wallet, before a "mark approved / send" action.

**Update, same session: Turso database created and wired in.** The user provided `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` (saved to `.env.local`, never printed in chat). Built and verified end-to-end against the real database (not just compiled):
- `src/lib/db.server.ts` — lazy singleton libSQL client (`server-only`), throws clearly if env vars are missing rather than at import time.
- `claim_requests` table created directly in the real Turso DB (id, subreddit, reddit_username, verification_code, escrow_address, payout_wallet, status `requested`/`paid`, requested_at, paid_at, tx_hash — same `requested → paid` shape as GameStock's payouts table, no reject state needed).
- `src/app/api/claim-requests/route.ts` — `POST` inserts a request, `GET` lists all (newest first) for the future `/admin` page.
- `ClaimFlow.tsx`'s final "Request claim" button now actually POSTs here (using the connected wallet's address as `payout_wallet`) instead of just moving to a local "done" screen with nothing saved.
- Verified for real via curl: POSTed a test request, GET returned it back correctly from the live database, then deleted the test row to keep the table clean.

**Update, same session: `/admin` built, with real server-side auth — not just hidden UI.** The user gave their wallet address (`0xF270C46B355115b2d3C793Dae0257EE11c96e1c6`, saved as `NEXT_PUBLIC_ADMIN_WALLET`). Built:
- `src/lib/adminAuth.server.ts` — verifies the caller is really the admin wallet using **Privy's server SDK** (`@privy-io/server-auth`, `PrivyClient.getUser({ idToken })`), not a client-side check anyone could bypass via devtools. The client sends its Privy identity token (`getIdentityToken()`) as `Authorization: Bearer <token>`; the server resolves it to a wallet address via Privy's own servers and compares it to `ADMIN_WALLET`.
- `GET /api/claim-requests` (list) and the new `PATCH /api/claim-requests/[id]` (mark paid, with an optional tx-hash note) both require this — **verified for real via curl**: no token → 401, garbage token → 401, no data ever leaks or mutates without passing the check.
- `/admin` page (`AdminPanel.tsx`): gated the same way client-side for UX (shows "connect wallet" / "not authorized" appropriately), then lists pending requests (subreddit with a direct link to `reddit.com/r/<sub>/about/moderators`, claimed username, verification code, escrow address, payout wallet, requested time) and a separate paid history. "Mark paid" prompts for an optional tx hash and PATCHes.
- Confirmed rendering correctly in-browser (title, copy, gate all correct) — noindex/nofollow set in metadata since it's an admin page.

**Still deliberately not built:** the actual on-chain payout execution (calling `claim()` on the escrow with the subreddit's derived key, then sending ETH to the mod's wallet). `/admin`'s "Mark paid" only records that a payout happened — it doesn't yet trigger one. That's flagged as its own, more sensitive next step (see the note left for the user about this earlier in the session): either build real server-side transaction-signing code, or expose the derived private key for the user's own wallet to use, each with different tradeoffs worth discussing deliberately rather than bundling in.

**Update, same session: Claim no longer requires connecting a wallet at all.** The user's idea: after getting verified, the mod just types in whatever wallet address they want the payout sent to and clicks "Cash out" — no need to have connected that specific wallet to SubPad. This simplified `ClaimFlow.tsx` significantly: dropped the Privy/`useWallets` dependency entirely, added a plain "payout wallet" text field validated with viem's `isAddress`, renamed the flow's final action to "Cash out." Lower friction for mods (no wallet-connect step needed just to request a payout) and better UX (the destination doesn't have to be whatever wallet they happened to log in with — could be a multisig, an exchange address, anything). Tested the **entire flow live in the browser** end to end (not curl this time — actually clicked through subreddit → username → code → wallet address → Cash out) and confirmed the real submission landed correctly in the live Turso database with every field matching, then cleaned up the test row.

Launch still requires a connected wallet (unavoidable — it has to sign the actual on-chain transaction). Claim does not.

**Payout mechanism decided and built, same session: manual, "like GameStock."** The user chose manual sending over automation. Before building it, confirmed the exact mechanics directly from `PonsV2FeeEscrow.sol`'s verified source: `function claim() external nonReentrant returns (uint256 amount) { amount = _claim(_balances[msg.sender]); }` — critically, **`claim()` pays out to `msg.sender`**, so the subreddit's own derived wallet must be the one calling it (not an arbitrary caller passing a recipient param). That means the real manual steps are: (1) import the subreddit's derived private key into a wallet, (2) send that wallet a small amount of ETH for gas, (3) call `claim()` on it from that wallet (e.g. via Blockscout's write-contract UI), which pays the accrued ETH to that same wallet, (4) send that ETH on to the mod's chosen payout wallet as an ordinary transfer.

Built to support this:
- `GET /api/admin/subreddit-key?subreddit=` — admin-only (same `requireAdmin` check as everything else in `/admin`), returns the subreddit's derived private key via the already-existing `subredditFeeRecipientPrivateKey()`.
- `/admin` now has a "Show escrow private key" button per pending request, which reveals the key inline plus the 4-step instructions above and a direct link to the Fee Escrow contract's write-contract page on Blockscout.
- Verified via curl (rejects unauthenticated requests, same as the other admin endpoints) and independently re-derived the key outside the app to confirm it resolves to the exact same address already used for r/nba throughout this session — the key genuinely controls the right funds, not just "looks right."

This closes out the core loop's design — every piece of the intended flow (launch → trade elsewhere → claim → manual review → manual payout) now exists in some form. What's left is testing the money-moving paths for real (bridging ETH, an actual launch, an actual claim+payout) rather than new features.

**Note (later in the session): the user asked for a "reveal escrow key per request" UI to be removed** from `/admin` right after this was built — wanted the per-request card to stay simple (just see the payout address, copy it, send money, mark paid), not have key-retrieval logic embedded in every row. `/api/admin/subreddit-key` and its UI were deleted. The underlying capability (`subredditFeeRecipientPrivateKey()`) still exists in `ponsRecipient.server.ts` for the next session to hand over ad hoc when the user actually needs a specific subreddit's key — just not built as a standing feature. Don't re-add per-request key UI without being asked again.

## 8c. Dashboard feature (2026-09-28, same session)

The user asked for a dashboard on `/subreddits` (replacing its placeholder): a PnL-style summary + a GitHub-style activity calendar (based on a reference screenshot of a crypto trading terminal's "Portfolio PnL" widget — dark theme, blue accents, rounded corners) plus a launch history list. Since SubPad takes no cut itself, "PnL" was reinterpreted as **treasury generated** (realized = paid to mods, unrealized = still sitting in escrow) rather than personal trading profit — stated as an assumption, not silently guessed. Kept the reference's information layout (total figure, stat breakdown, month calendar, streaks) but restyled entirely in SubPad's own light/mono/square design system, not the dark trading-terminal look.

Built:
- **`launches` table** (new) — records every successful launch (subreddit, name, symbol, token address, launcher wallet, tax, tx hash, when). Nothing recorded this before; Launch just fired the transaction and showed a success screen.
- **`LaunchForm.tsx` now records launches.** Uses `publicClient.simulateContract()` before sending (not just `writeContract`) specifically to get the token address `launchToken()` returns — `writeContract` alone only gives a tx hash, not the return value. POSTs to `/api/launches` after a successful send.
- **`claim_requests.amount_eth`** (new column) — `/admin`'s "Mark paid" now prompts for the actual amount sent (pre-filled with a live-read escrow balance shown in the same card, added while doing this — the pending card previously showed no balance at all), so payouts are recorded, not just marked.
- **`GET /api/launches`** (public — launch data is inherently public on-chain anyway) and **`GET /api/stats`** (public, aggregate-only — total paid, total in escrow across every subreddit with a coin, launch/subreddit counts, per-day paid totals for the calendar). Deliberately separate from the admin-gated `/api/claim-requests` so the public dashboard never exposes Reddit usernames or individual payout wallets — only sums.
- **`Dashboard.tsx`** — treasury summary card, a month calendar (built with plain `Date` math, UTC-based to match `datetime('now')`/`date()` in SQLite, no date library added), streak counters, and the launch history table.

**Verified with real data, not just compiled:** inserted a real launch + a real paid claim with an amount directly into Turso, loaded the page, confirmed the totals, the correct calendar day highlighted with the right amount, correct streak math, and the launch history row — all matched — then deleted the test rows and confirmed the empty state also renders cleanly (all zeros, no errors).

## 9. How the user likes to work (carried over, still applies)

- **"dnc" means "do not code": discuss only.** Do not write code until told to. This was in effect for the entirety of the planning conversation this brief summarizes — check whether it's still in effect at the start of the next session rather than assuming either way.
- When told "do whatever" / "you can figure it out," make sensible choices and state what was chosen.
- The user reviews visual/UI changes in the browser themselves and often asks to revert. Back up files before risky/visual changes.
- Do not commit or push unless explicitly asked — the user pushes and deploys themselves.
- Keep `npm run dev` running; only stop it to run `npm run build`, then restart.
- Be honest about what has and hasn't actually been tested.
- The user pushes back hard on scope creep and over-engineering — repeatedly cut features, integrations (Reddit OAuth, testnet, local-fork testing, public-announcement safety ceremony) in favor of the simplest thing that works, and explicitly modeled the whole product on copying an existing proven product (FundPad) rather than designing from scratch. Default to the minimal-scope interpretation of any open question, and flag it briefly rather than over-building.
- Secrets (private keys, API credentials) never get repeated back in chat or put in code/docs/commits — env vars and the deploy platform only.

## 10. First steps for the next session

1. Read this file. Confirm whether "dnc" is still in effect before writing any code.
2. Complete the setup tasks in section 7 (Reddit app registration, bridge funds, generate custody wallet/seed, pull Pons's exact ABI).
3. Start with the site rewrite (copy/sections, reusing the existing design system) and the Launch flow, since those are the most self-contained pieces; Claim flow and Reddit verification next.
4. Test directly on mainnet with small real amounts once a piece is ready — no testnet, no local fork, per the user's explicit decision.
