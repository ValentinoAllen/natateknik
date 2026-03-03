import {
  Wrench,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  CreditCard,
  Landmark,
} from "lucide-react";
import { useAppData } from "./data-provider";

export function Footer() {
  const { settings } = useAppData();

  const waNumber = settings.wa_number || "6282277775595";
  const waDisplay = settings.wa_display || "0822-7777-5595";
  const address =
    settings.address ||
    "Jl. Gunung Salak Utara No.88 Block B-C-D, Denpasar, Bali";

  const year = new Date().getFullYear();

  return (
    <footer
      id="kontak"
      className="border-t-4 border-fire bg-ink pt-16 pb-8 text-white/50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <div
                className="flex h-[34px] w-[34px] items-center justify-center bg-fire"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
                }}
              >
                <Wrench className="h-3.5 w-3.5 text-white" />
              </div>
              <span
                className="text-[1.1rem] tracking-[0.08em] text-white"
                style={{ fontFamily: "var(--font-oswald)", fontWeight: 600 }}
              >
                NATA<span className="text-fire">TEKNIK</span>
              </span>
            </div>
            <p className="text-[0.82rem] leading-[1.8] opacity-60">
              Penyedia alat teknik, mesin industri, dan perlengkapan bangunan
              terbaik di Bali.
            </p>
            <div className="mt-5 flex gap-3">
              <SocialLink
                href="https://www.facebook.com/natateknikbali8154"
                icon={Facebook}
              />
              <SocialLink
                href="https://www.instagram.com/natateknikbali/"
                icon={Instagram}
              />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <FooterTitle>Navigasi</FooterTitle>
            <FooterLink href="#">Beranda</FooterLink>
            <FooterLink href="#katalog">Katalog Produk</FooterLink>
            <FooterLink href="#kontak">Kontak</FooterLink>
          </div>

          {/* Contact */}
          <div>
            <FooterTitle>Kontak</FooterTitle>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <MapPin className="mt-1 h-3.5 w-3.5 shrink-0 text-fire" />
                <span className="text-[0.82rem] leading-[1.7]">{address}</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-3.5 w-3.5 text-fire" />
                <a
                  href={`https://wa.me/${waNumber}`}
                  className="text-[0.85rem] text-white/55 no-underline transition-colors hover:text-fire"
                >
                  {waDisplay}
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <FooterTitle>Jam Operasional</FooterTitle>
            <div className="flex flex-col gap-2 text-[0.82rem]">
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span>Senin – Sabtu</span>
                <span className="text-white">08:00 – 17:00</span>
              </div>
              <div className="flex justify-between">
                <span>Minggu</span>
                <span className="text-fire">Tutup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
          <p className="text-[0.72rem] tracking-[0.1em] uppercase opacity-35">
            &copy; {year} Nata Teknik — All Rights Reserved
          </p>
          <div className="flex gap-4 opacity-35">
            <CreditCard className="h-6 w-6" />
            <CreditCard className="h-6 w-6" />
            <Landmark className="h-5 w-5" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-4 text-[0.7rem] tracking-[0.2em] uppercase text-fire"
      style={{ fontFamily: "var(--font-oswald)" }}
    >
      {children}
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="mb-2 block text-[0.85rem] text-white/55 no-underline transition-colors hover:text-fire"
    >
      {children}
    </a>
  );
}

function SocialLink({
  href,
  icon: Icon,
}: {
  href: string;
  icon: typeof Facebook;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/50 transition-all hover:border-fire hover:text-fire"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
