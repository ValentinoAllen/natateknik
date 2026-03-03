import { ShieldCheck, Tags, MessageSquare, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ShieldCheck,
    title: "Garansi Produk",
    desc: "Semua produk bergaransi resmi pabrikan dengan layanan klaim mudah.",
  },
  {
    icon: Tags,
    title: "Harga Kompetitif",
    desc: "Harga terbaik langsung dari distributor resmi tanpa biaya tambahan.",
  },
  {
    icon: MessageSquare,
    title: "Konsultasi Gratis",
    desc: "Tim ahli kami siap membantu memilih alat yang paling sesuai kebutuhan.",
  },
  {
    icon: Package,
    title: "Stok Selalu Lengkap",
    desc: "Ribuan jenis alat tersedia — dari skala rumahan hingga industri besar.",
  },
];

export function WhyUs() {
  return (
    <section className="bg-ink py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left Text */}
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[0.72rem] tracking-[0.2em] uppercase text-fire"
              style={{ fontWeight: 600 }}>
              <span className="inline-block h-0.5 w-6 bg-fire" />
              Mengapa Kami
            </div>
            <h2
              className="mb-6 leading-none uppercase text-white"
              style={{
                fontFamily: "var(--font-oswald)",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 3rem)",
              }}
            >
              Pilihan Utama
              <br />
              <span className="text-fire">Para Profesional</span>
              <br />
              Di Bali
            </h2>
            <p className="text-[0.9rem] leading-[1.8] text-white/50">
              Kami bukan sekadar toko alat. Kami adalah mitra kerja Anda —
              memastikan setiap proyek berjalan lancar dengan peralatan yang
              tepat dan layanan yang cepat.
            </p>
          </div>

          {/* Right: Feature Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="overflow-hidden border-2 border-[#E8E4DF] bg-white p-8 transition-colors hover:border-fire"
              >
                <div
                  className="mb-5 flex h-[52px] w-[52px] items-center justify-center bg-fire text-white"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3
                  className="mb-2 text-base tracking-[0.05em] uppercase"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {title}
                </h3>
                <p className="text-[0.82rem] leading-[1.6] text-mid">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
