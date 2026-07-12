import {
  BASE_FEE,
  Contract,
  Transaction,
  TransactionBuilder,
  Address, 
  nativeToScVal,
  xdr,
  rpc,
} from "@stellar/stellar-sdk";

import { env, requireEnv } from "@/lib/env";

type ScValInput =
  | string
  | number
  | bigint
  | boolean
  | null
  | Uint8Array
  | xdr.ScVal
  | ScValInput[]
  | { [key: string]: ScValInput };

export interface ContractCallResult {
  xdr: string;
  contractId: string;
  method: string;
  simulationCost: string;
  latestLedger: number;
  transactionFee: string;
}

export type SorobanSubmissionResult = rpc.Api.SendTransactionResponse;

export interface ScholarshipCreationTransactionParams {
  creator: string;

  title: string;
  description: string;

  student: string;

  studentName: string;
  university: string;
  country: string;
  category: string;

  goal: number;
  deadline: string;

  escrowContract: string;
}

export interface DonationTransactionParams {
  donor: string;
  scholarshipChainId: number;
  amount: number;
}

export interface MilestoneApprovalTransactionParams {
  verifier: string;
  scholarshipId: string | number;
  milestoneId: string | number;
  proofUri: string;
}

export interface EscrowReleaseTransactionParams {
  verifier: string;
  student: string;
  scholarshipId: string | number;
  milestoneId: string | number;
  amount: number;
}

type ContractBuildInput = {
  sourceAccount: string;
  contractId: string;
  method: string;
  args: unknown[];
  timeoutSeconds?: number;
};

const DEFAULT_TIMEOUT_SECONDS = 180;

class SorobanClientError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "SorobanClientError";
    this.cause = cause;
  }
}

function getNetworkPassphrase() {
  const network = env.stellarNetwork.trim().toLowerCase();

  if (network === "public" || network === "mainnet" || network === "pubnet") {
    return "Public Global Stellar Network ; September 2015";
  }

  if (network === "futurenet") {
    return "Test SDF Future Network ; October 2022";
  }

  if (network.includes("stellar network")) {
    return env.stellarNetwork;
  }

  return "Test SDF Network ; September 2015";
}

function getRpcUrl() {
  return requireEnv(env.sorobanRpcUrl, "NEXT_PUBLIC_SOROBAN_RPC_URL");
}

function getContractId(value: string, name: string) {
  return requireEnv(value, name);
}

function createRpcServer() {
  const rpcUrl = getRpcUrl();

  return new rpc.Server(rpcUrl, {
    allowHttp: rpcUrl.startsWith("http://"),
  });
}

function serializeTransaction(transaction: Transaction) {
  return transaction.toXDR();
}

function assertSuccessfulSimulation(
  response: rpc.Api.SimulateTransactionResponse
): asserts response is
  | rpc.Api.SimulateTransactionSuccessResponse
  | rpc.Api.SimulateTransactionRestoreResponse {
  if ("error" in response) {
    throw new SorobanClientError(`Soroban simulation failed: ${response.error}`);
  }
}

function getSimulationFee(
  response: rpc.Api.SimulateTransactionResponse
) {
  if ("minResourceFee" in response) {
    return response.minResourceFee;
  }

  throw new SorobanClientError("Soroban simulation did not return a resource fee");
}

async function buildContractTransaction({
  sourceAccount,
  contractId,
  method,
  args,
  timeoutSeconds = DEFAULT_TIMEOUT_SECONDS,
}: ContractBuildInput): Promise<{
  prepared: Transaction;
  simulation: rpc.Api.SimulateTransactionResponse;
}> {
  const server = createRpcServer();

  try {
    const account = await server.getAccount(sourceAccount);
    const contract = new Contract(contractId);
    const built = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(contract.call(method, ...(args as xdr.ScVal[])))
      .setTimeout(timeoutSeconds)
      .build();

    const simulation = await simulateContractTransaction(built, server);
    assertSuccessfulSimulation(simulation);
    const prepared = await prepareContractTransaction(built, server);

    return { prepared, simulation };
  } catch (error) {
    console.error("Soroban build error:", error);

    throw error;
  }
}

export async function simulateContractTransaction(
  transaction: Transaction,
  server = createRpcServer()
) {
  return server.simulateTransaction(transaction);
}

export async function prepareContractTransaction(
  transaction: Transaction,
  server = createRpcServer()
) {
  return server.prepareTransaction(transaction);
}

async function buildPreparedCall(
  contractId: string,
  method: string,
  args: ScValInput[],
  sourceAccount: string
): Promise<ContractCallResult> {
  const { prepared, simulation } = await buildContractTransaction({
    sourceAccount,
    contractId,
    method,
    args,
  });

  return {
    xdr: serializeTransaction(prepared),
    contractId,
    method,
    simulationCost: getSimulationFee(simulation),
    latestLedger: simulation.latestLedger,
    transactionFee: prepared.fee,
  };
}

export async function buildScholarshipCreationTransaction(
  params: ScholarshipCreationTransactionParams
) {
  const metadata = JSON.stringify({
    title: params.title,
    description: params.description,
    studentName: params.studentName,
    university: params.university,
    country: params.country,
    category: params.category,
    deadline: params.deadline,
    escrowContract: params.escrowContract,
  });

  return buildPreparedCall(
    getContractId(
      env.factoryContractId,
      "NEXT_PUBLIC_SCHOLARSHIP_FACTORY_ID"
    ),
    "create",
    [
      Address.fromString(params.creator).toScVal(),
      Address.fromString(params.student).toScVal(),
      nativeToScVal(metadata),
      nativeToScVal(BigInt(params.goal), { type: "i128" }),
    ],
    params.creator
  );
}

export async function buildDonationTransaction(
  params: DonationTransactionParams
) {
  return buildPreparedCall(
    getContractId(
      env.donationManagerId,
      "NEXT_PUBLIC_DONATION_MANAGER_ID"
    ),
    "donate",
    [
      Address.fromString(params.donor).toScVal(),
      nativeToScVal(BigInt(params.scholarshipChainId), {
        type: "u32",
      }),
      nativeToScVal(BigInt(params.amount), {
        type: "i128",
      }),
    ],
    params.donor
  );
}

export async function buildMilestoneApprovalTransaction(
  params: MilestoneApprovalTransactionParams
) {
  return buildPreparedCall(
    getContractId(
      env.milestoneManagerId,
      "NEXT_PUBLIC_MILESTONE_MANAGER_ID"
    ),
    "approve",
    [
      params.verifier,
      Number(params.scholarshipId),
      Number(params.milestoneId),
      params.proofUri,
    ],
    params.verifier
  );
}

export async function buildEscrowReleaseTransaction(
  params: EscrowReleaseTransactionParams
) {
  return buildPreparedCall(
    getContractId(
      env.escrowContractId,
      "NEXT_PUBLIC_ESCROW_CONTRACT_ID"
    ),
    "release",
    [
      params.verifier,
      params.student,
      Number(params.scholarshipId),
      Number(params.milestoneId),
      params.amount,
    ],
    params.verifier
  );
}

export const buildReleaseTransaction = buildEscrowReleaseTransaction;

export async function submitSignedTransaction(
  signedXdr: string
): Promise<SorobanSubmissionResult> {
  try {
    const server = createRpcServer();
    const transaction = new Transaction(signedXdr, getNetworkPassphrase());

    return await server.sendTransaction(transaction);
  } catch (error) {
    if (error instanceof SorobanClientError) {
      throw error;
    }

    throw new SorobanClientError("Failed to submit signed Soroban transaction", error);
  }
}
