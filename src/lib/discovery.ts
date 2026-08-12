import type { CatalogPart, Creator } from "@/lib/catalog";

export type CountItem = {
  label: string;
  count: number;
};

export function countLabels(values: Iterable<string>, limit = 6): CountItem[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    const label = value.trim();

    if (!label) {
      continue;
    }

    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, limit);
}

export function topTeamsByParts(creators: Creator[], parts: CatalogPart[], limit = 5) {
  const counts = new Map<string, number>();

  for (const part of parts) {
    counts.set(part.creatorHandle, (counts.get(part.creatorHandle) ?? 0) + 1);
  }

  return creators
    .map((creator) => ({
      creator,
      count: counts.get(creator.handle) ?? 0
    }))
    .filter((entry) => entry.count > 0)
    .sort(
      (left, right) =>
        right.count - left.count || Number(left.creator.teamNumber) - Number(right.creator.teamNumber)
    )
    .slice(0, limit);
}

export function creatorDisplayLabel(creator: Creator) {
  return `${creator.teamNumber} / ${creator.teamName}`;
}
