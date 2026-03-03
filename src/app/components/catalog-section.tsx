import { useState, useCallback, useRef, useMemo } from "react";
import { Search, ChevronDown, MessageCircle, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAppData, type Product } from "./data-provider";

const PRODUCTS_PER_PAGE = 12;

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23F0ECE8' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%238A8480' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

export function CatalogSection() {
  const { products: allProducts, settings, loading } = useAppData();
  const waNumber = settings.wa_number || "6282277775595";

  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE);
  const [activeBrand, setActiveBrand] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const brands = useMemo(
    () =>
      Array.from(
        new Set(allProducts.map((p) => p.brand).filter(Boolean))
      ).sort(),
    [allProducts]
  );

  const filteredProducts = useMemo(() => {
    let base =
      activeBrand === "all"
        ? allProducts
        : allProducts.filter((p) => p.brand === activeBrand);
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      base = base.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    return base;
  }, [allProducts, activeBrand, debouncedQuery]);

  const handleBrandFilter = (brand: string) => {
    setActiveBrand(brand);
    setDisplayedCount(PRODUCTS_PER_PAGE);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedQuery(value.trim());
      setDisplayedCount(PRODUCTS_PER_PAGE);
    }, 250);
  };

  const getOrderUrl = useCallback(
    (name: string) => {
      const msg = encodeURIComponent(
        `Halo Nata Teknik, saya ingin menanyakan stok ${name}. Apakah tersedia? Terima kasih.`
      );
      return `https://wa.me/${waNumber}?text=${msg}`;
    },
    [waNumber]
  );

  const visibleProducts = filteredProducts.slice(0, displayedCount);
  const remaining = filteredProducts.length - displayedCount;

  return (
    <>
      <section id="katalog" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div
                className="mb-3 inline-flex items-center gap-2 text-[0.72rem] tracking-[0.2em] uppercase text-fire before:inline-block before:h-0.5 before:w-6 before:bg-fire"
                style={{ fontWeight: 600 }}
              >
                Katalog Live
              </div>
              <h2
                className="leading-none uppercase text-ink"
                style={{
                  fontFamily: "var(--font-oswald)",
                  fontWeight: 700,
                  fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                }}
              >
                List Product
              </h2>
            </div>

            {/* Brand Filters */}
            <div className="flex flex-wrap gap-2">
              <FilterPill
                active={activeBrand === "all"}
                onClick={() => handleBrandFilter("all")}
              >
                Semua
              </FilterPill>
              {brands.map((b) => (
                <FilterPill
                  key={b}
                  active={activeBrand === b}
                  onClick={() => handleBrandFilter(b)}
                >
                  {b}
                </FilterPill>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative w-full max-w-[400px]">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-mid" />
              <input
                type="text"
                placeholder="Cari produk, merk, atau deskripsi..."
                className="w-full border-2 border-[#E8E4DF] bg-white py-2.5 pr-4 pl-10 text-[0.88rem] text-ink outline-none transition-colors focus:border-fire"
                style={{ fontFamily: "var(--font-dm-sans)" }}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {debouncedQuery && (
              <span
                className="text-[0.78rem] tracking-[0.1em] uppercase text-mid"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                {filteredProducts.length} produk ditemukan
              </span>
            )}
          </div>

          {/* Product Grid */}
          <div className="grid min-h-[400px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              // Skeleton loading state
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse border-2 border-[#E8E4DF] bg-white">
                  <div className="h-[220px] bg-[#F0ECE8]" />
                  <div className="p-5">
                    <div className="mb-2 h-3 w-16 rounded bg-[#E8E4DF]" />
                    <div className="mb-3 h-5 w-3/4 rounded bg-[#E8E4DF]" />
                    <div className="mb-4 h-6 w-1/2 rounded bg-[#E8E4DF]" />
                    <div className="h-10 w-full rounded bg-[#E8E4DF]" />
                  </div>
                </div>
              ))
            ) : visibleProducts.length === 0 ? (
              <div
                className="col-span-full py-20 text-center text-[0.85rem] tracking-[0.15em] uppercase text-mid"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                Belum ada produk tersedia
              </div>
            ) : (
              visibleProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onDetail={() => setDetailProduct(p)}
                  onOrderUrl={getOrderUrl(p.name)}
                />
              ))
            )}
          </div>

          {/* Load More */}
          {remaining > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() =>
                  setDisplayedCount((prev) => prev + PRODUCTS_PER_PAGE)
                }
                className="bg-fire px-6 py-2.5 text-[0.85rem] tracking-[0.08em] uppercase text-white transition-all hover:bg-fire-dark"
                style={{
                  fontFamily: "var(--font-oswald)",
                  clipPath:
                    "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
                }}
              >
                <ChevronDown className="mr-2 inline-block h-4 w-4" />
                Muat Lebih Banyak ({remaining})
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          orderUrl={getOrderUrl(detailProduct.name)}
        />
      )}
    </>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer border-2 px-5 py-2 text-[0.78rem] tracking-[0.08em] uppercase transition-all ${active
          ? "border-fire bg-fire text-white"
          : "border-[#D6D1CC] bg-transparent text-mid hover:border-fire hover:text-fire"
        }`}
      style={{
        fontFamily: "var(--font-oswald)",
        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
      }}
    >
      {children}
    </button>
  );
}

function ProductCard({
  product,
  onDetail,
  onOrderUrl,
}: {
  product: Product;
  onDetail: () => void;
  onOrderUrl: string;
}) {
  return (
    <div
      onClick={onDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onDetail();
      }}
      className="group relative cursor-pointer overflow-hidden border-2 border-[#E8E4DF] bg-white transition-all duration-300 before:absolute before:top-0 before:left-0 before:z-[1] before:h-0 before:w-1 before:bg-fire before:transition-[height] before:duration-300 hover:-translate-y-1.5 hover:border-[#C8C4BF] hover:shadow-[0_24px_48px_rgba(20,20,20,0.12)] hover:before:h-full"
    >
      <div className="h-[220px] overflow-hidden bg-[#F0ECE8]">
        <ImageWithFallback
          src={product.image || PLACEHOLDER_IMG}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
        />
      </div>
      <div className="p-5 pb-6">
        <div
          className="text-[0.65rem] tracking-[0.2em] uppercase text-fire"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          {product.brand}
        </div>
        <h3
          className="mt-1 mb-3 line-clamp-2 text-base uppercase leading-[1.3] text-ink"
          style={{ fontFamily: "var(--font-oswald)", fontWeight: 500 }}
        >
          {product.name}
        </h3>
        <div
          className="mb-4 text-[1.4rem] text-ink"
          style={{ fontFamily: "var(--font-oswald)", fontWeight: 700 }}
        >
          {product.price}
        </div>
        <a
          href={onOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full cursor-pointer items-center justify-center gap-2 border-none bg-ink px-5 py-3 text-[0.78rem] tracking-[0.1em] uppercase text-white no-underline transition-colors hover:bg-fire"
          style={{
            fontFamily: "var(--font-oswald)",
            clipPath:
              "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
          }}
        >
          <MessageCircle className="h-4 w-4" />
          Pesan Sekarang
        </a>
      </div>
    </div>
  );
}

function ProductDetailModal({
  product,
  onClose,
  orderUrl,
}: {
  product: Product;
  onClose: () => void;
  orderUrl: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-[850px] overflow-hidden border-2 border-[#E8E4DF] bg-white flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/40 text-white transition-colors hover:bg-fire md:bg-transparent md:text-mid md: hover:text-fire"
          aria-label="Close detail"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex-shrink-0 w-full md:w-[45%] h-[250px] md:h-auto bg-[#F0ECE8] p-6 flex items-center justify-center">
          <ImageWithFallback
            src={product.image || PLACEHOLDER_IMG}
            alt={product.name}
            className="max-h-full max-w-full object-contain drop-shadow-sm"
          />
        </div>
        <div className="flex-1 px-6 md:px-8 py-6 md:py-8 overflow-y-auto flex flex-col">
          <div
            className="text-[0.65rem] tracking-[0.2em] uppercase text-fire"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {product.brand}
          </div>
          <h3
            className="mt-2 text-[1.2rem] sm:text-[1.4rem] leading-[1.3] uppercase text-ink pr-6"
            style={{ fontFamily: "var(--font-oswald)", fontWeight: 600 }}
          >
            {product.name}
          </h3>
          {product.description && (
            <div className="mt-4 flex-1">
              <p className="text-[0.85rem] sm:text-[0.92rem] leading-[1.7] text-mid whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}
          <div className="mt-6 border-t-2 border-[#E8E4DF] pt-6 shrink-0">
            <div
              className="text-[1.4rem] sm:text-[1.6rem] text-ink"
              style={{ fontFamily: "var(--font-oswald)", fontWeight: 700 }}
            >
              {product.price}
            </div>
            <a
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 border-none bg-ink px-5 py-3 text-[0.8rem] tracking-[0.1em] uppercase text-white no-underline transition-colors hover:bg-fire"
              style={{
                fontFamily: "var(--font-oswald)",
                clipPath:
                  "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Pesan Sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
