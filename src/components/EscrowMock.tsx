"use client";

import { useEffect, useRef, useState } from "react";

/** The mock starts mid-trading: some volume already done, some ETH already sitting in escrow. */
const START_TRADES = 214;
const START_ESCROW = 0.0412;

/** A gently wandering trade rate, so the numbers breathe like a real, live coin. */
const tradeChance = (t: number) => 0.5 + 0.3 * Math.sin(t / 5) + 0.15 * Math.sin(t * 1.3 + 1);

/**
 * The window in the landing page's "how it works" split: a mock of a subreddit's coin ticking along, trades adding up
 * and fees landing in escrow in real time. It only ticks while on screen, and not at all for visitors who prefer
 * reduced motion. It is an example, and the page labels it as one.
 */
export function EscrowMock() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);
  const [trades, setTrades] = useState(START_TRADES);
  const [escrow, setEscrow] = useState(START_ESCROW);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const start = () => {
      if (!timer) {
        timer = window.setInterval(() => {
          setTick((t) => t + 1);
        }, 1000);
      }
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.2 });
    io.observe(root);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  useEffect(() => {
    if (tick === 0) return;
    if (tradeChance(tick) <= 0.6) return;
    setTrades((n) => n + 1);
    setEscrow((n) => n + 0.00015 + Math.random() * 0.0003);
  }, [tick]);

  const activity = Math.max(8, Math.min(96, Math.round(50 + 40 * tradeChance(tick))));

  return (
    <div ref={rootRef}>
      <div className="app-bar">
        <i />
        <i />
        <i />
        <span>r/nba &middot; $NBA &middot; example</span>
      </div>
      <div className="app-body">
        <div className="app-gpu">
          <span>
            <b>r/nba coin</b>
            <small>3% creator tax &middot; escrow tied to this subreddit</small>
          </span>
          <span className="chip is-live">Trading</span>
        </div>
        <div className="app-grid">
          <div className="app-tile">
            <small>Activity</small>
            <b>{activity}%</b>
            <span className="meter" aria-hidden="true">
              <i style={{ width: `${activity}%` }} />
            </span>
          </div>
          <div className="app-tile">
            <small>Trades</small>
            <b>{trades.toLocaleString()}</b>
          </div>
          <div className="app-tile">
            <small>In escrow</small>
            <b>{escrow.toFixed(4)} ETH</b>
          </div>
        </div>
        <div className="app-toggle">Waiting for a verified mod to claim</div>
      </div>
    </div>
  );
}
