import type { CatalogPart } from "@/lib/catalog";

export const betaRepositoryOwner = "GrahamPinnell-hub";
export const betaRepositoryName = "Centralized-FRC-Add-on-Repository";
export const betaRepositoryUrl = `https://github.com/${betaRepositoryOwner}/${betaRepositoryName}`;
export const betaIssueTemplateName = "listing-submission.yml";
export const betaIssueTemplateUrl = `${betaRepositoryUrl}/issues/new?template=${betaIssueTemplateName}`;
export const betaPullRequestUrl = `${betaRepositoryUrl}/compare/main...main`;

type SubmissionDraftInput = {
  part: CatalogPart;
  ownerLabel: string;
  manifestFileName: string;
  categoryAddon: string;
  sourceUrl: string;
  importSourceLabel?: string | null;
};

export function buildSubmissionIssueTitle({ part }: SubmissionDraftInput) {
  return `Listing submission: ${part.title}`;
}

export function buildSubmissionIssueBody({
  part,
  ownerLabel,
  manifestFileName,
  categoryAddon,
  sourceUrl,
  importSourceLabel
}: SubmissionDraftInput) {
  return [
    "## Listing Summary",
    `- Title: ${part.title}`,
    `- Slug: ${part.slug}`,
    `- Owner: ${ownerLabel}`,
    `- Category: ${part.categoryLabel}`,
    `- Category add-on: ${categoryAddon || "not set"}`,
    `- Source link: ${sourceUrl || "none"}`,
    `- Imported from: ${importSourceLabel ?? "manual entry"}`,
    `- Manifest file: ${manifestFileName}`,
    "",
    "## Submission Checklist",
    "- [ ] I attached or pasted the exported manifest JSON for this listing.",
    "- [ ] I reviewed duplicate warnings and source links before submitting.",
    "- [ ] I confirmed the file and media links are correct for beta review.",
    "- [ ] I understand this issue is only the intake step and does not publish automatically.",
    "",
    "## Notes for Review",
    "Add any hardware notes, licensing clarifications, or reviewer context here."
  ].join("\n");
}

export function buildPullRequestBody({
  part,
  ownerLabel,
  manifestFileName,
  categoryAddon,
  sourceUrl,
  importSourceLabel
}: SubmissionDraftInput) {
  return [
    "## Listing Submission",
    `- Title: ${part.title}`,
    `- Slug: ${part.slug}`,
    `- Owner: ${ownerLabel}`,
    `- Category: ${part.categoryLabel}`,
    `- Category add-on: ${categoryAddon || "not set"}`,
    `- Source link: ${sourceUrl || "none"}`,
    `- Imported from: ${importSourceLabel ?? "manual entry"}`,
    `- Manifest target: src/data/listings/${part.slug}.json`,
    `- Local export file: ${manifestFileName}`,
    "",
    "## Checklist",
    "- [ ] Added or updated the listing manifest under `src/data/listings/`.",
    "- [ ] Confirmed slug, owner, and source URL are not duplicates.",
    "- [ ] Checked validator warnings and fixed anything that should not stay as beta-only placeholder data.",
    "- [ ] Confirmed media and file links are intentional for this beta submission."
  ].join("\n");
}
