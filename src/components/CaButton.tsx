"use client";

import { useState } from "react";

const CONTRACT_ADDRESS = "0xd579a38fb0a17ac613af20707134936b814d769a";

/** A nav pill that shows "CA" and expands to reveal the full contract address on hover; clicking copies it. */
export function CaButton() {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access can be denied (e.g. insecure context); nothing else to do here
    }
  }

  return (
    <button type="button" className={`ca-btn${copied ? " is-copied" : ""}`} onClick={onClick}>
      {copied ? (
        <span className="ca-full">Copied!</span>
      ) : (
        <>
          <span className="ca-label">CA</span>
          <span className="ca-full">{CONTRACT_ADDRESS}</span>
        </>
      )}
    </button>
  );
}
