import { Award, Tag, MessageCircle, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: Award, label: "Produk Original" },
  { icon: Tag, label: "Harga Terbaik" },
  { icon: MessageCircle, label: "Konsultasi Product" },
  { icon: ShieldCheck, label: "Produk Bergaransi" },
] as const;

export function FeaturesBar() {
  return (
    <div className="border-b-2 border-[#E8E4DF] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 divide-x divide-[#E8E4DF] md:grid-cols-4">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-5">
              <Icon className="h-[1.1rem] w-[1.1rem] text-fire" />
              <span
                className="text-[0.78rem] tracking-[0.05em] uppercase text-ink"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
