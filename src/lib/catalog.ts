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

const exampleImages = {
  swerveCover: {
    title: "Mk4 Swerve Cover",
    src: "/example-images/mk4-swerve-cover.png"
  },
  cameraMount: {
    title: "FRC Camera Mount",
    src: "/example-images/frc-camera-mount.png"
  },
  radioRslMount: {
    title: "FRC Radio and RSL Mount",
    src: "/example-images/frc-radio-and-rsl-mount.png"
  },
  pulleyGenerator: {
    title: "Pulley generator with hex hole and hub holes support (useful in FRC)",
    src: "/example-images/pulley-generator-support.png"
  },
  intakeWheels: {
    title: "Vectored Intake Wheels for FRC",
    src: "/example-images/vectored-intake-wheels-for-frc.png"
  }
} as const;

export const parts: CatalogPart[] = [
  {
    slug: "team-31-mk4i-wire-cover",
    title: exampleImages.swerveCover.title,
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
      {
        kind: "image",
        title: exampleImages.swerveCover.title,
        note: "Example listing photo for the installed wire cover and its clearance around the module hardware.",
        accent: "#f97316",
        src: exampleImages.swerveCover.src,
        framing: {
          cardFit: "cover",
          cardPosition: "center 54%",
          detailFit: "contain",
          galleryFit: "cover",
          galleryPosition: "center 54%",
          thumbFit: "cover",
          thumbPosition: "center 54%"
        }
      }
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
    title: exampleImages.cameraMount.title,
    summary: "An adjustable robot camera bracket example showing a compact FRC vision mount with simple rail-side hardware.",
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
      {
        kind: "image",
        title: exampleImages.cameraMount.title,
        note: "Example mounted camera photo used for the vision mount listing card and detail page.",
        accent: "#0f766e",
        src: exampleImages.cameraMount.src,
        framing: {
          cardFit: "contain",
          cardPosition: "center 48%",
          detailFit: "contain",
          detailPosition: "center 48%",
          thumbFit: "contain",
          thumbPosition: "center 48%",
          galleryFit: "contain",
          galleryPosition: "center 48%",
          lightboxFit: "contain",
          lightboxPosition: "center 48%"
        }
      }
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
    title: exampleImages.radioRslMount.title,
    summary: "A compact electronics bracket example that keeps a robot radio and status light in one clean, serviceable mount.",
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
      {
        kind: "image",
        title: exampleImages.radioRslMount.title,
        note: "Example mounted electronics photo used in place of the old stock sheet-metal art.",
        accent: "#38bdf8",
        src: exampleImages.radioRslMount.src,
        framing: {
          cardFit: "cover",
          cardPosition: "center 46%",
          detailFit: "contain",
          detailPosition: "center 50%",
          galleryFit: "cover",
          galleryPosition: "center 46%"
        }
      }
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
    title: exampleImages.pulleyGenerator.title,
    summary: "An example drivetrain utility listing showing a configurable pulley generator concept for quick FRC mechanism iteration.",
    category: "battery-hardware",
    categoryLabel: "Battery Hardware",
    subsystem: "Electrical",
    creatorHandle: "team-5940",
    featured: false,
    materials: ["PETG", "Nylon"],
    vendors: ["WCP"],
    products: ["Pulley Generator"],
    seasons: ["2025", "2026", "General"],
    tags: ["pulley", "hex bore", "mechanism", "generator"],
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
      {
        kind: "image",
        title: exampleImages.pulleyGenerator.title,
        note: "Example mechanism screenshot used as the sample image for the pulley-generator listing.",
        accent: "#f43f5e",
        src: exampleImages.pulleyGenerator.src,
        framing: {
          cardFit: "cover",
          cardPosition: "center 50%",
          detailFit: "contain",
          galleryFit: "cover",
          galleryPosition: "center 50%"
        }
      }
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
    title: exampleImages.intakeWheels.title,
    summary: "An example intake-wheel listing showing a vectored roller concept teams can reuse when prototyping FRC intakes.",
    category: "driver-station",
    categoryLabel: "Driver Station",
    subsystem: "Driver Station",
    creatorHandle: "team-5940",
    featured: false,
    materials: ["PLA+", "PETG"],
    vendors: ["AndyMark"],
    products: ["Intake Wheels"],
    seasons: ["General"],
    tags: ["intake", "wheels", "roller", "vectored"],
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
      {
        kind: "image",
        title: exampleImages.intakeWheels.title,
        note: "Example product image used for the sample intake-wheel listing.",
        accent: "#8b5cf6",
        src: exampleImages.intakeWheels.src,
        framing: {
          cardFit: "contain",
          cardPosition: "center 42%",
          cardZoom: 1.02,
          detailFit: "contain",
          detailPosition: "center 44%",
          thumbFit: "contain",
          thumbPosition: "center 44%",
          galleryFit: "contain",
          galleryPosition: "center 44%",
          lightboxFit: "contain",
          lightboxPosition: "center 44%"
        }
      }
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
  },
  {
    slug: "frc-radio-holder-printables",
    title: "FRC Radio holder",
    summary: "Beta import from Printables for a compact FRC radio holder teams can mount on a robot bellypan or electronics panel.",
    category: "electronics-mounts",
    categoryLabel: "Electronics Mounts",
    subsystem: "Electrical",
    creatorHandle: "black-unicorns-5135",
    featured: false,
    materials: ["PETG"],
    vendors: ["Community"],
    products: ["Radio Holder"],
    seasons: ["General"],
    tags: ["radio", "holder", "electronics", "mount", "printables"],
    license: "CC BY-NC 4.0",
    rating: 4.8,
    views: 0,
    downloads: 0,
    uploadedAgo: "Imported from Printables",
    files: [
      {
        label: "Printables download page",
        fileType: "STL",
        href: "https://www.printables.com/model/112526-frc-radio-holder",
        note: "Use the original Printables listing to access the uploaded printable files."
      },
      {
        label: "Original Printables listing",
        fileType: "SOURCE",
        href: "https://www.printables.com/model/112526-frc-radio-holder",
        note: "Reference link back to the original Printables page."
      }
    ],
    media: [],
    versions: [{ label: "beta import", date: "2026-08-13", summary: "Imported into the beta repository from a public Printables listing." }],
    printProfile: {
      material: "PETG",
      nozzle: "0.4 mm",
      layerHeight: "0.2 mm",
      infill: "25%",
      supports: "Check original listing",
      notes: "This beta entry points teams back to the original Printables files and documentation."
    },
    installNotes: [
      "Review the original Printables page for the exact hardware and mounting pattern.",
      "Useful as a starting point for radio packaging on electronics trays or bellypans."
    ],
    viewerNote: "This beta import currently links back to Printables for the downloadable geometry.",
    publishedAt: "2026-08-13",
    updatedAt: "2026-08-13"
  },
  {
    slug: "frc-bearing-checker-printables",
    title: "FRC Bearing Checker",
    summary: "Beta import from Printables for a simple FRC bearing checker that fits pit inspection and quick hardware sorting workflows.",
    category: "pit-tools",
    categoryLabel: "Pit Tools",
    subsystem: "Pit",
    creatorHandle: "printables-imports",
    featured: false,
    materials: ["PLA+"],
    vendors: ["Community"],
    products: ["Bearing Checker"],
    seasons: ["General"],
    tags: ["bearing", "checker", "pit tool", "inspection", "printables"],
    license: "CC BY-NC 4.0",
    rating: 4.8,
    views: 0,
    downloads: 0,
    uploadedAgo: "Imported from Printables",
    files: [
      {
        label: "Printables download page",
        fileType: "STL",
        href: "https://www.printables.com/model/531405-frc-bearing-checker",
        note: "Use the original Printables listing to access the uploaded printable files."
      },
      {
        label: "Original Printables listing",
        fileType: "SOURCE",
        href: "https://www.printables.com/model/531405-frc-bearing-checker",
        note: "Reference link back to the original Printables page."
      }
    ],
    media: [],
    versions: [{ label: "beta import", date: "2026-08-13", summary: "Imported into the beta repository from a public Printables listing." }],
    printProfile: {
      material: "PLA+",
      nozzle: "0.4 mm",
      layerHeight: "0.2 mm",
      infill: "20%",
      supports: "No",
      notes: "Good candidate for fast pit prints and organizer boards."
    },
    installNotes: [
      "Keep it in the pit drawer or inspection cart for quick bearing checks.",
      "Review the original Printables listing for fitment details and supported bearing sizes."
    ],
    viewerNote: "This beta import currently links back to Printables for the downloadable geometry.",
    publishedAt: "2026-08-13",
    updatedAt: "2026-08-13"
  },
  {
    slug: "charged-up-frc-2023-medal-printables",
    title: "Charged Up FRC 2023 Medal",
    summary: "Beta import from Printables for a Charged Up themed FRC medal teams can print as a keepsake, award, or event-side accessory.",
    category: "pit-tools",
    categoryLabel: "Pit Tools",
    subsystem: "Team Accessory",
    creatorHandle: "arimb",
    featured: false,
    materials: ["PLA+"],
    vendors: ["Community"],
    products: ["Team Medal"],
    seasons: ["2023"],
    tags: ["charged up", "medal", "award", "team accessory", "printables"],
    license: "CC BY-NC 4.0",
    rating: 4.7,
    views: 0,
    downloads: 0,
    uploadedAgo: "Imported from Printables",
    files: [
      {
        label: "Printables download page",
        fileType: "STL",
        href: "https://www.printables.com/model/517717-charged-up-frc-2023-medal",
        note: "Use the original Printables listing to access the uploaded printable files."
      },
      {
        label: "Original Printables listing",
        fileType: "SOURCE",
        href: "https://www.printables.com/model/517717-charged-up-frc-2023-medal",
        note: "Reference link back to the original Printables page."
      }
    ],
    media: [],
    versions: [{ label: "beta import", date: "2026-08-13", summary: "Imported into the beta repository from a public Printables listing." }],
    printProfile: {
      material: "PLA+",
      nozzle: "0.4 mm",
      layerHeight: "0.2 mm",
      infill: "15%",
      supports: "Check original listing",
      notes: "Great for fast single-color prints or simple multi-color swaps."
    },
    installNotes: [
      "Good fit for team awards, offseason keepsakes, or event table displays.",
      "Review the original Printables listing for scaling and lanyard-hole details."
    ],
    viewerNote: "This beta import currently links back to Printables for the downloadable geometry.",
    publishedAt: "2026-08-13",
    updatedAt: "2026-08-13"
  },
  {
    slug: "frc-tpu-wheels-printables",
    title: "FRC TPU Wheels",
    summary: "Beta import from Printables for reusable TPU wheels teams can adapt for lightweight rollers, intake prototypes, or compliant wheel experiments.",
    category: "mechanism-components",
    categoryLabel: "Mechanism Components",
    subsystem: "Mechanism",
    creatorHandle: "printables-imports",
    featured: false,
    materials: ["TPU"],
    vendors: ["Community"],
    products: ["TPU Wheels"],
    seasons: ["General"],
    tags: ["tpu", "wheels", "roller", "mechanism", "printables"],
    license: "CC BY-NC 4.0",
    rating: 4.8,
    views: 0,
    downloads: 0,
    uploadedAgo: "Imported from Printables",
    files: [
      {
        label: "Printables download page",
        fileType: "STL",
        href: "https://www.printables.com/model/268121-frc-tpu-wheels",
        note: "Use the original Printables listing to access the uploaded printable files."
      },
      {
        label: "Original Printables listing",
        fileType: "SOURCE",
        href: "https://www.printables.com/model/268121-frc-tpu-wheels",
        note: "Reference link back to the original Printables page."
      }
    ],
    media: [],
    versions: [{ label: "beta import", date: "2026-08-13", summary: "Imported into the beta repository from a public Printables listing." }],
    printProfile: {
      material: "TPU",
      nozzle: "0.4 mm",
      layerHeight: "0.24 mm",
      infill: "100%",
      supports: "No",
      notes: "Review the original listing for shore hardness, hub fit, and wheel sizing guidance."
    },
    installNotes: [
      "Useful as a prototype lane for compliant rollers or lightweight wheel concepts.",
      "Review the original Printables page for bore details and recommended printer setup."
    ],
    viewerNote: "This beta import currently links back to Printables for the downloadable geometry.",
    publishedAt: "2026-08-13",
    updatedAt: "2026-08-13"
  },
  {
    slug: "small-mecanum-wheel-hex-bore-printables",
    title: "Small Mecanum Wheel - 3/8 inch Hex bore for FRC",
    summary: "Beta import from Printables for a small mecanum wheel with a 3/8 in hex bore, useful for compact mechanism or drivetrain experiments.",
    category: "mechanism-components",
    categoryLabel: "Mechanism Components",
    subsystem: "Drivetrain",
    creatorHandle: "shadowtigerus",
    featured: false,
    materials: ["PLA+"],
    vendors: ["Community"],
    products: ["Mecanum Wheel"],
    seasons: ["General"],
    tags: ["mecanum", "wheel", "hex bore", "drivetrain", "printables"],
    license: "CC BY-NC 4.0",
    rating: 4.7,
    views: 0,
    downloads: 0,
    uploadedAgo: "Imported from Printables",
    files: [
      {
        label: "Printables download page",
        fileType: "STL",
        href: "https://www.printables.com/model/124414-small-mecanum-wheel-38-inch-hex-bore-for-frc",
        note: "Use the original Printables listing to access the uploaded printable files."
      },
      {
        label: "Original Printables listing",
        fileType: "SOURCE",
        href: "https://www.printables.com/model/124414-small-mecanum-wheel-38-inch-hex-bore-for-frc",
        note: "Reference link back to the original Printables page."
      }
    ],
    media: [],
    versions: [{ label: "beta import", date: "2026-08-13", summary: "Imported into the beta repository from a public Printables listing." }],
    printProfile: {
      material: "PLA+",
      nozzle: "0.4 mm",
      layerHeight: "0.2 mm",
      infill: "35%",
      supports: "Check original listing",
      notes: "Review the original listing for hub hardware, roller geometry, and axle fit."
    },
    installNotes: [
      "Useful for compact prototypes where a full-size mecanum is too large.",
      "Review the original Printables listing for exact bore fit and roller assembly details."
    ],
    viewerNote: "This beta import currently links back to Printables for the downloadable geometry.",
    publishedAt: "2026-08-13",
    updatedAt: "2026-08-13"
  },
  {
    slug: "frc-robot-hanging-hook-printables",
    title: "Hook for Hanging FIRST Robotics Competition (FRC) Robot",
    summary: "Beta import from Printables for a hanging hook teams can use around robot transport, storage, or pit organization workflows.",
    category: "pit-tools",
    categoryLabel: "Pit Tools",
    subsystem: "Pit",
    creatorHandle: "shyavans",
    featured: false,
    materials: ["PETG"],
    vendors: ["Community"],
    products: ["Robot Hook"],
    seasons: ["General"],
    tags: ["hook", "hanging", "robot", "pit tool", "printables"],
    license: "CC BY-NC 4.0",
    rating: 4.7,
    views: 0,
    downloads: 0,
    uploadedAgo: "Imported from Printables",
    files: [
      {
        label: "Printables download page",
        fileType: "STL",
        href: "https://www.printables.com/model/24037-hook-for-hanging-first-robotics-competition-frc-ro",
        note: "Use the original Printables listing to access the uploaded printable files."
      },
      {
        label: "Original Printables listing",
        fileType: "SOURCE",
        href: "https://www.printables.com/model/24037-hook-for-hanging-first-robotics-competition-frc-ro",
        note: "Reference link back to the original Printables page."
      }
    ],
    media: [],
    versions: [{ label: "beta import", date: "2026-08-13", summary: "Imported into the beta repository from a public Printables listing." }],
    printProfile: {
      material: "PETG",
      nozzle: "0.4 mm",
      layerHeight: "0.24 mm",
      infill: "40%",
      supports: "Check original listing",
      notes: "Review the original listing before using it in any real robot handling workflow."
    },
    installNotes: [
      "Treat this as a sourced beta listing and verify load safety before any real robot use.",
      "Review the original Printables page for intended use, print orientation, and load warnings."
    ],
    viewerNote: "This beta import currently links back to Printables for the downloadable geometry.",
    publishedAt: "2026-08-13",
    updatedAt: "2026-08-13"
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

export function filterParts(filters: SearchFilters) {
  return sortPartsList(filterPartsList(parts, creators, filters), filters.sort);
}
