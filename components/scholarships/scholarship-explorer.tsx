"use client";

import { useMemo, useState } from "react";
import { ScholarshipCard } from "@/components/scholarships/scholarship-card";
import { Badge, Card } from "@/components/ui";
import { searchScholarships } from "@/lib/services/firestore";
import type { Scholarship } from "@/lib/types";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export function ScholarshipExplorer({
  scholarships,
}: {
  scholarships: Scholarship[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [country, setCountry] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const categories = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          scholarships
            .map((s) => s.category)
            .filter(Boolean)
        )
      ).sort(),
    ],
    [scholarships]
  );

  const countries = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          scholarships
            .map((s) => s.country)
            .filter(Boolean)
        )
      ).sort(),
    ],
    [scholarships]
  );

  const statuses = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          scholarships
            .map((s) => s.status)
            .filter(Boolean)
        )
      ).sort(),
    ],
    [scholarships]
  );

  // Filter campaigns
  const filteredScholarships = useMemo(
    () =>
      searchScholarships(scholarships, {
        query,
        category,
        country,
        status,
      }),
    [scholarships, query, category, country, status]
  );

  // Sort campaigns
  const sortedScholarships = useMemo(() => {
    const list = [...filteredScholarships];
    if (sortBy === "newest") {
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    if (sortBy === "most_funded") {
      return list.sort((a, b) => {
        const pctA = a.goal > 0 ? a.raised / a.goal : 0;
        const pctB = b.goal > 0 ? b.raised / b.goal : 0;
        return pctB - pctA;
      });
    }
    if (sortBy === "ending_soon") {
      return list.sort((a, b) => a.deadline.localeCompare(b.deadline));
    }
    return list;
  }, [filteredScholarships, sortBy]);

  return (
    <div className="space-y-6">
      {/* FILTER CONTROLS PANEL */}
      <Card className="glass border border-white/5 p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan/35 to-transparent" />
        
        <div className="grid gap-4 md:grid-cols-5">
          <label className="md:col-span-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Search className="size-3.5 text-purple" /> Search Campaigns
            </span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-purple/40"
              placeholder="Search by candidate, university, title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <label>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <SlidersHorizontal className="size-3.5 text-purple" /> Category
            </span>
            <select
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item} className="bg-black text-white">
                  {item === "all" ? "All Categories" : item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <SlidersHorizontal className="size-3.5 text-purple" /> Region
            </span>
            <select
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {countries.map((item) => (
                <option key={item} value={item} className="bg-black text-white">
                  {item === "all" ? "All Regions" : item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <ArrowUpDown className="size-3.5 text-purple" /> Sort By
            </span>
            <select
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest" className="bg-black text-white">Newest Created</option>
              <option value="most_funded" className="bg-black text-white">Most Funded (%)</option>
              <option value="ending_soon" className="bg-black text-white">Ending Soon</option>
            </select>
          </label>
        </div>
      </Card>

      {/* METRICS HEAD */}
      <div className="flex items-center justify-between">
        <Badge className="bg-purple/10 text-purple border-purple/30">
          {sortedScholarships.length} Campaign{sortedScholarships.length !== 1 ? "s" : ""} Found
        </Badge>
        <span className="text-xs text-slate-500 font-medium">
          Live Stellar escrows
        </span>
      </div>

      {/* EXPLORER RESULTS */}
      {sortedScholarships.length === 0 ? (
        <Card className="glass p-12 text-center">
          <h3 className="text-xl font-semibold text-white">No campaigns match filters</h3>
          <p className="mt-2 text-slate-400 text-sm max-w-sm mx-auto">
            Try adjusting your search filters or clear the queries to see all live scholarship campaigns.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedScholarships.map((scholarship) => (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
            />
          ))}
        </div>
      )}
    </div>
  );
}