import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  categoryDefinitions,
  creators,
  type CatalogFile,
  type CatalogPart,
  type MediaCard
} from "../src/lib/catalog";

const rootDirectory = process.cwd();
const listingDirectory = join(rootDirectory, "src", "data", "listings");
const publicDirectory = join(rootDirectory, "public");
const allowedFileTypes = new Set<CatalogFile["fileType"]>(["STL", "STEP", "3MF", "DXF", "ZIP", "SOURCE"]);
const allowedMediaKinds = new Set<MediaCard["kind"]>(["image", "video"]);
const validCategories = new Map<string, (typeof categoryDefinitions)[number]>(
  categoryDefinitions.map((category) => [category.slug, category])
);
const validCreators = new Set(creators.map((creator) => creator.handle));
const genericSourcePlaceholders = new Set([
  "https://cad.onshape.com/",
  "https://github.com/"
]);

type ValidationIssue = {
  file: string;
  code: string;
  message: string;
};

type ManifestStatus = {
  file: string;
  slug: string;
  errorCount: number;
  warningCount: number;
  submissionReady: boolean;
};

const submissionBlockingWarningCodes = new Set([
  "placeholder-file-href",
  "generic-source-placeholder",
  "missing-media-src"
]);

function pushIssue(
  issues: ValidationIssue[],
  file: string,
  code: string,
  message: string
) {
  issues.push({ file, code, message });
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";

    if (url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }

    return url.toString();
  } catch {
    return value.trim();
  }
}

function isRemoteUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isLocalAsset(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}

function validateString(value: unknown, field: string, issues: ValidationIssue[], file: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    pushIssue(issues, file, "empty-string", `${field} must be a non-empty string.`);
    return "";
  }

  return value.trim();
}

function validateStringArray(value: unknown, field: string, issues: ValidationIssue[], file: string) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.trim().length === 0)) {
    pushIssue(issues, file, "invalid-string-array", `${field} must be an array of non-empty strings.`);
    return [] as string[];
  }

  return value.map((entry) => entry.trim());
}

function validateLocalAssetPath(
  assetPath: string,
  field: string,
  file: string,
  errors: ValidationIssue[]
) {
  const targetPath = resolve(publicDirectory, `.${assetPath}`);

  if (!targetPath.startsWith(resolve(publicDirectory))) {
    pushIssue(errors, file, "asset-outside-public", `${field} points outside /public: ${assetPath}`);
    return;
  }

  if (!existsSync(targetPath)) {
    pushIssue(errors, file, "missing-public-asset", `${field} references a missing public asset: ${assetPath}`);
  }
}

function validateFileRecords(
  value: unknown,
  file: string,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  discoveredSourceUrls: string[]
) {
  if (!Array.isArray(value)) {
    pushIssue(errors, file, "files-not-array", "files must be an array.");
    return;
  }

  if (value.length === 0) {
    pushIssue(errors, file, "files-empty", "files must contain at least one entry.");
  }

  const seenFileKeys = new Set<string>();

  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object") {
      pushIssue(errors, file, "file-not-object", `files[${index}] must be an object.`);
      continue;
    }

    const record = item as CatalogFile;
    const label = validateString(record.label, `files[${index}].label`, errors, file);
    const href = validateString(record.href, `files[${index}].href`, errors, file);
    validateString(record.note, `files[${index}].note`, errors, file);

    if (!allowedFileTypes.has(record.fileType)) {
      pushIssue(errors, file, "invalid-file-type", `files[${index}].fileType is not allowed: ${String(record.fileType)}`);
    }

    const fileKey = `${normalizeText(label)}::${normalizeUrl(href)}`;
    if (label && href && seenFileKeys.has(fileKey)) {
      pushIssue(warnings, file, "duplicate-file-entry", `files[${index}] duplicates another file label/href pair in the manifest.`);
    } else if (label && href) {
      seenFileKeys.add(fileKey);
    }

    if (href === "#") {
      pushIssue(warnings, file, "placeholder-file-href", `files[${index}] (${label || "unnamed"}) still uses a placeholder href.`);
      continue;
    }

    if (isLocalAsset(href)) {
      validateLocalAssetPath(href, `files[${index}].href`, file, errors);
      continue;
    }

    if (!isRemoteUrl(href)) {
      pushIssue(errors, file, "invalid-file-href", `files[${index}].href must be '#', a local /public asset, or an http(s) URL.`);
      continue;
    }

    const normalizedHref = normalizeUrl(href);

    if (!genericSourcePlaceholders.has(normalizedHref)) {
      discoveredSourceUrls.push(normalizedHref);
    } else {
      pushIssue(warnings, file, "generic-source-placeholder", `files[${index}] uses a generic source placeholder URL: ${normalizedHref}`);
    }
  }
}

function validateMediaRecords(
  value: unknown,
  file: string,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
) {
  if (!Array.isArray(value)) {
    pushIssue(errors, file, "media-not-array", "media must be an array.");
    return;
  }

  if (value.length === 0) {
    pushIssue(errors, file, "media-empty", "media must contain at least one entry.");
  }

  const seenMediaKeys = new Set<string>();

  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object") {
      pushIssue(errors, file, "media-not-object", `media[${index}] must be an object.`);
      continue;
    }

    const record = item as MediaCard;
    validateString(record.title, `media[${index}].title`, errors, file);
    validateString(record.note, `media[${index}].note`, errors, file);

    if (!allowedMediaKinds.has(record.kind)) {
      pushIssue(errors, file, "invalid-media-kind", `media[${index}].kind is not allowed: ${String(record.kind)}`);
    }

    if (!record.src || record.src.trim().length === 0) {
      pushIssue(warnings, file, "missing-media-src", `media[${index}] is missing src and will render as a fallback preview.`);
      continue;
    }

    const src = record.src.trim();
    const mediaKey = `${record.kind}::${normalizeText(record.title)}::${normalizeUrl(src)}`;
    if (seenMediaKeys.has(mediaKey)) {
      pushIssue(warnings, file, "duplicate-media-entry", `media[${index}] duplicates another media item in the manifest.`);
    } else {
      seenMediaKeys.add(mediaKey);
    }

    if (isLocalAsset(src)) {
      validateLocalAssetPath(src, `media[${index}].src`, file, errors);
      continue;
    }

    if (!isRemoteUrl(src)) {
      pushIssue(errors, file, "invalid-media-src", `media[${index}].src must be a local /public asset or an http(s) URL.`);
    }
  }
}

function validateManifest(
  fileName: string,
  content: CatalogPart,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  titleOwnerIndex: Map<string, string>,
  sourceUrlIndex: Map<string, string>
) {
  const file = `src/data/listings/${fileName}`;
  const slug = validateString(content.slug, "slug", errors, file);
  const expectedFileName = `${slug}.json`;

  if (slug && fileName !== expectedFileName) {
    pushIssue(errors, file, "filename-slug-mismatch", `file name must match slug. Expected ${expectedFileName}.`);
  }

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    pushIssue(errors, file, "invalid-slug-format", "slug must be lower-case kebab-case.");
  }

  const title = validateString(content.title, "title", errors, file);
  const summary = validateString(content.summary, "summary", errors, file);
  validateString(content.category, "category", errors, file);
  validateString(content.categoryLabel, "categoryLabel", errors, file);
  validateString(content.subsystem, "subsystem", errors, file);
  validateString(content.creatorHandle, "creatorHandle", errors, file);
  validateString(content.license, "license", errors, file);
  validateString(content.viewerNote, "viewerNote", errors, file);
  const publishedAt = validateString(content.publishedAt, "publishedAt", errors, file);
  const updatedAt = validateString(content.updatedAt, "updatedAt", errors, file);
  validateStringArray(content.materials, "materials", errors, file);
  const vendors = validateStringArray(content.vendors, "vendors", errors, file);
  const products = validateStringArray(content.products, "products", errors, file);
  validateStringArray(content.seasons, "seasons", errors, file);
  const tags = validateStringArray(content.tags, "tags", errors, file);
  validateStringArray(content.installNotes, "installNotes", errors, file);

  if (title.length > 0 && title.length < 6) {
    pushIssue(warnings, file, "short-title", "title is very short and may be hard to browse.");
  }

  if (summary.length > 0 && summary.length < 40) {
    pushIssue(warnings, file, "short-summary", "summary is very short. Add enough context for another team to understand the part.");
  }

  if (tags.length < 2) {
    pushIssue(warnings, file, "low-tag-count", "use at least two tags so the listing is easier to discover.");
  }

  if (new Set(tags.map(normalizeText)).size !== tags.length) {
    pushIssue(warnings, file, "duplicate-tags", "tags contains duplicates when normalized.");
  }

  if (new Set(vendors.map(normalizeText)).size !== vendors.length) {
    pushIssue(warnings, file, "duplicate-vendors", "vendors contains duplicates when normalized.");
  }

  if (new Set(products.map(normalizeText)).size !== products.length) {
    pushIssue(warnings, file, "duplicate-products", "products contains duplicates when normalized.");
  }

  if (typeof content.featured !== "boolean") {
    pushIssue(errors, file, "featured-not-boolean", "featured must be a boolean.");
  }

  if (content.validated !== undefined && typeof content.validated !== "boolean") {
    pushIssue(errors, file, "validated-not-boolean", "validated must be a boolean when provided.");
  }

  for (const metric of ["rating", "views", "downloads"] as const) {
    if (typeof content[metric] !== "number" || !Number.isFinite(content[metric]) || content[metric] < 0) {
      pushIssue(errors, file, "invalid-metric", `${metric} must be a non-negative number.`);
    }
  }

  if (typeof content.rating === "number" && content.rating > 5) {
    pushIssue(errors, file, "rating-out-of-range", "rating cannot be greater than 5.");
  }

  const publishedDate = new Date(publishedAt);
  const updatedDate = new Date(updatedAt);

  if (publishedAt && Number.isNaN(publishedDate.getTime())) {
    pushIssue(errors, file, "invalid-published-date", "publishedAt must be a valid date string.");
  }

  if (updatedAt && Number.isNaN(updatedDate.getTime())) {
    pushIssue(errors, file, "invalid-updated-date", "updatedAt must be a valid date string.");
  }

  if (
    publishedAt &&
    updatedAt &&
    !Number.isNaN(publishedDate.getTime()) &&
    !Number.isNaN(updatedDate.getTime()) &&
    updatedDate.getTime() < publishedDate.getTime()
  ) {
    pushIssue(errors, file, "updated-before-published", "updatedAt cannot be earlier than publishedAt.");
  }

  const categoryDefinition = validCategories.get(content.category);

  if (!categoryDefinition) {
    pushIssue(errors, file, "unknown-category", `category is not recognized: ${content.category}`);
  } else if (content.categoryLabel !== categoryDefinition.label) {
    pushIssue(
      errors,
      file,
      "category-label-mismatch",
      `categoryLabel does not match category ${content.category}. Expected "${categoryDefinition.label}".`
    );
  }

  if (!validCreators.has(content.creatorHandle)) {
    pushIssue(errors, file, "unknown-creator", `creatorHandle is not recognized: ${content.creatorHandle}`);
  }

  const titleOwnerKey = `${normalizeText(content.creatorHandle)}::${normalizeText(content.title)}`;
  const existingTitleOwner = titleOwnerIndex.get(titleOwnerKey);

  if (existingTitleOwner && existingTitleOwner !== slug) {
    pushIssue(
      errors,
      file,
      "duplicate-title-owner",
      `duplicate title detected for creator ${content.creatorHandle}. Also used by ${existingTitleOwner}.`
    );
  } else if (slug) {
    titleOwnerIndex.set(titleOwnerKey, slug);
  }

  const discoveredSourceUrls: string[] = [];
  validateFileRecords(content.files, file, errors, warnings, discoveredSourceUrls);
  validateMediaRecords(content.media, file, errors, warnings);

  if (!Array.isArray(content.versions) || content.versions.length === 0) {
    pushIssue(errors, file, "versions-empty", "versions must contain at least one entry.");
  } else {
    for (const [index, version] of content.versions.entries()) {
      validateString(version?.label, `versions[${index}].label`, errors, file);
      validateString(version?.date, `versions[${index}].date`, errors, file);
      validateString(version?.summary, `versions[${index}].summary`, errors, file);
    }
  }

  for (const sourceUrl of discoveredSourceUrls) {
    const existingSourceOwner = sourceUrlIndex.get(sourceUrl);

    if (existingSourceOwner && existingSourceOwner !== slug) {
      pushIssue(
        errors,
        file,
        "duplicate-source-url",
        `source URL is already used by another listing: ${sourceUrl} (also in ${existingSourceOwner}).`
      );
      continue;
    }

    if (slug) {
      sourceUrlIndex.set(sourceUrl, slug);
    }
  }
}

function main() {
  const listingFiles = readdirSync(listingDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const manifestStatuses: ManifestStatus[] = [];
  const seenSlugs = new Set<string>();
  const titleOwnerIndex = new Map<string, string>();
  const sourceUrlIndex = new Map<string, string>();

  if (listingFiles.length === 0) {
    console.error("No listing manifests were found in src/data/listings.");
    process.exit(1);
  }

  for (const fileName of listingFiles) {
    const fullPath = join(listingDirectory, fileName);
    let parsed: CatalogPart;

    try {
      parsed = JSON.parse(readFileSync(fullPath, "utf8")) as CatalogPart;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown JSON parse error.";
      pushIssue(errors, `src/data/listings/${fileName}`, "invalid-json", `invalid JSON: ${message}`);
      continue;
    }

    if (typeof parsed.slug === "string" && parsed.slug.trim()) {
      if (seenSlugs.has(parsed.slug)) {
        pushIssue(
          errors,
          `src/data/listings/${fileName}`,
          "duplicate-slug",
          `duplicate slug detected across manifests: ${parsed.slug}`
        );
      } else {
        seenSlugs.add(parsed.slug);
      }
    }

    const beforeErrors = errors.length;
    const beforeWarnings = warnings.length;
    validateManifest(fileName, parsed, errors, warnings, titleOwnerIndex, sourceUrlIndex);
    const manifestErrors = errors.slice(beforeErrors).filter((issue) => issue.file === `src/data/listings/${fileName}`);
    const manifestWarnings = warnings.slice(beforeWarnings).filter((issue) => issue.file === `src/data/listings/${fileName}`);
    manifestStatuses.push({
      file: `src/data/listings/${fileName}`,
      slug: parsed.slug,
      errorCount: manifestErrors.length,
      warningCount: manifestWarnings.length,
      submissionReady:
        manifestErrors.length === 0 &&
        manifestWarnings.every((issue) => !submissionBlockingWarningCodes.has(issue.code))
    });
  }

  for (const warning of warnings) {
    console.warn(`WARNING [${warning.code}] ${warning.file}: ${warning.message}`);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`ERROR [${error.code}] ${error.file}: ${error.message}`);
    }

    console.error(`Listing validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}.`);
    process.exit(1);
  }

  console.log("Submission readiness:");
  for (const status of manifestStatuses) {
    console.log(
      `- ${status.slug}: ${status.submissionReady ? "ready" : "beta-only"} (${status.errorCount} errors, ${status.warningCount} warnings)`
    );
  }

  console.log(
    `Validated ${listingFiles.length} listing manifest${listingFiles.length === 1 ? "" : "s"} with ${warnings.length} warning${warnings.length === 1 ? "" : "s"}.`
  );
}

main();
