import { useState, useEffect, useRef } from "react";
import { Wrench, Menu, X, MessageCircle } from "lucide-react";

interface NavbarProps {
  waNumber?: string;
}

export function Navbar({ waNumber = "6282277775595" }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        mobileOpen &&
        menuRef.current &&
        btnRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [mobileOpen]);

  const waLink = `https://wa.me/${waNumber}`;

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b-2 border-ink bg-paper/88 backdrop-blur-[16px]"
      style={{
        clipPath: "none",
      }}
    >
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 no-underline">
          <div
            className="flex h-9 w-9 items-center justify-center bg-fire"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
            }}
          >
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <span
            className="font-[var(--font-oswald)] text-[1.15rem] tracking-[0.08em] text-ink"
            style={{ fontFamily: "var(--font-oswald)", fontWeight: 600 }}
          >
            NATA<span className="text-fire">TEKNIK</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-10 lg:flex">
          <NavLink active>Beranda</NavLink>
          <NavLink onClick={() => scrollTo("katalog")}>Katalog</NavLink>
          <NavLink onClick={() => scrollTo("kontak")}>Kontak</NavLink>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-fire px-6 py-2.5 text-[0.85rem] tracking-[0.08em] text-white uppercase no-underline transition-all hover:bg-fire-dark hover:-translate-y-0.5"
            style={{
              fontFamily: "var(--font-oswald)",
              fontWeight: 500,
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
            }}
          >
            <MessageCircle className="mr-1.5 inline-block h-4 w-4" />
            Hubungi Kami
          </a>
        </div>

        {/* Hamburger */}
        <button
          ref={btnRef}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="p-2 lg:hidden"
          aria-label="Menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5 text-ink" />
          ) : (
            <Menu className="h-5 w-5 text-ink" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={`bg-ink lg:hidden ${mobileOpen ? "block" : "hidden"}`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6">
          <MobileNavLink active onClick={() => setMobileOpen(false)}>
            Beranda
          </MobileNavLink>
          <MobileNavLink
            onClick={() => {
              setMobileOpen(false);
              scrollTo("katalog");
            }}
          >
            Katalog
          </MobileNavLink>
          <MobileNavLink
            onClick={() => {
              setMobileOpen(false);
              scrollTo("kontak");
            }}
          >
            Kontak
          </MobileNavLink>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 bg-fire px-6 py-2.5 text-center text-[0.85rem] tracking-[0.08em] text-white uppercase no-underline transition-all hover:bg-fire-dark"
            style={{
              fontFamily: "var(--font-oswald)",
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
            }}
          >
            <MessageCircle className="mr-1.5 inline-block h-4 w-4" />
            Hubungi Kami
          </a>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative cursor-pointer border-none bg-transparent text-[0.8rem] tracking-[0.1em] uppercase transition-colors ${
        active ? "text-fire" : "text-ink hover:text-fire"
      }`}
      style={{ fontFamily: "var(--font-oswald)", fontWeight: 600 }}
    >
      {children}
      <span
        className={`absolute -bottom-0.5 left-0 h-0.5 bg-fire transition-all duration-300 ${
          active ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </button>
  );
}

function MobileNavLink({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b border-white/[0.08] bg-transparent py-3 text-left text-[0.9rem] tracking-[0.1em] uppercase ${
        active ? "text-fire" : "text-white/60"
      }`}
      style={{ fontFamily: "var(--font-oswald)" }}
    >
      {children}
    </button>
  );
}
