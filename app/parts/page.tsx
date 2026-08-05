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
        body="Search like a builder, not like a librarian. This pass adds team filtering, stronger sort states, and a cleaner results page for finding the exact part lane faster."
      />
      <Suspense fallback={<PartsBrowser filters={{}} options={options} creators={creators} results={parts} />}>
        <PartsBrowserClient options={options} parts={parts} creators={creators} />
      </Suspense>
    </>
  );
}
