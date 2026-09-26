import { Nav } from "@/components/Nav";
import { SceneBackground } from "@/components/SceneBackground";
import { Reveal } from "@/components/Reveal";
import { Logo } from "@/components/Logo";
import { Faq } from "@/components/Faq";
import { DownloadButton, SignUpButton } from "@/components/Buttons";
import { REWARD_TICKERS, SITE } from "@/lib/config";

const STEPS = [
  {
    title: "Download",
    body: "Get the PowerShare app for Windows. It installs in a minute.",
    icon: (
      <path d="M12 3v11m0 0-4-4m4 4 4-4M4 20h16" />
    ),
  },
  {
    title: "Connect",
    body: "Sign in with your PowerShare account. The app detects your GPU on its own.",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="10" rx="2" />
        <path d="M7 17v3M12 17v3M17 17v3M8 11h4" />
      </>
    ),
  },
  {
    title: "Contribute",
    body: "Press Start whenever your GPU is idle. Press Stop any time you need it back.",
    icon: <path d="m13 3-8 11h6l-1 7 8-11h-6l1-7Z" />,
  },
  {
    title: "Earn",
    body: "Points add up for every minute your GPU is connected. Watch them grow in the app.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M9.5 10.2c0-1 1-1.7 2.5-1.7s2.5.7 2.5 1.7-1 1.6-2.5 1.8-2.5.8-2.5 1.8 1 1.7 2.5 1.7 2.5-.7 2.5-1.7" />
      </>
    ),
  },
  {
    title: "Cash out",
    body: "Request a payout from the app. Our team reviews it and pays you in stocks.",
    icon: <path d="m4 16 5-5 4 4 7-8M15 7h5v5" />,
  },
];

const PAY_ROWS = [
  { time: "1.5 hours", amount: "$1.00", points: "90 pts" },
  { time: "3 hours", amount: "$2.00", points: "180 pts" },
  { time: "8 hours", amount: "$5.33", points: "480 pts" },
  { time: "24 hours", amount: "$16.00", points: "1,440 pts" },
];

const FAQ = [
  {
    q: "What is PowerShare?",
    a: "PowerShare lets you put your PC's idle graphics card to use. You install the app, connect your GPU, and earn points for the time it's contributing. Points can be cashed out as stocks.",
  },
  {
    q: "How much can I earn?",
    a: "Every 90 minutes your GPU is connected earns $1. A full day connected adds up to $16. There's no fee to join, and you never pay to earn.",
  },
  {
    q: "Do I need a powerful GPU?",
    a: "A dedicated graphics card on a Windows PC is all you need. Virtual and basic display adapters aren't supported.",
  },
  {
    q: "Can I still use my PC?",
    a: "Yes. You're in control: press Stop any time and your GPU is yours again. Start it again whenever it's idle.",
  },
  {
    q: "How do I get paid?",
    a: "Request a cash-out from the app once you've built up enough points. Payouts are reviewed and paid by the PowerShare team, so they aren't instant.",
  },
  {
    q: "Which stocks can I get?",
    a: "Popular names like NVIDIA, Apple, Tesla, Amazon, Alphabet and Microsoft. The list can change over time.",
  },
  {
    q: "Is it free? Do I need an account?",
    a: "It's free. Create an account on this site by connecting your wallet, then sign in to the app with the same wallet. One account per person.",
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
                  <i /> GPU power for stocks
                </span>
                <span className="badge">Windows app</span>
              </Reveal>
              <Reveal as="h1" id="hero-title" className="t-display" delay={80}>
                Your GPU is sitting idle. <span className="hl">Make it work.</span>
              </Reveal>
            </div>
            <div className="hero-right">
              <Reveal as="p" className="t-lead" delay={200}>
                Download the app, connect your GPU and let it contribute while you&apos;re away. Earn points for every
                minute, then cash them out for stocks.
              </Reveal>
              <Reveal className="hero-cta" delay={300}>
                <DownloadButton />
                <SignUpButton />
              </Reveal>
              <Reveal as="p" className="hero-note" delay={360}>
                Free to join. Download, connect, contribute, earn.
              </Reveal>
            </div>
          </div>
        </section>

        {/* 01 START */}
        <section id="start" className="section">
          <div className="container split">
            <Reveal className="split-text">
              <span className="t-eyebrow section-num">01 &middot; Start</span>
              <p className="t-h1">Turn idle hours into a portfolio.</p>
              <p className="t-lead t-muted">
                Your graphics card does nothing most of the day. PowerShare gives those hours a job, and every
                connected minute adds to your balance.
              </p>
              <div className="hero-cta">
                <DownloadButton />
              </div>
            </Reveal>
            <Reveal className="glass progress-card" delay={120}>
              <div className="progress-top">
                <span className="t-eyebrow">Your balance</span>
                <span className="chip is-live">Contributing</span>
              </div>
              <p className="progress-amount">
                $6.40 <small>/ $10.00 payout</small>
              </p>
              <div className="bar" role="img" aria-label="64 percent of the way to a payout">
                <span style={{ width: "64%" }} />
              </div>
              <div className="progress-meta">
                <span>9.6 hours connected</span>
                <span>Example</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 02 WHAT YOU CAN EARN */}
        <section id="what-you-can-earn" className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="t-eyebrow section-num">02 &middot; What you can earn</span>
              <p className="t-h1">$1 for every 1.5 hours.</p>
              <p className="t-lead t-muted">
                Earnings are simple and based on time: the longer your GPU is connected, the more you earn. No
                benchmarks, no tiers, no fees.
              </p>
            </Reveal>
            <div className="stats">
              <Reveal className="glass stat">
                <span className="num">$1</span>
                <p>For every 90 minutes your GPU is connected</p>
              </Reveal>
              <Reveal className="glass stat" delay={80}>
                <span className="num">$16</span>
                <p>For a full 24 hours of contributing</p>
              </Reveal>
              <Reveal className="glass stat" delay={160}>
                <span className="num">$0</span>
                <p>To join. You only need a Windows PC and a GPU</p>
              </Reveal>
            </div>
            <Reveal delay={200}>
              <p className="fine" style={{ marginTop: 20, maxWidth: 720 }}>
                Payouts are reviewed and approved by the PowerShare team. Availability may vary by country.
              </p>
            </Reveal>
          </div>
        </section>

        {/* 03 WHAT YOU BUILD TOWARD */}
        <section id="what-you-build" className="section tight">
          <div className="container">
            <Reveal className="section-head">
              <span className="t-eyebrow section-num">03 &middot; What you build toward</span>
              <p className="t-h1">Stocks, not just points.</p>
              <p className="t-lead t-muted">
                Points are a stepping stone. Cash them out for shares in companies you already know.
              </p>
            </Reveal>
            <Reveal className="ticker-row" delay={100}>
              {REWARD_TICKERS.map((t) => (
                <div className="ticker" key={t.symbol}>
                  <b>{t.symbol}</b>
                  <span>{t.name}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* 04 HOW IT WORKS */}
        <section id="how-it-works" className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="t-eyebrow section-num">04 &middot; How it works</span>
              <p className="t-h1">Five steps from idle to paid.</p>
              <p className="t-lead t-muted">
                Download &rarr; Connect GPU &rarr; Contribute &rarr; Earn. Then cash out when you&apos;re ready.
              </p>
            </Reveal>
            <div className="steps">
              {STEPS.map((s, i) => (
                <Reveal key={s.title} className="glass step" delay={i * 70}>
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

        {/* 05 WHAT IT PAYS */}
        <section id="what-it-pays" className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="t-eyebrow section-num">05 &middot; What it pays</span>
              <p className="t-h1">One rate. Easy to follow.</p>
              <p className="t-lead t-muted">
                You earn 1 point for every minute your GPU is connected, and 90 points is worth $1.
              </p>
            </Reveal>
            <Reveal className="glass pay-table" delay={100}>
              <div className="pay-row is-head">
                <span>Connected</span>
                <span>Points</span>
                <span>You earn</span>
              </div>
              {PAY_ROWS.map((r) => (
                <div className="pay-row" key={r.time}>
                  <b>{r.time}</b>
                  <span>{r.points}</span>
                  <span className="amt">{r.amount}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* 06 THE APP */}
        <section id="the-app" className="section">
          <div className="container split">
            <Reveal className="split-text">
              <span className="t-eyebrow section-num">06 &middot; The app</span>
              <p className="t-h1">Everything happens in the app.</p>
              <p className="t-lead t-muted">
                The PowerShare app for Windows detects your GPU, connects it to your account and lets you start or stop
                contributing with one click. See your GPU usage, your contribution time and what you&apos;ve earned at a
                glance.
              </p>
              <ul className="req-list">
                <li>Windows 10 or 11 (64-bit)</li>
                <li>A dedicated NVIDIA, AMD or Intel graphics card</li>
                <li>A PowerShare account (free, created on this site)</li>
              </ul>
              <div className="hero-cta">
                <DownloadButton />
                <SignUpButton />
              </div>
              <p className="fine">The installer is a plain .exe. Windows may ask you to confirm before it runs.</p>
            </Reveal>
            <Reveal className="glass app-window" delay={120}>
              <div className="app-bar">
                <i />
                <i />
                <i />
                <span>PowerShare</span>
              </div>
              <div className="app-body">
                <div className="app-gpu">
                  <span>
                    <b>NVIDIA GeForce RTX 3070</b>
                    <small>8 GB &middot; Detected</small>
                  </span>
                  <span className="chip is-live">Contributing</span>
                </div>
                <div className="app-grid">
                  <div className="app-tile">
                    <small>GPU usage</small>
                    <b>72%</b>
                  </div>
                  <div className="app-tile">
                    <small>Time</small>
                    <b>02:41:08</b>
                  </div>
                  <div className="app-tile">
                    <small>Earned</small>
                    <b className="up">$1.79</b>
                  </div>
                </div>
                <div className="app-toggle">Stop contributing</div>
              </div>
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
        <section id="contact" className="container final">
          <Reveal>
            <p className="t-display">
              Your GPU is idle.
              <br />
              <span className="t-accent">Put it to work.</span>
            </p>
          </Reveal>
          <Reveal className="actions" delay={100}>
            <DownloadButton />
            <SignUpButton />
          </Reveal>
          <Reveal delay={160}>
            <p className="contact-line">
              Questions or feedback? Say hello at <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
            </p>
          </Reveal>
        </section>

        <footer className="footer">
          <div className="container footer-inner">
            <Logo />
            <span>{SITE.tagline}</span>
            <span>&copy; {new Date().getFullYear()} PowerShare</span>
          </div>
        </footer>
      </main>
    </>
  );
}
