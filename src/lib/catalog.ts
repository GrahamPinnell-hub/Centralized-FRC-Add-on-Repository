export type Creator = {
  handle: string;
  displayName: string;
  teamName: string;
  teamNumber: string;
  location: string;
  bio: string;
};

export type CatalogFile = {
  label: string;
  fileType: "STL" | "STEP" | "3MF" | "DXF" | "ZIP" | "SOURCE";
  href: string;
  note: string;
};

export type MediaSurfaceFit = "cover" | "contain";

export type MediaFraming = {
  position?: string;
  fit?: MediaSurfaceFit;
  zoom?: number;
  cardPosition?: string;
  cardFit?: MediaSurfaceFit;
  cardZoom?: number;
  detailPosition?: string;
  detailFit?: MediaSurfaceFit;
  detailZoom?: number;
  thumbPosition?: string;
  thumbFit?: MediaSurfaceFit;
  thumbZoom?: number;
  galleryPosition?: string;
  galleryFit?: MediaSurfaceFit;
  galleryZoom?: number;
  lightboxPosition?: string;
  lightboxFit?: MediaSurfaceFit;
  lightboxZoom?: number;
};

export type MediaCard = {
  kind: "image" | "video";
  title: string;
  note: string;
  accent: string;
  src?: string;
  framing?: MediaFraming;
};

export type PartVersion = {
  label: string;
  date: string;
  summary: string;
};

export type CatalogPart = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  categoryLabel: string;
  subsystem: string;
  creatorHandle: string;
  featured: boolean;
  materials: string[];
  vendors: string[];
  products: string[];
  seasons: string[];
  tags: string[];
  license: string;
  rating: number;
  views: number;
  downloads: number;
  uploadedAgo: string;
  validated?: boolean;
  files: CatalogFile[];
  media: MediaCard[];
  versions: PartVersion[];
  printProfile?: {
    material: string;
    nozzle: string;
    layerHeight: string;
    infill: string;
    supports: string;
    notes: string;
  };
  installNotes: string[];
  viewerNote: string;
  remixedFrom?: string;
  publishedAt: string;
  updatedAt: string;
};

export type SearchFilters = {
  q?: string;
  category?: string;
  vendor?: string;
  creator?: string;
  season?: string;
  fileType?: string;
  material?: string;
  sort?: "trending" | "latest" | "rating" | "downloads";
};

export const categoryDefinitions = [
  {
    slug: "swerve-covers",
    label: "Swerve Covers",
    description: "Guards, wire covers, encoder shields, and service-friendly drivetrain accessories."
  },
  {
    slug: "vision-mounts",
    label: "Vision Mounts",
    description: "Limelight, PhotonVision, and multi-camera brackets built for real robot packaging."
  },
  {
    slug: "electronics-mounts",
    label: "Electronics Mounts",
    description: "Radio, PDH, CANivore, sensor board, and bellypan mounting hardware."
  },
  {
    slug: "battery-hardware",
    label: "Battery Hardware",
    description: "Battery retainers, pull handles, trays, and service accessories."
  },
  {
    slug: "driver-station",
    label: "Driver Station",
    description: "Controller trays, cable organizers, labels, and field-side workflow helpers."
  },
  {
    slug: "pit-tools",
    label: "Pit Tools",
    description: "Bearing checkers, robot hooks, medals, and team-side accessories used around the pit."
  },
  {
    slug: "mechanism-components",
    label: "Mechanism Components",
    description: "Reusable wheels, rollers, and printed mechanism components teams can adapt quickly."
  }
] as const;

export const creators: Creator[] = [
  {
    handle: "team-31",
    displayName: "Team 31 Resource Library",
    teamName: "Prime Movers",
    teamNumber: "31",
    location: "Carthage, MO",
    bio: "Serviceable robot accessories focused on drivetrain packaging, cable management, and parts students can print quickly between events."
  },
  {
    handle: "team-1778",
    displayName: "Team 1778 Add-ons",
    teamName: "Chill Out",
    teamNumber: "1778",
    location: "Pomona, CA",
    bio: "Design system-minded mounting and integration parts that fit into clean CAD workflows and repeated manufacturing."
  },
  {
    handle: "team-6328",
    displayName: "Team 6328 Hardware Share",
    teamName: "Mechanical Advantage",
    teamNumber: "6328",
    location: "Littleton, MA",
    bio: "Compact electronics packaging and iteration-heavy robot support parts with a bias toward practical documentation."
  },
  {
    handle: "team-5940",
    displayName: "Team 5940 Tooling",
    teamName: "BREAD",
    teamNumber: "5940",
    location: "Westford, MA",
    bio: "Driver station and service tools with a focus on fast pit use, visual clarity, and durable prints."
  },
  {
    handle: "printables-imports",
    displayName: "Printables Imports",
    teamName: "Printables Imports",
    teamNumber: "0",
    location: "Community Library, Online",
    bio: "Community listings imported into the beta catalog from public Printables pages so teams can discover them alongside team-hosted add-ons."
  },
  {
    handle: "black-unicorns-5135",
    displayName: "Black Unicorns 5135",
    teamName: "Black Unicorns 5135",
    teamNumber: "5135",
    location: "Community Library, Online",
    bio: "Imported community author profile used for beta-only Printables examples."
  },
  {
    handle: "shyavans",
    displayName: "ShyavanS",
    teamName: "ShyavanS",
    teamNumber: "0",
    location: "Community Library, Online",
    bio: "Imported community author profile used for beta-only Printables examples."
  },
  {
    handle: "shadowtigerus",
    displayName: "ShadowTigerus",
    teamName: "ShadowTigerus",
    teamNumber: "0",
    location: "Community Library, Online",
    bio: "Imported community author profile used for beta-only Printables examples."
  },
  {
    handle: "arimb",
    displayName: "AriMB",
    teamName: "AriMB",
    teamNumber: "0",
    location: "Community Library, Online",
    bio: "Imported community author profile used for beta-only Printables examples."
  }
];

export const categorySlugs = categoryDefinitions.map((category) => category.slug);
export const creatorHandles = creators.map((creator) => creator.handle);

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function filterPartsList(
  partList: CatalogPart[],
  creatorList: Creator[],
  filters: SearchFilters
) {
  const query = normalize(filters.q ?? "");

  return partList.filter((part) => {
    const creator = creatorList.find((candidate) => candidate.handle === part.creatorHandle);
    const haystack = [
      part.title,
      part.summary,
      part.subsystem,
      part.categoryLabel,
      part.tags.join(" "),
      part.vendors.join(" "),
      part.products.join(" "),
      part.seasons.join(" "),
      creator?.displayName ?? "",
      creator?.teamName ?? "",
      creator?.teamNumber ?? ""
    ]
      .join(" ")
      .toLowerCase();

    const queryMatch = !query || haystack.includes(query);
    const categoryMatch = !filters.category || part.category === filters.category;
    const vendorMatch = !filters.vendor || part.vendors.includes(filters.vendor);
    const creatorMatch = !filters.creator || part.creatorHandle === filters.creator;
    const seasonMatch = !filters.season || part.seasons.includes(filters.season);
    const materialMatch = !filters.material || part.materials.includes(filters.material);
    const fileTypeMatch = !filters.fileType || part.files.some((file) => file.fileType === filters.fileType);

    return (
      queryMatch &&
      categoryMatch &&
      vendorMatch &&
      creatorMatch &&
      seasonMatch &&
      materialMatch &&
      fileTypeMatch
    );
  });
}

export function sortPartsList(
  partList: CatalogPart[],
  sort: SearchFilters["sort"] = "trending"
) {
  const next = [...partList];

  switch (sort) {
    case "latest":
      return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "rating":
      return next.sort(
        (a, b) => b.rating - a.rating || b.downloads - a.downloads || b.views - a.views
      );
    case "downloads":
      return next.sort((a, b) => b.downloads - a.downloads || b.views - a.views);
    case "trending":
    default:
      return next.sort(
        (a, b) =>
          Number(Boolean(b.validated)) - Number(Boolean(a.validated)) ||
          b.downloads - a.downloads ||
          b.views - a.views ||
          b.rating - a.rating
      );
  }
}
