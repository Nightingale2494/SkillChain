import { describe, expect, it } from "vitest";
import { requireEnv } from "@/lib/env";

describe("environment validation", () => {
  it("returns configured values", () => expect(requireEnv("configured", "NAME")).toBe("configured"));
  it("throws for missing production configuration", () => expect(() => requireEnv("", "NAME")).toThrow("NAME is not configured"));
});
