import { useRef, useState, useCallback, useEffect } from "react";

interface HorizontalScrollProps {
  children: React.ReactNode;
}

export function HorizontalScroll({ children }: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
  };

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  }, []);

  const onMouseLeave = useCallback(() => setIsDragging(false), []);
  const onMouseUp = useCallback(() => setIsDragging(false), []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      scrollRef.current.scrollLeft = scrollLeftState - (x - startX) * 2;
    },
    [isDragging, startX, scrollLeftState]
  );

  const thumbWidthPercent = 20;
  const maxTranslatePercent = 100 - thumbWidthPercent;
  const translatePercent = scrollProgress * maxTranslatePercent;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className={`flex w-full gap-4 overflow-x-auto pb-4 ${
          isDragging
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
              transform: `translateX(${
                translatePercent / (thumbWidthPercent / 100)
              }%)`,
            }}
          />
        </div>
        <div className="h-0 w-0 border-t-4 border-b-4 border-l-[6px] border-t-transparent border-b-transparent border-l-mid/40" />
      </div>
    </div>
  );
}
