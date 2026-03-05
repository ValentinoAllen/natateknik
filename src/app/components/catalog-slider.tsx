import { Download } from "lucide-react";
import { HorizontalScroll } from "./horizontal-scroll";
import { useAppData } from "./data-provider";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function CatalogSlider() {
    const { brands, loading } = useAppData();

    // Filter only brands that have a catalog URL
    const catalogBrands = brands.filter((brand) => brand.catalog_url);

    // Fallback brand initials for when there's no image
    const getInitials = (name: string) =>
        name
            .split(/[\s+&]+/)
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    if (!loading && catalogBrands.length === 0) {
        return null; // Don't show the section at all if there are no catalogs
    }

    return (
        <section className="bg-[#f8f9fa] py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h2
                            className="text-2xl tracking-wide text-ink sm:text-3xl"
                            style={{
                                fontFamily: "var(--font-oswald)",
                                fontWeight: 700,
                            }}
                        >
                            Unduh Katalog
                        </h2>
                        <p className="mt-2 text-sm text-ink/60 sm:text-base">
                            Dapatkan informasi lengkap produk dari merek-merek ternama.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-[220px] w-[180px] shrink-0 animate-pulse rounded-xl bg-[#E8E4DF] sm:h-[260px] sm:w-[200px]"
                            />
                        ))}
                    </div>
                ) : (
                    <HorizontalScroll>
                        {catalogBrands.map((brand) => (
                            <div
                                key={brand.id}
                                className="group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                                style={{ width: "200px" }}
                            >
                                {/* Book Spine / Decorative Left Border */}
                                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-fire/80" />

                                <div className="flex h-[140px] w-full items-center justify-center border-b border-black/5 bg-black/[0.02] p-6">
                                    {brand.image ? (
                                        <ImageWithFallback
                                            src={brand.image}
                                            alt={brand.name}
                                            className="h-full w-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div
                                            className="flex h-full w-full flex-col items-center justify-center text-ink/40"
                                        >
                                            <span className="text-3xl" style={{ fontFamily: "var(--font-oswald)", fontWeight: 700 }}>
                                                {getInitials(brand.name)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col justify-between p-4 pl-5">
                                    <div>
                                        <span className="mb-1 block text-[0.65rem] font-bold tracking-widest uppercase text-fire/70">
                                            Katalog Resmi
                                        </span>
                                        <h3
                                            className="line-clamp-2 text-sm text-ink"
                                            style={{ fontWeight: 600 }}
                                        >
                                            Buku Produk {brand.name}
                                        </h3>
                                    </div>

                                    <a
                                        href={brand.catalog_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-fire py-2 text-xs font-semibold tracking-wider text-white transition-colors hover:bg-fire-dark"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Unduh PDF
                                    </a>
                                </div>
                            </div>
                        ))}
                    </HorizontalScroll>
                )}
            </div>
        </section>
    );
}
