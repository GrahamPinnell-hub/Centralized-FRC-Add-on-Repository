import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  categoryDefinitions,
  creators,
  filterPartsList,
  sortPartsList,
  type CatalogPart,
  type Creator,
  type SearchFilters
} from "@/lib/catalog";

export const listingManifestDirectory = join(process.cwd(), "src", "data", "listings");

function readListingManifest(fileName: string) {
  const fullPath = join(listingManifestDirectory, fileName);
  const raw = JSON.parse(readFileSync(fullPath, "utf8")) as CatalogPart;

  if (!raw.slug || !raw.title || !raw.category || !raw.creatorHandle) {
    throw new Error(`Listing manifest ${fileName} is missing required fields.`);
  }

  return raw;
}

function loadListingManifests() {
  const manifests = readdirSync(listingManifestDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right))
    .map(readListingManifest);
  const seenSlugs = new Set<string>();

  for (const manifest of manifests) {
    if (seenSlugs.has(manifest.slug)) {
      throw new Error(`Duplicate listing slug detected in repo manifests: ${manifest.slug}`);
    }

    seenSlugs.add(manifest.slug);
  }

  return manifests;
}

export const parts: CatalogPart[] = loadListingManifests();
export const partSlugs = parts.map((part) => part.slug);

function getCreator(handle: string) {
  return creators.find((creator) => creator.handle === handle);
}

export function getPart(slug: string) {
  return parts.find((part) => part.slug === slug);
}

export function getCreatorProfile(handle: string) {
  const creator = getCreator(handle);

  if (!creator) {
    return null;
  }

  return {
    creator,
    parts: parts.filter((part) => part.creatorHandle === handle)
  };
}

export function getFeaturedParts() {
  return parts.filter((part) => part.featured).slice(0, 3);
}

export function getTrendingParts() {
  return [...parts].sort((a, b) => b.downloads - a.downloads || b.views - a.views);
}

export function getLatestParts() {
  return [...parts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getCatalogStats() {
  return {
    partCount: parts.length,
    creatorCount: creators.length,
    categoryCount: categoryDefinitions.length,
    supportedTypes: ["STL", "STEP", "3MF", "DXF", "ZIP", "SOURCE"]
  };
}

export function getCategorySummaries() {
  return categoryDefinitions.map((category) => ({
    ...category,
    count: parts.filter((part) => part.category === category.slug).length
  }));
}

export function getCategory(slug: string) {
  const category = categoryDefinitions.find((entry) => entry.slug === slug);

  if (!category) {
    return null;
  }

  return {
    ...category,
    parts: parts.filter((part) => part.category === slug)
  };
}

export function getSearchOptions() {
  return {
    categories: categoryDefinitions.map((category) => ({ slug: category.slug, label: category.label })),
    vendors: [...new Set(parts.flatMap((part) => part.vendors))].sort(),
    seasons: [...new Set(parts.flatMap((part) => part.seasons))].sort(),
    fileTypes: [...new Set(parts.flatMap((part) => part.files.map((file) => file.fileType)))].sort(),
    materials: [...new Set(parts.flatMap((part) => part.materials))].sort()
  };
}

export function filterParts(filters: SearchFilters) {
  return sortPartsList(filterPartsList(parts, creators, filters), filters.sort);
}
