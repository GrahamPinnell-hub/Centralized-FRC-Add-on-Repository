import Link from "next/link";

import { CategoryCard, PartCard, SectionTitle } from "@/components/ui";
import {
  getCatalogStatsData,
  getCategorySummariesData,
  getLatestPartsData,
  getTrendingPartsData
} from "@/lib/repository";

export default async function HomePage() {
  const [stats, categories, trending, latest] = await Promise.all([
    getCatalogStatsData(),
    getCategorySummariesData(),
    getTrendingPartsData(),
    getLatestPartsData()
  ]);

  return (
    <>
      <section className="page-stack feed-section">
        <div className="feed-header">
          <div className="feed-title-row">
            <h1 className="feed-title">
              Trending <span className="feed-arrow" aria-hidden="true">&rarr;</span>
            </h1>
          </div>
          <div className="feed-pager" aria-label="Trending page controls">
            <span className="feed-page-indicator" aria-current="page">
              Page 1
            </span>
            <span className="feed-next-button">Next</span>
          </div>
        </div>
        <div className="card-grid listing-grid">
          {trending.map((part) => (
            <PartCard key={part.slug} part={part} />
          ))}
        </div>
      </section>

      <section className="page-stack">
        <div className="feed-header">
          <div className="feed-title-row">
            <h2 className="feed-title">
              Latest <span className="feed-arrow" aria-hidden="true">&rarr;</span>
            </h2>
          </div>
          <div className="feed-pager" aria-label="Latest page controls">
            <span className="feed-page-indicator" aria-current="page">
              Page 1
            </span>
            <span className="feed-next-button">Next</span>
          </div>
        </div>
        <div className="card-grid listing-grid">
          {latest.map((part) => (
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
        <section className="panel compact-panel homepage-note">
          <p className="eyebrow">Repository</p>
          <h3>Find reusable hardware before you redraw it.</h3>
          <p>
            Centralizing 3D prints, sheet metal, and source CAD saves teams from spending another
            half hour digging through forum posts and scattered cloud drives for the same mount or
            tray every season.
          </p>
          <div className="chip-row">
            <span className="chip">{stats.supportedTypes.join(" / ")}</span>
            <span className="chip">{stats.creatorCount} teams</span>
            <span className="chip">Auto-approved</span>
          </div>
          <div className="hero-actions">
            <Link href="/parts" className="button-link">
              Browse listings
            </Link>
            <Link href="/upload" className="action-link">
              Upload a part
            </Link>
          </div>
        </section>
        <aside className="page-stack">
          <section className="panel compact-panel">
            <p className="eyebrow">Coverage</p>
            <h3>{stats.partCount} seeded listings across {stats.categoryCount} categories.</h3>
            <p>
              Enough sample content to validate browse, upload, detail views, and the team-based
              ownership model before the first real community imports land.
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
        </aside>
      </section>
    </>
  );
}
