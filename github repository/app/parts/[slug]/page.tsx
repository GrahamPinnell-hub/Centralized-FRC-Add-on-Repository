import Link from "next/link";
import { notFound } from "next/navigation";

import { FileTable, MediaGallery, ViewerShell } from "@/components/ui";
import { getPart, parts } from "@/lib/catalog";

export default async function PartDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const part = getPart(slug);

  if (!part) {
    notFound();
  }

  const related = parts
    .filter((candidate) => candidate.slug !== part.slug && candidate.category === part.category)
    .slice(0, 3);

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">{part.categoryLabel}</p>
          <h1>{part.title}</h1>
          <p>{part.summary}</p>
          <div className="chip-row">
            {part.products.map((product) => (
              <span key={product} className="chip">
                {product}
              </span>
            ))}
            {part.seasons.map((season) => (
              <span key={season} className="chip">
                {season}
              </span>
            ))}
            <span className="chip chip-accent">{part.license}</span>
          </div>
        </div>
        <div className="hero-facts">
          <div>
            <strong>{part.materials.join(" / ")}</strong>
            <span>recommended materials</span>
          </div>
          <div>
            <strong>{part.files.length}</strong>
            <span>download and source slots</span>
          </div>
          <div>
            <strong>{part.versions[0]?.label ?? "v1.0"}</strong>
            <span>current release</span>
          </div>
          <div>
            <strong>{part.subsystem}</strong>
            <span>robot area</span>
          </div>
        </div>
      </section>

      <div className="detail-grid">
        <ViewerShell part={part} />
        <section className="panel">
          <h3>Compatibility and install notes</h3>
          <div className="chip-row">
            {part.vendors.map((vendor) => (
              <span key={vendor} className="chip">
                {vendor}
              </span>
            ))}
            {part.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
          <ul className="detail-list">
            {part.installNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p>
            Owner profile:{" "}
            <Link href={`/u/${part.creatorHandle}`} className="ghost-link">
              {part.creatorHandle}
            </Link>
          </p>
          <p>
            <Link href={`/report?part=${part.slug}`} className="button-link">
              Report this listing
            </Link>
          </p>
        </section>
      </div>

      <div className="two-column">
        <FileTable part={part} />
        <section className="panel">
          <h3>Print and fabrication notes</h3>
          {part.printProfile ? (
            <ul className="detail-list">
              <li>
                <strong>Material:</strong> {part.printProfile.material}
              </li>
              <li>
                <strong>Nozzle:</strong> {part.printProfile.nozzle}
              </li>
              <li>
                <strong>Layer height:</strong> {part.printProfile.layerHeight}
              </li>
              <li>
                <strong>Infill:</strong> {part.printProfile.infill}
              </li>
              <li>
                <strong>Supports:</strong> {part.printProfile.supports}
              </li>
              <li>
                <strong>Notes:</strong> {part.printProfile.notes}
              </li>
            </ul>
          ) : (
            <p>
              This listing is modeling fabrication notes for non-printed assets such as DXF-driven
              sheet metal.
            </p>
          )}
        </section>
      </div>

      <MediaGallery part={part} />

      <div className="two-column">
        <section className="panel">
          <h3>Version history</h3>
          <div className="file-table">
            {part.versions.map((version) => (
              <article key={`${part.slug}-${version.label}`} className="file-row">
                <div>
                  <strong>{version.label}</strong>
                  <p>{version.summary}</p>
                </div>
                <span className="muted">{version.date}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="panel">
          <h3>Related parts</h3>
          <div className="card-grid">
            {related.map((candidate) => (
              <article key={candidate.slug} className="card">
                <strong>
                  <Link href={`/parts/${candidate.slug}`}>{candidate.title}</Link>
                </strong>
                <p>{candidate.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
