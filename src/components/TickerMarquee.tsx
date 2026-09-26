import { REWARD_TICKERS } from "@/lib/config";

/**
 * A thin bordered strip of the reward stocks, drifting slowly sideways. The list is written out twice and the track
 * slides half its own width, so the loop has no seam. The second copy is hidden from screen readers. It pauses on hover,
 * and for visitors who prefer reduced motion it doesn't move at all.
 */
export function TickerMarquee() {
  const group = (hidden: boolean) => (
    <ul className="marquee-group" aria-hidden={hidden || undefined}>
      {REWARD_TICKERS.map((t) => (
        <li className="marquee-item" key={t.symbol}>
          <b>{t.symbol}</b>
          <span>{t.name}</span>
          <i aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee" role="group" aria-label="Stocks you can cash out for">
      <div className="marquee-track">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
