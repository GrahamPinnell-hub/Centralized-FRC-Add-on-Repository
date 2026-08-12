import Link from "next/link";
import { notFound } from "next/navigation";

import { PartCard } from "@/components/ui";
import { countLabels } from "@/lib/discovery";
import { getCategoryData, getCategorySlugsData } from "@/lib/repository";

function teamLabel(handle: string) {
  return handle.startsWith("team-") ? handle.replace("team-", "Team ") : handle;
}

export async function generateStaticParams() {
  const slugs = await getCategorySlugsData();
  return slugs.map((slug) => ({ slug }));
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryData(slug);

  if (!category) {
    notFound();
  }

  const topTags = countLabels(category.parts.flatMap((part) => part.tags), 6);
  const topFileTypes = countLabels(
    category.parts.flatMap((part) => part.files.map((file) => file.fileType)),
    5
  );
  const topTeams = countLabels(category.parts.map((part) => part.creatorHandle), 4);
  const validatedCount = category.parts.filter((part) => part.validated).length;

  return (
    <div className="page-stack">
      <section className="hero-banner category-hero">
        <div className="page-stack">
          <p className="eyebrow">Category</p>
          <h1>{category.label}</h1>
          <p>{category.description}</p>
          <div className="chip-row">
            {topTags.map((tag, index) => (
              <Link
                key={tag.label}
                href={`/parts?category=${category.slug}&q=${encodeURIComponent(tag.label)}`}
                className={`chip${index === 0 ? " chip-accent" : ""}`}
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="hero-facts">
          <div>
            <strong>{category.parts.length}</strong>
            <span>shared listings</span>
          </div>
          <div>
            <strong>{validatedCount}</strong>
            <span>validated builds</span>
          </div>
          <div>
            <strong>{topFileTypes.map((entry) => entry.label).join(" / ")}</strong>
            <span>common deliverables</span>
          </div>
        </div>
      </section>

      <section className="category-insight-grid">
        <section className="panel compact-panel">
          <p className="eyebrow">Search In This Lane</p>
          <h3>Top terms for {category.label.toLowerCase()}</h3>
          <div className="chip-row">
            {topTags.map((tag, index) => (
              <Link
                key={`tag-${tag.label}`}
                href={`/parts?category=${category.slug}&q=${encodeURIComponent(tag.label)}`}
                className={`chip${index === 0 ? " chip-accent" : ""}`}
              >
                {tag.label} <span className="chip-count">{tag.count}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="panel compact-panel">
          <p className="eyebrow">Teams Shipping Here</p>
          <h3>Most active libraries in this category</h3>
          <div className="discovery-link-list">
            {topTeams.map((team) => (
              <Link
                key={team.label}
                href={`/parts?category=${category.slug}&creator=${encodeURIComponent(team.label)}`}
                className="discovery-link-row"
              >
                <strong>{teamLabel(team.label)}</strong>
                <span>{team.count} listing{team.count === 1 ? "" : "s"}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="panel compact-panel">
          <p className="eyebrow">Deliverables</p>
          <h3>Fabrication outputs in this category</h3>
          <div className="chip-row">
            {topFileTypes.map((fileType, index) => (
              <Link
                key={fileType.label}
                href={`/parts?category=${category.slug}&fileType=${encodeURIComponent(fileType.label)}`}
                className={`chip${index === 0 ? " chip-accent" : ""}`}
              >
                {fileType.label} <span className="chip-count">{fileType.count}</span>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <div className="card-grid">
        {category.parts.map((part) => (
          <PartCard key={part.slug} part={part} />
        ))}
      </div>
    </div>
  );
}
