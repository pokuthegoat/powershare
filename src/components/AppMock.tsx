"use client";

import { useEffect, useRef, useState } from "react";
import { MINUTES_PER_DOLLAR } from "@/lib/config";

/** The starting point of the mock: 2 h 41 m 08 s connected, which at the site's rate is $1.79. */
const START_SECONDS = 2 * 3600 + 41 * 60 + 8;

const pad = (n: number) => String(n).padStart(2, "0");
const clock = (s: number) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

/** A gently wandering GPU load, so the bar breathes like a real one. */
const usageAt = (s: number) => Math.round(72 + 9 * Math.sin(s / 4) + 4 * Math.sin(s * 1.7 + 1));

/**
 * The window in section 06 of the landing page: a mock of the desktop app that runs. The clock ticks, the GPU usage
 * wanders and the earnings climb at the real rate (1 point a minute, 90 points to the dollar), so it explains the app
 * without words. It is an example, and the page labels it as one. It only ticks while it is on screen, and not at all
 * for visitors who prefer reduced motion.
 */
export function AppMock() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [seconds, setSeconds] = useState(START_SECONDS);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const start = () => {
      if (!timer) timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
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

  const usage = usageAt(seconds);
  const earned = seconds / 60 / MINUTES_PER_DOLLAR;

  return (
    <div ref={rootRef}>
      <div className="app-bar">
        <i />
        <i />
        <i />
        <span>PowerShare &middot; example</span>
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
            <b>{usage}%</b>
            <span className="meter" aria-hidden="true">
              <i style={{ width: `${usage}%` }} />
            </span>
          </div>
          <div className="app-tile">
            <small>Time</small>
            <b>{clock(seconds)}</b>
          </div>
          <div className="app-tile">
            <small>Earned</small>
            <b className="up">${earned.toFixed(3)}</b>
          </div>
        </div>
        <div className="app-toggle">Stop contributing</div>
      </div>
    </div>
  );
}
