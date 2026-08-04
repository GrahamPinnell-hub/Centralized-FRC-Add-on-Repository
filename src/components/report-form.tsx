"use client";

import { useSearchParams } from "next/navigation";

export function ReportForm() {
  const searchParams = useSearchParams();
  const part = searchParams.get("part") ?? "unknown-listing";

  return (
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
  );
}
