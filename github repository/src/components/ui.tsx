import Link from "next/link";
import type { ReactNode } from "react";

import type { CatalogPart, Creator, SearchFilters } from "@/lib/catalog";

type FilterOptions = {
  categories: { slug: string; label: string }[];
  vendors: string[];
  seasons: string[];
  fileTypes: string[];
  materials: string[];
};

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">FRC</span>
          <span>
            <strong>Centralized Add-on Repository</strong>
            <small>robot accessories, sheet metal, and reusable hardware</small>
          </span>
        </Link>
        <nav className="nav-links">
          <Link href="/parts">Browse</Link>
          <Link href="/upload">Upload</Link>
          <Link href="/u/team-31">Teams</Link>
          <Link href="/login">Log in</Link>
        </nav>
      </header>
      <main className="page-stack">{children}</main>
      <footer className="footer">
        <div>
          <strong>Why this exists</strong>
          <p>
            Teams should be able to find proven robot add-ons instead of redrawing the same
            mounts, guards, trays, and service tools every build season.
          </p>
        </div>
        <div>
          <strong>What comes next</strong>
          <p>
            V1 starts with prints and sheet metal, then expands toward PCB resources, board
            mounting standards, and code-related robot support assets.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  body
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="section-title">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

export function StatStrip({
  stats
}: {
  stats: { label: string; value: string; note: string }[];
}) {
  return (
    <div className="stat-strip">
      {stats.map((stat) => (
        <article key={stat.label} className="stat-card">
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
          <small>{stat.note}</small>
        </article>
      ))}
    </div>
  );
}

export function PartCard({ part }: { part: CatalogPart }) {
  return (
    <article className="panel card">
      <div className="card-topline">
        <span className="chip chip-accent">{part.categoryLabel}</span>
        <span className="muted">{part.subsystem}</span>
      </div>
      <h3>
        <Link href={`/parts/${part.slug}`}>{part.title}</Link>
      </h3>
      <p>{part.summary}</p>
      <div className="chip-row">
        {part.products.slice(0, 3).map((product) => (
          <span key={product} className="chip">
            {product}
          </span>
        ))}
      </div>
      <div className="card-meta">
        <span>{part.files.map((file) => file.fileType).join(" / ")}</span>
        <span>{part.seasons.join(", ")}</span>
      </div>
    </article>
  );
}

export function FilterPanel({
  filters,
  options
}: {
  filters: SearchFilters;
  options: FilterOptions;
}) {
  return (
    <form className="panel filters" action="/parts">
      <label>
        Search
        <input name="q" defaultValue={filters.q ?? ""} placeholder="mk4i swerve cover from team 31" />
      </label>
      <label>
        Category
        <select name="category" defaultValue={filters.category ?? ""}>
          <option value="">All categories</option>
          {options.categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Vendor
        <select name="vendor" defaultValue={filters.vendor ?? ""}>
          <option value="">All vendors</option>
          {options.vendors.map((vendor) => (
            <option key={vendor} value={vendor}>
              {vendor}
            </option>
          ))}
        </select>
      </label>
      <label>
        Season
        <select name="season" defaultValue={filters.season ?? ""}>
          <option value="">All seasons</option>
          {options.seasons.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>
      </label>
      <label>
        File type
        <select name="fileType" defaultValue={filters.fileType ?? ""}>
          <option value="">All file types</option>
          {options.fileTypes.map((fileType) => (
            <option key={fileType} value={fileType}>
              {fileType}
            </option>
          ))}
        </select>
      </label>
      <label>
        Material
        <select name="material" defaultValue={filters.material ?? ""}>
          <option value="">All materials</option>
          {options.materials.map((material) => (
            <option key={material} value={material}>
              {material}
            </option>
          ))}
        </select>
      </label>
      <div className="filter-actions">
        <button type="submit">Apply filters</button>
        <Link href="/parts" className="ghost-link">
          Reset
        </Link>
      </div>
    </form>
  );
}

export function ViewerShell({ part }: { part: CatalogPart }) {
  return (
    <section className="panel viewer-shell">
      <div className="viewer-head">
        <span className="chip chip-accent">Built-in Viewer</span>
        <span className="muted">{part.files.map((file) => file.fileType).join(" / ")}</span>
      </div>
      <div className="viewer-stage">
        <div className="viewer-mesh">
          <span>3D / 2D preview slot</span>
        </div>
      </div>
      <p>{part.viewerNote}</p>
    </section>
  );
}

export function FileTable({ part }: { part: CatalogPart }) {
  return (
    <section className="panel">
      <h3>Files and source links</h3>
      <div className="file-table">
        {part.files.map((file) => (
          <article key={`${part.slug}-${file.label}`} className="file-row">
            <div>
              <strong>{file.label}</strong>
              <p>{file.note}</p>
            </div>
            <div className="file-actions">
              <span className="chip">{file.fileType}</span>
              <a href={file.href}>Open slot</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MediaGallery({ part }: { part: CatalogPart }) {
  return (
    <section className="panel">
      <h3>Gallery</h3>
      <div className="media-grid">
        {part.media.map((item) => (
          <article key={`${part.slug}-${item.title}`} className="media-card">
            <div className="media-poster" style={{ background: `linear-gradient(135deg, ${item.accent}, #0f172a)` }}>
              <span>{item.kind === "video" ? "Video slot" : "Photo slot"}</span>
            </div>
            <strong>{item.title}</strong>
            <p>{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CreatorBanner({
  creator,
  partCount
}: {
  creator: Creator;
  partCount: number;
}) {
  return (
    <section className="hero-banner">
      <div>
        <p className="eyebrow">Team Profile</p>
        <h1>
          {creator.teamNumber} · {creator.teamName}
        </h1>
        <p>{creator.bio}</p>
      </div>
      <div className="hero-facts">
        <div>
          <strong>{partCount}</strong>
          <span>shared listings</span>
        </div>
        <div>
          <strong>{creator.location}</strong>
          <span>location</span>
        </div>
      </div>
    </section>
  );
}

export function EmptyState({
  title,
  body
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="panel empty-state">
      <h3>{title}</h3>
      <p>{body}</p>
    </section>
  );
}

export function UploadChecklist() {
  return (
    <aside className="panel upload-notes">
      <h3>V1 upload rules</h3>
      <ul>
        <li>Publish immediately. Listings are auto-approved in V1.</li>
        <li>Accepted file types: STL, STEP, 3MF, DXF, ZIP, and source CAD links.</li>
        <li>Add enough compatibility metadata that another team can find the part without guessing.</li>
        <li>Use the report flow later for broken links, unsafe content, or bad metadata.</li>
      </ul>
    </aside>
  );
}
