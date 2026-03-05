import { useState, useCallback, useRef, useMemo } from "react";
import { ChevronDown, MessageCircle, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAppData, type Product } from "./data-provider";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23F0ECE8' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%238A8480' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

const LIMIT_OPTIONS = [25, 50, 100];

type SortKey = "terbaru" | "termurah" | "termahal";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "termurah", label: "Termurah" },
  { value: "termahal", label: "Termahal" },
];

// Parse a price string like "Rp 205.000" into a number
function parsePrice(price: string): number {
  if (!price) return 0;
  const cleaned = price.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 0;
}

export function CatalogSection() {
  const {
    products: allProducts,
    brands,
    categories,
    settings,
    loading,
  } = useAppData();
  const waNumber = settings.wa_number || "6282277775595";

  const [activeBrand, setActiveBrand] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("terbaru");
  const [limit, setLimit] = useState(25);
  const [displayedCount, setDisplayedCount] = useState(25);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Derive brand names from the brands table
  const brandNames = useMemo(
    () => brands.map((b) => b.name).sort(),
    [brands]
  );

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let base = allProducts;

    // Filter by brand
    if (activeBrand !== "all") {
      base = base.filter((p) => p.brand === activeBrand);
    }

    // Filter by category
    if (activeCategory !== "all") {
      base = base.filter((p) => p.category === activeCategory);
    }

    // Sort
    if (sortBy === "termurah") {
      base = [...base].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortBy === "termahal") {
      base = [...base].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }
    // "terbaru" = default order from DB (newest first by id desc)

    return base;
  }, [allProducts, activeBrand, activeCategory, sortBy]);

  const visibleProducts = filteredProducts.slice(0, displayedCount);
  const remaining = filteredProducts.length - displayedCount;

  const handleBrandFilter = (brand: string) => {
    setActiveBrand(brand);
    setDisplayedCount(limit);
    setSidebarOpen(false);
  };

  const handleCategoryFilter = (cat: string) => {
    setActiveCategory(cat);
    setDisplayedCount(limit);
  };

  const handleSortChange = (val: SortKey) => {
    setSortBy(val);
    setDisplayedCount(limit);
  };

  const handleLimitChange = (val: number) => {
    setLimit(val);
    setDisplayedCount(val);
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

  return (
    <>
      <section id="katalog" className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="mb-8">
            <h2
              className="text-fire"
              style={{
                fontFamily: "var(--font-oswald)",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              }}
            >
              Semua Produk
            </h2>
            <div className="mt-2 h-1 w-full bg-gradient-to-r from-fire via-fire/60 to-fire/10 rounded-full" />
          </div>

          {/* Mobile Brand Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4 flex w-full items-center justify-between border-2 border-[#E8E4DF] bg-white px-4 py-3 text-left lg:hidden"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            <span className="text-sm uppercase tracking-wider text-ink">
              Etalase: {activeBrand === "all" ? "Semua Produk" : activeBrand}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-mid transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Two-Column Layout */}
          <div className="flex gap-6">
            {/* ── Left Sidebar ── */}
            <aside
              className={`shrink-0 ${sidebarOpen ? "block" : "hidden"
                } lg:block w-full lg:w-[220px]`}
            >
              <div className="rounded-lg border-2 border-[#E8E4DF] bg-white sticky top-4">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between border-b-2 border-[#E8E4DF] px-4 py-3">
                  <span
                    className="text-base text-ink"
                    style={{
                      fontFamily: "var(--font-oswald)",
                      fontWeight: 700,
                    }}
                  >
                    Etalase
                  </span>
                  <span
                    className="text-sm text-mid"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    {allProducts.length}
                  </span>
                </div>

                {/* Brand List */}
                <nav className="flex flex-col">
                  <BrandItem
                    label="Semua Produk"
                    active={activeBrand === "all"}
                    onClick={() => handleBrandFilter("all")}
                  />
                  {brandNames.map((name) => (
                    <BrandItem
                      key={name}
                      label={name}
                      active={activeBrand === name}
                      onClick={() => handleBrandFilter(name)}
                    />
                  ))}
                </nav>
              </div>
            </aside>

            {/* ── Right Content ── */}
            <div className="min-w-0 flex-1">
              {/* Filter Bar */}
              <div className="mb-6 flex flex-wrap items-center gap-4">
                {/* Category */}
                <div className="flex items-center gap-2">
                  <label
                    className="text-sm text-ink whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-oswald)",
                      fontWeight: 600,
                    }}
                  >
                    Kategori
                  </label>
                  <div className="relative">
                    <select
                      value={activeCategory}
                      onChange={(e) => handleCategoryFilter(e.target.value)}
                      className="appearance-none border-2 border-[#E8E4DF] bg-white py-2 pl-3 pr-8 text-sm text-ink outline-none transition-colors focus:border-fire cursor-pointer"
                      style={{ fontFamily: "var(--font-dm-sans)", minWidth: 160 }}
                    >
                      <option value="all">Pilih Semua</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-mid" />
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label
                    className="text-sm text-ink whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-oswald)",
                      fontWeight: 600,
                    }}
                  >
                    Urutkan
                  </label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value as SortKey)}
                      className="appearance-none border-2 border-[#E8E4DF] bg-white py-2 pl-3 pr-8 text-sm text-ink outline-none transition-colors focus:border-fire cursor-pointer"
                      style={{ fontFamily: "var(--font-dm-sans)", minWidth: 120 }}
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-mid" />
                  </div>
                </div>

                {/* Limit */}
                <div className="flex items-center gap-2">
                  <label
                    className="text-sm text-ink whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-oswald)",
                      fontWeight: 600,
                    }}
                  >
                    Limit
                  </label>
                  <div className="relative">
                    <select
                      value={limit}
                      onChange={(e) => handleLimitChange(Number(e.target.value))}
                      className="appearance-none border-2 border-[#E8E4DF] bg-white py-2 pl-3 pr-8 text-sm text-ink outline-none transition-colors focus:border-fire cursor-pointer"
                      style={{ fontFamily: "var(--font-dm-sans)", minWidth: 80 }}
                    >
                      {LIMIT_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-mid" />
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid min-h-[400px] grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse border border-[#E8E4DF] bg-white rounded-lg overflow-hidden">
                      <div className="h-[180px] bg-[#F0ECE8]" />
                      <div className="p-4">
                        <div className="mb-2 h-4 w-3/4 rounded bg-[#E8E4DF]" />
                        <div className="h-5 w-1/2 rounded bg-[#E8E4DF]" />
                      </div>
                    </div>
                  ))
                ) : visibleProducts.length === 0 ? (
                  <div
                    className="col-span-full py-20 text-center text-sm tracking-wider uppercase text-mid"
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
                      setDisplayedCount((prev) => prev + limit)
                    }
                    className="bg-fire px-6 py-2.5 text-sm tracking-wider uppercase text-white transition-all hover:bg-fire-dark rounded"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    <ChevronDown className="mr-2 inline-block h-4 w-4" />
                    Muat Lebih Banyak ({remaining})
                  </button>
                </div>
              )}
            </div>
          </div>
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

/* ── Brand Sidebar Item ─────────────────────────────────────────────── */
function BrandItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-l-4 cursor-pointer ${active
          ? "border-l-fire bg-fire/10 text-fire font-semibold"
          : "border-l-transparent text-ink/70 hover:bg-[#F5F2EE] hover:text-ink"
        }`}
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      {label}
    </button>
  );
}

/* ── Product Card ────────────────────────────────────────────────────── */
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
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#E8E4DF] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="h-[180px] overflow-hidden bg-[#F0ECE8]">
        <ImageWithFallback
          src={product.image || PLACEHOLDER_IMG}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3
          className="mb-2 line-clamp-2 text-sm leading-snug text-ink"
          style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 500 }}
        >
          {product.name}
        </h3>
        <div
          className="text-lg text-ink"
          style={{ fontFamily: "var(--font-oswald)", fontWeight: 700 }}
        >
          {product.price}
        </div>
      </div>
    </div>
  );
}

/* ── Product Detail Modal ────────────────────────────────────────────── */
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
      <div className="relative max-h-[90vh] w-full max-w-[850px] overflow-hidden rounded-lg border-2 border-[#E8E4DF] bg-white flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/40 text-white transition-colors hover:bg-fire md:bg-transparent md:text-mid md:hover:text-fire"
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
            className="text-xs tracking-widest uppercase text-fire"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {product.brand}
          </div>
          <h3
            className="mt-2 text-xl sm:text-2xl leading-tight uppercase text-ink pr-6"
            style={{ fontFamily: "var(--font-oswald)", fontWeight: 600 }}
          >
            {product.name}
          </h3>
          {product.description && (
            <div className="mt-4 flex-1">
              <p className="text-sm leading-relaxed text-mid whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}
          <div className="mt-6 border-t-2 border-[#E8E4DF] pt-6 shrink-0">
            <div
              className="text-2xl text-ink"
              style={{ fontFamily: "var(--font-oswald)", fontWeight: 700 }}
            >
              {product.price}
            </div>
            <a
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 border-none bg-ink px-5 py-3 text-sm tracking-wider uppercase text-white no-underline transition-colors hover:bg-fire rounded"
              style={{ fontFamily: "var(--font-oswald)" }}
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
