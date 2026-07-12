"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Scholarship } from "@/lib/types";

export function FundingChart({
  scholarships,
}: {
  scholarships: Scholarship[];
}) {
  const data = scholarships
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    )
    .map((scholarship) => ({
      name:
        scholarship.title.length > 18
          ? scholarship.title.slice(0, 18) + "..."
          : scholarship.title,
      raised: scholarship.raised,
      goal: scholarship.goal,
    }));

  return (
    <div className="h-72 rounded-3xl border border-white/10 bg-white/[.06] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="funding" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2fffc2" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#2fffc2" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis dataKey="name" stroke="#94a3b8" />

          <YAxis stroke="#94a3b8" />

          <Tooltip
            contentStyle={{
              background: "#06111f",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 16,
            }}
          />

          <Area
            type="monotone"
            dataKey="raised"
            stroke="#2fffc2"
            fill="url(#funding)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}