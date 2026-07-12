import {
  getAddress,
  isConnected,
  signTransaction,
} from "@stellar/freighter-api";
import type { WalletProvider } from "@/lib/types";

declare global {
  interface Window {
    xBull?: {
      connect: () => Promise<{ publicKey: string }>;
      sign: (xdr: string) => Promise<string>;
    };

    albedo?: {
      publicKey: (opts?: unknown) => Promise<{ pubkey: string }>;
      tx: (opts: {
        xdr: string;
        network: string;
      }) => Promise<{
        signed_envelope_xdr: string;
      }>;
    };
  }
}

export interface WalletSession {
  provider: WalletProvider;
  publicKey: string;
  connectedAt: string;
}

export interface WalletConnector {
  id: WalletProvider;
  name: string;

  detect(): Promise<boolean>;
  connect(): Promise<WalletSession>;
  sign(xdr: string): Promise<string>;
}

const session = (
  provider: WalletProvider,
  publicKey: string
): WalletSession => ({
  provider,
  publicKey,
  connectedAt: new Date().toISOString(),
});

export const freighterConnector: WalletConnector = {
  id: "freighter",
  name: "Freighter",

  async detect() {
    const result = await isConnected();
    return result.isConnected;
  },

  async connect() {
    const result = await getAddress();

    if (result.error) {
      throw new Error(result.error);
    }

    return session("freighter", result.address);
  },

  async sign(xdr: string) {
    const result = await signTransaction(xdr, {
      networkPassphrase: "Test SDF Network ; September 2015",
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.signedTxXdr;
  },
};

export const xbullConnector: WalletConnector = {
  id: "xbull",
  name: "xBull",

  async detect() {
    return typeof window !== "undefined" && !!window.xBull;
  },

  async connect() {
    if (!window.xBull) {
      throw new Error("xBull not installed");
    }

    const res = await window.xBull.connect();

    return session("xbull", res.publicKey);
  },

  async sign(xdr: string) {
    if (!window.xBull) {
      throw new Error("xBull not installed");
    }

    return window.xBull.sign(xdr);
  },
};

export const albedoConnector: WalletConnector = {
  id: "albedo",
  name: "Albedo",

  async detect() {
    return typeof window !== "undefined" && !!window.albedo;
  },

  async connect() {
    if (!window.albedo) {
      throw new Error("Albedo not installed");
    }

    const res = await window.albedo.publicKey({
      require_existing: true,
    });

    return session("albedo", res.pubkey);
  },

  async sign(xdr: string) {
    if (!window.albedo) {
      throw new Error("Albedo not installed");
    }

    const res = await window.albedo.tx({
      xdr,
      network: "testnet",
    });

    return res.signed_envelope_xdr;
  },
};

export const connectors = [
  freighterConnector,
  xbullConnector,
  albedoConnector,
];

export function connectorFor(provider: WalletProvider) {
  const connector = connectors.find((item) => item.id === provider);

  if (!connector) {
    throw new Error("Unsupported wallet provider");
  }

  return connector;
}