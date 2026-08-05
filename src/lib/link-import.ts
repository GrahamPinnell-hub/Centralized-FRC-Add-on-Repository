import type { CatalogFile } from "@/lib/catalog";

type ImportSource = {
  key: "printables" | "thingiverse" | "grabcad" | "onshape" | "github";
  label: string;
  hostnames: string[];
};

type MicrolinkImage = {
  url?: string;
};

type MicrolinkPayload = {
  status?: string;
  statusCode?: number;
  data?: {
    title?: string;
    description?: string;
    url?: string;
    author?: string | null;
    publisher?: string | null;
    image?: MicrolinkImage | null;
  };
};

type GitHubRepoPayload = {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  license: {
    spdx_id: string | null;
  } | null;
};

type GitHubTreePayload = {
  tree: Array<{
    path: string;
    type: string;
  }>;
};

export type ImportedFileCandidate = {
  label: string;
  fileType: CatalogFile["fileType"];
  href: string;
  note: string;
};

export type ImportedMediaCandidate = {
  kind: "image" | "video";
  title: string;
  note: string;
  src: string;
};

export type ImportedListingData = {
  sourceLabel: string;
  sourceKey: ImportSource["key"];
  sourceUrl: string;
  title: string;
  description: string;
  author: string | null;
  publisher: string | null;
  license: string | null;
  categorySlug: string | null;
  tags: string[];
  products: string[];
  vendors: string[];
  files: ImportedFileCandidate[];
  media: ImportedMediaCandidate[];
  warnings: string[];
};

const supportedSources: ImportSource[] = [
  { key: "printables", label: "Printables", hostnames: ["printables.com"] },
  { key: "thingiverse", label: "Thingiverse", hostnames: ["thingiverse.com"] },
  { key: "grabcad", label: "GrabCAD", hostnames: ["grabcad.com"] },
  { key: "onshape", label: "Onshape", hostnames: ["cad.onshape.com", "onshape.com"] },
  { key: "github", label: "GitHub", hostnames: ["github.com"] }
];

const supportedFileExtensions = [
  "stl",
  "3mf",
  "dxf",
  "step",
  "stp",
  "iges",
  "igs",
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
] as const;

const keywordSignals = [
  {
    pattern: /\bmk4i\b|\bmk4\b|\bmaxswerve\b|\bswerve\b/i,
    categorySlug: "swerve-covers",
    tags: ["swerve"],
    products: ["MK4i"],
    vendors: ["SDS"]
  },
  {
    pattern: /\blimelight\b|\bphoton\b|\bvision\b|\bcamera\b/i,
    categorySlug: "vision-mounts",
    tags: ["vision", "limelight"],
    products: ["Limelight 4"],
    vendors: ["Limelight"]
  },
  {
    pattern: /\bradio\b|\bpdh\b|\brsl\b|\belectronic/i,
    categorySlug: "electronics-mounts",
    tags: ["electronics"],
    products: ["PDH", "Radio"],
    vendors: ["REV"]
  },
  {
    pattern: /\bbattery\b/i,
    categorySlug: "battery-hardware",
    tags: ["battery"],
    products: ["Battery"],
    vendors: []
  },
  {
    pattern: /\bdriver station\b|\bjoystick\b|\bcontroller\b/i,
    categorySlug: "driver-station",
    tags: ["driver station"],
    products: [],
    vendors: []
  },
  {
    pattern: /\bkraken\b/i,
    categorySlug: null,
    tags: ["kraken"],
    products: ["Kraken"],
    vendors: ["WCP"]
  },
  {
    pattern: /\brev\b/i,
    categorySlug: null,
    tags: ["rev"],
    products: [],
    vendors: ["REV"]
  },
  {
    pattern: /\bwcp\b|\bwest coast products\b/i,
    categorySlug: null,
    tags: ["wcp"],
    products: [],
    vendors: ["WCP"]
  }
] as const;

const genericTagHints = [
  "mount",
  "cover",
  "camera",
  "vision",
  "intake",
  "wheel",
  "radio",
  "battery",
  "electronics",
  "swerve",
  "encoder",
  "limelight",
  "roller",
  "panel",
  "tray",
  "guard",
  "clip"
] as const;

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function detectSource(url: URL) {
  return supportedSources.find((source) =>
    source.hostnames.some((hostname) => url.hostname === hostname || url.hostname.endsWith(`.${hostname}`))
  );
}

function humanizeSegment(value: string) {
  return value
    .replace(/^thing:?/i, "")
    .replace(/^\d+[-_]+/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function humanizeRepositoryName(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/(^|[\s/])\w/g, (char) => char.toUpperCase());
}

function classifyFileType(path: string): CatalogFile["fileType"] | null {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";

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

  if (["f3d", "f3z", "sldprt", "sldasm", "ipt", "iam", "fcstd", "scad", "dwg", "ai", "svg"].includes(extension)) {
    return "SOURCE";
  }

  return null;
}

function priorityForFileType(fileType: CatalogFile["fileType"]) {
  switch (fileType) {
    case "STL":
      return 0;
    case "3MF":
      return 1;
    case "STEP":
      return 2;
    case "DXF":
      return 3;
    case "SOURCE":
      return 4;
    default:
      return 5;
  }
}

function extractSlugTitle(url: URL) {
  const segments = url.pathname
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });

  const ignored = new Set([
    "model",
    "models",
    "library",
    "cad-library",
    "files",
    "file",
    "download",
    "downloads",
    "documents",
    "document",
    "w",
    "e",
    "u"
  ]);

  for (const segment of [...segments].reverse()) {
    if (ignored.has(segment.toLowerCase()) || !/[a-z]/i.test(segment)) {
      continue;
    }

    const candidate = humanizeSegment(segment);
    if (candidate.length >= 4) {
      return candidate;
    }
  }

  return "";
}

function cleanImportedTitle(rawTitle: string | undefined, source: ImportSource, url: URL) {
  const slugTitle = extractSlugTitle(url);
  const title = (rawTitle ?? "").trim();

  if (source.key === "github") {
    const repoName = url.pathname.split("/").filter(Boolean)[1] ?? slugTitle;
    return humanizeRepositoryName(repoName || title || "Imported Listing");
  }

  let cleaned = title
    .replace(/\s+\|\s+Download free.*$/i, "")
    .replace(/\s+\|\s+Printables\.com.*$/i, "")
    .replace(/\s+\|\s+Thingiverse$/i, "")
    .replace(/\s+\|\s+GrabCAD.*$/i, "")
    .replace(/\s+\|\s+Onshape.*$/i, "")
    .trim();

  cleaned = cleaned.replace(/\s+by\s+[^|]+$/i, "").trim();

  return slugTitle || cleaned || "Imported Listing";
}

function cleanImportedDescription(rawDescription: string | undefined) {
  return (rawDescription ?? "")
    .replace(/\|\s+Download free 3D printable STL models?$/i, "")
    .replace(/\|\s+Download free STL models?$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAuthor(rawTitle: string | undefined, fallbackAuthor: string | null | undefined, source: ImportSource) {
  if (source.key === "github") {
    return fallbackAuthor ?? null;
  }

  const title = rawTitle ?? "";
  const byMatch = title.match(/\sby\s([^|]+?)(?:\s+\||$)/i);

  if (byMatch?.[1]) {
    return byMatch[1].trim();
  }

  if (fallbackAuthor && fallbackAuthor.toLowerCase() !== source.label.toLowerCase()) {
    return fallbackAuthor;
  }

  return null;
}

function deriveSignals(text: string) {
  const categoryChoices = keywordSignals
    .filter((signal) => signal.pattern.test(text))
    .map((signal) => signal.categorySlug)
    .filter((value) => value !== null);
  const genericTags = genericTagHints.filter((hint) => text.includes(hint));

  return {
    categorySlug: categoryChoices[0] ?? null,
    tags: dedupe([
      ...keywordSignals.flatMap((signal) => (signal.pattern.test(text) ? signal.tags : [])),
      ...genericTags
    ]),
    products: dedupe(keywordSignals.flatMap((signal) => (signal.pattern.test(text) ? signal.products : []))),
    vendors: dedupe(keywordSignals.flatMap((signal) => (signal.pattern.test(text) ? signal.vendors : [])))
  };
}

async function fetchMicrolinkPayload(url: string) {
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Metadata request failed with status ${response.status}.`);
  }

  return (await response.json()) as MicrolinkPayload;
}

function microlinkFailureReason(payload: MicrolinkPayload) {
  const metadataTitle = payload.data?.title?.trim() ?? "";

  if ((payload.statusCode ?? 200) >= 400) {
    return `The source blocked metadata import (${payload.statusCode}).`;
  }

  if (/^ERROR:/i.test(metadataTitle)) {
    return "The source returned an error page instead of the listing.";
  }

  if (/^sign in$/i.test(metadataTitle)) {
    return "The source requires sign-in before metadata can be read.";
  }

  return null;
}

async function importFromMicrolink(url: URL, source: ImportSource): Promise<ImportedListingData> {
  const payload = await fetchMicrolinkPayload(url.toString());
  const failureReason = microlinkFailureReason(payload);

  if (failureReason) {
    throw new Error(failureReason);
  }

  const metadata = payload.data ?? {};
  const title = cleanImportedTitle(metadata.title, source, url);
  const description = cleanImportedDescription(metadata.description);
  const author = extractAuthor(metadata.title, metadata.author, source);
  const signals = deriveSignals(`${title} ${description}`.toLowerCase());
  const files: ImportedFileCandidate[] = [
    {
      label: `Original ${source.label} listing`,
      fileType: "SOURCE",
      href: url.toString(),
      note: `Reference link back to the original ${source.label} page.`
    }
  ];
  const media: ImportedMediaCandidate[] = metadata.image?.url
    ? [
        {
          kind: "image",
          title,
          note: `Imported cover image from ${source.label}.`,
          src: metadata.image.url
        }
      ]
    : [];

  return {
    sourceLabel: source.label,
    sourceKey: source.key,
    sourceUrl: url.toString(),
    title,
    description,
    author,
    publisher: metadata.publisher ?? source.label,
    license: null,
    categorySlug: signals.categorySlug,
    tags: signals.tags,
    products: signals.products,
    vendors: signals.vendors,
    files,
    media,
    warnings: media.length === 0 ? [`${source.label} did not return a usable cover image.`] : []
  };
}

function parseGitHubRepo(url: URL) {
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length < 2) {
    return null;
  }

  return {
    owner: segments[0],
    repo: segments[1].replace(/\.git$/i, "")
  };
}

async function importFromGitHub(url: URL, source: ImportSource): Promise<ImportedListingData> {
  const repoTarget = parseGitHubRepo(url);

  if (!repoTarget) {
    throw new Error("GitHub imports need a repository URL like github.com/owner/repo.");
  }

  const repoHeaders = {
    "User-Agent": "FRC-Addons-Importer",
    Accept: "application/vnd.github+json"
  };

  const repoResponse = await fetch(`https://api.github.com/repos/${repoTarget.owner}/${repoTarget.repo}`, {
    headers: repoHeaders
  });

  if (!repoResponse.ok) {
    throw new Error(`GitHub repository lookup failed with status ${repoResponse.status}.`);
  }

  const repo = (await repoResponse.json()) as GitHubRepoPayload;

  const treeResponse = await fetch(
    `https://api.github.com/repos/${repoTarget.owner}/${repoTarget.repo}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`,
    { headers: repoHeaders }
  );

  if (!treeResponse.ok) {
    throw new Error(`GitHub file inventory failed with status ${treeResponse.status}.`);
  }

  const tree = (await treeResponse.json()) as GitHubTreePayload;
  const signals = deriveSignals(`${repo.name} ${repo.description ?? ""}`.toLowerCase());
  const cadFiles = tree.tree
    .filter((entry) => entry.type === "blob")
    .filter((entry) => supportedFileExtensions.some((extension) => entry.path.toLowerCase().endsWith(`.${extension}`)))
    .map((entry) => {
      const fileType = classifyFileType(entry.path);

      return fileType
        ? {
            label: entry.path,
            fileType,
            href: `https://raw.githubusercontent.com/${repoTarget.owner}/${repoTarget.repo}/${repo.default_branch}/${entry.path}`,
            note: `Imported from the GitHub repository tree: ${entry.path}`,
            priority: priorityForFileType(fileType)
          }
        : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((left, right) => left.priority - right.priority || left.label.localeCompare(right.label))
    .slice(0, 8)
    .map(({ priority: _priority, ...entry }) => entry);

  const files: ImportedFileCandidate[] = [
    {
      label: "Original GitHub repository",
      fileType: "SOURCE",
      href: repo.html_url,
      note: "Reference link back to the source repository."
    },
    {
      label: "Repository ZIP",
      fileType: "ZIP",
      href: `${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip`,
      note: `Download a snapshot of the ${repo.default_branch} branch.`
    },
    ...cadFiles
  ];

  const media: ImportedMediaCandidate[] = [
    {
      kind: "image",
      title: humanizeRepositoryName(repo.name),
      note: "Imported owner avatar from GitHub.",
      src: repo.owner.avatar_url
    }
  ];

  const warnings =
    cadFiles.length === 0
      ? ["No CAD or fabrication files were found in the repository tree yet."]
      : [];

  return {
    sourceLabel: source.label,
    sourceKey: source.key,
    sourceUrl: repo.html_url,
    title: humanizeRepositoryName(repo.name),
    description: cleanImportedDescription(repo.description ?? "") || `${repo.full_name} imported from GitHub.`,
    author: repo.owner.login,
    publisher: "GitHub",
    license: repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" ? repo.license.spdx_id : null,
    categorySlug: signals.categorySlug,
    tags: signals.tags,
    products: signals.products,
    vendors: signals.vendors,
    files,
    media,
    warnings
  };
}

export function getSupportedImportSources() {
  return supportedSources.map(({ key, label }) => ({ key, label }));
}

export async function importListingFromUrl(rawUrl: string): Promise<ImportedListingData> {
  let url: URL;

  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error("Enter a full URL, including https://, before importing.");
  }

  const source = detectSource(url);

  if (!source) {
    throw new Error("This importer currently supports Printables, Thingiverse, GrabCAD, Onshape, and GitHub links.");
  }

  if (source.key === "github") {
    return importFromGitHub(url, source);
  }

  return importFromMicrolink(url, source);
}
