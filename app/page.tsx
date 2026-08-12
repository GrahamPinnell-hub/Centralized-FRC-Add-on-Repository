import Link from "next/link";

import { CategoryCard, PartCard, SectionTitle } from "@/components/ui";
import { countLabels, creatorDisplayLabel, topTeamsByParts } from "@/lib/discovery";
import {
  getAllPartsData,
  getCatalogStatsData,
  getCategorySummariesData,
  getCreatorsData,
  getLatestPartsData,
  getTrendingPartsData
} from "@/lib/repository";

const quickSearches = [
  { href: "/parts?q=mk4i+swerve+cover", label: "MK4i swerve cover" },
  { href: "/parts?q=limelight+mount", label: "Limelight mount" },
  { href: "/parts?fileType=DXF", label: "DXF sheet metal" },
  { href: "/parts?fileType=SOURCE", label: "Source CAD" },
  { href: "/parts?q=driver+station", label: "Driver station" },
  { href: "/parts?q=wire+management", label: "Wire management" }
];

export default async function HomePage() {
  const [stats, categories, trending, latest, parts, creators] = await Promise.all([
    getCatalogStatsData(),
    getCategorySummariesData(),
    getTrendingPartsData(),
    getLatestPartsData(),
    getAllPartsData(),
    getCreatorsData()
  ]);
  const topTags = countLabels(parts.flatMap((part) => part.tags), 8);
  const topFormats = countLabels(parts.flatMap((part) => part.files.map((file) => file.fileType)), 5);
  const activeTeams = topTeamsByParts(creators, parts, 5);

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
        <div className="chip-row browse-chip-strip">
          {quickSearches.map((item, index) => (
            <Link key={item.href} href={item.href} className={`chip${index === 0 ? " chip-accent" : ""}`}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="card-grid listing-grid">
          {trending.map((part) => (
            <PartCard key={part.slug} part={part} />
          ))}
        </div>
      </section>

      <section className="discovery-grid">
        <section className="panel discovery-panel">
          <div className="page-stack discovery-panel-head">
            <p className="eyebrow">Popular Searches</p>
            <h3>Start from direct build-season intent.</h3>
            <p>Jump straight into the exact accessory or deliverable teams usually need first.</p>
          </div>
          <div className="chip-row">
            {quickSearches.map((item, index) => (
              <Link key={`discover-${item.href}`} href={item.href} className={`chip${index === 0 ? " chip-accent" : ""}`}>
                {item.label}
              </Link>
            ))}
          </div>
        </section>
        <section className="panel discovery-panel">
          <div className="page-stack discovery-panel-head">
            <p className="eyebrow">Top Tags</p>
            <h3>Browse using the language teams actually use.</h3>
            <p>Strong repositories let tags and search terms pull users deeper without extra clicks.</p>
          </div>
          <div className="chip-row">
            {topTags.map((tag, index) => (
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
        <section className="panel discovery-panel">
          <div className="page-stack discovery-panel-head">
            <p className="eyebrow">Team Libraries</p>
            <h3>Scan active team-owned collections.</h3>
            <p>Browse should surface who is sharing useful hardware, not just a pile of cards.</p>
          </div>
          <div className="discovery-link-list">
            {activeTeams.map((entry) => (
              <Link key={entry.creator.handle} href={`/u/${entry.creator.handle}`} className="discovery-link-row">
                <strong>{creatorDisplayLabel(entry.creator)}</strong>
                <span>{entry.count} listing{entry.count === 1 ? "" : "s"}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="panel discovery-panel">
          <div className="page-stack discovery-panel-head">
            <p className="eyebrow">Repository Formats</p>
            <h3>Filter by what you need to fabricate.</h3>
            <p>Print files, sheet metal, and source CAD all deserve equal weight in the browse flow.</p>
          </div>
          <div className="chip-row">
            {topFormats.map((format, index) => (
              <Link
                key={format.label}
                href={`/parts?fileType=${encodeURIComponent(format.label)}`}
                className={`chip${index === 0 ? " chip-accent" : ""}`}
              >
                {format.label} <span className="chip-count">{format.count}</span>
              </Link>
            ))}
          </div>
        </section>
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
        <div className="chip-row browse-chip-strip">
          {topTags.slice(0, 6).map((tag, index) => (
            <Link
              key={`latest-${tag.label}`}
              href={`/parts?q=${encodeURIComponent(tag.label)}&sort=latest`}
              className={`chip${index === 0 ? " chip-accent" : ""}`}
            >
              {tag.label}
            </Link>
          ))}
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
          body="Start with the robot packaging problem, then narrow by team, tag, deliverable, or vendor fit."
        />
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="home-columns">
        <section className="panel compact-panel homepage-note">
          <p className="eyebrow">Repository Snapshot</p>
          <h3>{stats.partCount} listings across {stats.categoryCount} active browse lanes.</h3>
          <p>
            The front page now behaves more like a repository: trending first, discovery lanes
            second, and team-owned libraries close behind.
          </p>
          <div className="chip-row">
            <span className="chip">{stats.supportedTypes.join(" / ")}</span>
            <span className="chip">{stats.creatorCount} teams</span>
            <span className="chip">Auto-publish demo mode</span>
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
            <p className="eyebrow">Best Fit</p>
            <h3>Built around reusable robot accessories first.</h3>
            <p>
              Swerve covers, vision mounts, driver station helpers, radio trays, guards, and sheet
              metal all sit inside one searchable structure.
            </p>
          </section>
          <section className="panel compact-panel">
            <p className="eyebrow">Next Layers</p>
            <h3>Ready for richer backend wiring later.</h3>
            <p>
              The browse structure now leaves room for real uploads, smarter ranking, and
              persistent team libraries without rebuilding the pages.
            </p>
          </section>
        </aside>
      </section>
    </>
  );
}
