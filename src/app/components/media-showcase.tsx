import { useState, useRef, useEffect } from "react";
import { Play, X, ChevronLeft, ChevronRight, Image, Film } from "lucide-react";
import { useAppData, type MediaItem } from "./data-provider";

export function MediaShowcase() {
  const { media, loading } = useAppData();
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [currentIndex, setCurrentIndex] = useState(0);

  const filtered =
    filter === "all" ? media : media.filter((m) => m.type === filter);

  const hasVideos = media.some((m) => m.type === "video");
  const hasImages = media.some((m) => m.type === "image");

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < filtered.length - 1;

  const goLeft = () => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  };

  const goRight = () => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  };

  // Reset index when filter changes or items change
  useEffect(() => {
    setCurrentIndex(0);
  }, [filter, media.length]);

  // If no media uploaded yet, don't render the section at all
  if (!loading && media.length === 0) return null;

  return (
    <>
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          

          {/* Loading skeleton */}
          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 1 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[300px] w-full shrink-0 animate-pulse rounded-lg bg-[#E8E4DF] sm:h-[420px] lg:h-[480px]"
                />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="relative">
              {/* Navigation arrows */}
              {hasPrev && (
                <button
                  onClick={goLeft}
                  className="absolute top-1/2 -left-3 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-[#E8E4DF] bg-white shadow-md transition-all hover:border-fire hover:text-fire lg:-left-5"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {hasNext && (
                <button
                  onClick={goRight}
                  className="absolute top-1/2 -right-3 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-[#E8E4DF] bg-white shadow-md transition-all hover:border-fire hover:text-fire lg:-right-5"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

              {/* Single media card */}
              <MediaCard
                key={filtered[currentIndex].id}
                item={filtered[currentIndex]}
                onClick={() => setLightboxItem(filtered[currentIndex])}
              />

              {/* Counter */}
              {filtered.length > 1 && (
                <div
                  className="mt-3 text-center text-xs tracking-[0.15em] uppercase text-[#999]"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {currentIndex + 1} / {filtered.length}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxItem && (
        <MediaLightbox
          item={lightboxItem}
          items={filtered}
          onClose={() => setLightboxItem(null)}
          onNavigate={setLightboxItem}
        />
      )}
    </>
  );
}

function MediaCard({
  item,
  onClick,
}: {
  item: MediaItem;
  onClick: () => void;
}) {
  const isVideo = item.type === "video";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const inner = (
    <div
      role="button"
      tabIndex={0}
      onClick={isVideo ? undefined : onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (!isVideo) onClick();
        }
      }}
      className="relative h-[300px] w-full cursor-pointer overflow-hidden border-2 border-[#E8E4DF] bg-[#F0ECE8] sm:h-[420px] lg:h-[480px]"
    >
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            src={item.url}
            muted
            playsInline
            controls={isPlaying}
            preload="metadata"
            className="h-full w-full object-cover"
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30"
              onClick={togglePlay}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fire/90 text-white shadow-lg">
                <Play className="h-6 w-6 fill-current" />
              </div>
            </div>
          )}
        </>
      ) : (
        <img
          src={item.url}
          alt={item.title || "Gallery image"}
          className="h-full w-full object-contain object-center"
          loading="lazy"
        />
      )}

      {/* Overlay info */}
      {(item.title || item.caption) && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-4">
          {item.title && (
            null
          )}
          {item.caption && (
            <p className="mt-0.5 line-clamp-2 text-xs text-white/70">
              {item.caption}
            </p>
          )}
        </div>
      )}

      {/* Type badge */}
      
    </div>
  );

  // If the item has a link_url, wrap in an anchor (but lightbox still opens on click)
  return inner;
}

function MediaLightbox({
  item,
  items,
  onClose,
  onNavigate,
}: {
  item: MediaItem;
  items: MediaItem[];
  onClose: () => void;
  onNavigate: (item: MediaItem) => void;
}) {
  const currentIndex = items.findIndex((m) => m.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev)
        onNavigate(items[currentIndex - 1]);
      if (e.key === "ArrowRight" && hasNext)
        onNavigate(items[currentIndex + 1]);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, items, hasPrev, hasNext, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Nav arrows */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(items[currentIndex - 1])}
          className="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={() => onNavigate(items[currentIndex + 1])}
          className="absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Content */}
      <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden">
        {item.type === "video" ? (
          <video
            src={item.url}
            controls
            autoPlay
            className="max-h-[80vh] max-w-full rounded"
          />
        ) : (
          <img
            src={item.url}
            alt={item.title || "Gallery image"}
            className="max-h-[80vh] max-w-full rounded object-contain"
          />
        )}
        {(item.title || item.caption) && (
          <div className="mt-3 text-center">
            {item.title && (
              <h3
                className="text-base uppercase text-white"
                style={{ fontFamily: "var(--font-oswald)", fontWeight: 600 }}
              >
                {item.title}
              </h3>
            )}
            {item.caption && (
              <p className="mt-1 text-sm text-white/60">{item.caption}</p>
            )}
          </div>
        )}
      </div>

      {/* Counter */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs tracking-[0.15em] uppercase text-white/50"
        style={{ fontFamily: "var(--font-oswald)" }}
      >
        {currentIndex + 1} / {items.length}
      </div>
    </div>
  );
}