import { SectionTitle } from "@/components/ui";

export default function ApiDocsPage() {
  return (
    <div className="page-stack">
      <SectionTitle
        eyebrow="Developers"
        title="API Docs"
        body="V1 developer docs outline the repository data model, listing metadata expectations, and the handoff path for static-site publishing."
      />
      <section className="panel page-stack">
        <article className="page-stack">
          <h3>Listing data</h3>
          <p>
            Core records track ownership, compatible products, vendors, seasons, fabrication files,
            media, and install notes so search stays useful across teams.
          </p>
        </article>
        <article className="page-stack">
          <h3>Submission flow</h3>
          <p>
            The current upload flow is static-site friendly first: teams build metadata in the UI,
            attach files, and move toward a repository-backed publish path that can be expanded later.
          </p>
        </article>
      </section>
    </div>
  );
}
