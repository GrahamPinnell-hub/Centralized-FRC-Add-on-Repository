import { FilterPanel, PartCard, SectionTitle } from "@/components/ui";
import { filterParts, getSearchOptions, type SearchFilters } from "@/lib/catalog";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters: SearchFilters = {
    q: one(resolvedSearchParams.q),
    category: one(resolvedSearchParams.category),
    vendor: one(resolvedSearchParams.vendor),
    season: one(resolvedSearchParams.season),
    fileType: one(resolvedSearchParams.fileType),
    material: one(resolvedSearchParams.material)
  };

  const options = getSearchOptions();
  const results = filterParts(filters);

  return (
    <>
      <SectionTitle
        eyebrow="Search"
        title="Browse reusable FRC add-ons"
        body="Search like a builder, not like a librarian. The approved V1 search already looks across title, summary, team, tag, vendor, product, season, and file type."
      />
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
    </>
  );
}
