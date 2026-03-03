import { FullpageWrapper } from "./fullpage-wrapper";
import { Hero } from "./hero";
import { MarqueeStrip } from "./marquee-strip";
import { FeaturesBar } from "./features-bar";
import { BrandsBanner } from "./brands-banner";
import { CategoriesBanner } from "./categories-banner";
import { MediaShowcase } from "./media-showcase";
import { CatalogSection } from "./catalog-section";
import { WhyUs } from "./why-us";
import { Footer } from "./footer";
import { WhatsAppFloat } from "./whatsapp-float";

export function MainSite() {
  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes waPulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes bounceDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Noise Texture */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 999;
          opacity: 0.4;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: var(--color-mid);
          border-radius: 3px;
        }

        /* Hide scrollbar utility */
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ── Sections 1 & 2: fullpage snap scroll ── */}
      <FullpageWrapper>
        {/* Section 1: Hero */}
        <div className="h-full w-full">
          <Hero />
        </div>

        {/* Section 2: Features & Banners */}
        <div className="flex h-full w-full flex-col overflow-hidden justify-center relative bg-white">
          <MarqueeStrip />
          <FeaturesBar />
          <div className="flex-1 flex flex-col justify-center gap-4 py-4 overflow-hidden">
            <BrandsBanner />
            <CategoriesBanner />
          </div>
        </div>
      </FullpageWrapper>

      {/* ── Remaining content: normal scroll ── */}
      <div className="bg-paper">
        <MediaShowcase />
        <CatalogSection />
      </div>

      <div className="bg-paper">
        <div className="bg-white">
          <WhyUs />
        </div>
        <Footer />
      </div>

      <WhatsAppFloat />
    </>
  );
}
