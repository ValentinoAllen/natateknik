import { supabase } from "../../../utils/supabase/client";

/**
 * Sanitizes a phone number for WhatsApp links.
 * 1. Removes all non-digit characters.
 * 2. If it starts with '0', replaces it with '62' (Indonesia code).
 */
export function sanitizeWhatsAppNumber(num: string): string {
  if (!num) return "";
  let cleaned = num.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return cleaned;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: string;
  image: string;
  description: string;
}

export interface Brand {
  id: number;
  name: string;
  image: string;
  catalog_url?: string;
}

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Settings {
  wa_number?: string;
  wa_display?: string;
  address?: string;
  store_name?: string;
  tagline?: string;
  hero_rating?: string;
  hero_reviews?: string;
  [key: string]: string | undefined;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export interface FetchProductsOptions {
  page?: number;     // 1-indexed
  limit?: number;    // items per page
  brand?: string;    // "all" or specific brand
  category?: string; // "all" or specific category
  sortBy?: "terbaru" | "termurah" | "termahal";
}

export async function fetchPaginatedProducts(options: FetchProductsOptions = {}): Promise<{ data: Product[]; count: number }> {
  let query = supabase.from("products").select("*", { count: "exact" });

  if (options.brand && options.brand !== "all") {
    query = query.eq("brand", options.brand);
  }

  if (options.category && options.category !== "all") {
    query = query.eq("category", options.category);
  }

  // Handle price sorting natively isn't perfect since price is stored as string like "Rp 205.000",
  // meaning DB alphanumeric sort will fail (`"Rp 1.000.000"` vs `"Rp 205.000"`).
  // Ideally, price should be stored as numeric in Postgres to sort reliably on the DB level.
  // Because it is TEXT, we either fetch ALL and sort client-side, OR we add a numeric `price_num` column.
  // Let's implement basic ID sorting for "terbaru", and fallback to client-sort for prices if needed.

  if (options.sortBy === "terbaru" || !options.sortBy) {
    query = query.order("id", { ascending: false });
  }

  // Pagination (0-indexed for .range)
  if (options.page !== undefined && options.limit !== undefined) {
    const start = (options.page - 1) * options.limit;
    const end = start + options.limit - 1;
    query = query.range(start, end);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  let results = data as Product[];

  // If sorting by price, we do it in-memory for the current chunk. 
  // (NOTE: true DB string-to-number cast sorting requires a PostgreSQL view or function)
  if (options.sortBy === "termurah" || options.sortBy === "termahal") {
    const parsePrice = (priceStr: string) => {
      if (!priceStr) return 0;
      return parseInt(priceStr.replace(/[^0-9]/g, ""), 10) || 0;
    };
    results.sort((a, b) => {
      if (options.sortBy === "termurah") {
        return parsePrice(a.price) - parsePrice(b.price);
      } else {
        return parsePrice(b.price) - parsePrice(a.price);
      }
    });
  }

  return { data: results || [], count: count || 0 };
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from("brands").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase.from("settings").select("*");
  if (error) throw new Error(error.message);

  // Convert array of {key, value} to a single object if that's how it's stored
  // Assuming the table `settings` has rows with 'key' and 'value' columns:
  if (data && data.length > 0 && "key" in data[0]) {
    const settingsObj: Settings = {};
    data.forEach((row: any) => {
      settingsObj[row.key] = row.value;
    });
    return settingsObj;
  }

  // Or if it's a single row with columns:
  return data?.[0] || {};
}

// ── Admin CRUD helpers ──────────────────────────────────────────────────
// Note: We no longer need to manually pass the `token` because the singleton
// supabase client automatically attaches the auth session of the logged in user.

// Products CRUD
export async function createProduct(product: Omit<Product, "id">, token: string): Promise<Product> {
  const { data, error } = await supabase.from("products").insert([product]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id: number, product: Partial<Product>, token: string): Promise<Product> {
  const { data, error } = await supabase.from("products").update(product).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(id: number, token: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function uploadProductImage(file: File, token: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('media').getPublicUrl(filePath);
  return data.publicUrl;
}

// Brands CRUD
export async function createBrand(brand: Omit<Brand, "id">, token: string): Promise<Brand> {
  const { data, error } = await supabase.from("brands").insert([brand]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBrand(id: number, brand: Partial<Brand>, token: string): Promise<Brand> {
  const { data, error } = await supabase.from("brands").update(brand).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBrand(id: number, token: string): Promise<void> {
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function uploadBrandCatalog(file: File, token: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `catalog-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `catalogs/${fileName}`;

  const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('media').getPublicUrl(filePath);
  return data.publicUrl;
}

// Categories CRUD
export async function createCategory(category: Omit<Category, "id">, token: string): Promise<Category> {
  const { data, error } = await supabase.from("categories").insert([category]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory(id: number, category: Partial<Category>, token: string): Promise<Category> {
  const { data, error } = await supabase.from("categories").update(category).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(id: number, token: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Settings
export async function updateSettings(settings: Record<string, string>, token: string): Promise<Record<string, string>> {
  // Try to determine schema based on first update
  const entries = Object.entries(settings);
  if (entries.length === 0) return settings;

  // If settings table represents rows of {key, value}
  const { error } = await supabase.from("settings").upsert(
    entries.map(([key, value]) => ({ key, value }))
  );

  if (error) {
    // Fallback: If settings table is a single row with columns
    const { data: existingSettings } = await supabase.from("settings").select("*").limit(1);
    if (existingSettings && existingSettings.length > 0) {
      const { error: updateError } = await supabase.from("settings").update(settings).eq("id", existingSettings[0].id);
      if (updateError) throw new Error(updateError.message);
    } else {
      const { error: insertError } = await supabase.from("settings").insert([settings]);
      if (insertError) throw new Error(insertError.message);
    }
  }

  return settings;
}

// ── Media ───────────────────────────────────────────────────────────────
export interface MediaItem {
  id: string;
  title: string;
  caption: string;
  type: "image" | "video";
  mime_type: string;
  storage_path: string;
  url: string;
  link_url: string;
  order: number;
  file_size: number;
  original_name: string;
  created_at: string;
}

export async function fetchMedia(): Promise<MediaItem[]> {
  const { data, error } = await supabase.from("media").select("*").order("order", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function uploadMedia(
  file: File,
  meta: {
    title?: string;
    caption?: string;
    type?: string;
    order?: number;
    link_url?: string;
  },
  accessToken: string
): Promise<MediaItem> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);

  // Insert metadata into media table
  const newMediaItem = {
    title: meta.title || file.name,
    caption: meta.caption || "",
    type: meta.type || (file.type.startsWith("video") ? "video" : "image"),
    mime_type: file.type,
    storage_path: filePath,
    url: publicUrlData.publicUrl,
    link_url: meta.link_url || "",
    order: meta.order || 0,
    file_size: file.size,
    original_name: file.name
  };

  const { data, error } = await supabase.from("media").insert([newMediaItem]).select().single();
  if (error) throw new Error(error.message);

  return data;
}

export async function updateMedia(
  id: string,
  updates: Partial<Pick<MediaItem, "title" | "caption" | "order" | "link_url">>,
  accessToken: string
): Promise<MediaItem> {
  const { data, error } = await supabase.from("media").update(updates).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMedia(
  id: string,
  accessToken: string
): Promise<void> {
  // Get item to know its storage path
  const { data: item } = await supabase.from("media").select("storage_path").eq("id", id).single();

  if (item?.storage_path) {
    await supabase.storage.from("media").remove([item.storage_path]);
  }

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adminSignup(
  email: string,
  password: string,
  name: string
): Promise<any> {
  // Using native supabase auth signup mapping user metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: "admin"
      }
    }
  });
  if (error) throw new Error(error.message);
  return data;
}