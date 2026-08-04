import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import type { CatalogPart, Creator, SearchFilters } from "@/lib/catalog";

type FilterOptions = {
  categories: { slug: string; label: string }[];
  vendors: string[];
  seasons: string[];
  fileTypes: string[];
  materials: string[];
};

const previewThemes: Record<string, { accent: string; glow: string; deep: string }> = {
  "swerve-covers": { accent: "#d4a54e", glow: "#bf9045", deep: "#241c0e" },
  "vision-mounts": { accent: "#dce1e7", glow: "#a8b0bb", deep: "#2b313a" },
  "electronics-mounts": { accent: "#ab813d", glow: "#9e7735", deep: "#241c0e" },
  "battery-hardware": { accent: "#c4b896", glow: "#9ea5ad", deep: "#2b313a" },
  "driver-station": { accent: "#bf9045", glow: "#ab813d", deep: "#241c0e" },
  default: { accent: "#d4a54e", glow: "#bf9045", deep: "#241c0e" }
};

const sidebarLinks = [
  { href: "/", label: "Home" },
  { href: "/parts", label: "Browse" },
  { href: "/upload", label: "Upload" },
  { href: "/categories/swerve-covers", label: "Categories" },
  { href: "/u/team-31", label: "Teams" },
  { href: "/report", label: "Report" },
  { href: "/login", label: "Log in" }
];

const topActions = [
  { href: "/parts", label: "Search", icon: "search", mobileIconOnly: true },
  { href: "/upload", label: "Upload", icon: "upload", mobileIconOnly: true },
  { href: "/report", label: "Report", icon: "report", mobileIconOnly: true },
  { href: "/login", label: "Login", primary: true }
];

function previewStyle(key: string): CSSProperties {
  const theme = previewThemes[key] ?? previewThemes.default;

  return {
    ["--preview-accent" as string]: theme.accent,
    ["--preview-glow" as string]: theme.glow,
    ["--preview-deep" as string]: theme.deep
  };
}

function creatorLabel(handle: string) {
  return handle.replace("team-", "Team ");
}

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href} className="sidebar-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <section className="sidebar-note">
          <p className="eyebrow">V1 Scope</p>
          <strong>Prints, sheet metal, and source CAD first.</strong>
          <p>PCB boards, fixtures, and smarter AI-assisted search can layer in next.</p>
        </section>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-leading">
            <details className="mobile-nav">
              <summary className="menu-toggle" aria-label="Open site navigation">
                <span className="menu-bars" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </summary>
              <div className="mobile-nav-panel">
                <nav className="mobile-nav-links">
                  {sidebarLinks.map((link) => (
                    <Link key={`mobile-${link.href}`} href={link.href} className="mobile-nav-link">
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <section className="mobile-nav-note">
                  <p className="eyebrow">V1 Scope</p>
                  <strong>Prints, sheet metal, and source CAD first.</strong>
                  <p>PCB boards, fixtures, and smarter AI-assisted search can layer in next.</p>
                </section>
              </div>
            </details>
            <Link href="/" className="brand">
              <span className="brand-mark">FRC</span>
              <span className="brand-copy">
                <strong>
                  <span className="brand-title-long">Centralized Add-on Repository</span>
                  <span className="brand-title-short">FRC Repository</span>
                </strong>
                <small>robot accessories, sheet metal, and reusable hardware</small>
              </span>
            </Link>
          </div>
          <nav className="top-actions">
            {topActions.map((action) => (
              <Link
                key={action.href + action.label}
                href={action.href}
                className={`action-link${action.primary ? " primary" : ""}${action.mobileIconOnly ? " mobile-icon-only" : ""}`}
                aria-label={action.label}
              >
                {action.icon ? <span className={`action-icon action-icon-${action.icon}`} aria-hidden="true" /> : null}
                <span className="action-label">{action.label}</span>
              </Link>
            ))}
          </nav>
        </header>
        <main className="content-shell page-stack">{children}</main>
        <footer className="footer">
          <p>
            Centralized FRC Add-on Repository exists so teams stop redrawing the same mounts,
            covers, trays, guards, and pit accessories every season.
          </p>
          <p>V1 keeps the library simple: immediate publishing, better metadata, and searchable CAD.</p>
        </footer>
      </div>
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
    <article className="panel card" style={previewStyle(part.category)}>
      <div className="card-preview">
        <div className="card-preview-meta">
          <span className="preview-badge">{part.categoryLabel}</span>
          <span className="preview-owner">{creatorLabel(part.creatorHandle)}</span>
        </div>
        <div className="preview-title">
          {part.products.slice(0, 2).join(" / ") || part.subsystem}
        </div>
      </div>
      <div className="card-body">
        <div className="card-topline">
          <span className="muted">{part.subsystem}</span>
          <span className="muted">{part.updatedAt}</span>
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
          <span>{part.files.length} files</span>
          <span>{part.seasons.join(", ")}</span>
        </div>
      </div>
    </article>
  );
}

export function CategoryCard({
  category
}: {
  category: { slug: string; label: string; description: string; count: number };
}) {
  return (
    <article className="panel card" style={previewStyle(category.slug)}>
      <div className="card-preview">
        <div className="card-preview-meta">
          <span className="preview-badge">Category</span>
          <span className="preview-owner">{category.count} listings</span>
        </div>
        <div className="preview-title">{category.label}</div>
      </div>
      <div className="card-body">
        <p>{category.description}</p>
        <div className="card-meta">
          <span>{category.count} shared parts</span>
          <Link href={`/categories/${category.slug}`} className="ghost-link">
            Open lane
          </Link>
        </div>
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
    <section className="panel viewer-shell" style={previewStyle(part.category)}>
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
          <article
            key={`${part.slug}-${item.title}`}
            className="media-card"
            style={{
              ["--preview-accent" as string]: item.accent,
              ["--preview-glow" as string]: item.accent,
              ["--preview-deep" as string]: "#1f2121"
            }}
          >
            <div className="media-poster">
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
          {creator.teamNumber} / {creator.teamName}
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
