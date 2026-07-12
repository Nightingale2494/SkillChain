import { env } from "@/lib/env";

export {
  buildScholarshipCreationTransaction,
  buildDonationTransaction,
  buildMilestoneApprovalTransaction,
  buildEscrowReleaseTransaction,
  submitSignedTransaction,
} from "@/lib/soroban/client";

export function stellarExplorerUrl(hash: string) {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

export function stellarContractUrl(contractId: string) {
  return `https://lab.stellar.org/r/testnet/contract/${contractId}`;
}

/**
 * Fetch the actual XLM balance of a Stellar address from Horizon Testnet
 */
export async function fetchAccountBalance(publicKey: string): Promise<string> {
  if (!publicKey) return "0.00";
  
  try {
    const horizonUrl = env.stellarNetwork === "public" 
      ? "https://horizon.stellar.org" 
      : "https://horizon-testnet.stellar.org";
      
    const response = await fetch(`${horizonUrl}/accounts/${publicKey}`);
    if (!response.ok) {
      if (response.status === 404) {
        return "0.00 (Unfunded Account)";
      }
      throw new Error(`Horizon returned ${response.status}`);
    }
    
    const accountData = await response.json();
    const nativeBalanceObj = accountData.balances.find(
      (b: any) => b.asset_type === "native"
    );
    
    return nativeBalanceObj ? parseFloat(nativeBalanceObj.balance).toFixed(2) : "0.00";
  } catch (error) {
    console.error("Failed to fetch Horizon balance:", error);
    return "Error loading balance";
  }
}

/**
 * Fetch the last 5 transactions for a Stellar account from Horizon Testnet
 */
export async function fetchRecentTransactions(publicKey: string): Promise<any[]> {
  if (!publicKey) return [];
  
  try {
    const horizonUrl = env.stellarNetwork === "public" 
      ? "https://horizon.stellar.org" 
      : "https://horizon-testnet.stellar.org";
      
    const response = await fetch(
      `${horizonUrl}/accounts/${publicKey}/payments?limit=5&order=desc`
    );
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const payments = data._embedded?.records || [];
    
    return payments.map((p: any) => ({
      id: p.id,
      type: p.type,
      amount: p.amount || p.starting_balance || "0.00",
      asset: p.asset_type === "native" || !p.asset_code ? "XLM" : p.asset_code,
      from: p.from || p.funder || p.account || "",
      to: p.to || p.account || p.into || "",
      txHash: p.transaction_hash,
      createdAt: p.created_at,
    }));
  } catch (error) {
    console.error("Failed to fetch Horizon transactions:", error);
    return [];
  }
}
