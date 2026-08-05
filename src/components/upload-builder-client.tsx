"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { PartCard, UploadChecklist } from "@/components/ui";
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

type SavedDraftSnapshot = {
  id: string;
  savedAt: string;
  ownerHandle: string;
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

type SubmissionManifest = {
  manifestVersion: "frc-addon-submission-v1";
  generatedAt: string;
  reviewStatus: "PENDING_REVIEW";
  workflow: "github-pages-static-submission";
  repository: {
    target: string;
    issueDraftUrl: string;
  };
  owner: {
    type: "PERSONAL" | "TEAM";
    handle: string;
    label: string;
  };
  listing: {
    slug: string;
    title: string;
    summary: string;
    category: string;
    categoryLabel: string;
    subsystem: string;
    license: string;
    tags: string[];
    vendors: string[];
    products: string[];
    seasons: string[];
    materials: string[];
    installNotes: string[];
    printAndFabricationNotes: string;
    fileCount: number;
    mediaCount: number;
    routeHint: string;
  };
  files: Array<{
    label: string;
    fileType: CatalogFile["fileType"];
    note: string;
    sourceUrl: string | null;
  }>;
  localUploads: {
    files: StagedUpload[];
    media: StagedMediaUpload[];
  };
  media: Array<{
    title: string;
    kind: DraftMedia["kind"];
    note: string;
    sourceUrl: string | null;
  }>;
};

const draftsStorageKey = "frc-addon-upload-drafts-v2";
const submissionRepo = "GrahamPinnell-hub/Centralized-FRC-Add-on-Repository";

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
    title: "Installed photo",
    note: "Show the part mounted on the robot if possible.",
    src: "https://images.unsplash.com/photo-1741517669003-94a4cb80f793?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=60&w=1600"
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

export function UploadBuilderClient({
  options,
  creators,
  parts
}: {
  options: SearchOptions;
  creators: Creator[];
  parts: CatalogPart[];
}) {
  const ownerChoices = useMemo<OwnerChoice[]>(
    () => {
      const team31 = creators.find((creator) => creator.handle === "team-31");

      return [
        {
          handle: "graham-pinnell",
          title: "Publish personally",
          note: "Personal listings can work before a team code is attached.",
          badge: "Personal"
        },
        {
          handle: team31?.handle ?? "team-31",
          title: team31 ? `${team31.teamNumber} / ${team31.teamName}` : "31 / Prime Movers",
          note: "Use the signed-in team profile once team access codes are wired.",
          badge: "Team"
        }
      ];
    },
    [creators]
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
  const [title, setTitle] = useState("MK4i Swerve Wire Cover");
  const [summary, setSummary] = useState(
    "A quick-swap cover that protects wires and encoder routing without slowing down module service."
  );
  const [category, setCategory] = useState(options.categories[0]?.slug ?? "swerve-covers");
  const [subsystem, setSubsystem] = useState("Drivetrain");
  const [products, setProducts] = useState("MK4i");
  const [vendors, setVendors] = useState("SDS");
  const [seasons, setSeasons] = useState("2026, General");
  const [materials, setMaterials] = useState("PETG, ABS");
  const [tags, setTags] = useState("swerve, wire management, encoder guard");
  const [license, setLicense] = useState(licenseOptions[0] ?? "CC BY-NC 4.0");
  const [printNotes, setPrintNotes] = useState(
    "PETG or ABS, 0.4 mm nozzle, 0.24 mm layers, four walls recommended."
  );
  const [installNotes, setInstallNotes] = useState(
    "Snaps around the module top plate. Check cable exit clearance before tightening hardware."
  );
  const [files, setFiles] = useState<DraftFile[]>(defaultFiles);
  const [media, setMedia] = useState<DraftMedia[]>(defaultMedia);
  const [stagedUploads, setStagedUploads] = useState<StagedUpload[]>([]);
  const [stagedMediaUploads, setStagedMediaUploads] = useState<StagedMediaUpload[]>([]);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraftSnapshot[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
          summary: "Initial draft listing generated from the V1 upload workbench."
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
      viewerNote:
        "Preview shell will support richer 3D, DXF, and media inspection once live asset uploads are connected.",
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
  const submissionIssueTitle = `[Submission] ${previewPart.title || "Untitled FRC Add-on"}`;
  const submissionIssueBody = [
    "## Listing summary",
    `- Title: ${previewPart.title}`,
    `- Owner: ${ownerLabel}`,
    `- Category: ${previewPart.categoryLabel}`,
    `- Subsystem: ${previewPart.subsystem}`,
    `- Vendors: ${previewPart.vendors.join(", ") || "None listed"}`,
    `- Products: ${previewPart.products.join(", ") || "None listed"}`,
    `- Seasons: ${previewPart.seasons.join(", ") || "None listed"}`,
    `- Materials: ${previewPart.materials.join(", ") || "None listed"}`,
    `- License: ${previewPart.license}`,
    `- Files: ${previewPart.files.length}`,
    `- Media: ${previewPart.media.length}`,
    "",
    "## Install notes",
    ...previewPart.installNotes.map((note) => `- ${note}`),
    "",
    "## Handoff",
    "- Download the generated submission manifest from the upload page.",
    "- Attach it to this issue or paste the copied manifest JSON below.",
    "",
    "## Manifest JSON",
    "```json",
    "{}",
    "```"
  ].join("\n");
  const submissionIssueUrl = `https://github.com/${submissionRepo}/issues/new?title=${encodeURIComponent(submissionIssueTitle)}&body=${encodeURIComponent(submissionIssueBody)}`;
  const submissionManifest = useMemo<SubmissionManifest>(
    () => ({
      manifestVersion: "frc-addon-submission-v1",
      generatedAt: new Date().toISOString(),
      reviewStatus: "PENDING_REVIEW",
      workflow: "github-pages-static-submission",
      repository: {
        target: submissionRepo,
        issueDraftUrl: submissionIssueUrl
      },
      owner: {
        type: activeOwner?.badge === "Team" ? "TEAM" : "PERSONAL",
        handle: ownerHandle,
        label: ownerLabel
      },
      listing: {
        slug: previewPart.slug,
        title: previewPart.title,
        summary: previewPart.summary,
        category: previewPart.category,
        categoryLabel: previewPart.categoryLabel,
        subsystem: previewPart.subsystem,
        license: previewPart.license,
        tags: previewPart.tags,
        vendors: previewPart.vendors,
        products: previewPart.products,
        seasons: previewPart.seasons,
        materials: previewPart.materials,
        installNotes: previewPart.installNotes,
        printAndFabricationNotes: printNotes,
        fileCount: previewPart.files.length,
        mediaCount: previewPart.media.length,
        routeHint: `/parts/${previewPart.slug}`
      },
      files: previewPart.files.map((file) => ({
        label: file.label,
        fileType: file.fileType,
        note: file.note,
        sourceUrl: file.href !== "#" ? file.href : null
      })),
      localUploads: {
        files: stagedUploads,
        media: stagedMediaUploads
      },
      media: previewPart.media.map((item) => ({
        title: item.title,
        kind: item.kind,
        note: item.note,
        sourceUrl: item.src?.startsWith("blob:") ? null : (item.src ?? null)
      }))
    }),
    [
      activeOwner?.badge,
      ownerHandle,
      ownerLabel,
      previewPart,
      printNotes,
      stagedMediaUploads,
      stagedUploads,
      submissionIssueUrl
    ]
  );
  const submissionManifestJson = useMemo(
    () => JSON.stringify(submissionManifest, null, 2),
    [submissionManifest]
  );
  const submissionManifestFilename = `${previewPart.slug || "frc-addon"}-submission.json`;

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

  function buildSnapshot(): SavedDraftSnapshot {
    return {
      id: `${slugify(title || "untitled")}-${Date.now()}`,
      savedAt: new Date().toISOString(),
      ownerHandle,
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
      stagedMediaUploads
    };
  }

  function saveDraft() {
    const snapshot = buildSnapshot();
    const nextDrafts = [snapshot, ...savedDrafts].slice(0, 5);
    setSavedDrafts(nextDrafts);
    window.localStorage.setItem(draftsStorageKey, JSON.stringify(nextDrafts));
    setSaveMessage(
      `Draft saved at ${new Date(snapshot.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`
    );
  }

  function restoreDraft(snapshot: SavedDraftSnapshot) {
    setOwnerHandle(normalizeOwnerHandle(snapshot.ownerHandle));
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
    setSaveMessage(`Restored draft from ${new Date(snapshot.savedAt).toLocaleString()}.`);
  }

  function clearSavedDrafts() {
    setSavedDrafts([]);
    window.localStorage.removeItem(draftsStorageKey);
    setSaveMessage("Saved drafts cleared from this browser.");
  }

  function requestTeamLink() {
    setSaveMessage(
      "Team linking stays mocked for V1. Later this button will attach another FRC team profile through an access code."
    );
  }

  function requestFolderUpload() {
    setSaveMessage(
      "Folder upload stays mocked for V1. Later this button will keep nested print packages together like Printables."
    );
  }

  function downloadSubmissionManifest() {
    const blob = new Blob([submissionManifestJson], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = submissionManifestFilename;
    anchor.click();
    URL.revokeObjectURL(href);
    setSaveMessage(`Downloaded ${submissionManifestFilename}.`);
  }

  async function copyManifestJson() {
    try {
      await navigator.clipboard.writeText(submissionManifestJson);
      setSaveMessage("Submission manifest JSON copied to the clipboard.");
    } catch {
      setSaveMessage("Clipboard access failed. Download the manifest JSON instead.");
    }
  }

  function openSubmissionIssueDraft() {
    window.open(submissionIssueUrl, "_blank", "noopener,noreferrer");
    setSaveMessage("Opened a GitHub issue draft for this submission.");
  }

  return (
    <div className="upload-workbench">
      <div className="page-stack">
        <section className="panel upload-step-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Step 1</p>
            <h3>Ownership and listing basics</h3>
          </div>
          <div className="upload-owner-bar">
            <label className="upload-owner-select">
              Owner
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
                  <div className="upload-photo-frame">
                    {item.src ? (
                      item.kind === "video" ? (
                        <video src={item.src} muted playsInline />
                      ) : (
                        <img src={item.src} alt={item.title || ""} />
                      )
                    ) : (
                      <span>Preview</span>
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

        <section className="panel upload-step-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Step 5</p>
            <h3>Review and submission package</h3>
          </div>
          <div className="upload-review-grid">
            <section className="upload-review-card">
              <div className="upload-slot-head">
                <strong>Submission review</strong>
                <span className="submission-status submission-status-pending">Pending review</span>
              </div>
              <div className="upload-review-stats">
                <div className="upload-review-stat">
                  <strong>{ownerLabel}</strong>
                  <span>owner</span>
                </div>
                <div className="upload-review-stat">
                  <strong>{previewPart.categoryLabel}</strong>
                  <span>category</span>
                </div>
                <div className="upload-review-stat">
                  <strong>{previewPart.files.length}</strong>
                  <span>files</span>
                </div>
                <div className="upload-review-stat">
                  <strong>{previewPart.media.length}</strong>
                  <span>media</span>
                </div>
              </div>
              <div className="chip-row">
                {previewPart.products.map((product) => (
                  <span key={product} className="chip">
                    {product}
                  </span>
                ))}
                {previewPart.vendors.map((vendor) => (
                  <span key={vendor} className="chip">
                    {vendor}
                  </span>
                ))}
                <span className="chip chip-accent">{previewPart.license}</span>
              </div>
              <p className="muted">
                Static Pages mode packages this listing as a structured manifest so it can move
                through GitHub review before becoming a published repository entry.
              </p>
            </section>

            <section className="upload-review-card">
              <strong>Submission package</strong>
              <div className="upload-submission-meta">
                <span className="chip chip-accent">{submissionManifestFilename}</span>
                <span className="chip">{submissionRepo}</span>
              </div>
              <ul className="detail-list">
                <li>Download the manifest JSON package for this listing.</li>
                <li>Open a GitHub issue draft tied to the repository handoff lane.</li>
                <li>Paste or attach the manifest so the listing can move into review.</li>
              </ul>
            </section>
          </div>

          <div className="filter-actions">
            <button type="button" onClick={saveDraft}>
              Save draft
            </button>
            <button type="button" onClick={downloadSubmissionManifest}>
              Download manifest
            </button>
            <button type="button" className="action-link" onClick={copyManifestJson}>
              Copy manifest JSON
            </button>
            <button type="button" className="action-link" onClick={openSubmissionIssueDraft}>
              Open GitHub issue
            </button>
          </div>

          <details className="upload-manifest-panel">
            <summary>
              <span>Preview submission manifest</span>
            </summary>
            <pre className="upload-manifest-code">{submissionManifestJson}</pre>
          </details>

          {saveMessage ? <p className="upload-inline-note">{saveMessage}</p> : null}
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
            <span className="submission-status submission-status-pending">Pending review</span>
            <span className="chip">{submissionManifestFilename}</span>
          </div>
          <div className="upload-preview-meta">
            <div className="detail-stat-block">
              <strong>{activeOwner?.badge ?? "Profile"}</strong>
              <span>{activeOwner?.title ?? formatOwnerLabel(ownerHandle)}</span>
            </div>
            <div className="detail-stat-block">
              <strong>{previewPart.files.length}</strong>
              <span>model slots</span>
            </div>
            <div className="detail-stat-block">
              <strong>{previewPart.media.length}</strong>
              <span>photo slots</span>
            </div>
            <div className="detail-stat-block">
              <strong>{previewPart.tags.length}</strong>
              <span>search tags</span>
            </div>
          </div>
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
          <div className="upload-step-head">
            <p className="eyebrow">Submission</p>
            <h3>Repository handoff</h3>
          </div>
          <div className="upload-submission-meta">
            <span className="chip chip-accent">{submissionRepo}</span>
            <span className="chip">{submissionManifestFilename}</span>
          </div>
          <ul className="detail-list">
            <li>Manifest status stays pending until the GitHub handoff is reviewed.</li>
            <li>Use the downloaded package to preserve tags, files, media, notes, and ownership.</li>
            <li>Later this same manifest can post directly into Prisma-backed storage.</li>
          </ul>
        </section>

        <section className="panel upload-preview-panel">
          <div className="upload-slot-head">
            <div className="upload-step-head">
              <p className="eyebrow">Saved Drafts</p>
              <h3>Browser draft shelf</h3>
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
                  </div>
                  <button type="button" className="action-link" onClick={() => restoreDraft(draft)}>
                    Restore
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">No saved browser drafts yet. Save one after editing the listing builder.</p>
          )}
        </section>

        <UploadChecklist />
      </div>
    </div>
  );
}
