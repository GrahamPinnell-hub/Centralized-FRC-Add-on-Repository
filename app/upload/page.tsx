import { UploadBuilderClient } from "@/components/upload-builder-client";
import { SectionTitle } from "@/components/ui";
import { getAllPartsData, getCreatorsData, getSearchOptionsData } from "@/lib/repository";

export default async function UploadPage() {
  const [options, creators, parts] = await Promise.all([
    getSearchOptionsData(),
    getCreatorsData(),
    getAllPartsData()
  ]);

  return (
    <div className="page-stack">
      <SectionTitle
        eyebrow="Upload"
        title="Build a listing that another team can reuse immediately"
        body="V1 stays static-site friendly: build the listing, review it, download a structured submission manifest, and hand it off through GitHub without losing files, tags, or fabrication notes."
      />
      <UploadBuilderClient options={options} creators={creators} parts={parts} />
    </div>
  );
}
