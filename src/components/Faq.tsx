"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

type Item = { q: string; a: string };

/**
 * The FAQ list. Each answer folds open and closed with an animated height instead of jumping.
 *
 * Reveal's own className must stay constant: it adds "in" by hand, and a changing className would wipe it and hide the
 * card again. So the open state lives on the inner card, not on the Reveal.
 */
export function Faq({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="faq">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <Reveal key={f.q} delay={i * 40}>
            <div className={`glass faq-item${isOpen ? " is-open" : ""}`}>
              <h3>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  id={`faq-q-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {f.q}
                </button>
              </h3>
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq-a">
                <div className="faq-a-inner">
                  <p>{f.a}</p>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
