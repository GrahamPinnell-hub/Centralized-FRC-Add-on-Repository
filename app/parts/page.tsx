import Link from "next/link";
import { Suspense } from "react";

import { PartsBrowserClient } from "@/components/parts-browser-client";
import { PartsBrowser } from "@/components/parts-browser";
import { SectionTitle } from "@/components/ui";
import { countLabels, creatorDisplayLabel, topTeamsByParts } from "@/lib/discovery";
import { getAllPartsData, getCreatorsData, getSearchOptionsData } from "@/lib/repository";

export default async function PartsPage() {
  const [options, parts, creators] = await Promise.all([
    getSearchOptionsData(),
    getAllPartsData(),
    getCreatorsData()
  ]);
  const popularTags = countLabels(parts.flatMap((part) => part.tags), 8);
  const activeTeams = topTeamsByParts(creators, parts, 4);
  const fileTypes = countLabels(parts.flatMap((part) => part.files.map((file) => file.fileType)), 5);

  return (
    <>
      <SectionTitle
        eyebrow="Search"
        title="Browse reusable FRC add-ons"
        body="Filter by team, vendor, file type, material, and season to get to the exact listing faster."
      />
      <section className="browse-launchpad-grid">
        <section className="panel compact-panel browse-launchpad-panel">
          <p className="eyebrow">Start Here</p>
          <h3>Common entry lanes</h3>
          <div className="chip-row">
            <Link href="/parts?sort=trending" className="chip chip-accent">
              Trending
            </Link>
            <Link href="/parts?sort=latest" className="chip">
              New uploads
            </Link>
            <Link href="/parts?category=swerve-covers" className="chip">
              Swerve covers
            </Link>
            <Link href="/parts?category=vision-mounts" className="chip">
              Vision mounts
            </Link>
            <Link href="/parts?category=electronics-mounts" className="chip">
              Electronics
            </Link>
          </div>
        </section>
        <section className="panel compact-panel browse-launchpad-panel">
          <p className="eyebrow">Popular Tags</p>
          <h3>High-signal search language</h3>
          <div className="chip-row">
            {popularTags.map((tag, index) => (
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
        <section className="panel compact-panel browse-launchpad-panel">
          <p className="eyebrow">Deliverables</p>
          <h3>Filter by fabrication output</h3>
          <div className="chip-row">
            {fileTypes.map((fileType, index) => (
              <Link
                key={fileType.label}
                href={`/parts?fileType=${encodeURIComponent(fileType.label)}`}
                className={`chip${index === 0 ? " chip-accent" : ""}`}
              >
                {fileType.label} <span className="chip-count">{fileType.count}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="panel compact-panel browse-launchpad-panel">
          <p className="eyebrow">Team Libraries</p>
          <h3>Teams with active demo collections</h3>
          <div className="discovery-link-list">
            {activeTeams.map((entry) => (
              <Link key={entry.creator.handle} href={`/u/${entry.creator.handle}`} className="discovery-link-row">
                <strong>{creatorDisplayLabel(entry.creator)}</strong>
                <span>{entry.count} listing{entry.count === 1 ? "" : "s"}</span>
              </Link>
            ))}
          </div>
        </section>
      </section>
      <Suspense fallback={<PartsBrowser filters={{}} options={options} creators={creators} results={parts} />}>
        <PartsBrowserClient options={options} parts={parts} creators={creators} />
      </Suspense>
    </>
  );
}
