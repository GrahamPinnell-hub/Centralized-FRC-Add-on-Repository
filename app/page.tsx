import Link from "next/link";

import { getCatalogStats, getCategorySummaries, getFeaturedParts, getLatestParts } from "@/lib/catalog";
import { CategoryCard, PartCard, SectionTitle } from "@/components/ui";

export default function HomePage() {
  const stats = getCatalogStats();
  const categories = getCategorySummaries();
  const featured = getFeaturedParts();
  const latest = getLatestParts();
  const boardFeed = [...featured, ...latest.filter((part) => !featured.some((entry) => entry.slug === part.slug))];

  return (
    <>
      <section className="panel board-hero">
        <div>
          <p className="eyebrow">FRC Repository</p>
          <h1>Competition-proven robot add-ons in one searchable library.</h1>
          <p>
            Built for teams that are tired of hunting through Chief Delphi threads, Onshape tabs,
            screenshots, dead CAD links, and random cloud drives for the same mount, guard, tray,
            or service tool every season.
          </p>
          <div className="hero-actions">
            <Link href="/parts" className="button-link">
              Browse listings
            </Link>
            <Link href="/upload" className="action-link">
              Upload a part
            </Link>
          </div>
          <div className="chip-row">
            <span className="chip">MK4i</span>
            <span className="chip">Limelight 4</span>
            <span className="chip">PDH</span>
            <span className="chip">Kraken X60</span>
            <span className="chip">DXF</span>
          </div>
        </div>
        <div className="hero-facts">
          <div>
            <strong>{stats.supportedTypes.join(" / ")}</strong>
            <span>searchable asset formats in V1</span>
          </div>
          <div>
            <strong>{stats.creatorCount} teams</strong>
            <span>seeded profile pages and reusable hardware libraries</span>
          </div>
          <div>
            <strong>auto-approved</strong>
            <span>report-driven moderation instead of a heavy queue</span>
          </div>
          <div>
            <strong>future lanes</strong>
            <span>PCB boards, fixtures, and code-adjacent resources later</span>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <SectionTitle
          eyebrow="Featured"
          title="Trending repository uploads"
          body="The first screen should feel like a library, not a marketing page. Start with the parts teams are most likely to reuse, print, bend, or remix."
        />
        <div className="card-grid">
          {boardFeed.map((part) => (
            <PartCard key={part.slug} part={part} />
          ))}
        </div>
      </section>

      <section className="page-stack">
        <SectionTitle
          eyebrow="Categories"
          title="Browse by robot problem"
          body="Move straight into drivetrain covers, vision mounts, electronics trays, battery hardware, and driver-station workflow instead of guessing which site might host the CAD."
        />
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="home-columns">
        <div className="page-stack">
          <SectionTitle
            eyebrow="Latest"
            title="Recent updates"
            body="Version history matters for community hardware. Teams need a reason to come back for fitment fixes, revised DXFs, and better documentation instead of downloading stale files once and never checking again."
          />
          <div className="card-grid">
            {latest.map((part) => (
              <PartCard key={part.slug} part={part} />
            ))}
          </div>
        </div>
        <aside className="page-stack">
          <section className="panel compact-panel">
            <p className="eyebrow">Repository Value</p>
            <h3>Less duplicated CAD work for every team.</h3>
            <p>
              Centralizing prints, sheet metal, and source CAD gives teams a better starting point
              than scavenging across five different sites for the same accessory.
            </p>
          </section>
          <section className="panel compact-panel">
            <p className="eyebrow">Direction</p>
            <h3>Keep the structure broad enough to grow.</h3>
            <p>
              V1 focuses on core hardware files now, while leaving room for board layouts, fixture
              plates, richer 3D preview, and smarter search later.
            </p>
          </section>
          <section className="panel compact-panel">
            <p className="eyebrow">Coverage</p>
            <h3>{stats.partCount} seeded listings across {stats.categoryCount} categories.</h3>
            <p>
              Enough sample content to validate browse, upload, detail views, and the team-based
              ownership model before the first real community imports land.
            </p>
          </section>
        </aside>
      </section>
    </>
  );
}
