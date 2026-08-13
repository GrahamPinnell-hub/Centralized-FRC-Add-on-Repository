"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { CatalogPart } from "@/lib/catalog";
import { PartCard } from "@/components/ui";

type FeedChip = {
  href: string;
  label: string;
};

type FeedShelfProps = {
  title: string;
  items: CatalogPart[];
  chips?: FeedChip[];
  pageSize: number;
  headingLevel?: 1 | 2;
};

export function FeedShelf({
  title,
  items,
  chips = [],
  pageSize,
  headingLevel = 2
}: FeedShelfProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);

  const pageItems = useMemo(() => {
    const start = currentPage * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  const HeadingTag = headingLevel === 1 ? "h1" : "h2";

  function handleNextPage() {
    setPage((current) => (current + 1) % totalPages);
  }

  return (
    <section className="page-stack feed-section">
      <div className="feed-header">
        <div className="feed-title-row">
          <HeadingTag className="feed-title">
            {title} <span className="feed-arrow" aria-hidden="true">&rarr;</span>
          </HeadingTag>
        </div>
        {totalPages > 1 ? (
          <div className="feed-pager" aria-label={`${title} page controls`}>
            <span className="feed-page-indicator" aria-current="page">
              Page {currentPage + 1} / {totalPages}
            </span>
            <button type="button" className="feed-next-button" onClick={handleNextPage}>
              Next
            </button>
          </div>
        ) : null}
      </div>
      {chips.length > 0 ? (
        <div className="chip-row browse-chip-strip">
          {chips.map((item, index) => (
            <Link key={`${title}-${item.href}`} href={item.href} className={`chip${index === 0 ? " chip-accent" : ""}`}>
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="card-grid listing-grid">
        {pageItems.map((part) => (
          <PartCard key={part.slug} part={part} />
        ))}
      </div>
    </section>
  );
}
