export const env = {
  stellarNetwork: process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet",
  sorobanRpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org",
  factoryContractId: process.env.NEXT_PUBLIC_SCHOLARSHIP_FACTORY_ID ?? "",
  escrowContractId: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID ?? "",
  donationManagerId: process.env.NEXT_PUBLIC_DONATION_MANAGER_ID ?? "",
  milestoneManagerId: process.env.NEXT_PUBLIC_MILESTONE_MANAGER_ID ?? "",
};
export function requireEnv(value: string, name: string) { if (!value) throw new Error(`${name} is not configured`); return value; }
