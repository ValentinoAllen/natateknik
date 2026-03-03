import { HorizontalScroll } from "./horizontal-scroll";
import { useAppData } from "./data-provider";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function CategoriesBanner() {
  const { categories, loading } = useAppData();

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          className="mb-6 tracking-wide text-ink"
          style={{
            fontFamily: "var(--font-oswald)",
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 3vw, 1.875rem)",
          }}
        >
          Kategori Pilihan
        </h2>

        {loading ? (
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="mx-2 h-32 w-32 shrink-0 animate-pulse rounded-lg bg-fire/90 sm:h-40 sm:w-40"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-mid">
            Belum ada kategori tersedia.
          </p>
        ) : (
          <HorizontalScroll>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group flex shrink-0 snap-start flex-col items-center"
              >
                <div className="mx-2 flex h-32 w-32 items-center justify-center rounded-lg bg-fire/90 shadow-sm transition-transform duration-300 group-hover:-translate-y-1 sm:h-40 sm:w-40 overflow-hidden relative">
                  {cat.image ? (
                    <ImageWithFallback
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full border-2 border-white/50" />
                  )}
                </div>
                <span
                  className="pointer-events-none mt-3 max-w-[120px] text-center text-xs tracking-widest uppercase text-ink/80 sm:max-w-[150px]"
                  style={{ fontWeight: 600 }}
                >
                  {cat.name}
                </span>
              </div>
            ))}
          </HorizontalScroll>
        )}
      </div>
    </section>
  );
}
