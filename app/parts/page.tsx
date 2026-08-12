import { Suspense } from "react";

import { PartsBrowserClient } from "@/components/parts-browser-client";
import { PartsBrowser } from "@/components/parts-browser";
import { countLabels, creatorDisplayLabel, topTeamsByParts } from "@/lib/discovery";
import { getAllPartsData, getCreatorsData, getSearchOptionsData } from "@/lib/repository";

const quickSearches = [
  { href: "/parts?q=mk4i+swerve+cover", label: "MK4i swerve cover" },
  { href: "/parts?q=limelight+mount", label: "Limelight mount" },
  { href: "/parts?q=radio+mount", label: "Radio mount" },
  { href: "/parts?q=driver+station", label: "Driver station" },
  { href: "/parts?q=wire+management", label: "Wire management" },
  { href: "/parts?fileType=DXF", label: "DXF sheet metal" }
] as const;

export default async function PartsPage() {
  const [options, parts, creators] = await Promise.all([
    getSearchOptionsData(),
    getAllPartsData(),
    getCreatorsData()
  ]);
  const popularTags = countLabels(parts.flatMap((part) => part.tags), 6);
  const activeTeams = topTeamsByParts(creators, parts, 4).map((entry) => ({
    handle: entry.creator.handle,
    label: creatorDisplayLabel(entry.creator),
    count: entry.count
  }));
  const fileTypes = countLabels(parts.flatMap((part) => part.files.map((file) => file.fileType)), 5);
  const browseData = {
    quickSearches: [...quickSearches],
    popularTags,
    activeTeams,
    fileTypes
  };

  return (
    <>
      <Suspense
        fallback={
          <PartsBrowser
            browseData={browseData}
            filters={{}}
            options={options}
            creators={creators}
            results={parts}
          />
        }
      >
        <PartsBrowserClient browseData={browseData} options={options} parts={parts} creators={creators} />
      </Suspense>
    </>
  );
}
