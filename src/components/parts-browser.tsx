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

type SearchMention = {
  kind: "team" | "category" | "vendor" | "material" | "fileType";
  label: string;
  value: string;
};

const sortOptions = [
  { value: "trending", label: "Trending" },
  { value: "latest", label: "Latest" },
  { value: "rating", label: "Top Rated" },
  { value: "downloads", label: "Most Downloaded" }
] as const;

const guidedSearchPrompts = [
  {
    label: "mk4i swerve cover from team 31",
    href: "/parts?q=mk4i+swerve+cover+from+team+31"
  },
  {
    label: "radio mount dxf sheet metal",
    href: "/parts?q=radio+mount+dxf+sheet+metal"
  },
  {
    label: "limelight mount petg",
    href: "/parts?q=limelight+mount+petg"
  },
  {
    label: "driver station cable tray",
    href: "/parts?q=driver+station+cable+tray"
  }
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

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

function detectSearchMentions(
  query: string | undefined,
  creators: Creator[],
  options: SearchOptions
) {
  const normalizedQuery = normalizeSearchText(query ?? "");

  if (!normalizedQuery) {
    return [];
  }

  const mentions: SearchMention[] = [];
  const seen = new Set<string>();

  const addMention = (mention: SearchMention) => {
    const key = `${mention.kind}:${mention.value}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    mentions.push(mention);
  };

  creators.forEach((creator) => {
    const teamNeedle = creator.teamNumber && creator.teamNumber !== "0" ? `team ${creator.teamNumber}` : "";
    const slashNeedle =
      creator.teamNumber && creator.teamNumber !== "0" ? `${creator.teamNumber} / ${creator.teamName}`.toLowerCase() : "";
    const displayNeedle = creator.teamName.toLowerCase();

    if (
      (teamNeedle && normalizedQuery.includes(teamNeedle)) ||
      (slashNeedle && normalizedQuery.includes(slashNeedle)) ||
      normalizedQuery.includes(displayNeedle)
    ) {
      addMention({
        kind: "team",
        label: creator.teamNumber && creator.teamNumber !== "0" ? `${creator.teamNumber} / ${creator.teamName}` : creator.teamName,
        value: creator.handle
      });
    }
  });

  options.categories.forEach((category) => {
    if (
      normalizedQuery.includes(category.label.toLowerCase()) ||
      normalizedQuery.includes(category.slug.replace(/-/g, " "))
    ) {
      addMention({
        kind: "category",
        label: category.label,
        value: category.slug
      });
    }
  });

  options.vendors.forEach((vendor) => {
    if (normalizedQuery.includes(vendor.toLowerCase())) {
      addMention({
        kind: "vendor",
        label: vendor,
        value: vendor
      });
    }
  });

  options.materials.forEach((material) => {
    if (normalizedQuery.includes(material.toLowerCase())) {
      addMention({
        kind: "material",
        label: material,
        value: material
      });
    }
  });

  options.fileTypes.forEach((fileType) => {
    if (normalizedQuery.includes(fileType.toLowerCase())) {
      addMention({
        kind: "fileType",
        label: fileType,
        value: fileType
      });
    }
  });

  return mentions;
}

function BrowseSearchHero({
  browseData,
  filters,
  creators,
  options
}: {
  browseData: BrowseHeroData;
  filters: SearchFilters;
  creators: Creator[];
  options: SearchOptions;
}) {
  const searchMentions = detectSearchMentions(filters.q, creators, options);
  const helperLinks = searchMentions
    .filter((mention) => {
      if (mention.kind === "team") {
        return filters.creator !== mention.value;
      }

      if (mention.kind === "category") {
        return filters.category !== mention.value;
      }

      if (mention.kind === "vendor") {
        return filters.vendor !== mention.value;
      }

      if (mention.kind === "material") {
        return filters.material !== mention.value;
      }

      return filters.fileType !== mention.value;
    })
    .slice(0, 4);

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
          <button type="submit" className="browse-search-submit" aria-label="Search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="5.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="m15 15 5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
          </button>
          <a href="#search-helper" className="browse-search-helper" aria-label="Search helper">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 3.5 13.8 8l4.7 1.8-4.7 1.8L12 16.1l-1.8-4.5-4.7-1.8L10.2 8 12 3.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path d="M18.5 15.5 19.4 17.8l2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3Z" fill="currentColor" />
              <path d="M5.2 14.8 5.9 16.5l1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7.7-1.7Z" fill="currentColor" />
            </svg>
          </a>
        </div>
      </form>

      <div className="browse-search-utility-row">
        <span className="chip chip-accent">Natural language works</span>
        <span className="chip">Try team names, products, materials, and file types in one search</span>
        {filters.q ? <span className="chip">Current query: {filters.q}</span> : null}
      </div>

      <section className="browse-helper-panel" id="search-helper">
        <div className="browse-helper-head">
          <div>
            <strong>Search helper</strong>
            <p>Use one line like YouTube-style search, then click into filters only if you need to tighten the result set.</p>
          </div>
          {filters.q ? (
            <Link href={buildPartsHref(filters, { sort: "latest" })} className="chip">
              View newest matches
            </Link>
          ) : null}
        </div>
        <div className="browse-helper-grid">
          <section className="browse-helper-card">
            <span className="eyebrow">Examples</span>
            <div className="chip-row">
              {guidedSearchPrompts.map((prompt, index) => (
                <Link key={prompt.href} href={prompt.href} className={`chip${index === 0 ? " chip-accent" : ""}`}>
                  {prompt.label}
                </Link>
              ))}
            </div>
          </section>
          <section className="browse-helper-card">
            <span className="eyebrow">Detected in your query</span>
            {searchMentions.length > 0 ? (
              <div className="chip-row">
                {searchMentions.map((mention) => (
                  <span key={`${mention.kind}-${mention.value}`} className="chip">
                    {mention.kind}: {mention.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted">No structured team, category, vendor, material, or file-type hint detected yet.</p>
            )}
          </section>
          <section className="browse-helper-card">
            <span className="eyebrow">One-click pivots</span>
            {helperLinks.length > 0 ? (
              <div className="chip-row">
                {helperLinks.map((mention) => {
                  const overrides: Partial<SearchFilters> =
                    mention.kind === "team"
                      ? { creator: mention.value }
                      : mention.kind === "category"
                        ? { category: mention.value }
                        : mention.kind === "vendor"
                          ? { vendor: mention.value }
                          : mention.kind === "material"
                            ? { material: mention.value }
                            : { fileType: mention.value };

                  return (
                    <Link
                      key={`pivot-${mention.kind}-${mention.value}`}
                      href={buildPartsHref(filters, overrides)}
                      className="chip"
                    >
                      Filter to {mention.label}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="muted">Search by team, product, material, or file type and this helper will offer faster pivots.</p>
            )}
          </section>
        </div>
      </section>

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
  const searchMentions = detectSearchMentions(filters.q, creators, options);
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
              : (creatorMap.get(filters.creator)?.teamName ?? filters.creator)
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
      <BrowseSearchHero browseData={browseData} filters={filters} creators={creators} options={options} />
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
            {filters.q ? (
              <div className="results-search-insight">
                <strong>Search interpretation</strong>
                <div className="chip-row">
                  <span className="chip chip-accent">Query: {filters.q}</span>
                  {searchMentions.map((mention) => (
                    <span key={`${mention.kind}-${mention.value}`} className="chip">
                      {mention.kind}: {mention.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
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
              <div className="chip-row">
                {guidedSearchPrompts.slice(0, 3).map((prompt) => (
                  <Link key={`empty-${prompt.href}`} href={prompt.href} className="chip">
                    {prompt.label}
                  </Link>
                ))}
              </div>
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
