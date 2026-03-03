import { HorizontalScroll } from "./horizontal-scroll";
import { useAppData } from "./data-provider";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function BrandsBanner() {
  const { brands, loading } = useAppData();

  // Fallback brand initials for when there's no image
  const getInitials = (name: string) =>
    name
      .split(/[\s+&]+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

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
          Brands
        </h2>

        {loading ? (
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="mx-2 h-32 w-32 shrink-0 animate-pulse rounded-lg bg-[#E8E4DF] sm:h-40 sm:w-40"
              />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <p className="py-8 text-center text-sm text-mid">
            Belum ada brand tersedia.
          </p>
        ) : (
          <HorizontalScroll>
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="group flex shrink-0 snap-start flex-col items-center"
              >
                <div className="mx-2 flex h-32 w-32 items-center justify-center rounded-lg border border-[#E8E4DF]/10 bg-white p-4 shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md sm:h-40 sm:w-40">
                  {brand.image ? (
                    <ImageWithFallback
                      src={brand.image}
                      alt={brand.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[2rem] text-ink/60"
                      style={{
                        fontFamily: "var(--font-oswald)",
                        fontWeight: 700,
                      }}
                    >
                      {getInitials(brand.name)}
                    </div>
                  )}
                </div>
                <span
                  className="pointer-events-none mt-3 text-center text-xs tracking-widest uppercase text-ink/80"
                  style={{ fontWeight: 600 }}
                >
                  {brand.name}
                </span>
              </div>
            ))}
          </HorizontalScroll>
        )}
      </div>
    </section>
  );
}
