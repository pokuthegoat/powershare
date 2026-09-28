import { createPublicClient, http, parseAbi, zeroAddress, type Hex } from "viem";
import { robinhoodChain } from "./robinhoodChain";

/**
 * Pons v2 launch factory on Robinhood Chain. Confirmed directly against the verified, bytecode-matched source at
 * robinhoodchain.blockscout.com (PonsV2LaunchFactory.sol) on 2026-09-28 — not just docs prose — for the struct shape
 * and the two functions that actually build/send the launch transaction (`launchToken`, `previewLaunchEconomics`).
 * `launchFee` and `maxCreatorTaxBps` are simple public-variable getters per Pons's docs, not independently
 * re-checked line-by-line; low risk since they're plain reads with no side effects.
 */
export const PONS_FACTORY_ADDRESS = "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e" as const;

/** Confirmed the same way as the factory: read directly from the verified PonsV2FeeEscrow source (2026-09-28). */
export const PONS_FEE_ESCROW_ADDRESS = "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e" as const;

export const PONS_FEE_ESCROW_ABI = parseAbi(["function balanceOf(address recipient) external view returns (uint256)"]);

export const PONS_FACTORY_ABI = parseAbi([
  "struct Socials { string twitter; string telegram; string discord; string website; string farcaster; }",
  "struct TokenParams { string name; string symbol; string logo; string description; Socials socials; address creatorFeeRecipient; uint16 creatorTaxBps; bool buybackEnabled; bytes32 expectedEconomics; bytes32 salt; }",
  "function launchToken(TokenParams params, uint256 launchConfigId, address pairToken) external payable returns (address token, address curve)",
  "function previewLaunchEconomics(uint256 launchConfigId, address pairToken) external view returns (bytes32)",
  "function launchFee() external view returns (uint256)",
  "function maxCreatorTaxBps() external view returns (uint16)",
]);

/** A native-ETH launch always uses this pair. */
export const NATIVE_PAIR_TOKEN = zeroAddress;

/** Config 0 is the standard native-ETH bonding curve. `previewLaunchEconomics` itself reverts if that ever stops being valid. */
export const DEFAULT_LAUNCH_CONFIG_ID = 0n;

export function ponsPublicClient() {
  return createPublicClient({ chain: robinhoodChain, transport: http() });
}

function randomSalt(): Hex {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}` as Hex;
}

export type LaunchCoinInput = {
  name: string;
  symbol: string;
  description: string;
  creatorFeeRecipient: Hex;
  creatorTaxBps: number;
};

/**
 * Reads the live launch fee and economics pin, then returns everything needed for a `launchToken` call: the built
 * `TokenParams`, the config id, the pair token, and the fee to send as `value`. Doesn't send anything itself — the
 * caller signs and submits with their own wallet client.
 */
export async function prepareLaunch(input: LaunchCoinInput) {
  const client = ponsPublicClient();

  const [launchFee, expectedEconomics] = await Promise.all([
    client.readContract({ address: PONS_FACTORY_ADDRESS, abi: PONS_FACTORY_ABI, functionName: "launchFee" }),
    client.readContract({
      address: PONS_FACTORY_ADDRESS,
      abi: PONS_FACTORY_ABI,
      functionName: "previewLaunchEconomics",
      args: [DEFAULT_LAUNCH_CONFIG_ID, NATIVE_PAIR_TOKEN],
    }),
  ]);

  const params = {
    name: input.name,
    symbol: input.symbol,
    // Image hosting isn't wired up yet — launches go out with no logo until that exists.
    logo: "",
    description: input.description,
    socials: { twitter: "", telegram: "", discord: "", website: "", farcaster: "" },
    creatorFeeRecipient: input.creatorFeeRecipient,
    creatorTaxBps: input.creatorTaxBps,
    buybackEnabled: false,
    expectedEconomics,
    salt: randomSalt(),
  } as const;

  return { params, launchConfigId: DEFAULT_LAUNCH_CONFIG_ID, pairToken: NATIVE_PAIR_TOKEN, launchFee };
}
