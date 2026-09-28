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

Not yet done: real Reddit verification (still a stub that "verifies" on a button click), and the actual claim/payout mechanism (calling `claim()` + forwarding funds + a database of requests + an `/admin` page to review and mark them paid) — agreed next steps, in that order, not started.

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
