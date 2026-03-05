import { useRef, useState, useEffect, useCallback } from "react";

interface HorizontalScrollProps {
  children: React.ReactNode;
}

export function HorizontalScroll({ children }: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Use refs for drag state to avoid stale closures
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const [dragging, setDragging] = useState(false); // for CSS only

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
  };

  // ── Mouse drag ──
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      setDragging(true);
      startX.current = e.pageX;
      scrollLeftStart.current = el.scrollLeft;
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const dx = e.pageX - startX.current;
      el.scrollLeft = scrollLeftStart.current - dx;
    };

    const onMouseUp = () => {
      isDragging.current = false;
      setDragging(false);
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // ── Touch drag (for mobile pinch-and-drag) ──
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      isDragging.current = true;
      setDragging(true);
      startX.current = e.touches[0].pageX;
      scrollLeftStart.current = el.scrollLeft;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const dx = e.touches[0].pageX - startX.current;
      el.scrollLeft = scrollLeftStart.current - dx;
    };

    const onTouchEnd = () => {
      isDragging.current = false;
      setDragging(false);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const thumbWidthPercent = 20;
  const maxTranslatePercent = 100 - thumbWidthPercent;
  const translatePercent = scrollProgress * maxTranslatePercent;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex w-full gap-4 overflow-x-auto pb-4 ${dragging
            ? "cursor-grabbing select-none"
            : "cursor-grab snap-x snap-mandatory"
          }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {/* Custom Scrollbar */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="h-0 w-0 border-t-4 border-b-4 border-r-[6px] border-t-transparent border-b-transparent border-r-mid/40" />
        <div className="relative h-1.5 w-full max-w-sm rounded-full bg-mid/20">
          <div
            className="absolute top-0 h-full rounded-full bg-mid/60 transition-transform duration-100 ease-out"
            style={{
              width: `${thumbWidthPercent}%`,
              transform: `translateX(${translatePercent / (thumbWidthPercent / 100)
                }%)`,
            }}
          />
        </div>
        <div className="h-0 w-0 border-t-4 border-b-4 border-l-[6px] border-t-transparent border-b-transparent border-l-mid/40" />
      </div>
    </div>
  );
}
