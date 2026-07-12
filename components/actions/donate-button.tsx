"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { useWallet } from "@/components/providers/wallet-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { submitScholarshipDonation } from "@/lib/services/scholarships";

export function DonateButton({
  scholarshipId,
  scholarshipChainId,
}: {
  scholarshipId: string;
  scholarshipChainId: number;
}) {
  const { session, sign } = useWallet();
  const { user } = useAuth();
  const router = useRouter();

  const [amount, setAmount] = useState(50);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const donate = () =>
    startTransition(() => {
      void (async () => {
        try {
          if (!session) {
            throw new Error("Connect a wallet first");
          }

          if (amount <= 0 || Number.isNaN(amount)) {
            throw new Error("Enter a valid donation amount");
          }

          await submitScholarshipDonation({
            scholarshipId,
            scholarshipChainId,
            amount,
            asset: "XLM",
            signer: {
              publicKey: session.publicKey,
              sign,
            },
            donorUid: user?.uid,
          });

          setError(undefined);
          router.refresh();
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Donation failed"
          );
        }
      })();
    });


  return (
    <div className="space-y-3">
      <input
        type="number"
        min={1}
        step={1}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Donation amount"
        className="w-full rounded-xl border border-white/10 bg-ink/70 px-4 py-3 text-white outline-none"
      />

      <Button disabled={isPending} onClick={donate}>
        {isPending
          ? "Signing donation..."
          : `Donate ${amount} XLM`}
      </Button>

      {error ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : null}
    </div>
  );
}