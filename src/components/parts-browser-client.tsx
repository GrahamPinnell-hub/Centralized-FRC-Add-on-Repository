"use client";

import { useSearchParams } from "next/navigation";

import { PartsBrowser } from "@/components/parts-browser";
import {
  filterPartsList,
  sortPartsList,
  type CatalogPart,
  type Creator,
  type SearchFilters
} from "@/lib/catalog";

type SearchOptions = {
  categories: { slug: string; label: string }[];
  vendors: string[];
  seasons: string[];
  fileTypes: string[];
  materials: string[];
};

type BrowseHeroData = {
  quickSearches: { href: string; label: string }[];
  popularTags: { label: string; count: number }[];
  fileTypes: { label: string; count: number }[];
  activeTeams: { handle: string; label: string; count: number }[];
};

function readFilters(searchParams: URLSearchParams): SearchFilters {
  const value = (key: string) => searchParams.get(key) ?? undefined;

  return {
    q: value("q"),
    category: value("category"),
    vendor: value("vendor"),
    creator: value("creator"),
    season: value("season"),
    fileType: value("fileType"),
    material: value("material"),
    sort: (value("sort") as SearchFilters["sort"]) ?? undefined
  };
}

export function PartsBrowserClient({
  browseData,
  options,
  parts,
  creators
}: {
  browseData: BrowseHeroData;
  options: SearchOptions;
  parts: CatalogPart[];
  creators: Creator[];
}) {
  const searchParams = useSearchParams();
  const filters = readFilters(searchParams);
  const results = sortPartsList(filterPartsList(parts, creators, filters), filters.sort);

  return (
    <PartsBrowser
      browseData={browseData}
      filters={filters}
      options={options}
      creators={creators}
      results={results}
    />
  );
}
