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
        body="Filter by team, vendor, file type, material, and season to find the exact part faster."
      />
      <Suspense fallback={<PartsBrowser filters={{}} options={options} creators={creators} results={parts} />}>
        <PartsBrowserClient options={options} parts={parts} creators={creators} />
      </Suspense>
    </>
  );
}
