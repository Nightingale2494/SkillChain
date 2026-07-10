import { Address, BASE_FEE, Contract, Networks, SorobanRpc, TransactionBuilder, nativeToScVal } from "@stellar/stellar-sdk";
import { env, requireEnv } from "@/lib/env";

export type ContractCallResult = { xdr: string; simulationCost: string; contractId: string };
const networkPassphrase = env.stellarNetwork === "public" ? Networks.PUBLIC : Networks.TESTNET;
const server = new SorobanRpc.Server(env.sorobanRpcUrl, { allowHttp: env.sorobanRpcUrl.startsWith("http://") });
async function buildContractCall(source: string, contractId: string, method: string, args: unknown[] = []): Promise<ContractCallResult> {
  const account = await server.getAccount(source);
  const contract = new Contract(contractId);
  const operation = contract.call(method, ...args.map((value) => nativeToScVal(value)));
  let tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase }).addOperation(operation).setTimeout(60).build();
  const prepared = await server.prepareTransaction(tx);
  return { xdr: prepared.toXDR(), simulationCost: prepared.fee, contractId };
}
export async function buildCreateScholarshipTransaction(params: { creator: string; student: string; metadataUri: string; goal: number }) { return buildContractCall(params.creator, requireEnv(env.factoryContractId, "NEXT_PUBLIC_SCHOLARSHIP_FACTORY_ID"), "create", [new Address(params.creator), new Address(params.student), params.metadataUri, BigInt(params.goal)]); }
export async function buildDonationTransaction(params: { donor: string; scholarshipId: number; amount: number; asset: string }) { return buildContractCall(params.donor, requireEnv(env.donationManagerId, "NEXT_PUBLIC_DONATION_MANAGER_ID"), "donate", [new Address(params.donor), params.scholarshipId, BigInt(params.amount)]); }
export async function buildMilestoneApprovalTransaction(params: { verifier: string; scholarshipId: number; milestoneId: number; proofUri: string }) { return buildContractCall(params.verifier, requireEnv(env.milestoneManagerId, "NEXT_PUBLIC_MILESTONE_MANAGER_ID"), "approve", [new Address(params.verifier), params.scholarshipId, params.milestoneId, params.proofUri]); }
export async function buildEscrowReleaseTransaction(params: { verifier: string; student: string; scholarshipId: number; milestoneId: number; amount: number }) { return buildContractCall(params.verifier, requireEnv(env.escrowContractId, "NEXT_PUBLIC_ESCROW_CONTRACT_ID"), "release", [new Address(params.verifier), new Address(params.student), params.scholarshipId, params.milestoneId, BigInt(params.amount)]); }
export async function submitSignedTransaction(signedXdr: string) { const tx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase); const result = await server.sendTransaction(tx); if (result.status === "ERROR") throw new Error("Soroban transaction submission failed"); return { hash: result.hash, status: result.status }; }
