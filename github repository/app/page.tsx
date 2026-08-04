import Link from "next/link";

import { getCatalogStats, getCategorySummaries, getFeaturedParts, getLatestParts } from "@/lib/catalog";
import { PartCard, SectionTitle, StatStrip } from "@/components/ui";

export default function HomePage() {
  const stats = getCatalogStats();
  const categories = getCategorySummaries();
  const featured = getFeaturedParts();
  const latest = getLatestParts();

  return (
    <>
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Approved V1 Direction</p>
          <h1>One place to find FRC parts that teams keep redesigning every season.</h1>
          <p>
            Start with 3D prints and sheet metal. Build toward electronics, board-level resources,
            and eventually reusable code and control accessories that save teams real build time.
          </p>
          <div className="chip-row">
            <Link href="/parts" className="button-link">
              Browse the catalog
            </Link>
            <Link href="/upload" className="ghost-link">
              See upload flow
            </Link>
          </div>
        </div>
        <div className="hero-facts">
          <div>
            <strong>{stats.supportedTypes.join(" · ")}</strong>
            <span>supported asset lanes in V1</span>
          </div>
          <div>
            <strong>auto-approved</strong>
            <span>with report-based moderation</span>
          </div>
          <div>
            <strong>team-ready</strong>
            <span>creator pages built for FRC programs</span>
          </div>
          <div>
            <strong>future-proof</strong>
            <span>schema shaped for PCB and code assets later</span>
          </div>
        </div>
      </section>

      <StatStrip
        stats={[
          {
            label: "seed listings",
            value: String(stats.partCount),
            note: "Enough sample content to validate browse, upload, and detail flows."
          },
          {
            label: "team profiles",
            value: String(stats.creatorCount),
            note: "Creator structure already supports FRC team-centered ownership."
          },
          {
            label: "top-level categories",
            value: String(stats.categoryCount),
            note: "Focused around real robot packaging and support hardware."
          }
        ]}
      />

      <section className="page-stack">
        <SectionTitle
          eyebrow="Categories"
          title="Start where teams actually search"
          body="V1 categories center around drivetrain packaging, vision mounts, electronics integration, battery hardware, and driver station workflow."
        />
        <div className="category-grid">
          {categories.map((category) => (
            <article key={category.slug} className="panel card">
              <span className="chip chip-accent">{category.count} listings</span>
              <h3>
                <Link href={`/categories/${category.slug}`}>{category.label}</Link>
              </h3>
              <p>{category.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-stack">
        <SectionTitle
          eyebrow="Featured"
          title="Reference listings for the first build"
          body="These sample parts cover the core V1 cases: 3D printable robot hardware, a sheet metal flat pattern, rich compatibility metadata, and team-owned listings."
        />
        <div className="card-grid">
          {featured.map((part) => (
            <PartCard key={part.slug} part={part} />
          ))}
        </div>
      </section>

      <section className="page-stack">
        <SectionTitle
          eyebrow="Latest"
          title="Recent updates"
          body="Version history matters for community hardware. This feed gives teams a reason to come back for fitment fixes and improved revisions instead of static old files."
        />
        <div className="card-grid">
          {latest.map((part) => (
            <PartCard key={part.slug} part={part} />
          ))}
        </div>
      </section>
    </>
  );
}
