import type { CSSProperties } from "react";

import { resolveAssetUrl } from "@/lib/assets";
import type { MediaCard, MediaFraming, MediaSurfaceFit } from "@/lib/catalog";

type MediaSurface = "card" | "detail" | "thumb" | "gallery" | "lightbox";

const fitFallback: Record<MediaSurface, MediaSurfaceFit> = {
  card: "cover",
  detail: "contain",
  thumb: "cover",
  gallery: "cover",
  lightbox: "contain"
};

function framingValue(
  framing: MediaFraming | undefined,
  surface: MediaSurface,
  key: "position" | "fit" | "zoom"
) {
  if (!framing) {
    return undefined;
  }

  const surfaceKey = `${surface}${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof MediaFraming;
  return framing[surfaceKey] ?? framing[key];
}

export function mediaSource(media?: MediaCard) {
  return media?.src ? resolveAssetUrl(media.src) : "";
}

export function mediaSurfaceStyle(
  media: MediaCard | undefined,
  surface: MediaSurface
): CSSProperties | undefined {
  const src = mediaSource(media);

  if (!src) {
    return undefined;
  }

  const position = framingValue(media?.framing, surface, "position") ?? "center";
  const fit = framingValue(media?.framing, surface, "fit") ?? fitFallback[surface];
  const zoom = framingValue(media?.framing, surface, "zoom") ?? 1;

  return {
    ["--media-image" as string]: `url("${src.replace(/"/g, '\\"')}")`,
    ["--media-position" as string]: position,
    ["--media-fit" as string]: fit,
    ["--media-scale" as string]: String(zoom)
  };
}
