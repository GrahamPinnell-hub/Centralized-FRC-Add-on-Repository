"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

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
  { href: "/parts?sort=downloads", label: "Downloads", icon: "downloads" }
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

type FooterLinkItem = {
  href: string;
  label: string;
  external?: boolean;
};

const sourceCodeUrl = "https://github.com/GrahamPinnell-hub/Centralized-FRC-Add-on-Repository";

const footerGroups: Array<{ title: string; links: FooterLinkItem[] }> = [
  {
    title: "Browse",
    links: [
      { href: "/parts?sort=latest", label: "Latest Listings" },
      { href: "/parts", label: "Explore" },
      { href: "/categories/swerve-covers", label: "Categories" },
      { href: "/parts?sort=trending", label: "Trending" }
    ]
  },
  {
    title: "Community",
    links: [
      { href: "/u/team-31", label: "Team Libraries" },
      { href: "/parts?sort=latest", label: "Fresh Uploads" },
      { href: "/upload", label: "Upload" },
      { href: "/language", label: "Language" }
    ]
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/dmca", label: "DMCA" },
      { href: "/legal/rules", label: "Rules" }
    ]
  },
  {
    title: "Developers",
    links: [
      { href: "/developers/api-docs", label: "API Docs" },
      { href: sourceCodeUrl, label: "Source Code", external: true }
    ]
  }
];

const footerSocialLinks: Array<FooterLinkItem & { icon: string }> = [
  { href: sourceCodeUrl, label: "GitHub", icon: "github", external: true },
  { href: "/upload", label: "Upload", icon: "upload" },
  { href: "/parts?sort=latest", label: "Latest", icon: "latest" }
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

  if (icon === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 4.3c-4.2 0-7.7 3.4-7.7 7.7 0 3.4 2.2 6.2 5.2 7.2.4.1.5-.2.5-.4v-1.6c-2.1.5-2.6-.9-2.6-.9-.4-.9-.9-1.1-.9-1.1-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.8 1.3 2 1 2.5.8.1-.6.3-1 .6-1.2-1.7-.2-3.5-.8-3.5-3.8 0-.8.3-1.5.8-2-.1-.2-.4-1 .1-2.1 0 0 .6-.2 2.1.8a7 7 0 0 1 3.8 0c1.4-1 2.1-.8 2.1-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.2.8 2 0 2.9-1.8 3.6-3.5 3.8.3.3.6.8.6 1.5V19c0 .2.1.5.5.4 3-1 5.2-3.8 5.2-7.2 0-4.3-3.4-7.7-7.7-7.7Z"
          fill="currentColor"
        />
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

function FooterLink({ href, label, external = false }: FooterLinkItem) {
  if (external) {
    return (
      <a href={href} className="footer-link" target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className="footer-link">
      {label}
    </Link>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);
  const languageMenuRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    setIsLanguageMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLanguageMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLanguageMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isLanguageMenuOpen]);

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newsletterEmail.trim()) {
      setNewsletterMessage("Enter an email to save newsletter interest.");
      return;
    }

    setNewsletterMessage(
      "Newsletter delivery is not connected yet. Your interest has been saved in this browser."
    );
    setNewsletterEmail("");
  }

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
              <p className="eyebrow">Repository Focus</p>
              <strong>Prints, sheet metal, and source CAD first.</strong>
              <p>Boards, code, and richer search can expand from the same listing structure later.</p>
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
                  <p className="eyebrow">Repository Focus</p>
                  <strong>Prints, sheet metal, and source CAD first.</strong>
                  <p>Boards, code, and richer search can expand from the same listing structure later.</p>
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
                <small>robot accessories, fabrication files, and reusable hardware</small>
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
                onClick={() => setIsLanguageMenuOpen(false)}
              >
                {action.icon ? <span className={`action-icon action-icon-${action.icon}`} aria-hidden="true" /> : null}
                <span className="action-label">{action.label}</span>
              </Link>
            ))}
            <details
              ref={languageMenuRef}
              className="language-menu action-language-menu"
              open={isLanguageMenuOpen}
            >
              <summary
                className="action-link action-language language-toggle icon-only"
                aria-label="Language options"
                onClick={(event) => {
                  event.preventDefault();
                  setIsLanguageMenuOpen((current) => !current);
                }}
              >
                <span className="action-icon action-icon-language" aria-hidden="true" />
                <span className="action-label">Language</span>
              </summary>
              <div className="language-panel">
                {languageOptions.map((language) => (
                  <button
                    key={language}
                    type="button"
                    className="language-option"
                    onClick={() => setIsLanguageMenuOpen(false)}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </details>
            <Link
              href="/login"
              className={`action-link ${actionClassName("Login")} primary`}
              aria-label="Login"
              onClick={() => setIsLanguageMenuOpen(false)}
            >
              <span className="action-label">Login</span>
            </Link>
          </nav>
        </header>
        <main className="content-shell page-stack">{children}</main>
        <footer className="footer">
          <div className="footer-main">
            <section className="footer-brand-column">
              <Link href="/" className="footer-brand-logo">
                <span className="brand-mark footer-brand-mark">FRC</span>
                <span className="footer-brand-wordmark">Centralized Add-on Repository</span>
              </Link>
              <p className="footer-lede">
                Centralized FRC Add-on Repository. Download and share community-built mounts,
                prints, sheet metal, and reusable robot hardware.
              </p>
              <div className="footer-social">
                {footerSocialLinks.map((link) =>
                  link.external ? (
                    <a
                      key={`${link.href}-${link.label}`}
                      href={link.href}
                      className="footer-social-link"
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                      title={link.label}
                    >
                      <SidebarGlyph icon={link.icon} />
                    </a>
                  ) : (
                    <Link
                      key={`${link.href}-${link.label}`}
                      href={link.href}
                      className="footer-social-link"
                      aria-label={link.label}
                      title={link.label}
                    >
                      <SidebarGlyph icon={link.icon} />
                    </Link>
                  )
                )}
              </div>
              <section className="footer-newsletter">
                <p className="footer-section-title">Newsletter</p>
                <p>Get trending add-ons and fresh uploads in your inbox.</p>
                <form className="footer-newsletter-form" onSubmit={submitNewsletter}>
                  <input
                    type="email"
                    placeholder="Your email"
                    value={newsletterEmail}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                  />
                  <button type="submit">Subscribe</button>
                </form>
                {newsletterMessage ? (
                  <p className="footer-newsletter-note">{newsletterMessage}</p>
                ) : null}
              </section>
            </section>

            <div className="footer-links-grid">
              {footerGroups.map((group) => (
                <section key={group.title} className="footer-group">
                  <p className="footer-section-title">{group.title}</p>
                  <nav className="footer-link-list">
                    {group.links.map((link) => (
                      <FooterLink
                        key={`${group.title}-${link.href}-${link.label}`}
                        href={link.href}
                        label={link.label}
                        external={link.external}
                      />
                    ))}
                  </nav>
                </section>
              ))}
            </div>
          </div>

          <div className="footer-bottom">
            <p>Copyright {"\u00a9"} 2026 Centralized FRC Add-on Repository. All rights reserved.</p>
            <p>
              Not affiliated with FIRST or official FRC vendors. Content is community submitted and
              maintained by teams.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
