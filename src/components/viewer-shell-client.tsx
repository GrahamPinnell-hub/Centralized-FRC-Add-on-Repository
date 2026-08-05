"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import type { CatalogPart } from "@/lib/catalog";
import { mediaSource, mediaSurfaceStyle } from "@/lib/media-presentation";

function visualMedia(part: CatalogPart) {
  return part.media.filter((item) => item.src);
}

export function ViewerShellClient({
  part,
  themeStyle
}: {
  part: CatalogPart;
  themeStyle: CSSProperties;
}) {
  const mediaItems = useMemo(() => visualMedia(part), [part]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const activeMedia = mediaItems[activeIndex] ?? null;
  const activeSource = mediaSource(activeMedia);
  const hasCarousel = mediaItems.length > 1;
  const stageLabel = activeMedia
    ? activeMedia.title === part.title
      ? activeMedia.kind === "video"
        ? "Install clip"
        : "Installed view"
      : activeMedia.title
    : "Preview lane";
  const stageNote =
    activeMedia?.note ??
    "V1 keeps the viewer shell ready for richer STL, STEP, DXF, and media previews once live asset uploads are connected.";

  useEffect(() => {
    setActiveIndex(0);
  }, [part.slug]);

  useEffect(() => {
    if (!isLightboxOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (mediaItems.length <= 1) {
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((index) => (index + 1) % mediaItems.length);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => (index - 1 + mediaItems.length) % mediaItems.length);
      }
    };

    document.body.classList.add("lightbox-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, mediaItems.length]);

  const openActiveMedia = () => {
    if (activeMedia?.src) {
      setLightboxOpen(true);
    }
  };

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + mediaItems.length) % mediaItems.length);
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % mediaItems.length);
  };

  return (
    <>
      <section className="panel viewer-shell" id="viewer" style={themeStyle}>
        <div className={`viewer-stage${activeMedia ? " has-media" : ""}`}>
          {activeMedia ? (
            <button
              type="button"
              className="viewer-stage-frame viewer-stage-trigger"
              onClick={openActiveMedia}
              aria-label={`Expand ${activeMedia.title}`}
            >
              <div className="viewer-stage-image" aria-hidden="true" style={mediaSurfaceStyle(activeMedia, "detail")}>
                {activeMedia.kind === "video" ? (
                  <video src={activeSource} muted playsInline />
                ) : (
                  <img src={activeSource} alt="" loading="lazy" />
                )}
              </div>
            </button>
          ) : (
            <div className="viewer-mesh">
              <span>3D / 2D preview slot</span>
              <small>Viewer shell for STL, STEP, DXF, media, and source CAD.</small>
            </div>
          )}
          <div className="viewer-stage-caption">
            <strong>{stageLabel}</strong>
            <span>{stageNote}</span>
          </div>
        </div>
        {activeMedia ? (
          <div className="viewer-stage-action-row">
            <button type="button" className="viewer-expand-button" onClick={openActiveMedia}>
              Open larger photo
            </button>
            <span className="viewer-stage-count">
              {activeIndex + 1} / {mediaItems.length}
            </span>
          </div>
        ) : null}
        {hasCarousel ? (
          <div className="viewer-thumb-strip">
            {mediaItems.map((item, index) => (
              <button
                type="button"
                key={`${part.slug}-${item.title}`}
                className={`viewer-thumb${index === activeIndex ? " is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Select ${item.title}`}
              >
                <div className="viewer-thumb-media">
                  <div className="viewer-thumb-media-image" style={mediaSurfaceStyle(item, "thumb")}>
                    {item.kind === "video" ? (
                      <video src={mediaSource(item)} muted playsInline />
                    ) : (
                      <img src={mediaSource(item)} alt={item.title} loading="lazy" />
                    )}
                  </div>
                </div>
                <strong>{item.title}</strong>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {isLightboxOpen && activeMedia ? (
        <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={`${part.title} media viewer`}>
          <button type="button" className="media-lightbox-backdrop" onClick={() => setLightboxOpen(false)} aria-label="Close media viewer" />
          <div className="media-lightbox-shell">
            <div className="media-lightbox-toolbar">
              <div className="media-lightbox-meta">
                <strong>{activeMedia.title}</strong>
                <span>
                  {activeIndex + 1} / {mediaItems.length}
                </span>
              </div>
              <button type="button" className="media-lightbox-close" onClick={() => setLightboxOpen(false)}>
                Close
              </button>
            </div>
            <div className={`media-lightbox-stage-shell${hasCarousel ? "" : " is-single"}`}>
              {hasCarousel ? (
                <button type="button" className="media-lightbox-nav is-prev" onClick={showPrevious} aria-label="Previous image">
                  <span aria-hidden="true">&lsaquo;</span>
                </button>
              ) : null}
              <div className="media-lightbox-stage" style={mediaSurfaceStyle(activeMedia, "lightbox")}>
                {activeMedia.kind === "video" ? (
                  <video src={activeSource} controls autoPlay playsInline />
                ) : (
                  <img src={activeSource} alt={activeMedia.title} />
                )}
              </div>
              {hasCarousel ? (
                <button type="button" className="media-lightbox-nav is-next" onClick={showNext} aria-label="Next image">
                  <span aria-hidden="true">&rsaquo;</span>
                </button>
              ) : null}
            </div>
            <div className="media-lightbox-caption">
              <strong>{part.title}</strong>
              <p>{activeMedia.note}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
