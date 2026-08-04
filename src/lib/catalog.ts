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

export type MediaCard = {
  kind: "image" | "video";
  title: string;
  note: string;
  accent: string;
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
  season?: string;
  fileType?: string;
  material?: string;
};

const categoryMeta = [
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
  }
];

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
  }
];

export const parts: CatalogPart[] = [
  {
    slug: "team-31-mk4i-wire-cover",
    title: "MK4i Swerve Wire Cover",
    summary: "A snap-on cover for SDS MK4i modules that shields motor and encoder leads without blocking fast maintenance access.",
    category: "swerve-covers",
    categoryLabel: "Swerve Covers",
    subsystem: "Drivetrain",
    creatorHandle: "team-31",
    featured: true,
    materials: ["PETG", "ABS"],
    vendors: ["SDS"],
    products: ["MK4i"],
    seasons: ["2025", "2026"],
    tags: ["swerve", "wire management", "encoder guard", "service access"],
    license: "CC BY-NC 4.0",
    rating: 4.9,
    views: 1642,
    downloads: 418,
    uploadedAgo: "14 days ago",
    validated: true,
    files: [
      { label: "Print-ready body", fileType: "STL", href: "#", note: "Primary printable geometry for fast pit replacements." },
      { label: "High-strength profile", fileType: "3MF", href: "#", note: "Tuned slicer profile with support blockers and wall count notes." },
      { label: "Master CAD export", fileType: "STEP", href: "#", note: "For editing around alternate motor routing or standoff spacing." },
      { label: "Onshape source", fileType: "SOURCE", href: "https://cad.onshape.com/", note: "Reference slot for the editable source document." }
    ],
    media: [
      { kind: "image", title: "Installed on a module", note: "Shows cable path clearance around the top plate and wheel guard.", accent: "#f97316" },
      { kind: "image", title: "Pit service angle", note: "Demonstrates how the cover can be removed without disturbing the module.", accent: "#14b8a6" },
      { kind: "video", title: "Quick install clip", note: "Thirty-second install video placeholder for the listing page.", accent: "#22c55e" }
    ],
    versions: [
      { label: "v1.2", date: "2026-07-21", summary: "Opened up clearance for bolt heads and added a cable relief notch." },
      { label: "v1.0", date: "2026-05-18", summary: "Initial release used on the 2026 offseason drivetrain." }
    ],
    printProfile: {
      material: "PETG or ABS",
      nozzle: "0.4 mm",
      layerHeight: "0.24 mm",
      infill: "35%",
      supports: "Only for cable clip overhang",
      notes: "Four walls recommended. Print face-down for cleaner outer surfaces."
    },
    installNotes: [
      "Snaps around the module top plate without needing new hardware.",
      "Clearances assume standard MK4i hardware stack and low-profile zip tie heads.",
      "Best fit comes from slightly deburring the cable slot after printing."
    ],
    viewerNote: "Viewer shell is meant for STL, 3MF, or STEP previews once local asset uploads are wired in.",
    publishedAt: "2026-05-18",
    updatedAt: "2026-07-21"
  },
  {
    slug: "limelight-4-universal-mount",
    title: "Limelight 4 Universal Mount",
    summary: "An angled front-rail mount for Limelight 4 with slotted adjustment for quick camera swaps and shooter tuning.",
    category: "vision-mounts",
    categoryLabel: "Vision Mounts",
    subsystem: "Vision",
    creatorHandle: "team-1778",
    featured: true,
    materials: ["ASA", "PETG"],
    vendors: ["Limelight"],
    products: ["Limelight 4"],
    seasons: ["2026", "General"],
    tags: ["vision", "limelight", "adjustable mount"],
    license: "CERN-OHL-S",
    rating: 4.8,
    views: 1285,
    downloads: 366,
    uploadedAgo: "23 days ago",
    validated: true,
    files: [
      { label: "Bracket body", fileType: "STL", href: "#", note: "Main printable body for rapid prototyping and fit checks." },
      { label: "Assembly reference", fileType: "STEP", href: "#", note: "Used for checking bumper cutouts and rail interference." },
      { label: "CAD source", fileType: "SOURCE", href: "https://cad.onshape.com/", note: "Reference slot for editable source geometry." }
    ],
    media: [
      { kind: "image", title: "Mount at intake edge", note: "A front rail camera placement intended for wide field-of-view use.", accent: "#0f766e" },
      { kind: "image", title: "Slot adjustment detail", note: "Shows the angle slot and screw capture geometry.", accent: "#f59e0b" }
    ],
    versions: [
      { label: "v2.0", date: "2026-06-30", summary: "Expanded angle slot range and improved nut trap retention." }
    ],
    printProfile: {
      material: "ASA preferred",
      nozzle: "0.4 mm",
      layerHeight: "0.2 mm",
      infill: "30%",
      supports: "No",
      notes: "Use heat-set inserts if the camera will be moved often."
    },
    installNotes: [
      "Pairs with 1/16 in polycarbonate backup plate for impacts.",
      "Use nylock nuts on the adjustment slot if mounting near intake vibration."
    ],
    viewerNote: "Preview panel should support STL now and STEP after the richer 3D pipeline is added.",
    publishedAt: "2026-06-12",
    updatedAt: "2026-06-30"
  },
  {
    slug: "radio-pdh-sheet-metal-tray",
    title: "Radio + PDH Sheet Metal Tray",
    summary: "A bent-sheet electronics tray sized for radio, PDH, and CANivore packaging on a compact bellypan without a separate printed bracket stack.",
    category: "electronics-mounts",
    categoryLabel: "Electronics Mounts",
    subsystem: "Electrical",
    creatorHandle: "team-6328",
    featured: true,
    materials: ["5052 Aluminum"],
    vendors: ["REV", "CTR"],
    products: ["PDH", "CANivore", "Radio"],
    seasons: ["2026", "General"],
    tags: ["sheet metal", "electronics", "bellypan", "dxf"],
    license: "CC BY 4.0",
    rating: 5.0,
    views: 1118,
    downloads: 297,
    uploadedAgo: "18 days ago",
    validated: true,
    files: [
      { label: "Flat pattern", fileType: "DXF", href: "#", note: "Primary manufacturing output for sheet metal sponsors or in-house waterjet." },
      { label: "Assembly CAD", fileType: "STEP", href: "#", note: "Reference for packaging and cable routing in robot CAD." },
      { label: "Fabrication bundle", fileType: "ZIP", href: "#", note: "Contains bend notes, hole callouts, and sponsor-facing fabrication instructions." }
    ],
    media: [
      { kind: "image", title: "Flat pattern overview", note: "Tab structure and bend callouts are placed for easy sponsor communication.", accent: "#38bdf8" },
      { kind: "image", title: "Installed tray", note: "Shows compact electronics packaging with service loops and radio airflow.", accent: "#0ea5e9" }
    ],
    versions: [
      { label: "v1.1", date: "2026-07-05", summary: "Moved radio holes for stronger antenna clearance and better cable exits." }
    ],
    installNotes: [
      "Assumes 0.090 in 5052 with two side bends and PEM nut hardware.",
      "Leave 0.25 in clearance around radio ports if you plan to add strain relief clips later."
    ],
    viewerNote: "The first DXF preview can be a 2D plate view, with 3D folded preview added later.",
    publishedAt: "2026-06-28",
    updatedAt: "2026-07-05"
  },
  {
    slug: "battery-retainer-pull-tab",
    title: "Battery Retainer With Pull Tab",
    summary: "A simple battery retainer and quick-pull tab combo that keeps batteries planted while making swap speed more consistent in the pit.",
    category: "battery-hardware",
    categoryLabel: "Battery Hardware",
    subsystem: "Electrical",
    creatorHandle: "team-5940",
    featured: false,
    materials: ["PETG", "Nylon"],
    vendors: ["AndyMark"],
    products: ["FRC Battery"],
    seasons: ["2025", "2026", "General"],
    tags: ["battery", "retainer", "pit workflow"],
    license: "MIT",
    rating: 4.7,
    views: 907,
    downloads: 254,
    uploadedAgo: "35 days ago",
    files: [
      { label: "Retainer body", fileType: "STL", href: "#", note: "Primary printable retainer component." },
      { label: "Pit-ready profile", fileType: "3MF", href: "#", note: "Slicer profile tuned for stronger pull-tab layers." },
      { label: "CAD reference", fileType: "STEP", href: "#", note: "Editable geometry for custom frame rail spacing." }
    ],
    media: [
      { kind: "image", title: "Battery in frame", note: "Shows how the pull tab remains reachable with bumper brackets nearby.", accent: "#f43f5e" },
      { kind: "video", title: "Swap sequence", note: "Short clip placeholder showing the battery removal motion.", accent: "#fb7185" }
    ],
    versions: [
      { label: "v1.0", date: "2026-04-22", summary: "Initial release for low-profile battery pockets." }
    ],
    printProfile: {
      material: "Nylon if repeated impacts are expected",
      nozzle: "0.6 mm",
      layerHeight: "0.28 mm",
      infill: "40%",
      supports: "No",
      notes: "Orient the pull tab flat to maximize layer continuity."
    },
    installNotes: [
      "Pairs well with hook-and-loop strap systems for two-step retention.",
      "Leave enough slack for battery lead routing before locking the retainer in place."
    ],
    viewerNote: "Viewer supports the printable body and can later show flex zones or alternate tab lengths.",
    publishedAt: "2026-04-22",
    updatedAt: "2026-04-22"
  },
  {
    slug: "driver-station-cable-tray",
    title: "Driver Station Cable Tray",
    summary: "A low-profile tray for joystick cables, battery leads, and labels that keeps the front edge of the driver station from becoming a cable pile.",
    category: "driver-station",
    categoryLabel: "Driver Station",
    subsystem: "Driver Station",
    creatorHandle: "team-5940",
    featured: false,
    materials: ["PLA+", "PETG"],
    vendors: ["Logitech"],
    products: ["Joystick", "USB Hub"],
    seasons: ["General"],
    tags: ["driver station", "cable management", "labels"],
    license: "CC BY-NC-SA 4.0",
    rating: 4.8,
    views: 1384,
    downloads: 412,
    uploadedAgo: "21 days ago",
    validated: true,
    files: [
      { label: "Tray body", fileType: "STL", href: "#", note: "Main printable tray with cable slots and label strip." },
      { label: "Assembly CAD", fileType: "STEP", href: "#", note: "Reference for matching tray width to your shelf or board." },
      { label: "Source CAD", fileType: "SOURCE", href: "https://cad.onshape.com/", note: "Editable source slot for personalized layouts." }
    ],
    media: [
      { kind: "image", title: "Cable lanes", note: "Shows dedicated routing lanes for USB and charge leads.", accent: "#8b5cf6" },
      { kind: "image", title: "Driver station view", note: "Demonstrates a cleaner front edge during match setup.", accent: "#6366f1" }
    ],
    versions: [
      { label: "v1.3", date: "2026-07-14", summary: "Added larger hub pocket and a removable label insert." }
    ],
    printProfile: {
      material: "PLA+ or PETG",
      nozzle: "0.4 mm",
      layerHeight: "0.2 mm",
      infill: "20%",
      supports: "No",
      notes: "Print in two mirrored halves if your printer bed is narrow."
    },
    installNotes: [
      "Use countersunk wood screws or rivet nuts depending on your driver station frame.",
      "Leave one spare lane for tether or emergency cable reroutes."
    ],
    viewerNote: "This viewer slot can later support alternate tray layouts and driver station accessory kits.",
    publishedAt: "2026-05-11",
    updatedAt: "2026-07-14"
  }
];

export const categorySlugs = categoryMeta.map((category) => category.slug);
export const creatorHandles = creators.map((creator) => creator.handle);
export const partSlugs = parts.map((part) => part.slug);

function normalize(value: string) {
  return value.trim().toLowerCase();
}

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
  return [...parts]
    .sort((a, b) => b.downloads - a.downloads || b.views - a.views)
    .slice(0, 6);
}

export function getLatestParts() {
  return [...parts]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);
}

export function getCatalogStats() {
  return {
    partCount: parts.length,
    creatorCount: creators.length,
    categoryCount: categoryMeta.length,
    supportedTypes: ["STL", "STEP", "3MF", "DXF", "ZIP", "SOURCE"]
  };
}

export function getCategorySummaries() {
  return categoryMeta.map((category) => ({
    ...category,
    count: parts.filter((part) => part.category === category.slug).length
  }));
}

export function getCategory(slug: string) {
  const category = categoryMeta.find((entry) => entry.slug === slug);
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
    categories: categoryMeta.map((category) => ({ slug: category.slug, label: category.label })),
    vendors: [...new Set(parts.flatMap((part) => part.vendors))].sort(),
    seasons: [...new Set(parts.flatMap((part) => part.seasons))].sort(),
    fileTypes: [...new Set(parts.flatMap((part) => part.files.map((file) => file.fileType)))].sort(),
    materials: [...new Set(parts.flatMap((part) => part.materials))].sort()
  };
}

export function filterParts(filters: SearchFilters) {
  const query = normalize(filters.q ?? "");

  return parts.filter((part) => {
    const creator = getCreator(part.creatorHandle);
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
    const seasonMatch = !filters.season || part.seasons.includes(filters.season);
    const materialMatch = !filters.material || part.materials.includes(filters.material);
    const fileTypeMatch = !filters.fileType || part.files.some((file) => file.fileType === filters.fileType);

    return queryMatch && categoryMatch && vendorMatch && seasonMatch && materialMatch && fileTypeMatch;
  });
}
