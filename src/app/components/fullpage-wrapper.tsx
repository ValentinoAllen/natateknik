import React, { useState, useEffect, useRef, useCallback } from "react";

interface FullpageWrapperProps {
  children: [React.ReactNode, React.ReactNode]; // exactly 2 sections
}

/**
 * Snap-scrolls between exactly 2 full-screen sections.
 * Once the user is on section 2 and scrolls down again, native page
 * scroll takes over (the wrapper simply becomes 200dvh tall and the
 * browser scrolls past it).
 */
export function FullpageWrapper({ children }: FullpageWrapperProps) {
  const [locked, setLocked] = useState(true); // true = on section 0 (Hero)
  const isAnimating = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  // ── scroll to section 1 (Features) ──
  const goToSection1 = useCallback(() => {
    if (isAnimating.current || !locked) return;
    isAnimating.current = true;
    setLocked(false);
    setTimeout(() => {
      isAnimating.current = false;
    }, 1000);
  }, [locked]);

  // ── scroll back to section 0 (Hero) ──
  const goToSection0 = useCallback(() => {
    if (isAnimating.current || locked) return;
    isAnimating.current = true;
    setLocked(true);
    // scroll the page back to top so the wrapper is fully in view
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => {
      isAnimating.current = false;
    }, 1000);
  }, [locked]);

  // ── Wheel handler (only active while wrapper is in viewport) ──
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (isAnimating.current) {
        e.preventDefault();
        return;
      }

      if (locked) {
        // On section 0 — hijack scroll
        e.preventDefault();
        if (e.deltaY > 0) goToSection1();
      } else {
        // On section 1 — only hijack scroll-up back to hero
        // Allow scroll-down to pass through to the rest of the page
        if (e.deltaY < 0 && window.scrollY === 0) {
          e.preventDefault();
          goToSection0();
        }
      }
    };

    const el = wrapperRef.current;
    if (el) {
      el.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (el) el.removeEventListener("wheel", handleWheel);
    };
  }, [locked, goToSection0, goToSection1]);

  // ── Touch handling ──
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (locked) {
        // prevent native scroll while on hero
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => document.removeEventListener("touchmove", handleTouchMove);
  }, [locked]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dist = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dist) < 50) return;
    if (dist > 0 && locked) goToSection1();
    if (dist < 0 && !locked && window.scrollY === 0) goToSection0();
  };

  // ── Keyboard ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (locked) {
          e.preventDefault();
          goToSection1();
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (!locked && window.scrollY === 0) {
          e.preventDefault();
          goToSection0();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [locked, goToSection0, goToSection1]);

  // When locked (hero visible), prevent body scroll
  useEffect(() => {
    if (locked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);

  return (
    <div
      ref={wrapperRef}
      className="relative h-[100dvh] w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={innerRef}
        className="h-full w-full"
        style={{
          transform: locked ? "translateY(0)" : "translateY(-100dvh)",
          transition: "transform 1s cubic-bezier(0.645, 0.045, 0.355, 1)",
        }}
      >
        {/* Section 0 – Hero */}
        <section className="flex h-[100dvh] w-full flex-col overflow-hidden">
          {children[0]}
        </section>

        {/* Section 1 – Features / Banners */}
        <section className="flex h-[100dvh] w-full flex-col overflow-hidden">
          {children[1]}
        </section>
      </div>

      {/* Dot nav – only 2 dots */}
      <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3 sm:right-8">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => (i === 0 ? goToSection0() : goToSection1())}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              (locked ? 0 : 1) === i
                ? "scale-125 bg-fire"
                : "bg-ink/20 hover:bg-ink/50"
            }`}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
