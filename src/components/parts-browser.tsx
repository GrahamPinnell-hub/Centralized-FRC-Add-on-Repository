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

type BrowseHeroData = {
  quickSearches: { href: string; label: string }[];
  popularTags: { label: string; count: number }[];
  fileTypes: { label: string; count: number }[];
  activeTeams: { handle: string; label: string; count: number }[];
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

function BrowseSearchHero({
  browseData,
  filters
}: {
  browseData: BrowseHeroData;
  filters: SearchFilters;
}) {
  return (
    <section className="panel browse-search-hero">
      <div className="browse-search-copy">
        <p className="eyebrow">Search</p>
        <h1>Find the exact FRC part fast</h1>
        <p>Search first, then refine the results below by team, vendor, material, season, or file type.</p>
      </div>

      <form className="browse-search-form" action="/parts">
        {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
        {filters.vendor ? <input type="hidden" name="vendor" value={filters.vendor} /> : null}
        {filters.creator ? <input type="hidden" name="creator" value={filters.creator} /> : null}
        {filters.season ? <input type="hidden" name="season" value={filters.season} /> : null}
        {filters.fileType ? <input type="hidden" name="fileType" value={filters.fileType} /> : null}
        {filters.material ? <input type="hidden" name="material" value={filters.material} /> : null}
        {filters.sort ? <input type="hidden" name="sort" value={filters.sort} /> : null}
        <div className="browse-search-input-shell">
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            className="browse-search-input"
            placeholder={'Search "mk4i swerve cover from team 31"'}
            aria-label="Search reusable FRC add-ons"
          />
          <button type="submit" className="browse-search-submit">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="5.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="m15 15 5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
            <span>Search</span>
          </button>
        </div>
      </form>

      <div className="browse-hero-grid">
        <section className="browse-hero-section">
          <div className="browse-hero-label">
            <strong>Popular searches</strong>
            <span>start here</span>
          </div>
          <div className="chip-row">
            {browseData.quickSearches.map((item, index) => (
              <Link key={item.href} href={item.href} className={`chip${index === 0 ? " chip-accent" : ""}`}>
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="browse-hero-section">
          <div className="browse-hero-label">
            <strong>Popular tags</strong>
            <span>search language</span>
          </div>
          <div className="chip-row">
            {browseData.popularTags.map((tag, index) => (
              <Link
                key={tag.label}
                href={`/parts?q=${encodeURIComponent(tag.label)}`}
                className={`chip${index === 0 ? " chip-accent" : ""}`}
              >
                {tag.label} <span className="chip-count">{tag.count}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="browse-hero-section">
          <div className="browse-hero-label">
            <strong>Formats and teams</strong>
            <span>browse lanes</span>
          </div>
          <div className="page-stack browse-hero-subgroups">
            <div className="chip-row">
              {browseData.fileTypes.map((fileType, index) => (
                <Link
                  key={fileType.label}
                  href={`/parts?fileType=${encodeURIComponent(fileType.label)}`}
                  className={`chip${index === 0 ? " chip-accent" : ""}`}
                >
                  {fileType.label} <span className="chip-count">{fileType.count}</span>
                </Link>
              ))}
            </div>
            <div className="browse-team-links">
              {browseData.activeTeams.map((team) => (
                <Link key={team.handle} href={`/u/${team.handle}`} className="browse-team-link">
                  <strong>{team.label}</strong>
                  <span>
                    {team.count} listing{team.count === 1 ? "" : "s"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export function PartsBrowser({
  browseData,
  filters,
  options,
  creators,
  results
}: {
  browseData: BrowseHeroData;
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
    <>
      <BrowseSearchHero browseData={browseData} filters={filters} />
      <section className="results-shell">
        <FilterPanel filters={filters} options={options} creators={creators} />
        <div className="page-stack">
          <section className="panel results-header-panel">
            <div className="results-header-topline">
              <div className="page-stack">
                <p className="eyebrow">Results</p>
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
                <span className="chip chip-accent">All published demo listings</span>
                <span className="chip">Use the search bar above or the filters on the left to narrow the feed</span>
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
    </>
  );
}
