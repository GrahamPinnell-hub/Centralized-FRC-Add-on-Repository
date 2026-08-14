import Link from "next/link";

import { FeedShelf } from "@/components/feed-shelf";
import { CategoryCard, SectionTitle } from "@/components/ui";
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
      <FeedShelf title="Trending" items={trending} chips={quickSearches} pageSize={8} headingLevel={1} />

      <FeedShelf
        title="Latest"
        items={latest}
        chips={topTags.slice(0, 6).map((tag) => ({
          href: `/parts?q=${encodeURIComponent(tag.label)}&sort=latest`,
          label: tag.label
        }))}
        pageSize={4}
      />

      <section className="discovery-grid discovery-grid-compact">
        <section className="panel discovery-panel discovery-panel-wide">
          <div className="page-stack discovery-panel-head">
            <p className="eyebrow">Browse Shortcuts</p>
            <h3>Jump in fast, then narrow down.</h3>
            <p>Start with common build-season searches or the exact tag language teams already use.</p>
          </div>
          <div className="discovery-dual-lane">
            <section className="page-stack discovery-mini-lane">
              <div className="discovery-lane-head">
                <strong>Popular searches</strong>
                <span>direct entry lanes</span>
              </div>
              <div className="chip-row">
                {quickSearches.map((item, index) => (
                  <Link
                    key={`discover-${item.href}`}
                    href={item.href}
                    className={`chip${index === 0 ? " chip-accent" : ""}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
            <section className="page-stack discovery-mini-lane">
              <div className="discovery-lane-head">
                <strong>Top tags</strong>
                <span>shared search language</span>
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
          </div>
        </section>
        <section className="panel discovery-panel discovery-panel-compact">
          <div className="page-stack discovery-panel-head">
            <p className="eyebrow">Team Libraries</p>
            <h3>See who is actively sharing.</h3>
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
        <section className="panel discovery-panel discovery-panel-compact">
          <div className="page-stack discovery-panel-head">
            <p className="eyebrow">Repository Formats</p>
            <h3>Filter by fabrication output.</h3>
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
        <section className="panel discovery-panel discovery-panel-compact">
          <div className="page-stack discovery-panel-head">
            <p className="eyebrow">Repository Snapshot</p>
            <h3>{stats.partCount} listings across {stats.categoryCount} active lanes.</h3>
          </div>
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
          <p className="eyebrow">Repository Flow</p>
          <h3>The front page now reads like a feed first.</h3>
          <p>
            Teams hit trending listings, check the newest uploads, then use browse shortcuts or
            categories only when they need to narrow the search.
          </p>
          <div className="chip-row">
            <span className="chip">Trending first</span>
            <span className="chip">Latest second</span>
            <span className="chip">Browse rails after</span>
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
