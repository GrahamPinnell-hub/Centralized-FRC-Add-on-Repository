"use client";

import { useSearchParams } from "next/navigation";

import { FilterPanel, PartCard } from "@/components/ui";
import { filterParts, getSearchOptions, type SearchFilters } from "@/lib/catalog";

function one(value: string | null) {
  return value ?? undefined;
}

export function PartsBrowser() {
  const searchParams = useSearchParams();
  const filters: SearchFilters = {
    q: one(searchParams.get("q")),
    category: one(searchParams.get("category")),
    vendor: one(searchParams.get("vendor")),
    season: one(searchParams.get("season")),
    fileType: one(searchParams.get("fileType")),
    material: one(searchParams.get("material"))
  };
  const options = getSearchOptions();
  const results = filterParts(filters);

  return (
    <section className="results-shell">
      <FilterPanel filters={filters} options={options} />
      <div className="page-stack">
        <section className="panel">
          <strong>{results.length} matching listings</strong>
          <p>
            This is the exact place where flexible search can later evolve toward AI-assisted
            queries like "mk4i swerve cover from team 31."
          </p>
        </section>
        <div className="card-grid">
          {results.map((part) => (
            <PartCard key={part.slug} part={part} />
          ))}
        </div>
      </div>
    </section>
  );
}
