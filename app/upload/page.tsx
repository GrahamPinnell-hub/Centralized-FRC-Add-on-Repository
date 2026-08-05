import { UploadBuilderClient } from "@/components/upload-builder-client";
import { getAllPartsData, getCreatorsData, getSearchOptionsData } from "@/lib/repository";

export default async function UploadPage() {
  const [options, creators, parts] = await Promise.all([
    getSearchOptionsData(),
    getCreatorsData(),
    getAllPartsData()
  ]);

  return <UploadBuilderClient options={options} creators={creators} parts={parts} />;
}
