import { notFound } from "next/navigation";

import { CreatorBanner, PartCard } from "@/components/ui";
import { getCreatorHandlesData, getCreatorProfileData } from "@/lib/repository";

export async function generateStaticParams() {
  const handles = await getCreatorHandlesData();
  return handles.map((handle) => ({ handle }));
}

export default async function CreatorPage({
  params
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getCreatorProfileData(handle);

  if (!profile) {
    notFound();
  }

  return (
    <div className="page-stack">
      <CreatorBanner creator={profile.creator} partCount={profile.parts.length} />
      <div className="card-grid">
        {profile.parts.map((part) => (
          <PartCard key={part.slug} part={part} />
        ))}
      </div>
    </div>
  );
}
