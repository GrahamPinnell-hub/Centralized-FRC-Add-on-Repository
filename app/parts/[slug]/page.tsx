import Link from "next/link";
import { notFound } from "next/navigation";

import { FileTable, MediaGallery, ViewerShell } from "@/components/ui";
import { getPart, parts, partSlugs } from "@/lib/catalog";

export function generateStaticParams() {
  return partSlugs.map((slug) => ({ slug }));
}

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
    <div className="page-stack detail-page">
      <nav className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/parts">Listings</Link>
        <span>/</span>
        <span>{part.title}</span>
      </nav>

      <section className="detail-titlebar">
        <div className="page-stack">
          <p className="eyebrow">{part.categoryLabel}</p>
          <h1>{part.title}</h1>
          <div className="detail-meta-row">
            <span className="detail-author">by {part.creatorHandle.replace("team-", "Team ")}</span>
            <span>Uploaded {part.uploadedAgo}</span>
            <span>{part.rating.toFixed(1)} rating</span>
          </div>
        </div>
      </section>

      <div className="detail-grid">
        <section className="panel detail-primary-panel">
          <ViewerShell part={part} />
          <div className="detail-action-bar">
            <a href="#files" className="button-link">
              Download
            </a>
            {part.validated ? <span className="status-pill">Validated</span> : null}
            <a href="#viewer" className="action-link">
              View in 3D
            </a>
            <a href="#related" className="action-link">
              Similar by shape
            </a>
            <Link href={`/report?part=${part.slug}`} className="action-link">
              Report listing
            </Link>
          </div>
          <div className="detail-summary-copy">
            <p>{part.summary}</p>
            <p>
              Built around {part.products.join(", ")} with fitment for {part.vendors.join(", ")}{" "}
              hardware and intended for {part.subsystem.toLowerCase()} packaging.
            </p>
          </div>
        </section>
        <section className="panel detail-side-panel">
          <h3>Schematic-style stats</h3>
          <div className="detail-stat-block">
            <strong>{part.views}</strong>
            <span>views</span>
          </div>
          <div className="detail-stat-block">
            <strong>{part.downloads}</strong>
            <span>downloads</span>
          </div>
          <div className="detail-stat-block">
            <strong>{part.files.length}</strong>
            <span>download and source slots</span>
          </div>
          <div className="detail-stat-block">
            <strong>{part.versions[0]?.label ?? "v1.0"}</strong>
            <span>current release</span>
          </div>
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
        </section>
      </div>

      <div className="detail-grid">
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
            Owner profile:
            {" "}
            <Link href={`/u/${part.creatorHandle}`} className="ghost-link">
              {part.creatorHandle}
            </Link>
          </p>
        </section>
        <section className="panel">
          <h3>Materials and fabrication</h3>
          <div className="chip-row">
            {part.materials.map((material) => (
              <span key={material} className="chip">
                {material}
              </span>
            ))}
          </div>
          <p>
            This listing supports {part.files.map((file) => file.fileType).join(", ")} deliverables
            with source links and install guidance intended for another team to reuse directly.
          </p>
        </section>
      </div>

      <div className="two-column" id="files">
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

      <div className="two-column" id="related">
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
              <article key={candidate.slug} className="panel card">
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
