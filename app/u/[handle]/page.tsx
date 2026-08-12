import Link from "next/link";
import { notFound } from "next/navigation";

import { CreatorBanner, PartCard } from "@/components/ui";
import { countLabels } from "@/lib/discovery";
import { getCreatorHandlesData, getCreatorProfileData } from "@/lib/repository";

export async function generateStaticParams() {
  const handles = await getCreatorHandlesData();
  return handles.map((handle) => ({ handle }));
}

export default async function CreatorPage({
  params
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getCreatorProfileData(handle);

  if (!profile) {
    notFound();
  }

  const categoryCoverage = countLabels(profile.parts.map((part) => part.category), 5).map((entry) => ({
    ...entry,
    label: profile.parts.find((part) => part.category === entry.label)?.categoryLabel ?? entry.label
  }));
  const topTags = countLabels(profile.parts.flatMap((part) => part.tags), 8);
  const topDeliverables = countLabels(
    profile.parts.flatMap((part) => part.files.map((file) => file.fileType)),
    5
  );

  return (
    <div className="page-stack">
      <CreatorBanner creator={profile.creator} partCount={profile.parts.length} />

      <section className="creator-insight-grid">
        <section className="panel compact-panel">
          <p className="eyebrow">Coverage</p>
          <h3>Where this team is publishing</h3>
          <div className="chip-row">
            {categoryCoverage.map((category, index) => (
              <Link
                key={category.label}
                href={`/parts?creator=${profile.creator.handle}&category=${encodeURIComponent(
                  profile.parts.find((part) => part.categoryLabel === category.label)?.category ?? ""
                )}`}
                className={`chip${index === 0 ? " chip-accent" : ""}`}
              >
                {category.label} <span className="chip-count">{category.count}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="panel compact-panel">
          <p className="eyebrow">Top Tags</p>
          <h3>Fast search terms for this library</h3>
          <div className="chip-row">
            {topTags.map((tag, index) => (
              <Link
                key={tag.label}
                href={`/parts?creator=${profile.creator.handle}&q=${encodeURIComponent(tag.label)}`}
                className={`chip${index === 0 ? " chip-accent" : ""}`}
              >
                {tag.label} <span className="chip-count">{tag.count}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="panel compact-panel">
          <p className="eyebrow">Deliverables</p>
          <h3>What this team tends to ship</h3>
          <div className="chip-row">
            {topDeliverables.map((fileType, index) => (
              <Link
                key={fileType.label}
                href={`/parts?creator=${profile.creator.handle}&fileType=${encodeURIComponent(fileType.label)}`}
                className={`chip${index === 0 ? " chip-accent" : ""}`}
              >
                {fileType.label} <span className="chip-count">{fileType.count}</span>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <section className="page-stack">
        <div className="feed-header">
          <div className="feed-title-row">
            <h2 className="feed-title">
              Team Library <span className="feed-arrow" aria-hidden="true">&rarr;</span>
            </h2>
          </div>
          <div className="feed-pager" aria-label="Team library links">
            <Link href={`/parts?creator=${profile.creator.handle}`} className="feed-next-button">
              Open filtered browse
            </Link>
          </div>
        </div>
        <div className="card-grid">
          {profile.parts.map((part) => (
            <PartCard key={part.slug} part={part} />
          ))}
        </div>
      </section>
    </div>
  );
}
