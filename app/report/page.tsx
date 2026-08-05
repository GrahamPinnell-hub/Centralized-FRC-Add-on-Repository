import { Suspense } from "react";

import { ReportForm } from "@/components/report-form";
import { SectionTitle } from "@/components/ui";

export default function ReportPage() {

  return (
    <div className="page-stack">
      <SectionTitle
        eyebrow="Moderation"
        title="Report a listing"
        body="Listings publish immediately, and the community can flag broken links, unsafe files, incorrect metadata, or terms problems when something needs attention."
      />
      <Suspense fallback={<section className="panel">Loading report form...</section>}>
        <ReportForm />
      </Suspense>
    </div>
  );
}
