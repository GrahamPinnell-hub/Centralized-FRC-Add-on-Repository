import Link from "next/link";

import { FilterPanel, PartCard } from "@/components/ui";
import type { CatalogPart, Creator, SearchFilters } from "@/lib/catalog";

type SearchOptions = {
  categories: { slug: string; label: string }[];
  vendors: string[];
  seasons: string[];
  fileTypes: string[];
  materials: string[];
};

const sortOptions = [
  { value: "trending", label: "Trending" },
  { value: "latest", label: "Latest" },
  { value: "rating", label: "Top Rated" },
  { value: "downloads", label: "Most Downloaded" }
] as const;

function buildPartsHref(filters: SearchFilters, overrides: Partial<SearchFilters> = {}) {
  const params = new URLSearchParams();
  const next = { ...filters, ...overrides };

  (Object.entries(next) as Array<[keyof SearchFilters, string | undefined]>).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `/parts?${query}` : "/parts";
}

export function PartsBrowser({
  filters,
  options,
  creators,
  results
}: {
  filters: SearchFilters;
  options: SearchOptions;
  creators: Creator[];
  results: CatalogPart[];
}) {
  const activeSort = filters.sort ?? "trending";
  const creatorMap = new Map(creators.map((creator) => [creator.handle, creator]));
  const activeFilters = [
    filters.q ? { key: "q", label: "Search", value: filters.q } : null,
    filters.category
      ? {
          key: "category",
          label: "Category",
          value: options.categories.find((category) => category.slug === filters.category)?.label ?? filters.category
        }
      : null,
    filters.vendor ? { key: "vendor", label: "Vendor", value: filters.vendor } : null,
    filters.creator
      ? {
          key: "creator",
          label: "Team",
          value:
            creatorMap.get(filters.creator)?.teamNumber && creatorMap.get(filters.creator)?.teamName
              ? `${creatorMap.get(filters.creator)?.teamNumber} / ${creatorMap.get(filters.creator)?.teamName}`
              : filters.creator
        }
      : null,
    filters.season ? { key: "season", label: "Season", value: filters.season } : null,
    filters.fileType ? { key: "fileType", label: "File", value: filters.fileType } : null,
    filters.material ? { key: "material", label: "Material", value: filters.material } : null
  ].filter(Boolean) as Array<{ key: keyof SearchFilters; label: string; value: string }>;
  const hasActiveFilters = activeFilters.length > 0;
  const resultsSummary = filters.q
    ? `Results for "${filters.q}"`
    : activeSort === "latest"
      ? "Recently updated listings"
      : activeSort === "rating"
        ? "Highest-rated listings"
        : activeSort === "downloads"
          ? "Most-downloaded listings"
          : "Trending reusable listings";

  return (
    <section className="results-shell">
      <FilterPanel filters={filters} options={options} creators={creators} />
      <div className="page-stack">
        <section className="panel results-header-panel">
          <div className="results-header-topline">
            <div className="page-stack">
              <p className="eyebrow">Browse</p>
              <h2>{resultsSummary}</h2>
              <p>
                {results.length} listing{results.length === 1 ? "" : "s"} matched across titles,
                tags, products, vendors, seasons, and team metadata.
              </p>
            </div>
            <div className="results-count-card">
              <strong>{results.length}</strong>
              <span>matching listings</span>
            </div>
          </div>
          <div className="results-sortbar">
            {sortOptions.map((option) => (
              <Link
                key={option.value}
                href={buildPartsHref(filters, { sort: option.value })}
                className={`results-sort-pill${activeSort === option.value ? " is-active" : ""}`}
              >
                {option.label}
              </Link>
            ))}
          </div>
          {hasActiveFilters ? (
            <div className="results-active-filters">
              {activeFilters.map((filter) => {
                const nextFilters = {
                  [filter.key]: undefined
                } as Partial<SearchFilters>;

                return (
                  <Link
                    key={`${filter.key}-${filter.value}`}
                    href={buildPartsHref(filters, nextFilters)}
                    className="chip results-filter-chip"
                  >
                    {filter.label}: {filter.value}
                  </Link>
                );
              })}
              <Link href="/parts" className="ghost-link">
                Reset all
              </Link>
            </div>
          ) : (
            <div className="results-active-filters">
              <span className="chip chip-accent">Search titles, vendors, tags, seasons, and teams</span>
              <span className="chip">Examples: `mk4i`, `team 31`, `limelight 4`, `dxf tray`</span>
            </div>
          )}
        </section>
        {results.length > 0 ? (
          <div className="card-grid">
            {results.map((part) => (
              <PartCard key={part.slug} part={part} />
            ))}
          </div>
        ) : (
          <section className="panel results-empty">
            <p className="eyebrow">No Matches</p>
            <h3>Nothing matched those filters.</h3>
            <p>Try clearing filters, changing sort, or searching by vendor, team, or subsystem.</p>
            <Link href="/parts" className="button-link">
              Browse all listings
            </Link>
          </section>
        )}
      </div>
    </section>
  );
}
