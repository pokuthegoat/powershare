import { defineChain } from "viem";

/**
 * Robinhood Chain mainnet (Arbitrum Orbit L2). Not one of viem's built-in chains, so it's defined by hand from
 * docs.robinhood.com/chain/connecting. The public RPC is rate-limited and fine for this app's low volume; swap for a
 * provider like Alchemy if that ever becomes a problem.
 */
export const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"], webSocket: ["wss://feed.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" },
  },
});
