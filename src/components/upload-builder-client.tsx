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
  creatorHandle: string;
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

const draftsStorageKey = "frc-addon-upload-drafts-v1";

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
  },
  {
    kind: "video",
    title: "Install clip",
    note: "Short install or use clip placeholder.",
    src: "https://images.unsplash.com/photo-1650530415027-dc9199f473ec?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=60&w=1600"
  }
];

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

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function inferMediaKind(file: File): DraftMedia["kind"] {
  if (file.type.startsWith("video/")) {
    return "video";
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ["mp4", "mov", "webm", "m4v"].includes(extension) ? "video" : "image";
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

export function UploadBuilderClient({
  options,
  creators
}: {
  options: SearchOptions;
  creators: Creator[];
}) {
  const [creatorHandle, setCreatorHandle] = useState(creators[0]?.handle ?? "team-31");
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
  const [license, setLicense] = useState("CC BY-NC 4.0");
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const previewPart = useMemo<CatalogPart>(() => {
    const activeCategory = options.categories.find((option) => option.slug === category);

    return {
      slug: slugify(title || "new-part"),
      title: title || "Untitled part",
      summary: summary || "Add a short summary so another team knows why this exists.",
      category,
      categoryLabel: activeCategory?.label ?? "Uncategorized",
      subsystem: subsystem || "General",
      creatorHandle,
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
          accent: "#d0a458",
          src: item.src
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
    creatorHandle,
    files,
    installNotes,
    license,
    materials,
    media,
    options.categories,
    printNotes,
    products,
    seasons,
    subsystem,
    summary,
    tags,
    title,
    vendors
  ]);

  const activeCreator = creators.find((creator) => creator.handle === creatorHandle) ?? creators[0];

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

  function buildSnapshot(): SavedDraftSnapshot {
    return {
      id: `${slugify(title || "untitled")}-${Date.now()}`,
      savedAt: new Date().toISOString(),
      creatorHandle,
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
    setSaveMessage(`Draft saved at ${new Date(snapshot.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`);
  }

  function restoreDraft(snapshot: SavedDraftSnapshot) {
    setCreatorHandle(snapshot.creatorHandle);
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

  return (
    <div className="upload-workbench">
      <div className="page-stack">
        <section className="panel upload-step-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Step 1</p>
            <h3>Ownership and listing basics</h3>
          </div>
          <form className="upload-form">
            <label>
              Team profile
              <select value={creatorHandle} onChange={(event) => setCreatorHandle(event.target.value)}>
                {creators.map((creator) => (
                  <option key={creator.handle} value={creator.handle}>
                    {creator.teamNumber} / {creator.teamName}
                  </option>
                ))}
              </select>
            </label>
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
            <h3>Compatibility and search metadata</h3>
          </div>
          <form className="upload-form">
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
              Search tags
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="swerve, guard, pit service"
              />
            </label>
            <label>
              License
              <input value={license} onChange={(event) => setLicense(event.target.value)} />
            </label>
          </form>
        </section>

        <section className="panel upload-step-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Step 3</p>
            <h3>Files, media drop lanes, and slot cleanup</h3>
          </div>
          <div className="page-stack">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="upload-hidden-input"
              onChange={onFileInputChange}
            />
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="upload-hidden-input"
              onChange={onMediaInputChange}
            />
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
              <div className="upload-dropzone-frame">
                <span className="upload-dropzone-icon" aria-hidden="true" />
                <strong>Drag your files here</strong>
                <p>STL, STEP, 3MF, DXF, ZIP, source CAD, and mixed fabrication bundles.</p>
              </div>
              <span className="upload-dropzone-separator">or</span>
              <button type="button" className="upload-browse-button" onClick={() => fileInputRef.current?.click()}>
                Browse Files
              </button>
              <p className="upload-dropzone-tip">
                Tip: you can upload multiple files as a single `.zip`, or drop several robot files at once.
              </p>
              <p className="upload-dropzone-support">
                Supported V1 lanes: `STL`, `STEP`, `3MF`, `DXF`, `ZIP`, source CAD exports, and related fabrication files.
              </p>
            </div>

            {stagedUploads.length > 0 ? (
              <section className="upload-import-queue">
                <div className="upload-slot-head">
                  <strong>Imported file queue</strong>
                  <span className="chip chip-accent">{stagedUploads.length} staged</span>
                </div>
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
              </section>
            ) : null}

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
              <div className="upload-dropzone-frame">
                <span className="upload-dropzone-icon upload-dropzone-icon-media" aria-hidden="true" />
                <strong>Drag gallery media here</strong>
                <p>Installed robot photos, pit shots, screenshots, and short install clips for the listing gallery.</p>
              </div>
              <span className="upload-dropzone-separator">or</span>
              <button type="button" className="upload-browse-button" onClick={() => mediaInputRef.current?.click()}>
                Browse Media
              </button>
            </div>

            {stagedMediaUploads.length > 0 ? (
              <section className="upload-import-queue">
                <div className="upload-slot-head">
                  <strong>Imported media queue</strong>
                  <span className="chip chip-accent">{stagedMediaUploads.length} staged</span>
                </div>
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
              </section>
            ) : null}

            {files.map((file, index) => (
              <div key={`file-${index}`} className="upload-slot-card">
                <div className="upload-slot-head">
                  <strong>File slot {index + 1}</strong>
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

            {media.map((item, index) => (
              <div key={`media-${index}`} className="upload-slot-card">
                <div className="upload-slot-head">
                  <strong>Media slot {index + 1}</strong>
                  <span className={`chip${item.kind === "video" ? " chip-accent" : ""}`}>
                    {item.kind}
                  </span>
                </div>
                <div className="upload-field-grid">
                  <label>
                    Media kind
                    <select value={item.kind} onChange={(event) => updateMedia(index, "kind", event.target.value)}>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </label>
                  <label>
                    Media title
                    <input value={item.title} onChange={(event) => updateMedia(index, "title", event.target.value)} />
                  </label>
                </div>
                <label className="upload-form">
                  Preview image URL
                  <input value={item.src} onChange={(event) => updateMedia(index, "src", event.target.value)} />
                </label>
                <label className="upload-form">
                  Media note
                  <input value={item.note} onChange={(event) => updateMedia(index, "note", event.target.value)} />
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="panel upload-step-panel">
          <div className="upload-step-head">
            <p className="eyebrow">Step 4</p>
            <h3>Fabrication and install guidance</h3>
          </div>
          <form className="upload-form">
            <label>
              Print / fabrication notes
              <textarea value={printNotes} onChange={(event) => setPrintNotes(event.target.value)} />
            </label>
            <label>
              Installation notes
              <textarea value={installNotes} onChange={(event) => setInstallNotes(event.target.value)} />
            </label>
            <div className="filter-actions">
              <button type="button" onClick={saveDraft}>
                Save draft
              </button>
              <button type="button" onClick={() => setSaveMessage("Publish flow stays mocked until live storage and auth are connected.")}>
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
              <strong>{activeCreator?.teamNumber ?? "--"}</strong>
              <span>team owner</span>
            </div>
            <div className="detail-stat-block">
              <strong>{previewPart.files.length}</strong>
              <span>file slots</span>
            </div>
            <div className="detail-stat-block">
              <strong>{previewPart.media.length}</strong>
              <span>media slots</span>
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
