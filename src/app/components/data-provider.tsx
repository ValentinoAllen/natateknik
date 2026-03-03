import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  fetchProducts,
  fetchBrands,
  fetchSettings,
  fetchMedia,
  fetchCategories,
  type Product,
  type Brand,
  type Category,
  type Settings,
  type MediaItem,
} from "./api";

export type { Product, Brand, Category, Settings, MediaItem };

interface DataState {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  settings: Settings;
  media: MediaItem[];
  loading: boolean;
  error: string | null;
}

const DEFAULT_SETTINGS: Settings = {
  wa_number: "6282277775595",
  wa_display: "0822-7777-5595",
  address: "Jl. Gunung Salak Utara No.88 Block B-C-D, Denpasar, Bali",
  store_name: "Nata Teknik",
  tagline: "Pusat Alat Teknik Terpercaya — Bali",
};

const DataContext = createContext<DataState>({
  products: [],
  brands: [],
  categories: [],
  settings: DEFAULT_SETTINGS,
  media: [],
  loading: true,
  error: null,
});

export function useAppData() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>({
    products: [],
    brands: [],
    categories: [],
    settings: DEFAULT_SETTINGS,
    media: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [products, brands, categories, settings, media] = await Promise.all([
          fetchProducts().catch((err) => {
            console.error("Failed to fetch products:", err);
            return [] as Product[];
          }),
          fetchBrands().catch((err) => {
            console.error("Failed to fetch brands:", err);
            return [] as Brand[];
          }),
          fetchCategories().catch((err) => {
            console.error("Failed to fetch categories:", err);
            return [] as Category[];
          }),
          fetchSettings().catch((err) => {
            console.error("Failed to fetch settings:", err);
            return DEFAULT_SETTINGS;
          }),
          fetchMedia().catch((err) => {
            console.error("Failed to fetch media:", err);
            return [] as MediaItem[];
          }),
        ]);

        if (cancelled) return;

        setState({
          products,
          brands,
          categories,
          settings: { ...DEFAULT_SETTINGS, ...settings },
          media,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        if (cancelled) return;
        console.error("Failed to load app data:", err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || "Failed to load data",
        }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return <DataContext.Provider value={state}>{children}</DataContext.Provider>;
}