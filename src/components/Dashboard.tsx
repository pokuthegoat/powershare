"use client";

import { useEffect, useMemo, useState } from "react";
import { robinhoodChain } from "@/lib/robinhoodChain";

type Stats = {
  launches: number;
  subreddits: number;
  totalPaidEth: number;
  totalInEscrowEth: number;
  dailyPaid: { day: string; amountEth: number }[];
};

type Launch = {
  id: number;
  subreddit: string;
  name: string;
  symbol: string;
  token_address: string;
  launcher_wallet: string;
  tx_hash: string;
  launched_at: string;
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;
const ymd = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [launches, setLaunches] = useState<Launch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(today.getUTCMonth());

  useEffect(() => {
    Promise.all([fetch("/api/stats"), fetch("/api/launches")])
      .then(async ([statsRes, launchesRes]) => {
        if (!statsRes.ok || !launchesRes.ok) throw new Error();
        setStats(await statsRes.json());
        setLaunches((await launchesRes.json()).launches);
      })
      .catch(() => setError("Couldn't load dashboard data."));
  }, []);

  if (error) return <p className="form-note">{error}</p>;
  if (!stats || !launches) return <p className="t-lead">Loading…</p>;

  const paidByDay = new Map(stats.dailyPaid.map((d) => [d.day, d.amountEth]));
  const totalGenerated = stats.totalPaidEth + stats.totalInEscrowEth;

  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay() + 6) % 7; // Monday = 0
  const monthTotal = Array.from({ length: daysInMonth }, (_, i) => paidByDay.get(ymd(viewYear, viewMonth, i + 1)) ?? 0).reduce((a, b) => a + b, 0);

  let bestStreak = 0;
  let running = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (paidByDay.get(ymd(viewYear, viewMonth, d))) {
      running++;
      bestStreak = Math.max(bestStreak, running);
    } else running = 0;
  }

  let currentStreak = 0;
  for (let cursor = new Date(today); ; cursor.setUTCDate(cursor.getUTCDate() - 1)) {
    const key = ymd(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate());
    if (!paidByDay.get(key)) break;
    currentStreak++;
  }

  function changeMonth(delta: number) {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div className="box" style={{ padding: 20 }}>
        <span className="t-eyebrow section-num">Treasury generated</span>
        <p className="progress-amount" style={{ marginTop: 10 }}>
          {totalGenerated.toFixed(4)} ETH
        </p>
        <div className="dash-stats" style={{ marginTop: 18 }}>
          <div className="dash-stat">
            <span className="t-eyebrow t-muted">Paid to mods</span>
            <span className="num">{stats.totalPaidEth.toFixed(4)} ETH</span>
          </div>
          <div className="dash-stat">
            <span className="t-eyebrow t-muted">Sitting in escrow</span>
            <span className="num">{stats.totalInEscrowEth.toFixed(4)} ETH</span>
          </div>
          <div className="dash-stat">
            <span className="t-eyebrow t-muted">Coins launched</span>
            <span className="num">{stats.launches}</span>
          </div>
          <div className="dash-stat">
            <span className="t-eyebrow t-muted">Subreddits</span>
            <span className="num">{stats.subreddits}</span>
          </div>
        </div>
      </div>

      <div className="box" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span className="t-eyebrow section-num">Payout activity</span>
          <div className="calendar-nav">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
              ‹
            </button>
            <span className="t-eyebrow">
              {MONTH_NAMES[viewMonth]} {viewYear} UTC+0
            </span>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">
              ›
            </button>
          </div>
        </div>
        <p className="progress-amount" style={{ marginTop: 14 }}>
          {monthTotal.toFixed(4)} ETH
        </p>

        <div className="calendar-grid">
          {WEEKDAYS.map((w, i) => (
            <div className="calendar-head" key={i}>
              {w}
            </div>
          ))}
          {Array.from({ length: firstWeekday }, (_, i) => (
            <div className="calendar-cell is-empty" key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const amount = paidByDay.get(ymd(viewYear, viewMonth, day));
            return (
              <div className={`calendar-cell${amount ? " has-payout" : ""}`} key={day}>
                <span className="day-num">{day}</span>
                <span className="day-amt">{amount ? `${amount.toFixed(3)} ETH` : "—"}</span>
              </div>
            );
          })}
        </div>
        <p className="fine" style={{ marginTop: 14 }}>
          Current streak: {currentStreak}d &middot; Best streak in {MONTH_NAMES[viewMonth]}: {bestStreak}d
        </p>
      </div>

      <div>
        <span className="t-eyebrow section-num">Launch history &middot; {launches.length}</span>
        {launches.length === 0 ? (
          <p className="t-lead t-muted" style={{ marginTop: 16 }}>
            No coins launched yet.
          </p>
        ) : (
          <div className="launch-list">
            <div className="launch-row is-head">
              <span>Subreddit</span>
              <span>Coin</span>
              <span>Launched by</span>
              <span>When</span>
            </div>
            {launches.map((l) => (
              <div className="launch-row" key={l.id}>
                <span>r/{l.subreddit}</span>
                <span>
                  {l.name} &middot; ${l.symbol}
                </span>
                <span>{short(l.launcher_wallet)}</span>
                <span>
                  <a href={`${robinhoodChain.blockExplorers.default.url}/tx/${l.tx_hash}`} target="_blank" rel="noreferrer">
                    {l.launched_at}
                  </a>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
