"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/lib/config";
import { smoothScrollTo } from "@/lib/smooth-scroll";
import { Logo } from "./Logo";
import { AuthButton } from "./AuthButton";
import { DownloadButton } from "./Buttons";

// Links to a section of the landing page ("/#how-it-works") scroll the page themselves instead of relying on the
// URL hash: a hash link does nothing when the hash is already set, and it rewrites the address bar.
const sectionIdOf = (href: string) => (href.startsWith("/#") ? href.slice(2) : null);

function scrollToSection(id: string, header: HTMLElement | null) {
  const section = document.getElementById(id);
  if (!section) return false;
  const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight ?? 0));
  // Glide through the site's smooth-scroll system; when that is off (reduced motion) it's an instant jump.
  if (!smoothScrollTo(top)) window.scrollTo({ top, behavior: "auto" });
  return true;
}

export function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={headerRef} className="nav">
      <div className="nav-inner">
        <Logo />
        <button
          type="button"
          className="burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
        </button>
        <nav id="nav-links" className={`nav-links${open ? " is-open" : ""}`} aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={(e) => {
                setOpen(false);
                const plain = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
                const sectionId = sectionIdOf(l.href);
                if (sectionId && plain && scrollToSection(sectionId, headerRef.current)) e.preventDefault();
              }}
            >
              {l.label}
            </Link>
          ))}
          <AuthButton />
          <DownloadButton variant="primary" small />
        </nav>
      </div>
    </header>
  );
}
