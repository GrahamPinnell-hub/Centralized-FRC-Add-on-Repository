"use client";

import {
  type CSSProperties,
  type ChangeEvent,
  type DragEvent,
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

type OwnerChoice = {
  handle: string;
  title: string;
  note: string;
  badge: string;
};

const draftsStorageKey = "frc-addon-upload-drafts-v2";
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

const fallbackLicenses = [
  "CC BY-NC 4.0",
  "CC BY 4.0",
  "CC BY-NC-SA 4.0",
  "MIT",
  "CERN-OHL-S"
] as const;

function splitList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
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

function replaceTrailingTag(tags: string, nextTag: string) {
  const existing = tags
    .split(",")
    .slice(0, -1)
    .map((tag) => tag.trim())
    .filter(Boolean);

  return [...existing, nextTag].join(", ") + ", ";
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
    () => Array.from(new Set([...parts.map((part) => part.license), ...fallbackLicenses])).sort(),
    [parts]
  );

  const tagSuggestions = useMemo<TagSuggestion[]>(() => {
    const counts = new Map<string, number>();

    for (const part of parts) {
      for (const tag of part.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
  }, [parts]);

  const [ownerHandle, setOwnerHandle] = useState(ownerChoices[0]?.handle ?? "graham-pinnell");
  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState(defaultDraftTitle);
  const [summary, setSummary] = useState(defaultDraftSummary);
  const [category, setCategory] = useState(options.categories[0]?.slug ?? "swerve-covers");
  const [subsystem, setSubsystem] = useState("Drivetrain");
  const [products, setProducts] = useState("MK4i");
  const [vendors, setVendors] = useState("SDS");
  const [seasons, setSeasons] = useState("2026, General");
  const [materials, setMaterials] = useState("PETG, ABS");
  const [tags, setTags] = useState(defaultDraftTags);
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
  const objectUrlsRef = useRef<string[]>([]);

  const currentTagQuery = tags.split(",").at(-1)?.trim().toLowerCase() ?? "";
  const selectedTags = splitList(tags).map((tag) => tag.toLowerCase());
  const matchingTags = currentTagQuery
    ? tagSuggestions
        .filter(
          (suggestion) =>
            suggestion.label.toLowerCase().includes(currentTagQuery) &&
            !selectedTags.includes(suggestion.label.toLowerCase())
        )
        .slice(0, 8)
    : [];

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
      tags: splitList(tags),
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
    setTags((current) => replaceTrailingTag(current, tag));
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
    setSubsystem(snapshot.subsystem);
    setProducts(snapshot.products);
    setVendors(snapshot.vendors);
    setSeasons(snapshot.seasons);
    setMaterials(snapshot.materials);
    setTags(snapshot.tags);
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
                Subsystem
                <input value={subsystem} onChange={(event) => setSubsystem(event.target.value)} />
              </label>
            </div>
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
            </label>
            <label className="upload-tag-field">
              Search tags
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="mk4i, swerve cover, limelight mount"
              />
              {matchingTags.length > 0 ? (
                <div className="upload-tag-suggestions">
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
                    x
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
                <p>.stl, .3mf, .step, .dxf, .zip, and source CAD</p>
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
