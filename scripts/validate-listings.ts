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
  message: string;
};

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
    issues.push({ file, message: `${field} must be a non-empty string.` });
    return "";
  }

  return value.trim();
}

function validateStringArray(value: unknown, field: string, issues: ValidationIssue[], file: string) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.trim().length === 0)) {
    issues.push({ file, message: `${field} must be an array of non-empty strings.` });
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
    errors.push({ file, message: `${field} points outside /public: ${assetPath}` });
    return;
  }

  if (!existsSync(targetPath)) {
    errors.push({ file, message: `${field} references a missing public asset: ${assetPath}` });
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
    errors.push({ file, message: "files must be an array." });
    return;
  }

  if (value.length === 0) {
    errors.push({ file, message: "files must contain at least one entry." });
  }

  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object") {
      errors.push({ file, message: `files[${index}] must be an object.` });
      continue;
    }

    const record = item as CatalogFile;
    const label = validateString(record.label, `files[${index}].label`, errors, file);
    const href = validateString(record.href, `files[${index}].href`, errors, file);
    validateString(record.note, `files[${index}].note`, errors, file);

    if (!allowedFileTypes.has(record.fileType)) {
      errors.push({ file, message: `files[${index}].fileType is not allowed: ${String(record.fileType)}` });
    }

    if (href === "#") {
      warnings.push({ file, message: `files[${index}] (${label || "unnamed"}) still uses a placeholder href.` });
      continue;
    }

    if (isLocalAsset(href)) {
      validateLocalAssetPath(href, `files[${index}].href`, file, errors);
      continue;
    }

    if (!isRemoteUrl(href)) {
      errors.push({ file, message: `files[${index}].href must be '#', a local /public asset, or an http(s) URL.` });
      continue;
    }

    const normalizedHref = normalizeUrl(href);

    if (!genericSourcePlaceholders.has(normalizedHref)) {
      discoveredSourceUrls.push(normalizedHref);
    } else {
      warnings.push({ file, message: `files[${index}] uses a generic source placeholder URL: ${normalizedHref}` });
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
    errors.push({ file, message: "media must be an array." });
    return;
  }

  if (value.length === 0) {
    errors.push({ file, message: "media must contain at least one entry." });
  }

  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object") {
      errors.push({ file, message: `media[${index}] must be an object.` });
      continue;
    }

    const record = item as MediaCard;
    validateString(record.title, `media[${index}].title`, errors, file);
    validateString(record.note, `media[${index}].note`, errors, file);

    if (!allowedMediaKinds.has(record.kind)) {
      errors.push({ file, message: `media[${index}].kind is not allowed: ${String(record.kind)}` });
    }

    if (!record.src || record.src.trim().length === 0) {
      warnings.push({ file, message: `media[${index}] is missing src and will render as a fallback preview.` });
      continue;
    }

    const src = record.src.trim();

    if (isLocalAsset(src)) {
      validateLocalAssetPath(src, `media[${index}].src`, file, errors);
      continue;
    }

    if (!isRemoteUrl(src)) {
      errors.push({ file, message: `media[${index}].src must be a local /public asset or an http(s) URL.` });
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
    errors.push({ file, message: `file name must match slug. Expected ${expectedFileName}.` });
  }

  validateString(content.title, "title", errors, file);
  validateString(content.summary, "summary", errors, file);
  validateString(content.category, "category", errors, file);
  validateString(content.categoryLabel, "categoryLabel", errors, file);
  validateString(content.subsystem, "subsystem", errors, file);
  validateString(content.creatorHandle, "creatorHandle", errors, file);
  validateString(content.license, "license", errors, file);
  validateString(content.viewerNote, "viewerNote", errors, file);
  validateString(content.publishedAt, "publishedAt", errors, file);
  validateString(content.updatedAt, "updatedAt", errors, file);
  validateStringArray(content.materials, "materials", errors, file);
  validateStringArray(content.vendors, "vendors", errors, file);
  validateStringArray(content.products, "products", errors, file);
  validateStringArray(content.seasons, "seasons", errors, file);
  validateStringArray(content.tags, "tags", errors, file);
  validateStringArray(content.installNotes, "installNotes", errors, file);

  if (typeof content.featured !== "boolean") {
    errors.push({ file, message: "featured must be a boolean." });
  }

  if (content.validated !== undefined && typeof content.validated !== "boolean") {
    errors.push({ file, message: "validated must be a boolean when provided." });
  }

  for (const metric of ["rating", "views", "downloads"] as const) {
    if (typeof content[metric] !== "number" || !Number.isFinite(content[metric]) || content[metric] < 0) {
      errors.push({ file, message: `${metric} must be a non-negative number.` });
    }
  }

  const categoryDefinition = validCategories.get(content.category);

  if (!categoryDefinition) {
    errors.push({ file, message: `category is not recognized: ${content.category}` });
  } else if (content.categoryLabel !== categoryDefinition.label) {
    errors.push({
      file,
      message: `categoryLabel does not match category ${content.category}. Expected "${categoryDefinition.label}".`
    });
  }

  if (!validCreators.has(content.creatorHandle)) {
    errors.push({ file, message: `creatorHandle is not recognized: ${content.creatorHandle}` });
  }

  const titleOwnerKey = `${normalizeText(content.creatorHandle)}::${normalizeText(content.title)}`;
  const existingTitleOwner = titleOwnerIndex.get(titleOwnerKey);

  if (existingTitleOwner && existingTitleOwner !== slug) {
    errors.push({
      file,
      message: `duplicate title detected for creator ${content.creatorHandle}. Also used by ${existingTitleOwner}.`
    });
  } else if (slug) {
    titleOwnerIndex.set(titleOwnerKey, slug);
  }

  const discoveredSourceUrls: string[] = [];
  validateFileRecords(content.files, file, errors, warnings, discoveredSourceUrls);
  validateMediaRecords(content.media, file, errors, warnings);

  if (!Array.isArray(content.versions) || content.versions.length === 0) {
    errors.push({ file, message: "versions must contain at least one entry." });
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
      errors.push({
        file,
        message: `source URL is already used by another listing: ${sourceUrl} (also in ${existingSourceOwner}).`
      });
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
      errors.push({ file: `src/data/listings/${fileName}`, message: `invalid JSON: ${message}` });
      continue;
    }

    if (typeof parsed.slug === "string" && parsed.slug.trim()) {
      if (seenSlugs.has(parsed.slug)) {
        errors.push({
          file: `src/data/listings/${fileName}`,
          message: `duplicate slug detected across manifests: ${parsed.slug}`
        });
      } else {
        seenSlugs.add(parsed.slug);
      }
    }

    validateManifest(fileName, parsed, errors, warnings, titleOwnerIndex, sourceUrlIndex);
  }

  for (const warning of warnings) {
    console.warn(`WARNING ${warning.file}: ${warning.message}`);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`ERROR ${error.file}: ${error.message}`);
    }

    console.error(`Listing validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}.`);
    process.exit(1);
  }

  console.log(
    `Validated ${listingFiles.length} listing manifest${listingFiles.length === 1 ? "" : "s"} with ${warnings.length} warning${warnings.length === 1 ? "" : "s"}.`
  );
}

main();
