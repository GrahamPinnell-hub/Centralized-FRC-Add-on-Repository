import { notFound } from "next/navigation";

import { CreatorBanner, PartCard } from "@/components/ui";
import { getCreatorProfile } from "@/lib/catalog";

export default async function CreatorPage({
  params
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = getCreatorProfile(handle);

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
