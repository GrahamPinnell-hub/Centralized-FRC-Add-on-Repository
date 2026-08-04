import { Suspense } from "react";

import { SectionTitle } from "@/components/ui";
import { PartsBrowser } from "@/components/parts-browser";

export default function PartsPage() {

  return (
    <>
      <SectionTitle
        eyebrow="Search"
        title="Browse reusable FRC add-ons"
        body="Search like a builder, not like a librarian. The approved V1 search already looks across title, summary, team, tag, vendor, product, season, and file type."
      />
      <Suspense fallback={<section className="panel">Loading search results...</section>}>
        <PartsBrowser />
      </Suspense>
    </>
  );
}
