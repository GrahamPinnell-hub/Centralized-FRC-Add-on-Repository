import { FilterPanel, PartCard } from "@/components/ui";
import type { CatalogPart, SearchFilters } from "@/lib/catalog";

type SearchOptions = {
  categories: { slug: string; label: string }[];
  vendors: string[];
  seasons: string[];
  fileTypes: string[];
  materials: string[];
};

export function PartsBrowser({
  filters,
  options,
  results
}: {
  filters: SearchFilters;
  options: SearchOptions;
  results: CatalogPart[];
}) {
  return (
    <section className="results-shell">
      <FilterPanel filters={filters} options={options} />
      <div className="page-stack">
        <section className="panel">
          <strong>{results.length} matching listings</strong>
          <p>
            Search is now wired through the shared repository layer so the exact same filters can
            read seeded Prisma data today and live submissions later.
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
