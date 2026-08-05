import { cache } from "react";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  type CatalogPart,
  type Creator,
  type SearchFilters,
  creatorHandles,
  creators as staticCreators,
  filterPartsList,
  filterParts as filterStaticParts,
  sortPartsList,
  getCatalogStats as getStaticCatalogStats,
  getCategory as getStaticCategory,
  getCategorySummaries as getStaticCategorySummaries,
  getCreatorProfile as getStaticCreatorProfile,
  getFeaturedParts as getStaticFeaturedParts,
  getLatestParts as getStaticLatestParts,
  getPart as getStaticPart,
  getSearchOptions as getStaticSearchOptions,
  getTrendingParts as getStaticTrendingParts,
  parts as staticParts
} from "@/lib/catalog";

const databasePartInclude = {
  category: true,
  license: true,
  ownerTeam: true,
  ownerUser: true,
  versions: {
    orderBy: { createdAt: "desc" as const }
  },
  assets: {
    orderBy: [{ position: "asc" as const }, { createdAt: "asc" as const }]
  },
  tags: {
    include: { tag: true }
  },
  vendors: {
    include: { vendor: true }
  },
  products: {
    include: {
      product: {
        include: { vendor: true }
      }
    }
  },
  seasons: {
    include: { season: true }
  }
} satisfies Prisma.PartInclude;

type DatabasePart = Prisma.PartGetPayload<{
  include: typeof databasePartInclude;
}>;

type DatabaseState = {
  categories: Awaited<ReturnType<typeof prisma.category.findMany>>;
  creators: Creator[];
  parts: CatalogPart[];
};

function parseJsonArray(value: string | null | undefined) {
  if (!value) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseJsonObject<T>(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function formatUploadedAgo(date: Date) {
  const now = new Date();
  const diff = Math.max(0, now.getTime() - date.getTime());
  const days = Math.floor(diff / 86_400_000);

  if (days <= 0) {
    return "today";
  }

  if (days === 1) {
    return "1 day ago";
  }

  return `${days} days ago`;
}

function toCreator(team: {
  slug: string;
  name: string;
  number: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  bio: string | null;
  shortName: string | null;
}): Creator {
  const locationParts = [team.city, team.state, team.country].filter(Boolean);

  return {
    handle: team.slug,
    displayName: team.shortName ?? (team.number ? `Team ${team.number} ${team.name}` : team.name),
    teamName: team.name,
    teamNumber: team.number ? String(team.number) : team.slug,
    location: locationParts.length > 0 ? locationParts.join(", ") : "Unknown",
    bio: team.bio ?? "Community-maintained team library."
  };
}

function toCatalogPart(part: DatabasePart): CatalogPart {
  const creatorHandle = part.ownerTeam?.slug ?? part.ownerUser?.handle ?? "community";
  const materials = parseJsonArray(part.materialsJson);
  const installNotes = parseJsonArray(part.installNotesJson);
  const printProfile = parseJsonObject<CatalogPart["printProfile"]>(part.printProfileJson);

  return {
    slug: part.slug,
    title: part.title,
    summary: part.summary,
    category: part.category.slug,
    categoryLabel: part.category.label,
    subsystem: part.subsystem,
    creatorHandle,
    featured: part.featured,
    materials: materials.length > 0 ? materials : part.material ? [part.material] : [],
    vendors: part.vendors.map((vendor) => vendor.vendor.name),
    products: part.products.map((product) => product.product.name),
    seasons: part.seasons.map((season) => season.season.label),
    tags: part.tags.map((tag) => tag.tag.label),
    license: part.license.name,
    rating: part.rating,
    views: part.views,
    downloads: part.downloads,
    uploadedAgo: formatUploadedAgo(part.createdAt),
    validated: part.validated,
    files: part.assets
      .filter((asset) => asset.kind === "DOWNLOAD" || asset.kind === "SOURCE_LINK")
      .map((asset) => ({
        label: asset.label,
        fileType: asset.fileType as CatalogPart["files"][number]["fileType"],
        href: asset.url,
        note: asset.description ?? asset.label
      })),
    media: part.assets
      .filter((asset) => asset.kind === "IMAGE" || asset.kind === "VIDEO")
      .map((asset) => ({
        kind: asset.kind === "VIDEO" ? "video" : "image",
        title: asset.label,
        note: asset.description ?? asset.label,
        accent: "#d0a458",
        src: asset.previewUrl ?? asset.url
      })),
    versions: part.versions.map((version) => ({
      label: version.versionLabel,
      date: version.createdAt.toISOString().slice(0, 10),
      summary: version.changelog
    })),
    printProfile,
    installNotes: installNotes.length > 0 ? installNotes : part.installNotes ? [part.installNotes] : [],
    viewerNote: part.viewerNote ?? "Viewer shell is ready for richer 3D preview once uploads move to live storage.",
    remixedFrom: undefined,
    publishedAt: part.createdAt.toISOString().slice(0, 10),
    updatedAt: part.updatedAt.toISOString().slice(0, 10)
  };
}

const getDatabaseState = cache(async (): Promise<DatabaseState | null> => {
  try {
    const [categories, teams, parts] = await Promise.all([
      prisma.category.findMany({
        orderBy: { label: "asc" }
      }),
      prisma.team.findMany({
        where: {
          parts: {
            some: {}
          }
        },
        orderBy: [{ number: "asc" }, { name: "asc" }]
      }),
      prisma.part.findMany({
        where: {
          status: "PUBLISHED"
        },
        include: databasePartInclude,
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }]
      })
    ]);

    return {
      categories,
      creators: teams.map(toCreator),
      parts: parts.map(toCatalogPart)
    };
  } catch {
    return null;
  }
});

async function getState() {
  return (await getDatabaseState()) ?? null;
}

function getFallbackCreatorHandles() {
  return creatorHandles;
}

export async function getPartSlugsData() {
  const state = await getState();
  return state ? state.parts.map((part) => part.slug) : staticParts.map((part) => part.slug);
}

export async function getCategorySlugsData() {
  const state = await getState();
  return state ? state.categories.map((category) => category.slug) : getStaticCategorySummaries().map((category) => category.slug);
}

export async function getCreatorHandlesData() {
  const state = await getState();
  return state ? state.creators.map((creator) => creator.handle) : getFallbackCreatorHandles();
}

export async function getCreatorsData() {
  const state = await getState();
  return state ? state.creators : staticCreators;
}

export async function getAllPartsData() {
  const state = await getState();
  return state ? state.parts : staticParts;
}

export async function getCatalogStatsData() {
  const state = await getState();

  if (!state) {
    return getStaticCatalogStats();
  }

  return {
    partCount: state.parts.length,
    creatorCount: state.creators.length,
    categoryCount: state.categories.length,
    supportedTypes: [...new Set(state.parts.flatMap((part) => part.files.map((file) => file.fileType)))].sort()
  };
}

export async function getCategorySummariesData() {
  const state = await getState();

  if (!state) {
    return getStaticCategorySummaries();
  }

  return state.categories.map((category) => ({
    slug: category.slug,
    label: category.label,
    description: category.description,
    count: state.parts.filter((part) => part.category === category.slug).length
  }));
}

export async function getTrendingPartsData() {
  const state = await getState();

  if (!state) {
    return getStaticTrendingParts();
  }

  return [...state.parts]
    .sort((a, b) => b.downloads - a.downloads || b.views - a.views)
    .slice(0, 6);
}

export async function getLatestPartsData() {
  const state = await getState();

  if (!state) {
    return getStaticLatestParts();
  }

  return [...state.parts]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);
}

export async function getFeaturedPartsData() {
  const state = await getState();

  if (!state) {
    return getStaticFeaturedParts();
  }

  return state.parts.filter((part) => part.featured).slice(0, 3);
}

export async function getSearchOptionsData() {
  const state = await getState();

  if (!state) {
    return getStaticSearchOptions();
  }

  return {
    categories: state.categories.map((category) => ({ slug: category.slug, label: category.label })),
    vendors: [...new Set(state.parts.flatMap((part) => part.vendors))].sort(),
    seasons: [...new Set(state.parts.flatMap((part) => part.seasons))].sort(),
    fileTypes: [...new Set(state.parts.flatMap((part) => part.files.map((file) => file.fileType)))].sort(),
    materials: [...new Set(state.parts.flatMap((part) => part.materials))].sort()
  };
}

export async function filterPartsData(filters: SearchFilters) {
  const state = await getState();

  if (!state) {
    return filterStaticParts(filters);
  }

  return sortPartsList(filterPartsList(state.parts, state.creators, filters), filters.sort);
}

export async function getCategoryData(slug: string) {
  const state = await getState();

  if (!state) {
    return getStaticCategory(slug);
  }

  const category = state.categories.find((entry) => entry.slug === slug);

  if (!category) {
    return null;
  }

  return {
    slug: category.slug,
    label: category.label,
    description: category.description,
    parts: state.parts.filter((part) => part.category === slug)
  };
}

export async function getCreatorProfileData(handle: string) {
  const state = await getState();

  if (!state) {
    return getStaticCreatorProfile(handle);
  }

  const creator = state.creators.find((candidate) => candidate.handle === handle);

  if (!creator) {
    return null;
  }

  return {
    creator,
    parts: state.parts.filter((part) => part.creatorHandle === handle)
  };
}

export async function getPartData(slug: string) {
  const state = await getState();

  if (!state) {
    return getStaticPart(slug) ?? null;
  }

  return state.parts.find((part) => part.slug === slug) ?? null;
}

export async function getRelatedPartsData(slug: string, category: string) {
  const state = await getState();

  if (!state) {
    return staticParts.filter((part) => part.slug !== slug && part.category === category).slice(0, 3);
  }

  return state.parts.filter((part) => part.slug !== slug && part.category === category).slice(0, 3);
}
