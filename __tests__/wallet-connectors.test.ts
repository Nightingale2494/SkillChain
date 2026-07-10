import { describe, expect, it } from "vitest";
import { connectors, connectorFor } from "@/lib/wallet/connectors";

describe("wallet connectors", () => {
  it("registers Freighter, xBull and Albedo", () => {
    expect(connectors.map((connector) => connector.id)).toEqual(["freighter", "xbull", "albedo"]);
  });
  it("throws for unsupported providers", () => {
    expect(() => connectorFor("unsupported" as never)).toThrow("Unsupported wallet provider");
  });
});
