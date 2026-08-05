import { Suspense } from "react";

import { PartsBrowserClient } from "@/components/parts-browser-client";
import { PartsBrowser } from "@/components/parts-browser";
import { SectionTitle } from "@/components/ui";
import { getAllPartsData, getCreatorsData, getSearchOptionsData } from "@/lib/repository";

export default async function PartsPage() {
  const [options, parts, creators] = await Promise.all([
    getSearchOptionsData(),
    getAllPartsData(),
    getCreatorsData()
  ]);

  return (
    <>
      <SectionTitle
        eyebrow="Search"
        title="Browse reusable FRC add-ons"
        body="Search like a builder, not like a librarian. The approved V1 search already looks across title, summary, team, tag, vendor, product, season, and file type."
      />
      <Suspense fallback={<PartsBrowser filters={{}} options={options} results={parts} />}>
        <PartsBrowserClient options={options} parts={parts} creators={creators} />
      </Suspense>
    </>
  );
}
