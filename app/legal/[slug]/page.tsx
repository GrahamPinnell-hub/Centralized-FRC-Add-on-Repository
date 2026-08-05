import { notFound } from "next/navigation";

import { SectionTitle } from "@/components/ui";

const legalPages = {
  terms: {
    title: "Terms of Service",
    body: "V1 terms define how teams can upload, reuse, and report shared FRC add-ons while keeping the repository searchable and safe.",
    sections: [
      {
        heading: "Repository use",
        copy:
          "Uploads should be relevant to FRC robot hardware, fabrication, electronics packaging, or closely related team tools. Listings that misrepresent compatibility or hide critical fabrication details can be removed."
      },
      {
        heading: "Ownership and licensing",
        copy:
          "Teams keep ownership of the files they upload. The selected listing license controls how other teams can reuse, remix, or redistribute those files."
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    body: "V1 privacy coverage stays narrow: basic account details, listing metadata, and repository activity used to operate the site.",
    sections: [
      {
        heading: "What is stored",
        copy:
          "Account identity, team association, listing metadata, and basic repository activity can be stored so teams can publish, search, and manage uploads."
      },
      {
        heading: "What is not here yet",
        copy:
          "V1 does not include a production newsletter backend, vendor analytics pipeline, or expanded ad tracking layer."
      }
    ]
  },
  dmca: {
    title: "DMCA",
    body: "The repository needs a clear takedown process when uploaded files or media should not be distributed.",
    sections: [
      {
        heading: "File complaints",
        copy:
          "Use the report flow to flag files, renders, or documentation that should be removed for copyright reasons. Include the listing URL and a short explanation of the claim."
      },
      {
        heading: "Response path",
        copy:
          "V1 routes these reports manually so obviously infringing or misattributed content can be taken down while the claim is reviewed."
      }
    ]
  },
  rules: {
    title: "Rules",
    body: "Repository rules are intended to keep uploads useful for teams that need to print, fabricate, or install a part quickly.",
    sections: [
      {
        heading: "Metadata quality",
        copy:
          "Listings should include enough product, vendor, subsystem, and fabrication metadata that another team can find the part without guessing."
      },
      {
        heading: "Safety and clarity",
        copy:
          "Do not upload misleading, unsafe, or intentionally broken files. Use report tools when a listing becomes stale, incompatible, or abusive."
      }
    ]
  }
} as const;

export function generateStaticParams() {
  return Object.keys(legalPages).map((slug) => ({ slug }));
}

export default async function LegalPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legalPages[slug as keyof typeof legalPages];

  if (!page) {
    notFound();
  }

  return (
    <div className="page-stack">
      <SectionTitle eyebrow="Legal" title={page.title} body={page.body} />
      <section className="panel page-stack">
        {page.sections.map((section) => (
          <article key={section.heading} className="page-stack">
            <h3>{section.heading}</h3>
            <p>{section.copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
