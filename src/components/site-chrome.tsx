"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

const primarySidebarLinks = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/parts", label: "Search", icon: "search" },
  { href: "/upload", label: "Upload", icon: "upload" },
  { href: "/parts?sort=trending", label: "Trending", icon: "trending" },
  { href: "/parts?sort=latest", label: "Latest", icon: "latest" },
  { href: "/u/team-31", label: "Teams", icon: "team" }
] as const;

const laneSidebarLinks = [
  { href: "/categories/swerve-covers", label: "Swerve Covers", icon: "swerve" },
  { href: "/categories/vision-mounts", label: "Vision Mounts", icon: "vision" },
  { href: "/categories/electronics-mounts", label: "Electronics", icon: "electronics" },
  { href: "/categories/battery-hardware", label: "Battery Hardware", icon: "battery" },
  { href: "/categories/driver-station", label: "Driver Station", icon: "driver" }
] as const;

const librarySidebarLinks = [
  { href: "/parts?fileType=STL", label: "3D Prints", icon: "prints" },
  { href: "/parts?fileType=DXF", label: "Sheet Metal", icon: "sheet" },
  { href: "/parts?fileType=SOURCE", label: "Source CAD", icon: "source" },
  { href: "/parts?sort=rating", label: "Top Rated", icon: "crown" },
  { href: "/parts?sort=downloads", label: "Downloads", icon: "downloads" },
  { href: "/report", label: "Report", icon: "report" }
] as const;

const mobileNavLinks = [
  ...primarySidebarLinks,
  ...laneSidebarLinks,
  ...librarySidebarLinks,
  { href: "/login", label: "Login", icon: "login" }
] as const;

const languageOptions = [
  "English",
  "Español",
  "Français",
  "Polski",
  "Português (Brasil)",
  "Português (Portugal)",
  "Русский",
  "简体中文"
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

function actionClassName(label: string) {
  return `action-${label.toLowerCase().replace(/\s+/g, "-")}`;
}

function SidebarGlyph({
  icon,
  collapsed = false
}: {
  icon: string;
  collapsed?: boolean;
}) {
  if (icon === "collapse") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d={collapsed ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.9"
        />
      </svg>
    );
  }

  if (icon === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 10.5 12 4l8.5 6.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M6.5 10.5V20h11v-9.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "search") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="5.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m15 15 5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "upload") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4.5v10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="m8.5 8 3.5-3.5L15.5 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M5 19.5h14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "trending") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.5 16.5 10 11l4 4 5.5-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M15.5 8H20v4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "latest") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v4.2l2.8 1.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "team") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.8 18.5c1.2-2.4 3.2-3.8 5.2-3.8 2 0 4 1.4 5.2 3.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M16 6.5c2 .1 3.8 1.3 4.8 3.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "vision") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4.5" y="7" width="11" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m15.5 10 4-2v8l-4-2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "electronics") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 2.8v2.5M15 2.8v2.5M9 18.7v2.5M15 18.7v2.5M2.8 9h2.5M18.7 9h2.5M2.8 15h2.5M18.7 15h2.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "battery") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4.5" y="7.5" width="14" height="9" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M18.5 10.2H20a1.2 1.2 0 0 1 1.2 1.2v1.2A1.2 1.2 0 0 1 20 13.8h-1.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "driver") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 8.2h10l2.5 4.8-1.8 4h-2.8l-1.6-2.4h-2.6L9.1 17H6.3l-1.8-4L7 8.2Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M9 12h.1M15 12h.1M12 10.5v3M10.5 12H13.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "prints") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 9V4.5h10V9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <rect x="5" y="9" width="14" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <rect x="7.5" y="13" width="9" height="6.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "sheet") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4.5h7l3 3v12H7z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M14 4.5v3h3" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "source") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m8.5 8.5-3.5 3.5 3.5 3.5M15.5 8.5l3.5 3.5-3.5 3.5M13.5 6l-3 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "crown") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m4.5 8.5 3.5 3 4-5 4 5 3.5-3 1.5 9h-18z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "downloads") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4.5v10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="m8.5 11 3.5 3.5 3.5-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M5 19.5h14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "report") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 5v14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M6 6h9l-1.8 3 1.8 3H6" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "login") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M12 12h7.5M16.2 8l4 4-4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function isLinkActive(href: string, pathname: string) {
  const url = new URL(href, "https://frc-addons.local");

  if (pathname !== url.pathname) {
    return false;
  }

  if ([...url.searchParams.keys()].length === 0) {
    return true;
  }

  return false;
}

function SidebarNavLink({
  href,
  label,
  icon,
  collapsed,
  pathname,
  footer = false
}: {
  href: string;
  label: string;
  icon: string;
  collapsed: boolean;
  pathname: string;
  footer?: boolean;
}) {
  const active = isLinkActive(href, pathname);

  return (
    <Link
      href={href}
      className={`sidebar-link${active ? " is-active" : ""}${footer ? " is-footer-link" : ""}`}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
    >
      <span className="sidebar-link-icon" aria-hidden="true">
        <SidebarGlyph icon={icon} />
      </span>
      <span className="sidebar-link-label">{label}</span>
    </Link>
  );
}

function SidebarLinkGroup({
  title,
  links,
  collapsed,
  pathname,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string; icon: string }>;
  collapsed: boolean;
  pathname: string;
}) {
  return (
    <section className="sidebar-section">
      <p className="sidebar-section-title">{title}</p>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <SidebarNavLink
            key={link.href + link.label}
            href={link.href}
            label={link.label}
            icon={link.icon}
            collapsed={collapsed}
            pathname={pathname}
          />
        ))}
      </nav>
    </section>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <div className="sidebar-shell">
        <aside className={`sidebar${sidebarCollapsed ? " is-collapsed" : ""}`}>
          <div className="sidebar-scroll">
            <SidebarLinkGroup
              title="Primary"
              links={primarySidebarLinks}
              collapsed={sidebarCollapsed}
              pathname={pathname}
            />
            <SidebarLinkGroup
              title="Build Lanes"
              links={laneSidebarLinks}
              collapsed={sidebarCollapsed}
              pathname={pathname}
            />
            <SidebarLinkGroup
              title="Library"
              links={librarySidebarLinks}
              collapsed={sidebarCollapsed}
              pathname={pathname}
            />
            <section className="sidebar-note">
              <p className="eyebrow">V1 Scope</p>
              <strong>Prints, sheet metal, and source CAD first.</strong>
              <p>PCB boards, fixtures, and smarter AI-assisted search can layer in next.</p>
            </section>
          </div>
          <div className="sidebar-footer">
            <div className="sidebar-footer-block">
              <p className="sidebar-section-title sidebar-footer-title">Account</p>
              <SidebarNavLink
                href="/login"
                label="Login"
                icon="login"
                collapsed={sidebarCollapsed}
                pathname={pathname}
                footer
              />
            </div>
            <button
              type="button"
              className="sidebar-collapse-toggle"
              onClick={() => setSidebarCollapsed((current) => !current)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                <SidebarGlyph icon="collapse" collapsed={sidebarCollapsed} />
              </span>
              <span className="sidebar-collapse-label">
                {sidebarCollapsed ? "Expand" : "Collapse"}
              </span>
            </button>
          </div>
        </aside>
      </div>
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
                  {mobileNavLinks.map((link) => (
                    <Link key={`mobile-${link.href}-${link.label}`} href={link.href} className="mobile-nav-link">
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
