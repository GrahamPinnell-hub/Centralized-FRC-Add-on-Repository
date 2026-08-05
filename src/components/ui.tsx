import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { ViewerShellClient } from "@/components/viewer-shell-client";
import type { CatalogPart, Creator, SearchFilters } from "@/lib/catalog";
import { mediaSource, mediaSurfaceStyle } from "@/lib/media-presentation";

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
  { href: "/login", label: "Log in" }
];

const languageOptions = [
  "English",
  "Espa\u00F1ol",
  "Fran\u00E7ais",
  "Polski",
  "Portugu\u00EAs (Brasil)",
  "Portugu\u00EAs (Portugal)",
  "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
  "\u7B80\u4F53\u4E2D\u6587"
] as const;

type TopAction = {
  href: string;
  icon?: string;
  iconOnly?: boolean;
  label: string;
};

const topActions: TopAction[] = [
  { href: "/parts", label: "Search", icon: "search", iconOnly: true },
  { href: "/upload", label: "Upload", icon: "upload", iconOnly: true }
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
  if (handle.startsWith("team-")) {
    return handle.replace("team-", "Team ");
  }

  return handle
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMetric(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function actionClassName(label: string) {
  return `action-${label.toLowerCase().replace(/\s+/g, "-")}`;
}

function getLeadMedia(part: CatalogPart) {
  return part.media.find((item) => item.src) ?? null;
}

function getPrimaryDownload(part: CatalogPart) {
  return part.files.find((file) => file.fileType !== "SOURCE") ?? part.files[0] ?? null;
}

function getSourceFile(part: CatalogPart) {
  return part.files.find((file) => file.fileType === "SOURCE") ?? null;
}

function getFileSlotLabel(fileType: CatalogPart["files"][number]["fileType"]) {
  switch (fileType) {
    case "DXF":
      return "Sheet metal / 2D fabrication";
    case "STEP":
      return "Neutral CAD reference";
    case "STL":
    case "3MF":
      return "Print-ready model";
    case "ZIP":
      return "Bundle download";
    case "SOURCE":
      return "Editable source CAD";
    default:
      return "Reusable file";
  }
}

function getFileActionLabel(file: CatalogPart["files"][number]) {
  switch (file.fileType) {
    case "SOURCE":
      return "Open source CAD";
    case "STEP":
      return "Download STEP";
    case "DXF":
      return "Download DXF";
    case "ZIP":
      return "Download ZIP";
    case "3MF":
      return "Download 3MF";
    case "STL":
      return "Download STL";
    default:
      return `Open ${file.fileType}`;
  }
}

function MetricIcon({ kind }: { kind: "rating" | "views" | "downloads" }) {
  if (kind === "rating") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="metric-icon-svg">
        <path
          d="m12 3.5 2.7 5.48 6.05.88-4.38 4.27 1.04 6.03L12 17.33l-5.41 2.85 1.04-6.03L3.25 9.86l6.05-.88Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  if (kind === "views") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="metric-icon-svg">
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="3.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="metric-icon-svg">
      <path d="M12 3.5v11.5" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M5 19.5h14" />
    </svg>
  );
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
                  <span className="brand-title-long">Centralized FRC Repository</span>
                  <span className="brand-title-short">FRC Add-ons</span>
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
                className={`action-link ${actionClassName(action.label)}${action.iconOnly ? " icon-only" : ""}`}
                aria-label={action.label}
              >
                {action.icon ? <span className={`action-icon action-icon-${action.icon}`} aria-hidden="true" /> : null}
                <span className="action-label">{action.label}</span>
              </Link>
            ))}
            <details className="language-menu action-language-menu">
              <summary
                className="action-link action-language language-toggle icon-only"
                aria-label="Language options"
              >
                <span className="action-icon action-icon-language" aria-hidden="true" />
                <span className="action-label">Language</span>
              </summary>
              <div className="language-panel">
                {languageOptions.map((language) => (
                  <button key={language} type="button" className="language-option">
                    {language}
                  </button>
                ))}
              </div>
            </details>
            <Link
              href="/login"
              className={`action-link ${actionClassName("Login")} primary`}
              aria-label="Login"
            >
              <span className="action-label">Login</span>
            </Link>
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
  const leadMedia = getLeadMedia(part);

  return (
    <article className="panel card listing-card" style={previewStyle(part.category)}>
      <Link href={`/parts/${part.slug}`} className="card-media">
        <div className={`card-preview card-preview-clean${leadMedia ? " has-media" : ""}`}>
          {leadMedia?.src ? (
            <div className="card-preview-image" aria-hidden="true" style={mediaSurfaceStyle(leadMedia, "card")}>
              <img src={mediaSource(leadMedia)} alt="" loading="lazy" />
            </div>
          ) : null}
        </div>
      </Link>
      <div className="card-body">
        <h3>
          <Link href={`/parts/${part.slug}`}>{part.title}</Link>
        </h3>
        <div className="card-stats">
          <span className="metric-pill">
            <MetricIcon kind="rating" />
            {part.rating.toFixed(1)}
          </span>
          <span className="metric-pill">
            <MetricIcon kind="views" />
            {formatMetric(part.views)}
          </span>
          <span className="metric-pill">
            <MetricIcon kind="downloads" />
            {formatMetric(part.downloads)}
          </span>
        </div>
        <div className="card-author-row">
          <span className="card-byline">by {creatorLabel(part.creatorHandle)}</span>
        </div>
        <div className="chip-row">
          {part.tags.slice(0, 4).map((tag, index) => (
            <span key={tag} className={`chip${index === 0 ? " chip-accent" : ""}`}>
              {tag}
            </span>
          ))}
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
  options,
  creators
}: {
  filters: SearchFilters;
  options: FilterOptions;
  creators: Creator[];
}) {
  return (
    <form className="panel filters" action="/parts">
      <input type="hidden" name="sort" value={filters.sort ?? "trending"} />
      <div className="page-stack">
        <p className="eyebrow">Filter Stack</p>
        <h3>Search like a builder</h3>
        <p>Drill into vendors, teams, file types, and seasons without leaving the same browse lane.</p>
      </div>
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
        Team
        <select name="creator" defaultValue={filters.creator ?? ""}>
          <option value="">All teams</option>
          {creators.map((creator) => (
            <option key={creator.handle} value={creator.handle}>
              {creator.teamNumber} / {creator.teamName}
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
  return <ViewerShellClient part={part} themeStyle={previewStyle(part.category)} />;
}

export function FileTable({ part }: { part: CatalogPart }) {
  return (
    <section className="panel">
      <div className="section-title detail-section-title">
        <p className="eyebrow">Downloads</p>
        <h2>Files and source links</h2>
        <p>Printable, fabrication, and source files.</p>
      </div>
      <div className="file-table">
        {part.files.map((file, index) => (
          <article
            key={`${part.slug}-${file.label}`}
            className={`file-row${index === 0 ? " is-primary" : ""}`}
          >
            <div className="file-row-copy">
              <div className="file-row-titleline">
                <strong>{file.label}</strong>
                {index === 0 ? <span className="file-row-badge is-primary">Primary</span> : null}
                {file.fileType === "SOURCE" ? <span className="file-row-badge">Source</span> : null}
              </div>
              <div className="file-row-meta">
                <span className={`chip${file.fileType === "SOURCE" ? " chip-accent" : ""}`}>{file.fileType}</span>
                <span className="muted">{getFileSlotLabel(file.fileType)}</span>
              </div>
              <p>{file.note}</p>
            </div>
            <div className="file-actions">
              <a href={file.href} target="_blank" rel="noreferrer">
                {getFileActionLabel(file)}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MediaGallery({ part }: { part: CatalogPart }) {
  return (
    <section className="panel" id="media">
      <div className="section-title detail-section-title">
        <p className="eyebrow">Media</p>
        <h2>Gallery</h2>
        <p>Installed views and short clips.</p>
      </div>
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
            <div className={`media-poster${item.src ? " has-media" : ""}`}>
              {item.src ? (
                <div className="media-poster-image" style={mediaSurfaceStyle(item, "gallery")}>
                  <img src={mediaSource(item)} alt={item.title} loading="lazy" />
                </div>
              ) : null}
            </div>
            <div className="media-card-topline">
              <span>{item.kind === "video" ? "Video" : "Photo"}</span>
              <span>{item.kind === "video" ? "Install clip" : "Installed view"}</span>
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
        <li>Use the drop zone for grouped robot files, then clean up labels and detected file types before publishing.</li>
        <li>Add enough compatibility metadata that another team can find the part without guessing.</li>
        <li>Use the report flow later for broken links, unsafe content, or bad metadata.</li>
      </ul>
    </aside>
  );
}
