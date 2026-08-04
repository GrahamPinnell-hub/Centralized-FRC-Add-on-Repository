import { SectionTitle } from "@/components/ui";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReportPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const part = one(resolvedSearchParams.part) ?? "unknown-listing";

  return (
    <div className="page-stack">
      <SectionTitle
        eyebrow="Moderation"
        title="Report a listing"
        body="V1 avoids a heavy approval queue. Instead, parts publish immediately and the community can flag broken links, unsafe files, incorrect metadata, or terms problems."
      />
      <form className="panel upload-form">
        <label>
          Listing slug
          <input defaultValue={part} />
        </label>
        <label>
          Reason
          <select defaultValue="broken-link">
            <option value="broken-link">Broken link or missing file</option>
            <option value="bad-metadata">Bad or misleading metadata</option>
            <option value="license">License issue</option>
            <option value="unsafe">Unsafe or inappropriate content</option>
          </select>
        </label>
        <label>
          Details
          <textarea placeholder="Describe what is wrong and what a moderator should check." />
        </label>
        <button type="button">Submit report</button>
      </form>
    </div>
  );
}
