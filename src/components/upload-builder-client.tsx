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

const draftsStorageKey = "frc-addon-upload-drafts-v2";

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

  function updateFile(index: number, key: keyof DraftFile, value: string) {
    setFiles((current) =>
      current.map((file, fileIndex) =>
        fileIndex === index
          ? {
              ...file,
              [key]: key === "fileType" ? (value as DraftFile["fileType"]) : value
            }
          : file
      )
    );
  }

  function updateMedia(index: number, key: keyof DraftMedia, value: string) {
    setMedia((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: key === "kind" ? (value as DraftMedia["kind"]) : value
            }
          : item
      )
    );
  }

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
              <summary>Advanced options</summary>
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
              className={`upload-dropzone upload-dropzone-media${isDraggingMedia ? " is-dragging" : ""}`}
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
              <div className="upload-dropzone-frame upload-dropzone-frame-compact">
                <span className="upload-dropzone-icon upload-dropzone-icon-media" aria-hidden="true" />
                <strong>Drag gallery media here</strong>
                <p>Photos first. Short install videos can live here too.</p>
              </div>
              <button type="button" className="upload-browse-button" onClick={() => mediaInputRef.current?.click()}>
                Add Photos
              </button>
            </div>
            {stagedMediaUploads.length > 0 ? (
              <div className="upload-queue-grid">
                {stagedMediaUploads.map((upload, index) => (
                  <article key={`${upload.name}-${index}`} className="upload-queue-item">
                    <div>
                      <strong>{upload.name}</strong>
                      <p>{upload.sizeLabel}</p>
                    </div>
                    <span className={`chip${upload.kind === "video" ? " chip-accent" : ""}`}>
                      {upload.kind}
                    </span>
                  </article>
                ))}
              </div>
            ) : null}
            <div className="upload-media-grid">
              {media.map((item, index) => (
                <div key={`media-${index}`} className="upload-media-card">
                  <div className="upload-media-preview">
                    {item.src ? <img src={item.src} alt="" /> : <span>Preview</span>}
                  </div>
                  <div className="upload-slot-head">
                    <strong>{item.kind === "video" ? "Video slot" : "Photo slot"} {index + 1}</strong>
                    <span className={`chip${item.kind === "video" ? " chip-accent" : ""}`}>
                      {item.kind}
                    </span>
                  </div>
                  <div className="upload-form">
                    <label>
                      Title
                      <input value={item.title} onChange={(event) => updateMedia(index, "title", event.target.value)} />
                    </label>
                    <label>
                      Note
                      <input value={item.note} onChange={(event) => updateMedia(index, "note", event.target.value)} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
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
                <h4>3D Models and Fabrication Files</h4>
                <p>Print files, neutral CAD, DXF flat patterns, ZIP bundles, and source CAD.</p>
              </div>
            </div>
            <div
              className={`upload-dropzone${isDraggingFiles ? " is-dragging" : ""}`}
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
              <div className="upload-dropzone-frame upload-dropzone-frame-compact">
                <span className="upload-dropzone-icon" aria-hidden="true" />
                <strong>Drag model files here</strong>
                <p>STL, STEP, 3MF, DXF, ZIP, and source CAD all belong in this lane.</p>
              </div>
              <button type="button" className="upload-browse-button" onClick={() => fileInputRef.current?.click()}>
                Add Model Files
              </button>
            </div>
            {stagedUploads.length > 0 ? (
              <div className="upload-queue-grid">
                {stagedUploads.map((upload, index) => (
                  <article key={`${upload.name}-${index}`} className="upload-queue-item">
                    <div>
                      <strong>{upload.name}</strong>
                      <p>{upload.sizeLabel}</p>
                    </div>
                    <span className="chip">{upload.fileType}</span>
                  </article>
                ))}
              </div>
            ) : null}
            <div className="upload-file-grid">
              {files.map((file, index) => (
                <div key={`file-${index}`} className="upload-slot-card">
                  <div className="upload-slot-head">
                    <strong>Model slot {index + 1}</strong>
                    <span className="chip">{file.fileType}</span>
                  </div>
                  <div className="upload-field-grid">
                    <label>
                      File label
                      <input value={file.label} onChange={(event) => updateFile(index, "label", event.target.value)} />
                    </label>
                    <label>
                      File type
                      <select
                        value={file.fileType}
                        onChange={(event) => updateFile(index, "fileType", event.target.value)}
                      >
                        {options.fileTypes.map((fileType) => (
                          <option key={fileType} value={fileType}>
                            {fileType}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="upload-form">
                    File or source URL
                    <input value={file.href} onChange={(event) => updateFile(index, "href", event.target.value)} />
                  </label>
                  <label className="upload-form">
                    Slot note
                    <input value={file.note} onChange={(event) => updateFile(index, "note", event.target.value)} />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="panel upload-step-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Step 4</p>
            <h3>Install notes and publish</h3>
          </div>
          <form className="upload-form">
            <label>
              Installation notes
              <textarea value={installNotes} onChange={(event) => setInstallNotes(event.target.value)} />
            </label>
            <div className="filter-actions">
              <button type="button" onClick={saveDraft}>
                Save draft
              </button>
              <button
                type="button"
                onClick={() =>
                  setSaveMessage("Publish flow stays mocked until live storage, accounts, and team access are connected.")
                }
              >
                Publish now
              </button>
            </div>
            {saveMessage ? <p className="upload-inline-note">{saveMessage}</p> : null}
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
