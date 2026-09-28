# PowerShare: project brief for a new Claude session

Paste this whole file at the start of a session. It says what PowerShare is, what is built, every decision already made, what is still open, and how the user likes to work. Written at the end of the Phase 1 session, 2026-09-26. Where I say "not verified" I mean it.

## 1. What PowerShare is

- A consumer product in the spirit of IdleNet (idlenet.app): people download a **Windows desktop app**, it detects their GPU, they press **Start**, and they earn **points for every minute the GPU is "contributing"**. Points are cashed out as **stocks**.
- Tagline: "YOUR GPU IS SITTING IDLE. MAKE IT WORK." / "GPU power for stocks." Flow: Download, Connect GPU, Contribute, Earn, Cash out.
- **The contribution is simulated.** Nothing actually runs on the GPU. The app reports it is "contributing" and the server counts time. The user knows and accepted this ("this doesn't have to be profitable, it's not going to run for long, I just need to create the project"). Real people may still use it and can cash out real value, so:
  - App/site copy must stay accurate. Do not claim the GPU is doing AI training, rendering, or work for customers.
  - Fraud protection matters, because payouts are real (see section 6).
- No crypto, no coin, no token. Rewards are internal points, paid out manually as stocks by the user. (Earlier ideas about a coin were dropped on purpose.)
- Expected users: very few. The user (owner/admin) approves every payout by hand.

## 2. The plan (phases) and status

1. **Website: DONE, deployed.** Live: https://powershare-ten.vercel.app/ . Repo: https://github.com/pokuthegoat/powershare (branch `main`). The user pushes and deploys themselves.
2. **Accounts and backend: NEXT.** Turso database, app sign-in ("link your device"), points, heartbeat, payouts, admin panel.
3. **Windows desktop app (Electron).**
4. **(Dropped)** A real GPU workload network. Not building it.
5. **(Dropped)** Coin.
6. Testing and polish. 7. Launch (installer released, Download button live).

## 3. Reference project: GameStock (`D:\gamestock`)

The user's other project, same idea (play games, earn points, cash out stocks/crypto). **Reuse its patterns**: accounts, points ledger, payout requests, and the admin approval panel ("the same way we did in GameStock"). It is a Next.js app. I have only skimmed it. Read it before reusing anything:
- API routes in `src/app/api/` (`account`, `payouts`, `admin/payouts`, `daily`, `missions`, etc.), `src/lib/` (`payouts.ts`, `account-types.ts`, `levels.ts`, ...), `src/components/admin/AdminPayouts.tsx`, `src/app/admin/`.
- It uses `@libsql/client` (SQLite) with a **local file** (`GAMESTOCK_DB_PATH`), `jose`, and Privy with `PRIVY_APP_SECRET` to check which wallet a request belongs to. Admin access is a comma-separated env list `ADMIN_WALLETS`, checked on the server for every admin request.
- PowerShare must use a **remote Turso database**, not a local file (Vercel has no persistent disk).
- It also has an `AGENTS.md`/`CLAUDE.md` telling you this is a newer Next.js than you know: read `node_modules/next/dist/docs/` before writing Next code. PowerShare has the same (auto-generated) files.

## 4. The website (Phase 1): what exists

**Stack:** Next.js 16.3 (App Router, Turbopack), React 19, TypeScript, `@privy-io/react-auth` v3, three.js (background), lenis (smooth scroll), fonts via `next/font/google` (Geist for headings, Instrument Sans for body, JetBrains Mono for labels/buttons/nav). `@solana-program/system`, `@solana-program/token`, `@solana/kit` are installed only because Privy's client bundle imports them; do not remove.

**Pages:** `/` (landing), `/signup`, `/login` (both open the Privy wallet dialog). No account page and no other features on the site. The navbar button says "Sign up" (or "Log out" when signed in). The Privy dialog takes a few seconds to appear after the click.

**Landing page sections:** hero, 01 Start (balance card mock), 02 What you can earn (full-width black band with a giant "$1"), 03 What you build toward (stocks + ticker marquee), 04 How it works (5 steps), interlude line ("Sleep is for people. Graphics cards work in shifts."), 05 What it pays (table), 06 The app (live-ticking app mock, labelled "example"), 07 FAQ (animated accordion), closing black band, beige footer.

**Key files:**
- `src/app/page.tsx` (all copy), `src/app/globals.css` (the whole design system), `src/app/layout.tsx`.
- `src/lib/config.ts`: `SITE` (name, tagline, `contactEmail: "powershare.hq@gmail.com"`, `url` = **placeholder** `https://powershare.app`), `PRIVY_APP_ID` (from `NEXT_PUBLIC_PRIVY_APP_ID`), `DOWNLOAD_URL` (from `NEXT_PUBLIC_DOWNLOAD_URL`, falls back to `/#the-app`), `MINUTES_PER_DOLLAR = 90`, `REWARD_TICKERS` (NVDA, AAPL, TSLA, AMZN, GOOGL, MSFT), nav links.
- `src/components/`: `Providers` (Privy), `Nav`, `Logo`, `Buttons`, `AuthButton`, `AuthPage`, `Faq`, `AppMock`, `TickerMarquee`, `SceneBackground` (the background), `SmoothScroll`, `ScrollToTop`, `Reveal` (now just a plain wrapper, see design).
- `src/lib/`: `config.ts`, `grain.ts` (film grain, ported from GameStock), `smooth-scroll.ts` (lenis settings; heavier than default: duration 1.9, wheel multiplier 0.8).

**Privy:** app ID `cmuif50zi03a00bl0r972bazm` (public). Configured for **wallet-only login** in both the dashboard and code (`loginMethods: ["wallet"]`); these must match. The app secret is in `D:\powershare\.env.local` (gitignored) as `PRIVY_APP_SECRET`; the app ID is `NEXT_PUBLIC_PRIVY_APP_ID`. The secret is **not used by the website**, only by the future backend. The user's Vercel domain must be in Privy's allowed origins. Never put the secret in a `NEXT_PUBLIC_` variable, in code, or in chat/docs.

**Not done or not verified on the website:** the phone-width layout has never been seen (my browser tool could not shrink the viewport); a production build has not been run since many late changes (stop the dev server first, since both use `.next`); the blob's shader cost on weak/integrated GPUs is untested; `SITE.url` is a placeholder; the Download button just scrolls to the app section until an installer URL exists; the user is generating a **logo** and will send it (the current logo is a black square with a white bolt: `public/logo.svg` and `src/app/icon.svg`); there are deliberately no Terms/Privacy pages (the user declined).

## 5. Design system (keep the app consistent with it)

- **Three colours only:** white (primary), black `#0a0a0a` (secondary), beige `#ece2cf` (third). Nothing else. Square corners, 1px black hairlines, mono uppercase labels, numbered sections. Inspired by IdleNet's visual language (not a copy).
- **Type:** Geist for headings (light: weights 400/500, tight letter-spacing), Instrument Sans body, JetBrains Mono for labels/nav/buttons/numbers.
- **Background:** one halftone-printed blob (beige with black dots), a ray-marched shader in `SceneBackground.tsx`, plus hairline outline shapes (rings, squares, a pill, dot grids) and a film-grain overlay. The blob has 3 shapes it morphs between (tri-lobed metaball, lumpy pebble, rounded cube with holes) via continuous formulas (not crossfades), follows a curvy scroll-driven route, and sinks behind the closing black band at the bottom. **It has no cursor interaction** (dent/tilt/follow were tried and removed).
- **No scroll-in animations at all** (the user removed them). No fade-ups, no typing effect (tried, reverted). Interaction feedback (hover colours, FAQ fold, marquee, ticking mock) stays.
- Refreshing the page starts at the top (scroll restoration disabled), except for `#section` links.
- The user is very sensitive to look-and-feel details. They review in the browser and ask for reverts.

## 6. Product decisions (settled)

**Points and money**
- 1 point = 1 minute connected. **90 points = $1** (so $1 per 1.5 hours; $16 for 24 hours). Store credited **seconds** on the server; show points and dollars.
- **Minimum cash-out: $10 (900 points, 54,000 seconds).**
- Paid manually as stocks by the admin. The user will **not reject** requests, so the flow is just `requested` then `paid` (no reject/refund path needed). Marking paid has one optional text note/reference.
- Cash-out request: the user picks a stock (from the ticker list) and an amount (at least $10, at most their balance), from **inside the app**.

**Admin**
- **Admin wallet: `0x1992d6e3f8C5f0030b8C42d37263ceD25047D3C1`** (env `ADMIN_WALLETS`, comma separated, compared case-insensitively, checked server-side on every admin request).
- Admin panel at **`/admin`** on the website, sign in with that wallet through Privy, styled like the site. Lists requests, lets the admin mark them paid.

**Accounts**
- Accounts are created on the website with Privy (wallet). One account per person = one Privy user/wallet. The app signs in with the same account through a **device-link flow** (no Privy inside the app).
- A small **`/link`** page on the site is approved (the user said there should be no account page, but this approval page is needed): the user opens it, signs in with their wallet, and approves a short code shown by the app.

**Fairness/anti-abuse (server-authoritative)**
- The app sends a **heartbeat every 60 s**. The server credits the real gap since the last beat, capped at about 90 s. Ending a session (Stop) credits nothing extra. If beats stop for about 2 minutes the session ends.
- **One active session per account.** Starting on a second PC ends the first.
- The reported GPU name is checked on the server: reject virtual/basic adapters ("Microsoft Basic Display", VMware, Hyper-V, and similar). NVIDIA, AMD and Intel are all fine.
- A ceiling of 24 h of credit per day. No other daily cap.
- Rate-limit endpoints; store app tokens hashed; short expiry for device codes.

**Database:** **Turso** (libSQL, via `@libsql/client`), its own database for PowerShare (not GameStock's). Env: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`. The user has not yet created it or shared anything.

## 7. The Windows app (Phase 3) decisions

- **Electron**, packaged with electron-builder as an NSIS installer `.exe`, **unsigned** (Windows SmartScreen will warn; the download page can say so). The user has never built a desktop app, so explain as you go. Secure defaults: `contextIsolation` on, `nodeIntegration` off, a preload bridge.
- Code lives in a **`desktop/`** folder of the same repo (shares types/API contract with the site). The site is the Next app at the repo root and Vercel builds only that.
- **Look:** same design system (white/black/beige, mono labels, square panels). A small halftone blob on the dashboard, only while contributing. **Fixed window about 420 x 680**, no maximize.
- **Screens:** sign-in (with a "Sign up" button that opens the website), dashboard (detected GPU, Start/Stop, contributing status, GPU usage, contribution time, earned, balance), cash-out, small settings.
- **Tray:** closing the window minimizes to the tray while contributing continues. "Start with Windows" checkbox, off by default.
- **GPU detection** with the `systeminformation` package (model, VRAM, driver). Usage is reliable on NVIDIA; show "n/a" for AMD/Intel when unavailable.
- **The app must not actually load the GPU** and must not claim real work (see section 1).
- **Distribution:** installer on **GitHub Releases** (about 80 MB); the site's Download button links to it via `NEXT_PUBLIC_DOWNLOAD_URL`. **No auto-update** for now.
- **App icon:** needs a `.ico`, to be made from the user's logo (pending).

## 8. Sketch of the backend (a proposal, NOT built)

**Tables (draft):** `users` (privy id, wallet, created), `device_codes` (user code, device code hash, status, user id, expires), `app_tokens` (token hash, user id, created, last used, revoked), `sessions` (user id, gpu name, vram, started, last beat, ended, credited seconds), `ledger` (user id, seconds delta, reason, created), `payouts` (user id, ticker, amount, status `requested|paid`, note, created, paid at).

**Endpoints (draft):**
- Device link: `POST /api/device/start` (app: returns user code + device code), page `/link` then `POST /api/device/approve` (Privy-authenticated), `POST /api/device/poll` (app: gets its token once approved). App calls use `Authorization: Bearer <token>`.
- `GET /api/me` (balance, seconds, active session), `POST /api/contribute/start`, `POST /api/contribute/heartbeat`, `POST /api/contribute/stop`.
- `POST /api/payouts` (create, checks minimum and balance), `GET /api/payouts` (mine).
- Admin (Privy + `ADMIN_WALLETS`): `GET /api/admin/payouts`, `POST /api/admin/payouts` (mark paid + note).

**Build order (agreed):** a thin end-to-end slice first: database, link-your-device sign-in, heartbeat, balance, and a bare app doing just those; test it on the user's own PC; **then** cash-outs, the admin panel and polish.

## 9. What is still needed from the user

1. Create the Turso database; provide the URL and token (into `.env.local` and Vercel, never committed).
2. Add to Vercel: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `PRIVY_APP_SECRET`, `ADMIN_WALLETS`.
3. Confirm the Vercel domain is in Privy's allowed origins.
4. The logo (square, ideally SVG; say whether to keep the "PowerShare" text next to it).
5. A second wallet/account for testing cash-outs (not the admin wallet).
6. Later: real domain (replace the `SITE.url` placeholder).

## 10. How the user likes to work (important)

- Windows 11; the project is `D:\powershare`; shell is Bash/PowerShell. Node 24.
- **"dnc" means "do not code": discuss only.** Do not write code until they say to. When they say "do whatever" or "you can figure it out", make sensible choices and tell them what you chose.
- They **review everything in the browser and often ask to revert.** Before any risky or visual change, **back up the files** (they can ask you to undo it) and say where the backup is. Do not rely on old scratchpad backups from earlier sessions.
- **Keep the dev server (`npm run dev`, http://localhost:3000) running.** Only stop it to run `npm run build`, then restart it.
- **Do not commit or push unless asked.** They push and deploy themselves. If you do commit, end the message with the co-author line required by the session.
- Be honest about what was and was not tested (for example, phone layout). Do not over-claim.
- They dislike cluttered, gimmicky or generic-looking things, and are happy to say "this is worse, revert."
- They paste secrets into chat sometimes: never repeat a secret back, never put one in code, docs or a commit; keep them in `.env.local` and Vercel.

## 11. First steps for the next session

1. Read this file, then read `D:\gamestock`'s account, points, payout and admin code (section 3) and `D:\powershare\src` to confirm the state.
2. Ask the user for the Turso URL/token (or help them create the database with the Turso CLI or dashboard).
3. Propose the thin-slice plan (section 8) in a few lines, get a "go", then build the backend slice, test it, then the app.
