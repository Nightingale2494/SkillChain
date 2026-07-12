"use client";

import { useState } from "react";

import { useWallet } from "@/components/providers/wallet-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Button, Card } from "@/components/ui";
import { createScholarshipCampaign } from "@/lib/services/scholarships";

const fields = [
  "title",
  "studentWallet",
  "studentName",
  "university",
  "country",
  "category",
  "goal",
] as const;

const initialForm = {
  title: "",
  studentWallet: "",
  studentName: "",
  university: "",
  country: "",
  category: "",
  goal: "",
  deadline: "",
  description: "",
};

export function CreateScholarshipForm() {
  const { session, sign } = useWallet();
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();

  return (
    <Card>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();

          setLoading(true);
          setError(undefined);

          void (async () => {
            try {
              if (!session) {
                throw new Error("Please connect your Freighter wallet first.");
              }

              await createScholarshipCampaign({
                input: {
                  ...form,
                  goal: Number(form.goal),
                },
                signer: {
                  publicKey: session.publicKey,
                  sign,
                },
                creatorUid: user?.uid,
              });


              setDone(true);
              setForm(initialForm);
            } catch (submissionError) {
              setError(
                submissionError instanceof Error
                  ? submissionError.message
                  : "Unable to create scholarship"
              );
            } finally {
              setLoading(false);
            }
          })();
        }}
      >
        {fields.map((field) => (
          <label
            key={field}
            className="text-sm text-slate-300 capitalize"
          >
            {field.replace(/([A-Z])/g, " $1")}

            <input
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/70 px-4 py-3 text-white"
              placeholder={
                field === "studentWallet"
                  ? "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  : field
              }
              value={form[field]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))
              }
            />
          </label>
        ))}

        <label className="text-sm text-slate-300">
          Deadline

          <input
            required
            type="date"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/70 px-4 py-3 text-white"
            value={form.deadline}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                deadline: event.target.value,
              }))
            }
          />
        </label>

        <label className="text-sm text-slate-300 md:col-span-2">
          Description

          <textarea
            required
            className="mt-2 min-h-32 w-full rounded-2xl border border-white/10 bg-ink/70 px-4 py-3 text-white"
            placeholder="Describe the academic need and verification plan"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </label>

        <Button
          className="md:col-span-2"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Preparing Soroban transaction..."
            : "Create scholarship campaign"}
        </Button>

        {done && (
          <p className="text-mint md:col-span-2">
            Scholarship created successfully. Transaction submitted to Stellar Testnet.
          </p>
        )}

        {error && (
          <p className="text-red-300 md:col-span-2">
            {error}
          </p>
        )}
      </form>
    </Card>
  );
}