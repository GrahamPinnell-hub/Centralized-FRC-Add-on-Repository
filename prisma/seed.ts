import type { Prisma } from "@prisma/client";
import { AssetKind, PrismaClient } from "@prisma/client";

import { categoryDefinitions, creators } from "../src/lib/catalog";
import { parts } from "../src/lib/catalog-source";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitLocation(location: string) {
  const [city, state, country] = location.split(",").map((part) => part.trim());

  return {
    city: city || null,
    state: state || null,
    country: country || "USA"
  };
}

async function resetDatabase() {
  await prisma.partReport.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.partVersion.deleteMany();
  await prisma.partTag.deleteMany();
  await prisma.partVendor.deleteMany();
  await prisma.partProduct.deleteMany();
  await prisma.partSeason.deleteMany();
  await prisma.part.deleteMany();
  await prisma.teamMembership.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.season.deleteMany();
  await prisma.license.deleteMany();
  await prisma.category.deleteMany();
}

async function seedReferenceData() {
  const categoryMap = new Map<string, string>();
  const licenseMap = new Map<string, string>();
  const vendorMap = new Map<string, string>();
  const productMap = new Map<string, string>();
  const seasonMap = new Map<string, string>();
  const tagMap = new Map<string, string>();
  const teamMap = new Map<string, string>();

  for (const category of categoryDefinitions) {
    const created = await prisma.category.create({
      data: {
        slug: category.slug,
        label: category.label,
        description: category.description
      }
    });
    categoryMap.set(category.slug, created.id);
  }

  for (const creator of creators) {
    const location = splitLocation(creator.location);
    const parsedTeamNumber = Number.parseInt(creator.teamNumber, 10);
    const created = await prisma.team.create({
      data: {
        slug: creator.handle,
        number: Number.isNaN(parsedTeamNumber) ? null : parsedTeamNumber,
        name: creator.teamName,
        shortName: creator.displayName,
        bio: creator.bio,
        ...location
      }
    });
    teamMap.set(creator.handle, created.id);
  }

  for (const licenseName of [...new Set(parts.map((part) => part.license))]) {
    const created = await prisma.license.create({
      data: {
        slug: slugify(licenseName),
        name: licenseName
      }
    });
    licenseMap.set(licenseName, created.id);
  }

  for (const vendorName of [...new Set(parts.flatMap((part) => part.vendors))]) {
    const created = await prisma.vendor.create({
      data: {
        slug: slugify(vendorName),
        name: vendorName
      }
    });
    vendorMap.set(vendorName, created.id);
  }

  for (const part of parts) {
    for (const productName of part.products) {
      const owningVendor = part.vendors[0] ?? "community";
      const key = `${owningVendor}::${productName}`;

      if (productMap.has(key)) {
        continue;
      }

      const created = await prisma.product.create({
        data: {
          vendorId: vendorMap.get(owningVendor)!,
          slug: slugify(productName),
          name: productName
        }
      });
      productMap.set(key, created.id);
    }
  }

  for (const seasonLabel of [...new Set(parts.flatMap((part) => part.seasons))]) {
    const year = Number.parseInt(seasonLabel, 10);
    const created = await prisma.season.create({
      data: {
        year: Number.isNaN(year) ? 0 : year,
        label: seasonLabel
      }
    });
    seasonMap.set(seasonLabel, created.id);
  }

  for (const tagLabel of [...new Set(parts.flatMap((part) => part.tags))]) {
    const created = await prisma.tag.create({
      data: {
        slug: slugify(tagLabel),
        label: tagLabel
      }
    });
    tagMap.set(tagLabel, created.id);
  }

  return { categoryMap, licenseMap, productMap, seasonMap, tagMap, teamMap, vendorMap };
}

async function seedParts(reference: Awaited<ReturnType<typeof seedReferenceData>>) {
  for (const part of parts) {
    const assets: Prisma.AssetCreateWithoutPartInput[] = [
      ...part.files.map((file, index) => ({
        kind: file.fileType === "SOURCE" ? AssetKind.SOURCE_LINK : AssetKind.DOWNLOAD,
        label: file.label,
        description: file.note,
        fileType: file.fileType,
        url: file.href,
        previewUrl: null,
        position: index
      })),
      ...part.media.map((media, index) => ({
        kind: media.kind === "video" ? AssetKind.VIDEO : AssetKind.IMAGE,
        label: media.title,
        description: media.note,
        fileType: media.kind === "video" ? "VIDEO" : "IMAGE",
        url: media.src ?? "#",
        previewUrl: media.src ?? null,
        position: part.files.length + index
      }))
    ];

    const created = await prisma.part.create({
      data: {
        slug: part.slug,
        title: part.title,
        summary: part.summary,
        subsystem: part.subsystem,
        material: part.materials[0] ?? null,
        materialsJson: JSON.stringify(part.materials),
        installNotes: part.installNotes.join("\n"),
        installNotesJson: JSON.stringify(part.installNotes),
        printSettings: part.printProfile ? JSON.stringify(part.printProfile) : null,
        printProfileJson: part.printProfile ? JSON.stringify(part.printProfile) : null,
        viewerNote: part.viewerNote,
        status: "PUBLISHED",
        featured: part.featured,
        validated: part.validated ?? false,
        rating: part.rating,
        views: part.views,
        downloads: part.downloads,
        categoryId: reference.categoryMap.get(part.category)!,
        licenseId: reference.licenseMap.get(part.license)!,
        ownerTeamId: reference.teamMap.get(part.creatorHandle)!,
        createdAt: new Date(part.publishedAt),
        updatedAt: new Date(part.updatedAt),
        tags: {
          create: part.tags.map((tag) => ({
            tag: {
              connect: { id: reference.tagMap.get(tag)! }
            }
          }))
        },
        vendors: {
          create: part.vendors.map((vendor) => ({
            vendor: {
              connect: { id: reference.vendorMap.get(vendor)! }
            }
          }))
        },
        products: {
          create: part.products.map((product) => ({
            product: {
              connect: {
                id: reference.productMap.get(`${part.vendors[0] ?? "community"}::${product}`)!
              }
            }
          }))
        },
        seasons: {
          create: part.seasons.map((season) => ({
            season: {
              connect: { id: reference.seasonMap.get(season)! }
            }
          }))
        },
        versions: {
          create: part.versions.map((version) => ({
            versionLabel: version.label,
            changelog: version.summary,
            createdAt: new Date(version.date),
            updatedAt: new Date(version.date)
          }))
        },
        assets: {
          create: assets
        }
      }
    });

    if (part.remixedFrom) {
      await prisma.part.update({
        where: { id: created.id },
        data: {
          remixedFrom: {
            connect: { slug: part.remixedFrom }
          }
        }
      });
    }
  }
}

async function main() {
  await resetDatabase();
  const reference = await seedReferenceData();
  await seedParts(reference);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
