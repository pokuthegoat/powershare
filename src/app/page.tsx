import { Nav } from "@/components/Nav";
import { SceneBackground } from "@/components/SceneBackground";
import { Reveal } from "@/components/Reveal";
import { Logo } from "@/components/Logo";
import { Faq } from "@/components/Faq";
import { LaunchButton, ClaimButton } from "@/components/Buttons";
import { EscrowMock } from "@/components/EscrowMock";
import { TickerMarquee } from "@/components/TickerMarquee";
import { SITE } from "@/lib/config";

const STEPS = [
  {
    title: "Launch",
    body: "Pick any subreddit and launch a coin for it. No mods, no permission, nobody has to say yes.",
    icon: <path d="m13 3-8 11h6l-1 7 8-11h-6l1-7Z" />,
  },
  {
    title: "Trade",
    body: "Every buy and sell pays a small tax, held in escrow tied to that one subreddit.",
    icon: (
      <>
        <path d="M4 8h13M13 4l4 4-4 4" />
        <path d="M20 16H7M11 12l-4 4 4 4" />
      </>
    ),
  },
  {
    title: "Verify",
    body: "A mod posts a short code somewhere only a mod can edit, proving they actually run the sub.",
    icon: (
      <>
        <path d="M12 3l7 3v5c0 5-3.2 7.7-7 9-3.8-1.3-7-4-7-9V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: "Claim",
    body: "Once verified, request a payout whenever you want. No waiting on anyone's schedule.",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="12" rx="1" />
        <path d="M3 10h18M7 15h4" />
      </>
    ),
  },
  {
    title: "Spend",
    body: "Funds land in a wallet as real ETH — hosting, contest prizes, whatever the community needs.",
    icon: <path d="M12 21s-7-4.35-9.5-9C.5 7.5 3 3 7 3c2 0 3.8 1 5 2.5C13.2 4 15 3 17 3c4 0 6.5 4.5 4.5 9-2.5 4.65-9.5 9-9.5 9Z" />,
  },
];

const TAX_ROWS = [
  { tax: "1%", per1k: "$10", per10k: "$100" },
  { tax: "3%", per1k: "$30", per10k: "$300" },
  { tax: "5%", per1k: "$50", per10k: "$500" },
  { tax: "10%", per1k: "$100", per10k: "$1,000" },
];

const FAQ = [
  {
    q: "What is SubPad?",
    a: "SubPad lets anyone launch a coin for any subreddit. Trading fees build up in escrow tied to that subreddit, and the subreddit's own mods can verify and claim them.",
  },
  {
    q: "Do I need permission from the subreddit to launch a coin?",
    a: "No. Anyone can launch a coin for any subreddit, at any time. You pay the launch fee and gas yourself, and you can't route any of the fees to yourself.",
  },
  {
    q: "How do mods prove they run the subreddit?",
    a: "We give you a short code. Post it somewhere only a moderator can edit — the sidebar, the description, or a stickied post — and we check it against Reddit's public moderator list.",
  },
  {
    q: "How do mods actually get paid?",
    a: "Once verified, click \"Claim fees\" to request a payout. We send it as ETH to your connected wallet the next time we're online — it's a manual, reviewed payout, not an instant automatic one.",
  },
  {
    q: "Is the money safe?",
    a: "The trading and escrow happen on Pons v2, a public protocol — SubPad doesn't build or control that part. We do hold the wallet that fees collect into before a claim, so claiming is a reviewed payout from us, not a fully trustless on-chain withdrawal. Coins themselves can also lose all their value.",
  },
  {
    q: "What happens if a subreddit's mods never verify?",
    a: "The fees just sit there. Nothing expires, nothing gets swept, nothing goes to anyone else.",
  },
  {
    q: "Where does trading actually happen?",
    a: "On Pons v2's own page for that coin. SubPad doesn't build a chart or a buy/sell widget — we link straight to it.",
  },
];

export default function Home() {
  return (
    <>
      <SceneBackground />
      <Nav />

      <main className="page">
        {/* HERO */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero-inner">
            <div className="hero-left">
              <Reveal className="hero-badges">
                <span className="badge">
                  <i /> Built on Pons v2
                </span>
                <span className="badge">Any subreddit</span>
              </Reveal>
              <Reveal as="h1" id="hero-title" className="t-display hero-title">
                <span className="line">Every subreddit</span> <span className="line">has a price</span>{" "}
                <span className="line">
                  <span className="mark">nobody&apos;s claimed.</span>
                </span>
              </Reveal>
              <div className="hero-sub">
                <Reveal as="p" className="t-lead">
                  Launch a coin for any subreddit. Every trade pays a fee into escrow for that community — its mods
                  verify and claim it, whenever they want.
                </Reveal>
                <Reveal className="hero-cta">
                  <LaunchButton />
                  <ClaimButton />
                </Reveal>
                <Reveal as="p" className="hero-note">
                  No permission needed to start. No mods required.
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* 01 LAUNCH */}
        <section id="start" className="section">
          <div className="container split">
            <Reveal className="split-text">
              <span className="t-eyebrow section-num">01 &middot; Launch</span>
              <p className="t-h1">Every subreddit can have a coin.</p>
              <p className="t-lead t-muted">
                You don&apos;t need to run it, know the mods, or ask anyone. Pick a subreddit, launch a coin, and its
                trading fees start building up in escrow from the first trade.
              </p>
              <div className="hero-cta">
                <LaunchButton />
              </div>
            </Reveal>
            <Reveal className="box progress-card">
              <div className="progress-top">
                <span className="t-eyebrow">r/nba escrow</span>
                <span className="chip is-live">Trading</span>
              </div>
              <p className="progress-amount">
                0.0412 ETH <small>waiting to be claimed</small>
              </p>
              <div className="progress-meta">
                <span>214 trades &middot; 3% creator tax</span>
                <span>Example</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 02 WHERE THE FEES GO */}
        <section id="what-you-can-earn" className="band-ink band-earn">
          <div className="container earn-inner">
            <Reveal className="section-head">
              <span className="t-eyebrow section-num">02 &middot; Where the fees go</span>
            </Reveal>
            <Reveal as="h2" className="earn-giant">
              <span className="earn-num">0%</span>
              <span className="earn-per">
                of the fees go to
                <br />
                whoever launches the coin.
              </span>
            </Reveal>
            <Reveal as="p" className="t-lead earn-lead">
              Every trade&apos;s creator tax goes straight into escrow for the subreddit itself — never to the person
              who started the coin. Nobody, including SubPad, can spend it before a verified mod claims it.
            </Reveal>
            <div className="stats">
              <Reveal className="stat">
                <span className="num">10%</span>
                <p>Maximum creator tax on every trade, fixed the moment a coin launches</p>
              </Reveal>
              <Reveal className="stat">
                <span className="num">0</span>
                <p>Permission needed from a subreddit before someone can launch a coin for it</p>
              </Reveal>
              <Reveal className="stat">
                <span className="num">1</span>
                <p>Escrow address per subreddit, so fees never mix with another coin&apos;s</p>
              </Reveal>
            </div>
            <Reveal>
              <p className="fine" style={{ marginTop: 20, maxWidth: 720 }}>
                Trading and escrow run on Pons v2, a public protocol on Robinhood Chain. Availability may vary by
                country.
              </p>
            </Reveal>
          </div>
        </section>

        {/* 03 A TREASURY, NOT JUST A TOKEN */}
        <section id="what-you-build" className="section tight">
          <div className="container">
            <Reveal className="section-head">
              <span className="t-eyebrow section-num">03 &middot; What it&apos;s for</span>
              <p className="t-h1">A treasury, not just a token.</p>
              <p className="t-lead t-muted">
                Claimed fees are real ETH in a mod-controlled wallet — server and bot hosting, contest prizes,
                charity drives the sub already runs, whatever the community needs.
              </p>
            </Reveal>
          </div>
          <Reveal className="marquee-wrap">
            <TickerMarquee />
          </Reveal>
        </section>

        {/* 04 HOW IT WORKS */}
        <section id="how-it-works" className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="t-eyebrow section-num">04 &middot; How it works</span>
              <p className="t-h1">Five steps from launch to spent.</p>
              <p className="t-lead t-muted">
                Launch &rarr; Trade &rarr; Verify &rarr; Claim. Then spend it on the community.
              </p>
            </Reveal>
            <div className="steps">
              {STEPS.map((s, i) => (
                <Reveal key={s.title} className="step">
                  <span className="step-num">0{i + 1}</span>
                  <svg
                    className="step-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {s.icon}
                  </svg>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="interlude" aria-label="A word from us">
          <div className="container">
            <Reveal as="p" className="interlude-line">
              Nobody asked your subreddit&apos;s permission. <span>Someone was going to trade it eventually.</span>
            </Reveal>
          </div>
        </section>

        {/* 05 WHAT IT PAYS */}
        <section id="what-it-pays" className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="t-eyebrow section-num">05 &middot; What it pays</span>
              <p className="t-h1">The tax rate decides the pace.</p>
              <p className="t-lead t-muted">
                The creator tax is set once, at launch, between 0% and 10%. A higher tax raises more per trade, but
                can slow down trading.
              </p>
            </Reveal>
            <Reveal className="pay-table">
              <div className="pay-row is-head">
                <span>Creator tax</span>
                <span>Per $1,000 traded</span>
                <span>Per $10,000 traded</span>
              </div>
              {TAX_ROWS.map((r) => (
                <div className="pay-row" key={r.tax}>
                  <b>{r.tax}</b>
                  <span>{r.per1k}</span>
                  <span className="amt">{r.per10k}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* 06 TRADING HAPPENS ON PONS */}
        <section id="the-app" className="section">
          <div className="container split">
            <Reveal className="split-text">
              <span className="t-eyebrow section-num">06 &middot; Trading</span>
              <p className="t-h1">Trading happens on Pons.</p>
              <p className="t-lead t-muted">
                We don&apos;t build a chart or a buy/sell screen. Every coin trades on Pons v2&apos;s own page, with
                its own live chart. SubPad handles the part that matters for the subreddit: escrow and claiming.
              </p>
              <ul className="req-list">
                <li>Built on Pons v2, live on Robinhood Chain</li>
                <li>Each subreddit gets its own dedicated escrow address</li>
                <li>Nobody can spend it before a verified mod claims it</li>
              </ul>
              <div className="hero-cta">
                <LaunchButton />
                <ClaimButton />
              </div>
              <p className="fine">Charts, liquidity and swaps are handled entirely by Pons v2 — SubPad never touches them.</p>
            </Reveal>
            <Reveal className="app-window">
              <EscrowMock />
            </Reveal>
          </div>
        </section>

        {/* 07 QUESTIONS */}
        <section id="faq" className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="t-eyebrow section-num">07 &middot; Questions</span>
              <p className="t-h1">Good things to know.</p>
            </Reveal>
            <Faq items={FAQ} />
          </div>
        </section>

        {/* FINAL CTA + CONTACT */}
        <section id="contact" className="band-ink">
          <div className="container final">
            <Reveal>
              <p className="t-display">
                Your subreddit has a price.
                <br />
                <span className="mark">Someone should claim it.</span>
              </p>
            </Reveal>
            <Reveal className="actions">
              <LaunchButton />
              <ClaimButton />
            </Reveal>
            <Reveal>
              <p className="contact-line">
                Questions or feedback? Say hello at <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
              </p>
            </Reveal>
          </div>
        </section>

        <footer className="footer">
          <div className="container footer-inner">
            <Logo />
            <span>{SITE.tagline}</span>
            <span>&copy; {new Date().getFullYear()} SubPad</span>
          </div>
        </footer>
      </main>
    </>
  );
}
