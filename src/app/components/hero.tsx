import { LayoutGrid, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAppData } from "./data-provider";

const HERO_BG =
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=2000";

export function Hero() {
  const { settings } = useAppData();
  const reviews = settings.hero_reviews || "77+";
  const rating = settings.hero_rating || "4.5";

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden bg-ink">
      {/* Background Image */}
      <ImageWithFallback
        src={HERO_BG}
        alt="Nata Teknik — Pusat Alat Teknik dan Bangunan di Bali"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        style={{ mixBlendMode: "luminosity" }}
      />

      {/* Decorative Lines */}
      <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-fire/40 to-transparent" />
      <div className="absolute top-0 right-20 h-full w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

      {/* Rotating Badge */}
      <div
        className="absolute top-[30%] right-[8%] hidden h-[140px] w-[140px] items-center justify-center rounded-full bg-fire lg:flex"
        style={{ animation: "spin 20s linear infinite" }}
      >
        <svg viewBox="0 0 140 140" className="absolute h-full w-full">
          <path
            id="textCircle"
            d="M 70,70 m -55,0 a 55,55 0 1,1 110,0 a 55,55 0 1,1 -110,0"
            fill="none"
          />
          <text
            fontFamily="var(--font-oswald)"
            fontSize="11"
            fill="white"
            letterSpacing="4"
          >
            <textPath href="#textCircle">
              TERPERCAYA &bull; BALI &bull; DENPASAR &bull; ALAT TEKNIK &bull;
            </textPath>
          </text>
        </svg>
        <div className="absolute flex h-20 w-20 flex-col items-center justify-center">
          <div
            className="text-[2rem] text-white"
            style={{
              fontFamily: "var(--font-oswald)",
              fontWeight: 700,
              animation: "spin 20s linear infinite reverse",
            }}
          >
            {rating}
          </div>
          <div
            className="text-[0.55rem] tracking-[0.15em] uppercase text-white/80"
            style={{ animation: "spin 20s linear infinite reverse" }}
          >
            &#9733; Rating
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-24 pb-32 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div
            className="mb-6 inline-block bg-fire px-3.5 py-1 text-[0.7rem] tracking-[0.15em] uppercase text-white"
            style={{
              fontFamily: "var(--font-oswald)",
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
            }}
          >
            {settings.tagline || "Pusat Alat Teknik Terpercaya — Bali"}
          </div>

          <h1
            className="mb-6 text-white leading-[0.9] uppercase"
            style={{
              fontFamily: "var(--font-oswald)",
              fontWeight: 700,
              fontSize: "clamp(3.5rem, 9vw, 8rem)",
            }}
          >
            Nata
            <br />
            <span className="text-fire">Teknik</span>
            <br />
            <span className="text-[0.45em] tracking-[0.06em] text-white/45">
              Denpasar, Bali
            </span>
          </h1>

          <p className="mb-10 max-w-[420px] text-base leading-[1.7] text-white/55">
            Menyediakan peralatan teknik, mesin industri, dan perlengkapan
            bangunan berkualitas tinggi — untuk proyek besar maupun kebutuhan
            rumah tangga.
          </p>

          <div className="mb-12 flex flex-wrap gap-4">
            <a
              href="#katalog"
              className="inline-flex items-center gap-2 bg-fire px-10 py-4 text-[0.9rem] tracking-[0.1em] uppercase text-white no-underline transition-all hover:bg-fire-dark hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-oswald)",
                clipPath:
                  "polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)",
              }}
            >
              <LayoutGrid className="h-4 w-4" />
              Lihat Katalog
            </a>
            <a
              href="https://maps.google.com/?q=Nata+Teknik+Denpasar+Bali"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-white/20 px-8 py-4 text-[0.9rem] tracking-[0.1em] uppercase text-white no-underline transition-all hover:border-fire hover:text-fire"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              <MapPin className="h-4 w-4" />
              Lokasi Toko
            </a>
          </div>

          <div className="flex gap-10 border-t border-white/[0.12] pt-6">
            <StatItem value={`${reviews}`} label="Ulasan Positif" />
            <StatItem value={`${rating}★`} label="Rating Toko" />
            <StatItem value="100%" label="Produk Original" />
          </div>
        </div>
      </div>

      {/* Diagonal cutout */}
      <div
        className="absolute -bottom-px left-0 h-[120px] w-full bg-paper"
        style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
      />
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <h4
        className="text-[2rem] text-fire"
        style={{ fontFamily: "var(--font-oswald)" }}
      >
        {value}
      </h4>
      <p className="text-[0.72rem] tracking-[0.1em] uppercase text-white/45">
        {label}
      </p>
    </div>
  );
}
