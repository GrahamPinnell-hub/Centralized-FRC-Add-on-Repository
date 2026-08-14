import Link from "next/link";
import { notFound } from "next/navigation";

import { FileTable, MediaGallery, PartCard, ViewerShell } from "@/components/ui";
import { countLabels } from "@/lib/discovery";
import {
  getCreatorProfileData,
  getPartData,
  getPartSlugsData,
  getRelatedPartsData
} from "@/lib/repository";

function creatorLabel(handle: string) {
  return handle.replace("team-", "Team ");
}

function formatDateLabel(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
}

function getPrimaryDownloadHref(
  part: Awaited<ReturnType<typeof getPartData>>
) {
  return part?.files.find((file) => file.fileType !== "SOURCE") ?? part?.files[0] ?? null;
}

function getSourceHref(
  part: Awaited<ReturnType<typeof getPartData>>
) {
  return part?.files.find((file) => file.fileType === "SOURCE") ?? null;
}

export async function generateStaticParams() {
  const slugs = await getPartSlugsData();
  return slugs.map((slug) => ({ slug }));
}

export default async function PartDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const part = await getPartData(slug);

  if (!part) {
    notFound();
  }

  const [related, creatorProfile] = await Promise.all([
    getRelatedPartsData(part.slug, part.category),
    getCreatorProfileData(part.creatorHandle)
  ]);
  const primaryDownload = getPrimaryDownloadHref(part);
  const sourceFile = getSourceHref(part);
  const creatorName = creatorProfile
    ? `${creatorProfile.creator.teamNumber} / ${creatorProfile.creator.teamName}`
    : creatorLabel(part.creatorHandle);
  const creatorLocation = creatorProfile?.creator.location ?? "Shared community listing";
  const creatorParts = creatorProfile?.parts.length ?? 1;
  const deliverableTypes = Array.from(new Set(part.files.map((file) => file.fileType)));
  const productSummary = part.products.join(", ");
  const vendorSummary = part.vendors.join(", ");
  const materialSummary = part.materials.join(" / ");
  const currentRelease = part.versions[0]?.label ?? "v1.0";
  const hasMedia = part.media.some((item) => item.src);
  const mediaCount = part.media.length;
  const creatorCategories = creatorProfile
    ? countLabels(creatorProfile.parts.map((entry) => entry.categoryLabel), 4)
    : [];
  const creatorTags = creatorProfile
    ? countLabels(creatorProfile.parts.flatMap((entry) => entry.tags), 6)
    : [];

  return (
    <div className="page-stack detail-page">
      <nav className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/parts">Listings</Link>
        <span>/</span>
        <Link href={`/categories/${part.category}`}>{part.categoryLabel}</Link>
        <span>/</span>
        <span>{part.title}</span>
      </nav>

      <section className="detail-hero-shell">
        <div className="detail-hero-main">
          <div className="page-stack detail-hero-copy">
            <div className="detail-hero-topline">
              <p className="eyebrow">{part.categoryLabel}</p>
              {part.validated ? <span className="status-pill">Validated</span> : null}
            </div>
            <h1>{part.title}</h1>
            <p className="detail-summary-intro">{part.summary}</p>
            <div className="detail-meta-row">
              <Link href={`/u/${part.creatorHandle}`} className="detail-author">
                by {creatorName}
              </Link>
              <span>{creatorLocation}</span>
              <span>Uploaded {part.uploadedAgo}</span>
              <span>Updated {formatDateLabel(part.updatedAt)}</span>
              <span>{part.rating.toFixed(1)} rating</span>
            </div>
            <div className="chip-row detail-chip-row">
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
            <div className="detail-at-a-glance">
              <div className="detail-glance-card">
                <span>primary output</span>
                <strong>{deliverableTypes[0] ?? "Files"}</strong>
              </div>
              <div className="detail-glance-card">
                <span>gallery items</span>
                <strong>{mediaCount}</strong>
              </div>
              <div className="detail-glance-card">
                <span>current release</span>
                <strong>{currentRelease}</strong>
              </div>
              <div className="detail-glance-card">
                <span>vendor fit</span>
                <strong>{vendorSummary}</strong>
              </div>
            </div>
            <div className="detail-spec-grid">
              <div className="detail-spec-card">
                <span>Compatible with</span>
                <strong>{productSummary}</strong>
              </div>
              <div className="detail-spec-card">
                <span>Deliverables</span>
                <strong>{deliverableTypes.join(" / ")}</strong>
              </div>
              <div className="detail-spec-card">
                <span>Material</span>
                <strong>{materialSummary}</strong>
              </div>
              <div className="detail-spec-card">
                <span>Subsystem</span>
                <strong>{part.subsystem}</strong>
              </div>
            </div>
          </div>
          <div className="detail-showcase-grid">
            <ViewerShell part={part} />
            <aside className="panel detail-hero-aside">
              <div className="detail-stat-inline-grid">
                <div className="detail-stat-inline">
                  <strong>{part.rating.toFixed(1)}</strong>
                  <span>rating</span>
                </div>
                <div className="detail-stat-inline">
                  <strong>{part.views}</strong>
                  <span>views</span>
                </div>
                <div className="detail-stat-inline">
                  <strong>{part.downloads}</strong>
                  <span>downloads</span>
                </div>
              </div>
              <div className="detail-action-stack">
                {primaryDownload ? (
                  <a href={primaryDownload.href} className="button-link" target="_blank" rel="noreferrer">
                    Download {primaryDownload.fileType}
                  </a>
                ) : (
                  <a href="#files" className="button-link">
                    View files
                  </a>
                )}
                {sourceFile ? (
                  <a href={sourceFile.href} className="action-link" target="_blank" rel="noreferrer">
                    Open source CAD
                  </a>
                ) : (
                  <a href="#files" className="action-link">
                    Browse files
                  </a>
                )}
                {hasMedia ? (
                  <a href="#media" className="action-link">
                    Open gallery
                  </a>
                ) : null}
                <a href="#related" className="action-link">
                  Related parts
                </a>
                <Link href={`/report?part=${part.slug}`} className="ghost-link detail-report-link">
                  Report listing
                </Link>
              </div>
              <div className="detail-hero-facts">
                <div className="detail-inline-block">
                  <strong>Published by</strong>
                  <span>{creatorName}</span>
                </div>
                <div className="detail-inline-block">
                  <strong>Updated</strong>
                  <span>{formatDateLabel(part.updatedAt)}</span>
                </div>
                <div className="detail-inline-block">
                  <strong>Viewer note</strong>
                  <span>{part.viewerNote}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="detail-stage-grid">
        <section className="detail-stage-panel">
          <div className="section-title detail-section-title">
            <p className="eyebrow">Overview</p>
            <h2>Repository overview</h2>
            <p>Core fit, files, and install notes without burying the useful details.</p>
          </div>
          <div className="detail-summary-copy">
            <p>{part.summary}</p>
            <p>
              This release is aimed at {part.subsystem.toLowerCase()} packaging, built around
              {` ${productSummary}`} hardware, and currently ships {deliverableTypes.join(" / ")}
              files for direct reuse.
            </p>
          </div>
          <ul className="detail-highlight-list">
            {part.installNotes.slice(0, 4).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <div className="chip-row detail-jump-row">
            <a href="#files" className="chip chip-accent">
              Files
            </a>
            {hasMedia ? (
              <a href="#media" className="chip">
                Gallery
              </a>
            ) : null}
            <a href="#related" className="chip">
              Related parts
            </a>
            <Link href={`/u/${part.creatorHandle}`} className="chip">
              Team library
            </Link>
          </div>
        </section>
        <aside className="panel detail-team-panel">
          <div className="section-title detail-section-title">
            <p className="eyebrow">Publisher</p>
            <h2>{creatorName}</h2>
            <p>{creatorProfile?.creator.bio ?? "Shared FRC team profile."}</p>
          </div>
          <div className="detail-stat-block">
            <strong>{creatorParts}</strong>
            <span>published listings</span>
          </div>
          <div className="detail-stat-block">
            <strong>{part.files.length}</strong>
            <span>files and source links</span>
          </div>
          <div className="detail-stat-block">
            <strong>{part.versions[0]?.label ?? "v1.0"}</strong>
            <span>current release</span>
          </div>
          <div className="detail-stat-block">
            <strong>{part.materials.join(" / ")}</strong>
            <span>materials</span>
          </div>
          <div className="detail-stat-block">
            <strong>{part.subsystem}</strong>
            <span>robot subsystem</span>
          </div>
          <div className="detail-stat-block">
            <strong>{formatDateLabel(part.publishedAt)}</strong>
            <span>published date</span>
          </div>
          <div className="chip-row">
            {part.vendors.map((vendor) => (
              <span key={vendor} className="chip">
                {vendor}
              </span>
            ))}
          </div>
          {creatorCategories.length > 0 ? (
            <div className="detail-team-cluster">
              <strong>Common categories</strong>
              <div className="chip-row">
                {creatorCategories.map((category) => (
                  <span key={category.label} className="chip">
                    {category.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {creatorTags.length > 0 ? (
            <div className="detail-team-cluster">
              <strong>Common tags</strong>
              <div className="chip-row">
                {creatorTags.map((tag) => (
                  <span key={tag.label} className="chip">
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <Link href={`/u/${part.creatorHandle}`} className="ghost-link">
            Open team profile
          </Link>
        </aside>
      </div>

      <div className="detail-overview-grid">
        <section className="panel">
          <div className="section-title detail-section-title">
            <p className="eyebrow">Install</p>
            <h2>Compatibility and install notes</h2>
            <p>Vendor fit, install callouts, and reuse tags.</p>
          </div>
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
        </section>
        <section className="panel">
          <div className="section-title detail-section-title">
            <p className="eyebrow">Metadata</p>
            <h2>Listing metadata</h2>
            <p>Fabrication context, release metadata, and reuse-facing details.</p>
          </div>
          <div className="detail-meta-grid">
            <div className="detail-meta-item">
              <span>License</span>
              <strong>{part.license}</strong>
            </div>
            <div className="detail-meta-item">
              <span>Subsystem</span>
              <strong>{part.subsystem}</strong>
            </div>
            <div className="detail-meta-item">
              <span>Published</span>
              <strong>{formatDateLabel(part.publishedAt)}</strong>
            </div>
            <div className="detail-meta-item">
              <span>Source CAD</span>
              <strong>{sourceFile ? "Included" : "Not listed"}</strong>
            </div>
          </div>
          <div className="chip-row">
            {part.materials.map((material) => (
              <span key={material} className="chip">
                {material}
              </span>
            ))}
            {part.seasons.map((season) => (
              <span key={season} className="chip">
                {season}
              </span>
            ))}
          </div>
          <p>
            This listing supports {part.files.map((file) => file.fileType).join(", ")} deliverables
            with source links and install guidance intended for another team to reuse directly.
          </p>
          <div className="detail-tag-cloud">
            {part.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="detail-assets-grid" id="files">
        <FileTable part={part} />
        <section className="panel">
          <div className="section-title detail-section-title">
            <p className="eyebrow">Fabrication</p>
            <h2>Print and fabrication notes</h2>
            <p>Quick setup notes for print or sponsor fabrication.</p>
          </div>
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

      <div className="detail-bottom-grid" id="related">
        <section className="panel">
          <div className="section-title detail-section-title">
            <p className="eyebrow">Changelog</p>
            <h2>Version history</h2>
            <p>Release notes and geometry changes over time.</p>
          </div>
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
          <div className="section-title detail-section-title">
            <p className="eyebrow">More Like This</p>
            <h2>Related parts</h2>
            <p>Other listings solving a similar packaging problem.</p>
          </div>
          <div className="detail-related-grid detail-related-card-grid">
            {related.map((candidate) => (
              <PartCard key={candidate.slug} part={candidate} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
