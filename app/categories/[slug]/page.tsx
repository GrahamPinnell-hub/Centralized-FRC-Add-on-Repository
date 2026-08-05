import { notFound } from "next/navigation";

import { PartCard, SectionTitle } from "@/components/ui";
import { getCategoryData, getCategorySlugsData } from "@/lib/repository";

export async function generateStaticParams() {
  const slugs = await getCategorySlugsData();
  return slugs.map((slug) => ({ slug }));
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryData(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="page-stack">
      <SectionTitle
        eyebrow="Category"
        title={category.label}
        body={`${category.description} This lane exists so teams can stop hunting through scattered screenshots, forum replies, and dead CAD links for the same class of accessory.`}
      />
      <div className="card-grid">
        {category.parts.map((part) => (
          <PartCard key={part.slug} part={part} />
        ))}
      </div>
    </div>
  );
}
