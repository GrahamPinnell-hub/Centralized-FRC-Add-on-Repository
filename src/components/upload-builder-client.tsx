"use client";

import {
  type CSSProperties,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { PartCard, UploadChecklist } from "@/components/ui";
import { resolveAssetUrl } from "@/lib/assets";
import {
  parsePreviewSession,
  previewSessionStorageKey,
  type PreviewJoinedTeam
} from "@/lib/account-preview";
import {
  getSupportedImportSources,
  importListingFromUrl,
  type ImportedFileCandidate,
  type ImportedListingData,
  type ImportedMediaCandidate
} from "@/lib/link-import";
import type { CatalogPart, CatalogFile, Creator } from "@/lib/catalog";

type SearchOptions = {
  categories: { slug: string; label: string }[];
  vendors: string[];
  seasons: string[];
  fileTypes: string[];
  materials: string[];
};

type DraftFile = {
  label: string;
  fileType: CatalogFile["fileType"];
  href: string;
  note: string;
};

type DraftMedia = {
  kind: "image" | "video";
  title: string;
  note: string;
  src: string;
};

type StagedUpload = {
  name: string;
  fileType: CatalogFile["fileType"];
  sizeLabel: string;
};

type StagedMediaUpload = {
  name: string;
  kind: DraftMedia["kind"];
  sizeLabel: string;
};

type DemoPublishState = "draft" | "published-preview";

type SavedDraftSnapshot = {
  id: string;
  savedAt: string;
  demoState?: DemoPublishState;
  ownerHandle: string;
  sourceUrl: string;
  title: string;
  summary: string;
  category: string;
  categoryAddon: string;
  subsystem: string;
  products: string;
  vendors: string;
  seasons: string;
  materials: string;
  tags: string;
  license: string;
  printNotes: string;
  installNotes: string;
  files: DraftFile[];
  media: DraftMedia[];
  stagedUploads: StagedUpload[];
  stagedMediaUploads: StagedMediaUpload[];
  lastImport?: ImportedListingData | null;
};

type DemoManifest = {
  manifestVersion: "demo-upload-manifest-v1";
  generatedAt: string;
  state: DemoPublishState;
  owner: {
    handle: string;
    label: string;
    badge: string;
  };
  importPreview: {
    sourceLabel: string;
    sourceUrl: string;
    author: string | null;
    warnings: string[];
    importedFiles: number;
    importedMedia: number;
  } | null;
  listing: {
    slug: string;
    title: string;
    summary: string;
    category: string;
    categoryLabel: string;
    categoryAddon: string;
    subsystem: string;
    license: string;
    tags: string[];
    products: string[];
    vendors: string[];
    seasons: string[];
    materials: string[];
  };
  deliverables: {
    files: DraftFile[];
    media: DraftMedia[];
    stagedUploads: StagedUpload[];
    stagedMediaUploads: StagedMediaUpload[];
    printNotes: string;
    installNotes: string[];
  };
  demoNotes: string[];
};

type TagSuggestion = {
  label: string;
  count: number;
};

type CategoryAddonOption = {
  value: string;
  label: string;
  note: string;
};

type LicenseDefinition = {
  value: string;
  summary: string;
  description: string;
};

type OwnerChoice = {
  handle: string;
  title: string;
  note: string;
  badge: string;
};

const draftsStorageKey = "frc-addon-upload-drafts-v2";
const customTagStorageKey = "frc-addon-custom-tags-v1";
const defaultDraftTitle = "Mk4 Swerve Cover";
const defaultDraftSummary =
  "A quick-swap cover that protects wires and encoder routing without slowing down module service.";
const defaultDraftTags = "swerve, wire management, encoder guard";
const defaultPrintNotes =
  "PETG or ABS, 0.4 mm nozzle, 0.24 mm layers, four walls recommended.";
const defaultInstallNotes =
  "Snaps around the module top plate. Check cable exit clearance before tightening hardware.";
const supportedImportSources = getSupportedImportSources();

const defaultFiles: DraftFile[] = [
  {
    label: "Primary print file",
    fileType: "STL",
    href: "#",
    note: "Main build file teams should download first."
  },
  {
    label: "Neutral CAD export",
    fileType: "STEP",
    href: "#",
    note: "Used for robot integration and fit checks."
  },
  {
    label: "Source CAD",
    fileType: "SOURCE",
    href: "https://cad.onshape.com/",
    note: "Editable source document for remixes."
  }
];

const defaultMedia: DraftMedia[] = [
  {
    kind: "image",
    title: "Mk4 Swerve Cover",
    note: "Show the part mounted on the robot if possible.",
    src: "/example-images/mk4-swerve-cover.png"
  }
];

const fallbackLicenses: LicenseDefinition[] = [
  {
    value: "CC BY-NC 4.0",
    summary: "Teams can remix and share it, but they must credit the creator and keep it non-commercial.",
    description: "Best default for community robot add-ons that should stay open for teams while blocking resale."
  },
  {
    value: "CC BY 4.0",
    summary: "Anyone can share or adapt it as long as the original creator is credited.",
    description: "Use this when you want the widest reuse path and are comfortable with commercial reuse."
  },
  {
    value: "CC BY-NC-SA 4.0",
    summary: "Reuse is allowed with credit, non-commercial limits, and the same license on remixes.",
    description: "Good when you want future remixes to stay open under the same community terms."
  },
  {
    value: "MIT",
    summary: "Very permissive open-source license with attribution and few restrictions.",
    description: "Useful for code, firmware helpers, and open tooling where you want minimal license friction."
  },
  {
    value: "CERN-OHL-S",
    summary: "Open hardware license that keeps modified hardware source under the same terms.",
    description: "Fit for CAD and PCB work when you want strong share-back requirements for hardware derivatives."
  }
] as const;

const categoryAddonLibrary: Record<string, CategoryAddonOption[]> = {
  "swerve-covers": [
    {
      value: "wire-cover",
      label: "Wire cover",
      note: "Use for cable routing shields, snap-on wire guards, and service-friendly top covers."
    },
    {
      value: "encoder-guard",
      label: "Encoder guard",
      note: "Use for printed guards that protect encoders, leads, and small electronics near the module."
    },
    {
      value: "motor-protector",
      label: "Motor protector",
      note: "Use for shells that shield exposed motors or terminals from bumper contact and debris."
    },
    {
      value: "service-shield",
      label: "Service shield",
      note: "Use for plates or covers that stay on the robot while still allowing quick maintenance."
    }
  ],
  "driver-station": [
    {
      value: "tablet-mount",
      label: "Tablet mount",
      note: "Use for display stands, scouting screens, and driver station tablet brackets."
    },
    {
      value: "cable-organizer",
      label: "Cable organizer",
      note: "Use for joystick cable strain relief, USB guides, and portable wiring organizers."
    },
    {
      value: "button-box",
      label: "Button box",
      note: "Use for operator button panels, switch pods, and labeled input housings."
    },
    {
      value: "field-cart",
      label: "Field cart accessory",
      note: "Use for brackets, hooks, or fixtures that travel with the driver station setup."
    }
  ],
  "electronics-mounts": [
    {
      value: "radio-mount",
      label: "Radio mount",
      note: "Use for brackets or enclosures made around team radio layouts."
    },
    {
      value: "pdh-pdp-mount",
      label: "Power mount",
      note: "Use for PDH, PDP, or fused power distribution mounting solutions."
    },
    {
      value: "sensor-bracket",
      label: "Sensor bracket",
      note: "Use for small electronics, expansion hubs, or protected sensor standoffs."
    },
    {
      value: "bellypan-panel",
      label: "Bellypan panel",
      note: "Use for flat plates and hardware patterns that organize electronics on a robot pan."
    }
  ],
  "vision-mounts": [
    {
      value: "camera-mount",
      label: "Camera mount",
      note: "Use for fixed mounts built around Limelight, PhotonVision, or USB cameras."
    },
    {
      value: "adjustable-bracket",
      label: "Adjustable bracket",
      note: "Use for multi-angle mounts with slots, pivots, or shims for aiming."
    },
    {
      value: "hood",
      label: "Protective hood",
      note: "Use for glare shields, impact guards, and protective camera housings."
    },
    {
      value: "retrofit-plate",
      label: "Retrofit plate",
      note: "Use for adapters that let a team swap from one camera package to another."
    }
  ]
};

function splitList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function joinList(values: string[]) {
  return values.join(", ");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatOwnerLabel(handle: string) {
  if (handle.startsWith("team-")) {
    return handle.replace("team-", "Team ");
  }

  return handle
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferFileType(name: string): CatalogFile["fileType"] {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "stl") {
    return "STL";
  }

  if (extension === "3mf") {
    return "3MF";
  }

  if (extension === "dxf") {
    return "DXF";
  }

  if (["step", "stp", "iges", "igs"].includes(extension)) {
    return "STEP";
  }

  if (["zip", "7z", "rar"].includes(extension)) {
    return "ZIP";
  }

  if (
    [
      "f3d",
      "f3z",
      "sldprt",
      "sldasm",
      "ipt",
      "iam",
      "fcstd",
      "scad",
      "dwg",
      "ai",
      "svg"
    ].includes(extension)
  ) {
    return "SOURCE";
  }

  return "ZIP";
}

function inferMediaKind(file: File): DraftMedia["kind"] {
  if (file.type.startsWith("video/")) {
    return "video";
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ["mp4", "mov", "webm", "m4v"].includes(extension) ? "video" : "image";
}

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function mediaFrameStyle(src: string | undefined): CSSProperties | undefined {
  const resolvedSrc = resolveAssetUrl(src);

  if (!resolvedSrc) {
    return undefined;
  }

  return {
    ["--media-image" as string]: `url("${resolvedSrc.replace(/"/g, '\\"')}")`
  };
}

function toDraftFile(file: File): DraftFile {
  const fileType = inferFileType(file.name);

  return {
    label: file.name.replace(/\.[^.]+$/, ""),
    fileType,
    href: "#",
    note: `Imported from local file drop: ${file.name}`
  };
}

function isPlaceholderFileSet(files: DraftFile[]) {
  return (
    files.length === defaultFiles.length &&
    files.every(
      (file, index) =>
        file.label === defaultFiles[index]?.label &&
        file.fileType === defaultFiles[index]?.fileType &&
        file.href === defaultFiles[index]?.href &&
        file.note === defaultFiles[index]?.note
    )
  );
}

function buildFallbackCategoryAddons(categoryLabel: string): CategoryAddonOption[] {
  return [
    {
      value: "mount",
      label: "Mount",
      note: `Use for general ${categoryLabel.toLowerCase()} brackets and mounting plates.`
    },
    {
      value: "guard",
      label: "Guard",
      note: `Use for protective ${categoryLabel.toLowerCase()} covers and shields.`
    },
    {
      value: "organizer",
      label: "Organizer",
      note: `Use for small reusable ${categoryLabel.toLowerCase()} helpers and support pieces.`
    }
  ];
}

function mergeImportedFiles(currentFiles: DraftFile[], importedFiles: ImportedFileCandidate[]) {
  const nextFiles = importedFiles.map((file) => ({
    label: file.label,
    fileType: file.fileType,
    href: file.href,
    note: file.note
  }));

  if (nextFiles.length === 0) {
    return currentFiles;
  }

  if (isPlaceholderFileSet(currentFiles)) {
    return nextFiles;
  }

  const importedKeys = new Set(nextFiles.map((file) => `${file.href}|${file.label}`));

  return [
    ...nextFiles,
    ...currentFiles.filter((file) => !importedKeys.has(`${file.href}|${file.label}`))
  ];
}

function mergeImportedMedia(currentMedia: DraftMedia[], importedMedia: ImportedMediaCandidate[]) {
  if (importedMedia.length === 0) {
    return currentMedia;
  }

  const nextMedia = importedMedia.map((item) => ({
    kind: item.kind,
    title: item.title,
    note: item.note,
    src: item.src
  }));

  if (currentMedia.length === defaultMedia.length && currentMedia[0]?.src === defaultMedia[0]?.src) {
    return nextMedia;
  }

  const seen = new Set<string>();

  return [...nextMedia, ...currentMedia].filter((item) => {
    const key = `${item.kind}|${item.src}|${item.title}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function UploadBuilderClient({
  options,
  creators,
  parts
}: {
  options: SearchOptions;
  creators: Creator[];
  parts: CatalogPart[];
}) {
  const [joinedTeams, setJoinedTeams] = useState<PreviewJoinedTeam[]>([]);
  const [customTagSuggestions, setCustomTagSuggestions] = useState<TagSuggestion[]>([]);
  const ownerChoices = useMemo<OwnerChoice[]>(
    () => {
      const team31 = creators.find((creator) => creator.handle === "team-31");

      const baseChoices: OwnerChoice[] = [
        {
          handle: "graham-pinnell",
          title: "Publish personally",
          note: "Use your personal profile when the listing should not be attached to a team.",
          badge: "Personal"
        },
        {
          handle: team31?.handle ?? "team-31",
          title: team31 ? `${team31.teamNumber} / ${team31.teamName}` : "31 / Prime Movers",
          note: "Publish under the team profile that should own the listing.",
          badge: "Team"
        }
      ];

      const joinedChoices = joinedTeams
        .filter((team) => !baseChoices.some((owner) => owner.handle === team.handle))
        .map(
          (team): OwnerChoice => ({
            handle: team.handle,
            title: team.title,
            note: "Publish under a team profile that was joined from your account session.",
            badge: "Team"
          })
        );

      return [...baseChoices, ...joinedChoices];
    },
    [creators, joinedTeams]
  );

  const licenseOptions = useMemo(
    () =>
      Array.from(
        new Set([...parts.map((part) => part.license), ...fallbackLicenses.map((option) => option.value)])
      ).sort(),
    [parts]
  );

  const tagSuggestions = useMemo<TagSuggestion[]>(() => {
    const counts = new Map<string, number>();

    for (const part of parts) {
      for (const tag of part.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    for (const tag of customTagSuggestions) {
      counts.set(tag.label, Math.max(counts.get(tag.label) ?? 0, tag.count));
    }

    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
  }, [customTagSuggestions, parts]);

  const [ownerHandle, setOwnerHandle] = useState(ownerChoices[0]?.handle ?? "graham-pinnell");
  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState(defaultDraftTitle);
  const [summary, setSummary] = useState(defaultDraftSummary);
  const [category, setCategory] = useState(options.categories[0]?.slug ?? "swerve-covers");
  const [categoryAddon, setCategoryAddon] = useState("");
  const [subsystem, setSubsystem] = useState("Drivetrain");
  const [products, setProducts] = useState("MK4i");
  const [vendors, setVendors] = useState("SDS");
  const [seasons, setSeasons] = useState("2026, General");
  const [materials, setMaterials] = useState("PETG, ABS");
  const [tags, setTags] = useState(defaultDraftTags);
  const [tagInput, setTagInput] = useState("");
  const [license, setLicense] = useState(licenseOptions[0] ?? "CC BY-NC 4.0");
  const [printNotes, setPrintNotes] = useState(defaultPrintNotes);
  const [installNotes, setInstallNotes] = useState(defaultInstallNotes);
  const [files, setFiles] = useState<DraftFile[]>(defaultFiles);
  const [media, setMedia] = useState<DraftMedia[]>(defaultMedia);
  const [stagedUploads, setStagedUploads] = useState<StagedUpload[]>([]);
  const [stagedMediaUploads, setStagedMediaUploads] = useState<StagedMediaUpload[]>([]);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraftSnapshot[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [lastImport, setLastImport] = useState<ImportedListingData | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [publishMode, setPublishMode] = useState<"draft" | "publish">("draft");
  const [demoState, setDemoState] = useState<DemoPublishState>("draft");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const tagInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const activeCategoryAddons = useMemo(() => {
    const activeCategory = options.categories.find((option) => option.slug === category);

    return categoryAddonLibrary[category] ?? buildFallbackCategoryAddons(activeCategory?.label ?? "General");
  }, [category, options.categories]);

  const activeCategoryAddon =
    activeCategoryAddons.find((option) => option.value === categoryAddon) ?? activeCategoryAddons[0];
  const activeLicense = fallbackLicenses.find((option) => option.value === license);
  const tagEntries = splitList(tags);
  const currentTagQuery = tagInput.trim().toLowerCase();
  const selectedTags = tagEntries.map((tag) => tag.toLowerCase());
  const matchingTags = currentTagQuery
    ? tagSuggestions
        .filter(
          (suggestion) =>
            suggestion.label.toLowerCase().includes(currentTagQuery) &&
            !selectedTags.includes(suggestion.label.toLowerCase())
        )
        .slice(0, 8)
    : [];
  const canCreateTag =
    tagInput.trim().length > 0 &&
    !selectedTags.includes(tagInput.trim().toLowerCase()) &&
    !tagSuggestions.some((suggestion) => suggestion.label.toLowerCase() === tagInput.trim().toLowerCase());

  const previewPart = useMemo<CatalogPart>(() => {
    const activeCategory = options.categories.find((option) => option.slug === category);

    return {
      slug: slugify(title || "new-part"),
      title: title || "Untitled part",
      summary: summary || "Add a short summary so another team knows why this exists.",
      category,
      categoryLabel: activeCategory?.label ?? "Uncategorized",
      subsystem: subsystem || "General",
      creatorHandle: ownerHandle,
      featured: false,
      materials: splitList(materials),
      vendors: splitList(vendors),
      products: splitList(products),
      seasons: splitList(seasons),
      tags: tagEntries,
      license: license || "License not set",
      rating: 0,
      views: 0,
      downloads: 0,
      uploadedAgo: "Preview",
      validated: false,
      files: files.filter((file) => file.label.trim()),
      media: media
        .filter((item) => item.title.trim())
        .map((item) => ({
          kind: item.kind,
          title: item.title,
          note: item.note,
          accent: item.kind === "video" ? "#c4b896" : "#d0a458",
          src: item.src || undefined
        })),
      versions: [
        {
          label: "v1.0",
          date: "2026-08-05",
          summary: "Initial listing generated from the upload form."
        }
      ],
      printProfile: {
        material: splitList(materials)[0] ?? "PETG",
        nozzle: "0.4 mm",
        layerHeight: "0.24 mm",
        infill: "35%",
        supports: "Only where needed",
        notes: printNotes
      },
      installNotes: splitList(installNotes),
      viewerNote: "Media previews appear here as files and photos are added to the listing.",
      publishedAt: "2026-08-05",
      updatedAt: "2026-08-05"
    };
  }, [
    category,
    files,
    installNotes,
    license,
    materials,
    media,
    options.categories,
    ownerHandle,
    printNotes,
    products,
    seasons,
    subsystem,
    summary,
    tags,
    title,
    vendors
  ]);

  const activeOwner = ownerChoices.find((owner) => owner.handle === ownerHandle) ?? ownerChoices[0];
  const ownerLabel =
    activeOwner?.badge === "Personal"
      ? "Personal"
      : (activeOwner?.title ?? formatOwnerLabel(ownerHandle));
  const isPublishMode = publishMode === "publish";
  const manifestFileName = `${previewPart.slug || "new-listing"}-${demoState}.json`;

  function normalizeOwnerHandle(handle: string) {
    return ownerChoices.some((owner) => owner.handle === handle)
      ? handle
      : (ownerChoices[0]?.handle ?? "graham-pinnell");
  }

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(draftsStorageKey);

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as SavedDraftSnapshot[];
      if (Array.isArray(parsed)) {
        setSavedDrafts(parsed);
      }
    } catch {
      setSavedDrafts([]);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(customTagStorageKey);

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as TagSuggestion[];

      if (Array.isArray(parsed)) {
        setCustomTagSuggestions(
          parsed
            .filter((tag): tag is TagSuggestion => Boolean(tag?.label))
            .map((tag) => ({
              label: tag.label,
              count: Math.max(1, Number.isFinite(tag.count) ? tag.count : 1)
            }))
        );
      }
    } catch {
      setCustomTagSuggestions([]);
    }
  }, []);

  useEffect(() => {
    function syncJoinedTeams() {
      const session = parsePreviewSession(window.localStorage.getItem(previewSessionStorageKey));
      setJoinedTeams(session?.joinedTeams ?? []);
    }

    syncJoinedTeams();
    window.addEventListener("storage", syncJoinedTeams);
    window.addEventListener("focus", syncJoinedTeams);

    return () => {
      window.removeEventListener("storage", syncJoinedTeams);
      window.removeEventListener("focus", syncJoinedTeams);
    };
  }, []);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const normalized = normalizeOwnerHandle(ownerHandle);
    if (normalized !== ownerHandle) {
      setOwnerHandle(normalized);
    }
  }, [ownerChoices, ownerHandle]);

  useEffect(() => {
    if (activeCategoryAddons.length === 0) {
      if (categoryAddon) {
        setCategoryAddon("");
      }
      return;
    }

    if (!activeCategoryAddons.some((option) => option.value === categoryAddon)) {
      setCategoryAddon(activeCategoryAddons[0].value);
    }
  }, [activeCategoryAddons, categoryAddon]);

  function queueFiles(incoming: File[]) {
    if (incoming.length === 0) {
      return;
    }

    const importedFiles = incoming.map(toDraftFile);

    setFiles((current) =>
      isPlaceholderFileSet(current) ? importedFiles : [...current, ...importedFiles]
    );
    setStagedUploads((current) => [
      ...incoming.map((file) => ({
        name: file.name,
        fileType: inferFileType(file.name),
        sizeLabel: formatBytes(file.size)
      })),
      ...current
    ]);
  }

  function queueMediaFiles(incoming: File[]) {
    if (incoming.length === 0) {
      return;
    }

    const importedMedia = incoming.map((file) => {
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(objectUrl);

      return {
        kind: inferMediaKind(file),
        title: file.name.replace(/\.[^.]+$/, ""),
        note: `Imported from local media drop: ${file.name}`,
        src: objectUrl
      } satisfies DraftMedia;
    });

    setMedia((current) => [...importedMedia, ...current]);
    setStagedMediaUploads((current) => [
      ...incoming.map((file) => ({
        name: file.name,
        kind: inferMediaKind(file),
        sizeLabel: formatBytes(file.size)
      })),
      ...current
    ]);
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    queueFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function onMediaInputChange(event: ChangeEvent<HTMLInputElement>) {
    queueMediaFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function onFileDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFiles(false);
    queueFiles(Array.from(event.dataTransfer.files));
  }

  function onMediaDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingMedia(false);
    queueMediaFiles(Array.from(event.dataTransfer.files));
  }

  function applyTagSuggestion(tag: string) {
    setTags((current) => {
      const nextEntries = splitList(current);
      const normalized = tag.toLowerCase();

      if (!nextEntries.some((entry) => entry.toLowerCase() === normalized)) {
        nextEntries.push(tag);
      }

      return joinList(nextEntries);
    });
    setTagInput("");
  }

  function commitTag(tag: string) {
    const normalizedTag = tag.replace(/,+$/g, "").trim();

    if (!normalizedTag) {
      return;
    }

    setTags((current) => {
      const nextEntries = splitList(current);

      if (nextEntries.some((entry) => entry.toLowerCase() === normalizedTag.toLowerCase())) {
        return current;
      }

      return joinList([...nextEntries, normalizedTag]);
    });
    setCustomTagSuggestions((current) => {
      const existingIndex = current.findIndex(
        (entry) => entry.label.toLowerCase() === normalizedTag.toLowerCase()
      );
      const nextSuggestions =
        existingIndex >= 0
          ? current.map((entry, index) =>
              index === existingIndex ? { ...entry, count: entry.count + 1 } : entry
            )
          : [...current, { label: normalizedTag, count: 1 }];

      window.localStorage.setItem(customTagStorageKey, JSON.stringify(nextSuggestions));
      return nextSuggestions;
    });
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((current) =>
      joinList(splitList(current).filter((entry) => entry.toLowerCase() !== tag.toLowerCase()))
    );
  }

  function onTagInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (["Enter", ",", "Tab"].includes(event.key) && tagInput.trim()) {
      event.preventDefault();
      commitTag(tagInput);
      return;
    }

    if (event.key === "Backspace" && !tagInput && tagEntries.length > 0) {
      event.preventDefault();
      removeTag(tagEntries[tagEntries.length - 1]);
    }
  }

  function removeMedia(index: number) {
    setMedia((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setStagedMediaUploads((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setStagedUploads((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  function sortFilesAlphabetically() {
    setFiles((current) => [...current].sort((left, right) => left.label.localeCompare(right.label)));
    setStagedUploads((current) => [...current].sort((left, right) => left.name.localeCompare(right.name)));
  }

  function buildManifest(state: DemoPublishState, generatedAt = new Date().toISOString()): DemoManifest {
    return {
      manifestVersion: "demo-upload-manifest-v1",
      generatedAt,
      state,
      owner: {
        handle: ownerHandle,
        label: activeOwner?.title ?? formatOwnerLabel(ownerHandle),
        badge: activeOwner?.badge ?? "Profile"
      },
      importPreview: lastImport
        ? {
            sourceLabel: lastImport.sourceLabel,
            sourceUrl: lastImport.sourceUrl,
            author: lastImport.author,
            warnings: lastImport.warnings,
            importedFiles: lastImport.files.length,
            importedMedia: lastImport.media.length
          }
        : null,
      listing: {
        slug: previewPart.slug,
        title: previewPart.title,
        summary: previewPart.summary,
        category: previewPart.category,
        categoryLabel: previewPart.categoryLabel,
        categoryAddon,
        subsystem: previewPart.subsystem,
        license: previewPart.license,
        tags: previewPart.tags,
        products: previewPart.products,
        vendors: previewPart.vendors,
        seasons: previewPart.seasons,
        materials: previewPart.materials
      },
      deliverables: {
        files,
        media: media.map((item) => ({
          ...item,
          src: item.src.startsWith("blob:") ? "" : item.src
        })),
        stagedUploads,
        stagedMediaUploads,
        printNotes,
        installNotes: previewPart.installNotes
      },
      demoNotes: [
        "This export is a demo-mode manifest only.",
        "Listings are stored locally in this browser until a live backend is added.",
        "Publish preview simulates a repository publish state without creating a real public record."
      ]
    };
  }

  function buildSnapshot(state: DemoPublishState): SavedDraftSnapshot {
    const savedAt = new Date().toISOString();

    return {
      id: `${slugify(title || "untitled")}-${Date.now()}`,
      savedAt,
      demoState: state,
      ownerHandle,
      sourceUrl,
      title,
      summary,
      category,
      categoryAddon,
      subsystem,
      products,
      vendors,
      seasons,
      materials,
      tags,
      license,
      printNotes,
      installNotes,
      files,
      media: media.map((item) => ({
        ...item,
        src: item.src.startsWith("blob:") ? "" : item.src
      })),
      stagedUploads,
      stagedMediaUploads,
      lastImport
    };
  }

  function persistSnapshot(state: DemoPublishState) {
    const snapshot = buildSnapshot(state);
    const nextDrafts = [snapshot, ...savedDrafts].slice(0, 5);
    setSavedDrafts(nextDrafts);
    window.localStorage.setItem(draftsStorageKey, JSON.stringify(nextDrafts));
    setDemoState(state);
    return snapshot;
  }

  function downloadManifest(state: DemoPublishState) {
    const generatedAt = new Date().toISOString();
    const manifest = buildManifest(state, generatedAt);
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${previewPart.slug || "new-listing"}-${state}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSaveMessage(`Downloaded demo manifest for ${state === "draft" ? "draft" : "published preview"}.`);
  }

  function saveDraft() {
    const snapshot = persistSnapshot("draft");
    setSaveMessage(
      `Draft saved at ${new Date(snapshot.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`
    );
  }

  function restoreDraft(snapshot: SavedDraftSnapshot) {
    const restoredState = snapshot.demoState ?? "draft";
    setOwnerHandle(normalizeOwnerHandle(snapshot.ownerHandle));
    setSourceUrl(snapshot.sourceUrl ?? "");
    setTitle(snapshot.title);
    setSummary(snapshot.summary);
    setCategory(snapshot.category);
    setCategoryAddon(snapshot.categoryAddon ?? "");
    setSubsystem(snapshot.subsystem);
    setProducts(snapshot.products);
    setVendors(snapshot.vendors);
    setSeasons(snapshot.seasons);
    setMaterials(snapshot.materials);
    setTags(snapshot.tags);
    setTagInput("");
    setLicense(snapshot.license);
    setPrintNotes(snapshot.printNotes);
    setInstallNotes(snapshot.installNotes);
    setFiles(snapshot.files);
    setMedia(snapshot.media.length > 0 ? snapshot.media : defaultMedia);
    setStagedUploads(snapshot.stagedUploads);
    setStagedMediaUploads(snapshot.stagedMediaUploads);
    setLastImport(snapshot.lastImport ?? null);
    setDemoState(restoredState);
    setPublishMode(restoredState === "published-preview" ? "publish" : "draft");
    setSaveMessage(`Restored draft from ${new Date(snapshot.savedAt).toLocaleString()}.`);
  }

  function clearSavedDrafts() {
    setSavedDrafts([]);
    window.localStorage.removeItem(draftsStorageKey);
    setSaveMessage("Saved drafts cleared from this browser.");
  }

  function requestTeamLink() {
    setSaveMessage(
      "Log in and join a team with a 6-digit code to add another team profile here."
    );
  }

  function requestFolderUpload() {
    setSaveMessage(
      "Folder upload is not connected yet. For now, use Add files for grouped fabrication packages."
    );
  }

  function togglePublishMode() {
    setPublishMode((current) => (current === "draft" ? "publish" : "draft"));
  }

  function publishListing() {
    const snapshot = persistSnapshot("published-preview");
    setSaveMessage(
      `Published preview updated at ${new Date(snapshot.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}. Demo mode did not create a live listing.`
    );
  }

  async function importFromListingLink() {
    const trimmedUrl = sourceUrl.trim();

    if (!trimmedUrl) {
      setImportMessage(
        "Paste a Printables, Thingiverse, Onshape, or GitHub link to start from an existing listing."
      );
      return;
    }

    setIsImporting(true);
    setImportMessage("Importing listing metadata...");

    try {
      const imported = await importListingFromUrl(trimmedUrl);

      setSourceUrl(imported.sourceUrl);
      setTitle(imported.title || defaultDraftTitle);
      setSummary(
        imported.description ||
          `Imported starting point from ${imported.sourceLabel}. Review metadata, files, and media before publishing the listing.`
      );

      if (imported.categorySlug && options.categories.some((option) => option.slug === imported.categorySlug)) {
        setCategory(imported.categorySlug);
      }

      if (imported.products.length > 0) {
        setProducts(imported.products.join(", "));
      }

      if (imported.vendors.length > 0) {
        setVendors(imported.vendors.join(", "));
      }

      if (imported.tags.length > 0) {
        setTags(imported.tags.join(", "));
      } else if (tags === defaultDraftTags) {
        setTags(defaultDraftTags);
      }
      setTagInput("");

      if (imported.license && licenseOptions.includes(imported.license)) {
        setLicense(imported.license);
      }

      setFiles((current) => mergeImportedFiles(current, imported.files));
      setMedia((current) => mergeImportedMedia(current, imported.media));
      setLastImport(imported);

      const pulledParts = [
        imported.title ? "title" : null,
        imported.description ? "summary" : null,
        imported.media.length > 0 ? "cover media" : null,
        imported.files.length > 0 ? "source links" : null
      ].filter(Boolean);

      setImportMessage(
        `Imported ${pulledParts.join(", ")} from ${imported.sourceLabel}${
          imported.author ? ` by ${imported.author}` : ""
        }.`
      );
    } catch (error) {
      setLastImport(null);
      setImportMessage(error instanceof Error ? error.message : "Import failed. Try another link.");
    } finally {
      setIsImporting(false);
    }
  }

  function closeComposer() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign("/");
  }

  return (
    <div className="page-stack upload-compose-shell">
      <section className="upload-compose-sticky">
        <div className="upload-compose-bar">
          <h2 className="upload-compose-title">New Listing</h2>
          <div className="upload-compose-controls">
            <div className="upload-mode-toggle">
              <span className={`upload-mode-label${!isPublishMode ? " is-active" : ""}`}>Draft</span>
              <button
                type="button"
                role="switch"
                aria-checked={isPublishMode}
                aria-label={isPublishMode ? "Switch to draft mode" : "Switch to published mode"}
                className={`upload-mode-switch${isPublishMode ? " is-published" : ""}`}
                onClick={togglePublishMode}
              >
                <span className="upload-mode-knob" />
              </button>
              <span className={`upload-mode-label${isPublishMode ? " is-active" : ""}`}>Published</span>
            </div>
            <button
              type="button"
              className="action-link upload-compose-manifest"
              onClick={() => downloadManifest(isPublishMode ? "published-preview" : "draft")}
            >
              Export manifest
            </button>
            <button type="button" className="action-link upload-compose-close" onClick={closeComposer}>
              Close
            </button>
            <button
              type="button"
              className="upload-compose-primary"
              onClick={isPublishMode ? publishListing : saveDraft}
            >
              {isPublishMode ? "Publish Preview" : "Save Draft"}
            </button>
          </div>
        </div>
        {saveMessage ? <p className="upload-inline-note upload-compose-feedback">{saveMessage}</p> : null}
      </section>

      <div className="upload-workbench">
        <div className="page-stack">
        <section className="panel upload-step-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Quick Start</p>
            <h3>Import from an existing listing link</h3>
          </div>
          <div className="upload-form upload-import-grid">
            <label>
              Listing URL
              <div className="upload-link-row">
                <input
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                  placeholder="https://www.printables.com/model/..."
                />
                <button
                  type="button"
                  className="action-link upload-import-button"
                  onClick={importFromListingLink}
                  disabled={isImporting}
                >
                  {isImporting ? "Importing..." : "Import link"}
                </button>
              </div>
            </label>
            <div className="chip-row">
              {supportedImportSources.map((source) => (
                <span key={source.label} className="chip">
                  {source.label}
                </span>
              ))}
            </div>
            <p className="upload-owner-note">
              Use this to prefill a listing from Printables, Thingiverse, Onshape, or GitHub
              before attaching your own local files and photos.
            </p>
            {importMessage ? <p className="upload-inline-note">{importMessage}</p> : null}
            {lastImport ? (
              <div className="upload-import-summary">
                <div className="chip-row">
                  <span className="chip chip-accent">{lastImport.sourceLabel}</span>
                  {lastImport.author ? <span className="chip">By {lastImport.author}</span> : null}
                  {lastImport.media.length > 0 ? (
                    <span className="chip">{lastImport.media.length} media item{lastImport.media.length === 1 ? "" : "s"}</span>
                  ) : null}
                  {lastImport.files.length > 0 ? (
                    <span className="chip">{lastImport.files.length} imported link{lastImport.files.length === 1 ? "" : "s"}</span>
                  ) : null}
                </div>
                {lastImport.warnings.length > 0 ? (
                  <div className="page-stack upload-import-warnings">
                    {lastImport.warnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="panel upload-step-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Step 1</p>
            <h3>Ownership and listing basics</h3>
          </div>
          <div className="upload-owner-bar">
            <label className="upload-owner-select">
              Publisher
              <select value={ownerHandle} onChange={(event) => setOwnerHandle(event.target.value)}>
                {ownerChoices.map((owner) => (
                  <option key={owner.handle} value={owner.handle}>
                    {owner.badge === "Personal" ? "Personal" : owner.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="upload-owner-actions">
              <button type="button" className="action-link" onClick={requestTeamLink}>
                Add team
              </button>
            </div>
          </div>
          {activeOwner ? <p className="upload-owner-note">{activeOwner.note}</p> : null}
          <form className="upload-form">
            <label>
              Part title
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label>
              Summary
              <textarea value={summary} onChange={(event) => setSummary(event.target.value)} />
            </label>
            <div className="upload-field-grid">
              <label>
                Category
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {options.categories.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Category add-on
                <select value={categoryAddon} onChange={(event) => setCategoryAddon(event.target.value)}>
                  {activeCategoryAddons.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="upload-field-support">{activeCategoryAddon?.note}</span>
              </label>
            </div>
            <label>
                Subsystem
                <input value={subsystem} onChange={(event) => setSubsystem(event.target.value)} />
              </label>
          </form>
        </section>

        <section className="panel upload-step-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Step 2</p>
            <h3>Search and licensing</h3>
          </div>
          <div className="upload-form">
            <label>
              License
              <select value={license} onChange={(event) => setLicense(event.target.value)}>
                {licenseOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="upload-license-help">
                <strong>{activeLicense?.summary ?? "Use a license that makes reuse expectations clear."}</strong>
                <p>
                  {activeLicense?.description ??
                    "If you use a custom or imported license, make sure teams can tell whether remixing, resale, or required attribution are allowed."}
                </p>
              </div>
            </label>
            <label className="upload-tag-field">
              Search tags
              <div className="upload-tag-picker" onClick={() => tagInputRef.current?.focus()}>
                {tagEntries.map((tag) => (
                  <span key={tag} className="upload-tag-chip">
                    {tag}
                    <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeTag(tag)}>
                      x
                    </button>
                  </span>
                ))}
                <input
                  ref={tagInputRef}
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={onTagInputKeyDown}
                  placeholder={tagEntries.length === 0 ? "mk4i, swerve cover, limelight mount" : "Add a tag"}
                />
              </div>
              <span className="upload-field-support">
                Pick from existing tags or press Enter to add a new one, like Printables.
              </span>
              {matchingTags.length > 0 || canCreateTag ? (
                <div className="upload-tag-suggestions">
                  {canCreateTag ? (
                    <button
                      type="button"
                      className="upload-tag-option upload-tag-option-create"
                      onClick={() => commitTag(tagInput)}
                    >
                      <strong>Create "{tagInput.trim()}"</strong>
                      <span>New tag</span>
                    </button>
                  ) : null}
                  {matchingTags.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      type="button"
                      className="upload-tag-option"
                      onClick={() => applyTagSuggestion(suggestion.label)}
                    >
                      <strong>{suggestion.label}</strong>
                      <span>{suggestion.count} uses</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </label>
            <details
              className="upload-advanced-panel"
              open={showAdvanced}
              onToggle={(event) => setShowAdvanced((event.target as HTMLDetailsElement).open)}
            >
              <summary>
                <span>Advanced options</span>
              </summary>
              <div className="upload-advanced-grid">
                <div className="upload-field-grid">
                  <label>
                    Products
                    <input
                      value={products}
                      onChange={(event) => setProducts(event.target.value)}
                      placeholder="MK4i, Limelight 4"
                    />
                  </label>
                  <label>
                    Vendors
                    <input
                      value={vendors}
                      onChange={(event) => setVendors(event.target.value)}
                      placeholder="SDS, REV, WCP"
                    />
                  </label>
                </div>
                <div className="upload-field-grid">
                  <label>
                    Seasons
                    <input
                      value={seasons}
                      onChange={(event) => setSeasons(event.target.value)}
                      placeholder="2026, General"
                    />
                  </label>
                  <label>
                    Materials
                    <input
                      value={materials}
                      onChange={(event) => setMaterials(event.target.value)}
                      placeholder="PETG, ABS, 5052 Aluminum"
                    />
                  </label>
                </div>
                <label>
                  Print and fabrication notes
                  <textarea value={printNotes} onChange={(event) => setPrintNotes(event.target.value)} />
                </label>
              </div>
            </details>
          </div>
        </section>

        <section className="panel upload-step-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Step 3</p>
            <h3>Photos and model files</h3>
          </div>
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="upload-hidden-input"
            onChange={onMediaInputChange}
          />
          <section className="upload-board">
            <div className="upload-section-head">
              <div>
                <h4>Photos</h4>
                <p>Installed robot photos, screenshots, and short clips for the gallery.</p>
              </div>
            </div>
            <div
              className={`upload-media-strip${isDraggingMedia ? " is-dragging" : ""}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDraggingMedia(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingMedia(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                if (event.currentTarget === event.target) {
                  setIsDraggingMedia(false);
                }
              }}
              onDrop={onMediaDrop}
            >
              {media.map((item, index) => (
                <article key={`media-${index}`} className="upload-photo-tile">
                  <button
                    type="button"
                    className="upload-photo-remove"
                    aria-label={`Remove ${item.title || `media ${index + 1}`}`}
                    onClick={() => removeMedia(index)}
                  >
                    <span aria-hidden="true">x</span>
                  </button>
                  <span className={`chip${item.kind === "video" ? " chip-accent" : ""}`}>{item.kind}</span>
                  <div className="upload-photo-frame" style={mediaFrameStyle(item.src)}>
                    {item.src ? (
                      item.kind === "video" ? (
                        <video src={resolveAssetUrl(item.src)} muted playsInline />
                      ) : (
                        <img src={resolveAssetUrl(item.src)} alt={item.title || ""} />
                      )
                    ) : (
                      <span>Media</span>
                    )}
                  </div>
                  <strong>{item.title || `Photo ${index + 1}`}</strong>
                </article>
              ))}
              <button type="button" className="upload-photo-add" onClick={() => mediaInputRef.current?.click()}>
                <span aria-hidden="true">+</span>
              </button>
            </div>
            <div className="upload-dropzone upload-dropzone-inline upload-dropzone-media-note">
              <p>Drag photos and short clips here, or tap the plus tile to add them.</p>
            </div>
            {stagedMediaUploads.length > 0 ? (
              <div className="upload-upload-summary">
                {stagedMediaUploads.map((upload, index) => (
                  <span key={`${upload.name}-${index}`} className={`chip${upload.kind === "video" ? " chip-accent" : ""}`}>
                    {upload.name} - {upload.sizeLabel}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="upload-hidden-input"
            onChange={onFileInputChange}
          />
          <section className="upload-board">
            <div className="upload-section-head">
              <div>
                <h4>Fabrication Files</h4>
                <p>.stl, .3mf, .step, .dxf, .zip, source CAD, and fabrication bundles</p>
              </div>
            </div>
            <div className="upload-file-actions">
              <button type="button" className="upload-file-action" onClick={requestFolderUpload}>
                Add folder
              </button>
              <button type="button" className="upload-file-action" onClick={() => fileInputRef.current?.click()}>
                Add files
              </button>
              <button type="button" className="upload-file-action" onClick={sortFilesAlphabetically}>
                Sort files alphabetically
              </button>
            </div>
            <div
              className={`upload-dropzone upload-dropzone-inline${isDraggingFiles ? " is-dragging" : ""}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDraggingFiles(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingFiles(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                if (event.currentTarget === event.target) {
                  setIsDraggingFiles(false);
                }
              }}
              onDrop={onFileDrop}
            >
              <p>Drag files here to add them to the root</p>
            </div>
            <div className="upload-file-list">
              {files.map((file, index) => (
                <article key={`file-${index}`} className="upload-file-row">
                  <div className="upload-file-meta">
                    <strong>{file.label}</strong>
                    <p>{file.note}</p>
                  </div>
                  <div className="upload-file-row-actions">
                    <span className="chip">{file.fileType}</span>
                    <button
                      type="button"
                      className="action-link"
                      aria-label={`Remove ${file.label}`}
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {stagedUploads.length > 0 ? (
              <div className="upload-upload-summary">
                {stagedUploads.map((upload, index) => (
                  <span key={`${upload.name}-${index}`} className="chip">
                    {upload.name} - {upload.sizeLabel}
                  </span>
                ))}
              </div>
            ) : null}
          </section>
        </section>

        <section className="panel upload-step-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Step 4</p>
            <h3>Install notes</h3>
          </div>
          <form className="upload-form">
            <label>
              Installation notes
              <textarea value={installNotes} onChange={(event) => setInstallNotes(event.target.value)} />
            </label>
          </form>
        </section>

        </div>

        <div className="page-stack upload-preview-column">
        <section className="panel upload-preview-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Live Preview</p>
            <h3>Card and listing summary</h3>
          </div>
          <PartCard part={previewPart} />
          <div className="upload-submission-meta">
            <span
              className={`submission-status${
                demoState === "published-preview" ? " submission-status-published" : " submission-status-draft"
              }`}
            >
              {demoState === "published-preview" ? "Published demo preview" : "Local draft"}
            </span>
            <span className="chip">{manifestFileName}</span>
          </div>
          <div className="upload-preview-meta">
            <div className="detail-stat-block">
              <strong>{activeOwner?.badge ?? "Profile"}</strong>
              <span>{activeOwner?.title ?? formatOwnerLabel(ownerHandle)}</span>
            </div>
            <div className="detail-stat-block">
              <strong>{previewPart.files.length}</strong>
              <span>files</span>
            </div>
            <div className="detail-stat-block">
              <strong>{previewPart.media.length}</strong>
              <span>photos and clips</span>
            </div>
            <div className="detail-stat-block">
              <strong>{previewPart.tags.length}</strong>
              <span>search tags</span>
            </div>
          </div>
        </section>

        <section className="panel upload-preview-panel">
          <div className="upload-slot-head">
            <div className="upload-step-head">
              <p className="eyebrow">Demo Package</p>
              <h3>Local draft and manifest handoff</h3>
            </div>
            <button
              type="button"
              className="action-link"
              onClick={() => downloadManifest(demoState)}
            >
              Download JSON
            </button>
          </div>
          <div className="upload-manifest-card">
            <div className="detail-stat-block">
              <strong>{manifestFileName}</strong>
              <span>manifest file name</span>
            </div>
            <div className="detail-stat-block">
              <strong>{demoState === "published-preview" ? "Published preview" : "Draft"}</strong>
              <span>demo state</span>
            </div>
            <div className="detail-stat-block">
              <strong>{sourceUrl ? "Linked import" : "Manual entry"}</strong>
              <span>starting point</span>
            </div>
          </div>
          <p className="muted">
            Export the manifest to package this demo listing as structured JSON before a live backend exists.
          </p>
        </section>

        <section className="panel upload-preview-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Import Preview</p>
            <h3>What came in from the source link</h3>
          </div>
          {lastImport ? (
            <div className="page-stack">
              <div className="chip-row">
                <span className="chip chip-accent">{lastImport.sourceLabel}</span>
                {lastImport.author ? <span className="chip">By {lastImport.author}</span> : null}
                <span className="chip">{lastImport.files.length} links</span>
                <span className="chip">{lastImport.media.length} media</span>
              </div>
              <a href={lastImport.sourceUrl} target="_blank" rel="noreferrer" className="ghost-link">
                Open imported source
              </a>
              {lastImport.warnings.length > 0 ? (
                <div className="page-stack upload-import-warnings">
                  {lastImport.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              ) : (
                <p className="muted">
                  Imported metadata is staged locally. Review it before saving the draft or publishing the preview.
                </p>
              )}
            </div>
          ) : (
            <p className="muted">
              No imported source yet. Paste a supported listing link above to prefill the title, files, media, and metadata.
            </p>
          )}
        </section>

        <section className="panel upload-preview-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Listing Snapshot</p>
            <h3>What another team will see</h3>
          </div>
          <div className="chip-row">
            {previewPart.products.map((product) => (
              <span key={product} className="chip">
                {product}
              </span>
            ))}
            {previewPart.seasons.map((season) => (
              <span key={season} className="chip">
                {season}
              </span>
            ))}
            <span className="chip chip-accent">{previewPart.license}</span>
          </div>
          <ul className="detail-list">
            {previewPart.installNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>

        <section className="panel upload-preview-panel">
          <div className="upload-slot-head">
            <div className="upload-step-head">
              <p className="eyebrow">Saved Drafts</p>
              <h3>Saved in this browser</h3>
            </div>
            {savedDrafts.length > 0 ? (
              <button type="button" className="action-link" onClick={clearSavedDrafts}>
                Clear all
              </button>
            ) : null}
          </div>
          {savedDrafts.length > 0 ? (
            <div className="upload-queue-grid">
              {savedDrafts.map((draft) => (
                <article key={draft.id} className="upload-queue-item upload-saved-draft">
                  <div>
                    <strong>{draft.title || "Untitled draft"}</strong>
                    <p>{new Date(draft.savedAt).toLocaleString()}</p>
                    <div className="chip-row">
                      <span
                        className={`chip${
                          (draft.demoState ?? "draft") === "published-preview" ? " chip-accent" : ""
                        }`}
                      >
                        {(draft.demoState ?? "draft") === "published-preview" ? "Published preview" : "Draft"}
                      </span>
                      {draft.lastImport?.sourceLabel ? <span className="chip">{draft.lastImport.sourceLabel}</span> : null}
                    </div>
                  </div>
                  <button type="button" className="action-link" onClick={() => restoreDraft(draft)}>
                    Restore
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">No saved drafts yet. Save one after editing the listing.</p>
          )}
        </section>

        <UploadChecklist />
        </div>
      </div>
    </div>
  );
}
