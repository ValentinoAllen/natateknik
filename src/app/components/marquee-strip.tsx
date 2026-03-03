const BASE_ITEMS = [
  "Peralatan Berkualitas Tinggi",
  "Pengiriman Cepat Bali",
  "Mesin Industri Terbaik",
  "Perlengkapan Bangunan",
  "Servis Terpercaya",
  "Nata Teknik Denpasar",
];

export function MarqueeStrip() {
  const baseTrack = BASE_ITEMS.map((item, i) => (
    <span key={i} className="flex shrink-0 items-center">
      <span
        className="px-8 text-[0.75rem] tracking-[0.15em] uppercase text-white"
        style={{ fontFamily: "var(--font-oswald)" }}
      >
        {item}
      </span>
      <span className="shrink-0 text-[0.65rem] text-white/50">&#9670;</span>
    </span>
  ));

  return (
    <div className="flex w-full overflow-hidden bg-fire py-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex w-max shrink-0"
          style={{ animation: "slideLeft 15s linear infinite" }}
        >
          {baseTrack}
        </div>
      ))}
    </div>
  );
}
