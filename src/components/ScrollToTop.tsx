"use client";

import { useEffect } from "react";

/**
 * Refreshing the page starts at the top.
 *
 * Browsers remember where you had scrolled to and put you back there after a refresh (and after coming back with the back
 * button). The inline script in the root layout turns that off as early as it can; this is the safety net for the moment
 * the page mounts, in case the browser had already restored a position before that script ran (it can, the first time).
 *
 * A link with a #section in the address (say /#faq) is left alone: that is a deliberate place to land.
 */
export function ScrollToTop() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!window.location.hash && window.scrollY > 0) window.scrollTo(0, 0);
  }, []);
  return null;
}
