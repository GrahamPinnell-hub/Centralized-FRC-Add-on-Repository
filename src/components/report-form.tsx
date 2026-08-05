"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const reasons = [
  { value: "broken-link", label: "Broken link or missing file" },
  { value: "bad-metadata", label: "Bad or misleading metadata" },
  { value: "license", label: "License issue" },
  { value: "unsafe", label: "Unsafe or inappropriate content" }
] as const;

type ReasonValue = (typeof reasons)[number]["value"];

function formatPartLabel(part: string) {
  return part
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function ReportForm() {
  const searchParams = useSearchParams();
  const part = searchParams.get("part") ?? "unknown-listing";
  const initialReason =
    reasons.find((reason) => reason.value === searchParams.get("reason"))?.value ?? reasons[0].value;
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState<ReasonValue>(initialReason);
  const partLabel = useMemo(() => formatPartLabel(part), [part]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="two-column">
      <form className="panel upload-form" onSubmit={onSubmit}>
        <label>
          Listing slug
          <input value={part} readOnly />
        </label>
        <label>
          Listing title
          <input value={partLabel} readOnly />
        </label>
        <label>
          Reason
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value as ReasonValue)}
          >
            {reasons.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Contact email (optional)
          <input type="email" placeholder="mentor@team.org" />
        </label>
        <label>
          Details
          <textarea placeholder="Describe what is wrong, what file failed, or what a moderator should verify." />
        </label>
        <div className="filter-actions">
          <button type="submit">Queue report</button>
          <Link href={part === "unknown-listing" ? "/parts" : `/parts/${part}`} className="ghost-link">
            Back to listing
          </Link>
        </div>
      </form>
      <aside className="panel report-aside">
        <p className="eyebrow">Report Flow</p>
        <h3>Moderation stays lightweight</h3>
        <ul className="detail-list">
          <li>Listings publish immediately instead of waiting for manual approval.</li>
          <li>Each listing can be flagged for broken files, bad metadata, licensing, or unsafe content.</li>
          <li>This flow is already structured so reports can move into persistent storage later.</li>
        </ul>
        {submitted ? (
          <div className="report-confirmation">
            <strong>Report captured.</strong>
            <p>
              This mock submission is tied to <span>{part}</span> for the selected reason:
              {" "}
              {reasons.find((option) => option.value === reason)?.label}.
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
