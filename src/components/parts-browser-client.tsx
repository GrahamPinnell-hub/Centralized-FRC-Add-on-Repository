"use client";

import { useSearchParams } from "next/navigation";

import { PartsBrowser } from "@/components/parts-browser";
import { filterPartsList, type CatalogPart, type Creator, type SearchFilters } from "@/lib/catalog";

type SearchOptions = {
  categories: { slug: string; label: string }[];
  vendors: string[];
  seasons: string[];
  fileTypes: string[];
  materials: string[];
};

function readFilters(searchParams: URLSearchParams): SearchFilters {
  const value = (key: string) => searchParams.get(key) ?? undefined;

  return {
    q: value("q"),
    category: value("category"),
    vendor: value("vendor"),
    season: value("season"),
    fileType: value("fileType"),
    material: value("material")
  };
}

export function PartsBrowserClient({
  options,
  parts,
  creators
}: {
  options: SearchOptions;
  parts: CatalogPart[];
  creators: Creator[];
}) {
  const searchParams = useSearchParams();
  const filters = readFilters(searchParams);
  const results = filterPartsList(parts, creators, filters);

  return <PartsBrowser filters={filters} options={options} results={results} />;
}
