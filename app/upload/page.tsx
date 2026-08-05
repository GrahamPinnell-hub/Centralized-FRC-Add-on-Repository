import { UploadBuilderClient } from "@/components/upload-builder-client";
import { SectionTitle } from "@/components/ui";
import { getCreatorsData, getSearchOptionsData } from "@/lib/repository";

export default async function UploadPage() {
  const [options, creators] = await Promise.all([getSearchOptionsData(), getCreatorsData()]);

  return (
    <div className="page-stack">
      <SectionTitle
        eyebrow="Upload"
        title="Build a listing that another team can reuse immediately"
        body="V1 stays simple: no review queue, but the listing builder should force enough structure that teams can publish prints, sheet metal, and source CAD without making search or reuse worse."
      />
      <UploadBuilderClient options={options} creators={creators} />
    </div>
  );
}
