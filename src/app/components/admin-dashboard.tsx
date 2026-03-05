import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Upload,
  Trash2,
  Image,
  Film,
  LogOut,
  Wrench,
  Loader2,
  GripVertical,
  Edit3,
  X,
  Check,
  Plus,
  ArrowLeft,
  AlertCircle,
  Eye,
  Package,
  Tags,
  Settings,
  LayoutDashboard,
  Menu,
  ExternalLink,
  Search,
  Save,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import {
  fetchMedia,
  uploadMedia,
  updateMedia,
  deleteMedia,
  adminSignup,
  fetchProducts,
  fetchBrands,
  fetchCategories,
  fetchSettings,
  createProduct,
  updateProduct,
  deleteProduct as apiDeleteProduct,
  createBrand,
  updateBrand,
  deleteBrand as apiDeleteBrand,
  createCategory,
  updateCategory,
  deleteCategory as apiDeleteCategory,
  updateSettings as apiUpdateSettings,
  uploadProductImage,
  uploadBrandCatalog,
  type MediaItem,
  type Product,
  type Brand,
  type Category,
  type Settings as SettingsType,
} from "./api";
import { supabase } from "../../../utils/supabase/client";

type AdminPage = "overview" | "products" | "brands" | "categories" | "media" | "settings";

export function AdminDashboard() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAccessToken(session.access_token);
        setUser(session.user);
      }
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAccessToken(session.access_token);
        setUser(session.user);
      } else {
        setAccessToken(null);
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );

  if (!accessToken)
    return (
      <AdminLogin
        onLogin={(t, u) => {
          setAccessToken(t);
          setUser(u);
        }}
      />
    );

  return <AdminPanel accessToken={accessToken} user={user} />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIN
   ═══════════════════════════════════════════════════════════════════════════ */
function AdminLogin({ onLogin }: { onLogin: (t: string, u: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") await adminSignup(email, password, "Admin");
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); return; }
      if (data.session) onLogin(data.session.access_token, data.session.user);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 flex items-center justify-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center bg-fire"
            style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)" }}
          >
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span
            className="text-2xl tracking-wider text-white"
            style={{ fontFamily: "var(--font-oswald)", fontWeight: 700 }}
          >
            NATA<span className="text-fire">TEKNIK</span>
          </span>
        </div>

        <div className="border-2 border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          <h2
            className="mb-1 text-center text-lg uppercase tracking-wider text-white"
            style={{ fontFamily: "var(--font-oswald)", fontWeight: 600 }}
          >
            {mode === "login" ? "Admin Login" : "Buat Akun Admin"}
          </h2>
          <p className="mb-8 text-center text-xs text-white/40">
            {mode === "login" ? "Masuk untuk mengelola konten website" : "Daftar akun admin baru"}
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-[0.7rem] tracking-widest uppercase text-white/50">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full border-2 border-white/15 bg-transparent px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-fire"
                placeholder="admin@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-[0.7rem] tracking-widest uppercase text-white/50">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full border-2 border-white/15 bg-transparent px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-fire"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={busy}
              className="mt-2 flex cursor-pointer items-center justify-center gap-2 bg-fire px-6 py-3 text-[0.85rem] tracking-wider uppercase text-white transition-all hover:bg-fire-dark disabled:opacity-50"
              style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)" }}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Masuk" : "Daftar & Masuk"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              className="cursor-pointer border-none bg-transparent text-xs text-white/40 underline transition-colors hover:text-fire">
              {mode === "login" ? "Belum punya akun? Buat akun admin" : "Sudah punya akun? Login"}
            </button>
          </div>
        </div>

        <a href="/" className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/30 no-underline transition-colors hover:text-fire">
          <ArrowLeft className="h-3 w-3" /> Kembali ke Website
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN PANEL (Shell with sidebar + content)
   ═══════════════════════════════════════════════════════════════════════════ */
function AdminPanel({ accessToken, user }: { accessToken: string; user: any }) {
  const [page, setPage] = useState<AdminPage>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global data cache
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<SettingsType>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const reload = useCallback(async () => {
    setDataLoading(true);
    try {
      const [p, b, cat, m, s] = await Promise.all([
        fetchProducts().catch(() => []),
        fetchBrands().catch(() => []),
        fetchCategories().catch(() => []),
        fetchMedia().catch(() => []),
        fetchSettings().catch(() => ({})),
      ]);
      setProducts(p);
      setBrands(b);
      setCategories(cat);
      setMediaItems(m);
      setSettings(s);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const NAV: { id: AdminPage; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "Produk", icon: Package },
    { id: "brands", label: "Brand", icon: Tags },
    { id: "categories", label: "Kategori", icon: FolderOpen },
    { id: "media", label: "Media", icon: Image },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#111]">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-white/[0.07] bg-ink transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.07] px-5">
          <div className="flex h-8 w-8 items-center justify-center bg-fire"
            style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)" }}>
            <Wrench className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm tracking-wider text-white" style={{ fontFamily: "var(--font-oswald)", fontWeight: 600 }}>
            NATA<span className="text-fire">TEKNIK</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = page === n.id;
            return (
              <button
                key={n.id}
                onClick={() => { setPage(n.id); setSidebarOpen(false); }}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-[0.8rem] tracking-wide transition-colors ${active
                  ? "bg-fire/15 text-fire"
                  : "bg-transparent text-white/50 hover:bg-white/[0.05] hover:text-white/80"
                  }`}
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="border-t border-white/[0.07] p-4 space-y-2">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-white/30 no-underline hover:text-fire">
            <ExternalLink className="h-3 w-3" /> Lihat Website
          </a>
          <button onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent text-xs text-white/30 hover:text-fire">
            <LogOut className="h-3 w-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#111]/95 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="cursor-pointer rounded-md border border-white/10 bg-transparent p-2 text-white/50 lg:hidden">
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-sm tracking-widest uppercase text-white/60"
              style={{ fontFamily: "var(--font-oswald)" }}>
              {NAV.find((n) => n.id === page)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={reload} title="Refresh data"
              className="cursor-pointer rounded-md border border-white/10 bg-transparent p-2 text-white/40 transition-colors hover:text-fire">
              <RefreshCw className={`h-3.5 w-3.5 ${dataLoading ? "animate-spin" : ""}`} />
            </button>
            <span className="hidden text-xs text-white/30 sm:inline">{user?.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {page === "overview" && <OverviewPage products={products} brands={brands} media={mediaItems} settings={settings} loading={dataLoading} />}
          {page === "products" && <ProductsPage products={products} setProducts={setProducts} brands={brands} categories={categories} token={accessToken} showToast={showToast} loading={dataLoading} />}
          {page === "brands" && <BrandsPage brands={brands} setBrands={setBrands} token={accessToken} showToast={showToast} loading={dataLoading} />}
          {page === "categories" && <CategoriesPage categories={categories} setCategories={setCategories} token={accessToken} showToast={showToast} loading={dataLoading} />}
          {page === "media" && <MediaPage items={mediaItems} setItems={setMediaItems} token={accessToken} showToast={showToast} loading={dataLoading} />}
          {page === "settings" && <SettingsPage settings={settings} setSettings={setSettings} token={accessToken} showToast={showToast} loading={dataLoading} />}
        </main>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-2 border px-4 py-3 text-sm shadow-lg ${toast.type === "ok"
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}>
          {toast.type === "ok" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Shared UI helpers
   ═══════════════════════════════════════════════════════════════════════════ */
const osw = { fontFamily: "var(--font-oswald)" } as const;
const clipBtn = { ...osw, fontWeight: 600, clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)" } as const;

function SectionHeader({ title, count, children }: { title: string; count?: number; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl uppercase tracking-wider text-white" style={{ ...osw, fontWeight: 700 }}>
          {title}
        </h2>
        {count !== undefined && <p className="mt-0.5 text-xs text-white/30">{count} item</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
        <Icon className="h-8 w-8 text-white/15" />
      </div>
      <p className="text-sm uppercase tracking-wider text-white/25" style={osw}>{label}</p>
    </div>
  );
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-[200px] animate-pulse border border-white/10 bg-white/5 rounded" />
      ))}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder, rows }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; rows?: number;
}) {
  const cls = "w-full border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-fire rounded";
  return (
    <div>
      <label className="mb-1 block text-[0.65rem] tracking-widest uppercase text-white/40">{label}</label>
      {rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={cls + " resize-none"} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   OVERVIEW PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
function OverviewPage({ products, brands, media, settings, loading }: {
  products: Product[]; brands: Brand[]; media: MediaItem[]; settings: SettingsType; loading: boolean;
}) {
  const stats = [
    { label: "Produk", value: products.length, icon: Package, color: "text-fire" },
    { label: "Brand", value: brands.length, icon: Tags, color: "text-blue-400" },
    { label: "Media", value: media.length, icon: Image, color: "text-green-400" },
    { label: "Video", value: media.filter((m) => m.type === "video").length, icon: Film, color: "text-purple-400" },
  ];

  return (
    <div>
      <SectionHeader title="Dashboard Overview" />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded border border-white/[0.07] bg-white/[0.03] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[0.65rem] tracking-widest uppercase text-white/30" style={osw}>{s.label}</span>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div className="text-3xl text-white" style={{ ...osw, fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Quick info */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded border border-white/[0.07] bg-white/[0.03] p-5">
              <h3 className="mb-4 text-xs tracking-widest uppercase text-fire" style={osw}>Info Toko</h3>
              <div className="space-y-2 text-sm text-white/50">
                <div className="flex justify-between"><span>WhatsApp</span><span className="text-white">{settings.wa_display || "-"}</span></div>
                <div className="flex justify-between"><span>Rating</span><span className="text-white">{settings.hero_rating || "-"}</span></div>
                <div className="flex justify-between"><span>Reviews</span><span className="text-white">{settings.hero_reviews || "-"}</span></div>
              </div>
            </div>

            <div className="rounded border border-white/[0.07] bg-white/[0.03] p-5">
              <h3 className="mb-4 text-xs tracking-widest uppercase text-fire" style={osw}>Produk Terbaru</h3>
              {products.length === 0 ? (
                <p className="text-sm text-white/30">Belum ada produk</p>
              ) : (
                <div className="space-y-2">
                  {products.slice(-5).reverse().map((p) => (
                    <div key={p.id} className="flex items-center gap-3 text-sm">
                      {p.image && (
                        <img src={p.image} alt="" className="h-8 w-8 rounded bg-white/5 object-cover" />
                      )}
                      <div className="flex-1 truncate text-white/70">{p.name}</div>
                      <span className="shrink-0 text-xs text-fire">{p.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCTS PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
function ProductsPage({ products, setProducts, brands, categories, token, showToast, loading }: {
  products: Product[]; setProducts: (p: Product[]) => void; brands: Brand[]; categories: Category[]; token: string;
  showToast: (m: string, t?: "ok" | "err") => void; loading: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = search
    ? products.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
    )
    : products;

  const handleSave = async (data: Omit<Product, "id">) => {
    setBusy(true);
    try {
      if (editing) {
        const updated = await updateProduct(editing.id, data, token);
        setProducts(products.map((p) => (p.id === editing.id ? updated : p)));
        showToast("Produk berhasil diperbarui");
      } else {
        const created = await createProduct(data, token);
        setProducts([...products, created]);
        showToast("Produk berhasil ditambahkan");
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      showToast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await apiDeleteProduct(id, token);
      setProducts(products.filter((p) => p.id !== id));
      showToast("Produk dihapus");
    } catch (err: any) {
      showToast(err.message, "err");
    }
  };

  return (
    <div>
      <SectionHeader title="Kelola Produk" count={products.length}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..."
              className="w-[200px] rounded border border-white/10 bg-white/[0.03] py-2 pr-3 pl-9 text-xs text-white outline-none focus:border-fire" />
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex cursor-pointer items-center gap-2 bg-fire px-5 py-2.5 text-[0.75rem] tracking-wider uppercase text-white transition-all hover:bg-fire-dark"
            style={clipBtn}>
            <Plus className="h-3.5 w-3.5" /> Tambah
          </button>
        </div>
      </SectionHeader>

      {loading ? <SkeletonGrid /> : filtered.length === 0 ? (
        <EmptyState icon={Package} label="Belum ada produk" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="group overflow-hidden rounded border border-white/[0.07] bg-white/[0.03] transition-colors hover:border-white/15">
              <div className="relative h-[160px] overflow-hidden bg-white/5">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/15"><Package className="h-10 w-10" /></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                  <button onClick={() => { setEditing(p); setShowForm(true); }}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white hover:bg-fire" title="Edit">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white hover:bg-red-500" title="Hapus">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-1 flex items-center gap-2">
                  {p.brand && <span className="text-[0.6rem] tracking-widest uppercase text-fire" style={osw}>{p.brand}</span>}
                  {p.brand && p.category && <span className="text-[0.5rem] text-white/20">•</span>}
                  {p.category && <span className="text-[0.6rem] tracking-widest uppercase text-blue-400" style={osw}>{p.category}</span>}
                </div>
                <h4 className="truncate text-sm text-white" style={{ ...osw, fontWeight: 500 }}>{p.name}</h4>
                <div className="mt-1 text-lg text-white" style={{ ...osw, fontWeight: 700 }}>{p.price}</div>
                {p.description && <p className="mt-1 line-clamp-2 text-[0.7rem] text-white/30">{p.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <ProductFormModal
          product={editing}
          brands={brands}
          categories={categories}
          busy={busy}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
          token={token}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, brands, categories, busy, onSave, onClose, token }: {
  product: Product | null; brands: Brand[]; categories: Category[]; busy: boolean;
  onSave: (data: Omit<Product, "id">) => void; onClose: () => void; token: string;
}) {
  const [name, setName] = useState(product?.name || "");
  const [brand, setBrand] = useState(product?.brand || "");
  const [category, setCategory] = useState(product?.category || "");
  const [price, setPrice] = useState(product?.price || "");
  const [image, setImage] = useState(product?.image || "");
  const [description, setDescription] = useState(product?.description || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image || null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    let finalImage = image;
    if (imageFile) {
      setUploading(true);
      try {
        finalImage = await uploadProductImage(imageFile, token);
      } catch (err: any) {
        console.error("Image upload failed:", err);
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    onSave({ name, brand, category, price, image: finalImage, description });
  };

  const isBusy = busy || uploading;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => { if (e.target === e.currentTarget && !isBusy) onClose(); }}>
      <div className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded border border-white/15 bg-[#1a1a1a] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base uppercase tracking-wider text-white" style={{ ...osw, fontWeight: 600 }}>
            {product ? "Edit Produk" : "Tambah Produk"}
          </h3>
          <button onClick={onClose} disabled={isBusy} className="cursor-pointer border-none bg-transparent text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-col gap-3">
          <InputField label="Nama Produk" value={name} onChange={setName} placeholder="Mesin Bor XYZ" />

          {/* Brand select */}
          <div>
            <label className="mb-1 block text-[0.65rem] tracking-widest uppercase text-white/40">Brand</label>
            <select
              value={brands.some((b) => b.name === brand) ? brand : "__custom__"}
              onChange={(e) => { if (e.target.value !== "__custom__") setBrand(e.target.value); }}
              className="w-full rounded border border-white/15 bg-[#222] px-3 py-2 text-sm text-white outline-none focus:border-fire"
            >
              <option value="">— Pilih Brand —</option>
              {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
              {brand && !brands.some((b) => b.name === brand) && (
                <option value="__custom__">{brand} (manual)</option>
              )}
            </select>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="atau ketik manual"
              className="mt-1.5 w-full rounded border border-white/15 bg-[#222] px-3 py-2 text-sm text-white outline-none focus:border-fire"
            />
          </div>

          {/* Category select */}
          <div>
            <label className="mb-1 block text-[0.65rem] tracking-widest uppercase text-white/40">Kategori</label>
            <select
              value={categories.some((c) => c.name === category) ? category : "__custom__"}
              onChange={(e) => { if (e.target.value !== "__custom__") setCategory(e.target.value); }}
              className="w-full rounded border border-white/15 bg-[#222] px-3 py-2 text-sm text-white outline-none focus:border-fire"
            >
              <option value="">— Pilih Kategori —</option>
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              {category && !categories.some((c) => c.name === category) && (
                <option value="__custom__">{category} (manual)</option>
              )}
            </select>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="atau ketik manual"
              className="mt-1.5 w-full rounded border border-white/15 bg-[#222] px-3 py-2 text-sm text-white outline-none focus:border-fire"
            />
          </div>

          <InputField label="Harga" value={price} onChange={setPrice} placeholder="Rp 1.500.000" />

          {/* Image upload - drag & drop */}
          <div>
            <label className="mb-1 block text-[0.65rem] tracking-widest uppercase text-white/40">Gambar Produk</label>
            {imagePreview ? (
              <div className="relative h-[160px] overflow-hidden rounded border border-white/10 bg-white/5">
                <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); setImage(""); }}
                  className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                className={`flex h-[120px] cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed transition-colors ${dragActive ? "border-fire bg-fire/5" : "border-white/15 hover:border-white/30"
                  }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mb-2 h-6 w-6 text-white/20" />
                <p className="text-xs text-white/40">Drag & drop atau <span className="text-fire underline">pilih gambar</span></p>
                <p className="mt-0.5 text-[0.6rem] text-white/20">JPG, PNG, GIF, WebP</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
                />
              </div>
            )}
          </div>

          <InputField label="Deskripsi" value={description} onChange={setDescription} rows={3} placeholder="Deskripsi produk..." />
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} disabled={isBusy} className="flex-1 cursor-pointer rounded border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white/60 hover:text-white">Batal</button>
          <button onClick={handleSubmit} disabled={isBusy || !name}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 bg-fire px-4 py-2.5 text-sm uppercase tracking-wider text-white hover:bg-fire-dark disabled:opacity-50"
            style={{ ...osw, fontWeight: 600 }}>
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {uploading ? "Mengupload..." : product ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BRANDS PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
function BrandsPage({ brands, setBrands, token, showToast, loading }: {
  brands: Brand[]; setBrands: (b: Brand[]) => void; token: string;
  showToast: (m: string, t?: "ok" | "err") => void; loading: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSave = async (data: Omit<Brand, "id">) => {
    setBusy(true);
    try {
      if (editing) {
        const updated = await updateBrand(editing.id, data, token);
        setBrands(brands.map((b) => (b.id === editing.id ? updated : b)));
        showToast("Brand berhasil diperbarui");
      } else {
        const created = await createBrand(data, token);
        setBrands([...brands, created]);
        showToast("Brand berhasil ditambahkan");
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      showToast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus brand ini?")) return;
    try {
      await apiDeleteBrand(id, token);
      setBrands(brands.filter((b) => b.id !== id));
      showToast("Brand dihapus");
    } catch (err: any) {
      showToast(err.message, "err");
    }
  };

  return (
    <div>
      <SectionHeader title="Kelola Brand" count={brands.length}>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex cursor-pointer items-center gap-2 bg-fire px-5 py-2.5 text-[0.75rem] tracking-wider uppercase text-white transition-all hover:bg-fire-dark"
          style={clipBtn}>
          <Plus className="h-3.5 w-3.5" /> Tambah
        </button>
      </SectionHeader>

      {loading ? <SkeletonGrid count={4} /> : brands.length === 0 ? (
        <EmptyState icon={Tags} label="Belum ada brand" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {brands.map((b) => (
            <div key={b.id} className="group relative overflow-hidden rounded border border-white/[0.07] bg-white/[0.03] p-4 transition-colors hover:border-white/15">
              <div className="mb-3 flex h-[80px] items-center justify-center rounded bg-white/5">
                {b.image ? (
                  <img src={b.image} alt={b.name} className="h-full w-full rounded object-contain p-2" loading="lazy" />
                ) : (
                  <span className="text-xl text-white/20" style={{ ...osw, fontWeight: 700 }}>
                    {b.name.charAt(0)}
                  </span>
                )}
              </div>
              <h4 className="flex items-center justify-center gap-1 truncate text-center text-sm text-white" style={{ ...osw, fontWeight: 500 }}>
                {b.name}
                {b.catalog_url && (
                  <span className="rounded bg-fire/20 px-1 py-0.5 text-[0.6rem] text-fire" title="Katalog PDF tersedia">
                    PDF
                  </span>
                )}
              </h4>
              <div className="absolute inset-0 flex items-center justify-center gap-2 rounded bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                <button onClick={() => { setEditing(b); setShowForm(true); }}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white hover:bg-fire">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(b.id)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white hover:bg-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BrandFormModal brand={editing} busy={busy} onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }} token={token} />
      )}
    </div>
  );
}

function BrandFormModal({ brand, busy, onSave, onClose, token }: {
  brand: Brand | null; busy: boolean; onSave: (d: Omit<Brand, "id">) => void; onClose: () => void; token: string;
}) {
  const [name, setName] = useState(brand?.name || "");
  const [file, setFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(brand?.image || "");
  const [pdfUrl, setPdfUrl] = useState(brand?.catalog_url || "");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handlePdfFile = (f: File) => {
    if (f.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan.");
      return;
    }
    setPdfFile(f);
    setPdfUrl(""); // Clear the existing URL since we're replacing it with a fresh file
  };

  const handleSaveClick = async () => {
    if (!name) return;
    setUploading(true);
    let imageUrl = brand?.image || "";
    let finalPdfUrl = pdfUrl;

    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `brand-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `brands/${fileName}`;

        const { error } = await supabase.storage.from('media').upload(filePath, file);
        if (!error) {
          const { data } = supabase.storage.from('media').getPublicUrl(filePath);
          imageUrl = data.publicUrl;
        }
      }

      if (pdfFile) {
        finalPdfUrl = await uploadBrandCatalog(pdfFile, token);
      }

      await onSave({ name, image: imageUrl, catalog_url: finalPdfUrl });
    } catch (err: any) {
      console.error("Upload failed", err);
      alert("Terjadi kesalahan saat mengunggah file. " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => { if (e.target === e.currentTarget && !uploading && !busy) onClose(); }}>
      <div className="w-full max-w-[420px] rounded border border-white/15 bg-[#1a1a1a] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base uppercase tracking-wider text-white" style={{ ...osw, fontWeight: 600 }}>
            {brand ? "Edit Brand" : "Tambah Brand"}
          </h3>
          <button onClick={onClose} disabled={uploading || busy} className="cursor-pointer border-none bg-transparent text-white/40 hover:text-white disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-col gap-4">
          <InputField label="Nama Brand" value={name} onChange={setName} placeholder="Makita" />

          <div>
            <label className="mb-1.5 block text-[0.65rem] tracking-widest uppercase text-white/40">Logo Brand</label>
            {!preview ? (
              <div className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed transition-colors ${dragActive ? "border-fire bg-fire/5" : "border-white/15 hover:border-white/30"}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith("image/")) handleFile(f); }}
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="mb-2 h-6 w-6 text-white/20" />
                <p className="text-xs text-white/40">Drag & drop atau <span className="text-fire underline">pilih file</span></p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            ) : (
              <div className="relative flex h-32 items-center justify-center rounded border border-white/10 bg-white/5 p-2">
                <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
                <button onClick={() => { setFile(null); setPreview(""); }}
                  className="absolute top-2 right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[0.65rem] tracking-widest uppercase text-white/40">Katalog PDF (Opsional)</label>
            <div className="flex items-center gap-3">
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfFile(f); }}
              />
              <button
                onClick={() => pdfInputRef.current?.click()}
                className="flex cursor-pointer items-center gap-2 rounded border border-white/15 bg-white/5 px-3 py-2 text-xs text-white transition-colors hover:bg-white/10"
              >
                <Upload className="h-3.5 w-3.5" /> Pilih PDF
              </button>
              <div className="flex-1 truncate text-xs text-white/60">
                {pdfFile ? pdfFile.name : pdfUrl ? "Katalog Tersimpan. (Pilih untuk mengganti)" : "Belum ada file PDF."}
              </div>
              {(pdfFile || pdfUrl) && (
                <button onClick={() => { setPdfFile(null); setPdfUrl(""); }}
                  className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-red-500/80 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            {pdfUrl && !pdfFile && (
              <a href={pdfUrl} target="_blank" rel="noreferrer" className="mt-2 block text-[0.65rem] text-fire underline hover:text-fire-dark">
                Lihat PDF Tersimpan
              </a>
            )}
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} disabled={uploading || busy} className="flex-1 cursor-pointer rounded border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white/60 hover:text-white disabled:opacity-50">Batal</button>
          <button onClick={handleSaveClick} disabled={busy || uploading || !name}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 bg-fire px-4 py-2.5 text-sm uppercase tracking-wider text-white hover:bg-fire-dark disabled:opacity-50"
            style={{ ...osw, fontWeight: 600 }}>
            {busy || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {brand ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORIES PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
function CategoriesPage({ categories, setCategories, token, showToast, loading }: {
  categories: Category[]; setCategories: (c: Category[]) => void; token: string;
  showToast: (m: string, t?: "ok" | "err") => void; loading: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSave = async (data: Omit<Category, "id">) => {
    setBusy(true);
    try {
      if (editing) {
        const updated = await updateCategory(editing.id, data, token);
        setCategories(categories.map((c) => (c.id === editing.id ? updated : c)));
        showToast("Kategori berhasil diperbarui");
      } else {
        const created = await createCategory(data, token);
        setCategories([...categories, created]);
        showToast("Kategori berhasil ditambahkan");
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      showToast(err.message, "err");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      await apiDeleteCategory(id, token);
      setCategories(categories.filter((c) => c.id !== id));
      showToast("Kategori dihapus");
    } catch (err: any) {
      showToast(err.message, "err");
    }
  };

  return (
    <div>
      <SectionHeader title="Kelola Kategori" count={categories.length}>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex cursor-pointer items-center gap-2 bg-fire px-5 py-2.5 text-[0.75rem] tracking-wider uppercase text-white transition-all hover:bg-fire-dark"
          style={clipBtn}>
          <Plus className="h-3.5 w-3.5" /> Tambah
        </button>
      </SectionHeader>

      {loading ? <SkeletonGrid count={4} /> : categories.length === 0 ? (
        <EmptyState icon={FolderOpen} label="Belum ada kategori" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((c) => (
            <div key={c.id} className="group relative overflow-hidden rounded border border-white/[0.07] bg-white/[0.03] p-4 transition-colors hover:border-white/15">
              <div className="mb-3 flex h-[80px] items-center justify-center rounded bg-white/5">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="h-full w-full rounded object-contain p-2" loading="lazy" />
                ) : (
                  <span className="text-xl text-white/20" style={{ ...osw, fontWeight: 700 }}>
                    {c.name.charAt(0)}
                  </span>
                )}
              </div>
              <h4 className="truncate text-center text-sm text-white" style={{ ...osw, fontWeight: 500 }}>{c.name}</h4>
              <div className="absolute inset-0 flex items-center justify-center gap-2 rounded bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                <button onClick={() => { setEditing(c); setShowForm(true); }}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white hover:bg-fire">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(c.id)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white hover:bg-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryFormModal category={editing} busy={busy} onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function CategoryFormModal({ category, busy, onSave, onClose }: {
  category: Category | null; busy: boolean; onSave: (d: Omit<Category, "id">) => void; onClose: () => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(category?.image || "");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSaveClick = async () => {
    if (!name) return;
    setUploading(true);
    let imageUrl = category?.image || "";

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `category-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error } = await supabase.storage.from('media').upload(filePath, file);
      if (!error) {
        const { data } = supabase.storage.from('media').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
    }

    await onSave({ name, image: imageUrl });
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => { if (e.target === e.currentTarget && !uploading && !busy) onClose(); }}>
      <div className="w-full max-w-[420px] rounded border border-white/15 bg-[#1a1a1a] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base uppercase tracking-wider text-white" style={{ ...osw, fontWeight: 600 }}>
            {category ? "Edit Kategori" : "Tambah Kategori"}
          </h3>
          <button onClick={onClose} disabled={uploading || busy} className="cursor-pointer border-none bg-transparent text-white/40 hover:text-white disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-col gap-4">
          <InputField label="Nama Kategori" value={name} onChange={setName} placeholder="Mesin Bor" />

          <div>
            <label className="mb-1.5 block text-[0.65rem] tracking-widest uppercase text-white/40">Gambar Kategori</label>
            {!preview ? (
              <div className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed transition-colors ${dragActive ? "border-fire bg-fire/5" : "border-white/15 hover:border-white/30"}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith("image/")) handleFile(f); }}
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="mb-2 h-6 w-6 text-white/20" />
                <p className="text-xs text-white/40">Drag & drop atau <span className="text-fire underline">pilih file</span></p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            ) : (
              <div className="relative flex h-32 items-center justify-center rounded border border-white/10 bg-white/5 p-2">
                <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
                <button onClick={() => { setFile(null); setPreview(""); }}
                  className="absolute top-2 right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} disabled={uploading || busy} className="flex-1 cursor-pointer rounded border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white/60 hover:text-white disabled:opacity-50">Batal</button>
          <button onClick={handleSaveClick} disabled={busy || uploading || !name}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 bg-fire px-4 py-2.5 text-sm uppercase tracking-wider text-white hover:bg-fire-dark disabled:opacity-50"
            style={{ ...osw, fontWeight: 600 }}>
            {busy || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {category ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MEDIA PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
function MediaPage({ items, setItems, token, showToast, loading }: {
  items: MediaItem[]; setItems: (i: MediaItem[]) => void; token: string;
  showToast: (m: string, t?: "ok" | "err") => void; loading: boolean;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus media ini?")) return;
    try {
      await deleteMedia(id, token);
      setItems(items.filter((m) => m.id !== id));
      showToast("Media dihapus");
    } catch (err: any) {
      showToast(err.message, "err");
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Pick<MediaItem, "title" | "caption" | "order" | "link_url">>) => {
    try {
      const updated = await updateMedia(id, updates, token);
      setItems(items.map((m) => (m.id === id ? updated : m)));
      setEditingId(null);
      showToast("Media diperbarui");
    } catch (err: any) {
      showToast(err.message, "err");
    }
  };

  return (
    <div>
      <SectionHeader title="Kelola Media" count={items.length}>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span>{items.filter((m) => m.type === "image").length} foto</span>
          <span>•</span>
          <span>{items.filter((m) => m.type === "video").length} video</span>
          <button onClick={() => setShowUpload(true)}
            className="ml-3 flex cursor-pointer items-center gap-2 bg-fire px-5 py-2.5 text-[0.75rem] tracking-wider uppercase text-white transition-all hover:bg-fire-dark"
            style={clipBtn}>
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        </div>
      </SectionHeader>

      {loading ? <SkeletonGrid /> : items.length === 0 ? (
        <EmptyState icon={Image} label="Belum ada media — upload foto atau video" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} editing={editingId === item.id}
              onEdit={() => setEditingId(item.id)} onCancelEdit={() => setEditingId(null)}
              onUpdate={(u) => handleUpdate(item.id, u)} onDelete={() => handleDelete(item.id)}
              onPreview={() => setPreviewItem(item)} />
          ))}
        </div>
      )}

      {showUpload && (
        <UploadModal token={token} nextOrder={items.length} uploading={uploading} setUploading={setUploading}
          onClose={() => setShowUpload(false)}
          onUploaded={(item) => { setItems([...items, item]); setShowUpload(false); showToast("Media berhasil diupload"); }}
          onError={(m) => showToast(m, "err")} />
      )}

      {previewItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setPreviewItem(null); }}>
          <button onClick={() => setPreviewItem(null)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          {previewItem.type === "video" ? (
            <video src={previewItem.url} controls autoPlay className="max-h-[85vh] max-w-[90vw] rounded" />
          ) : (
            <img src={previewItem.url} alt={previewItem.title} className="max-h-[85vh] max-w-[90vw] rounded object-contain" />
          )}
        </div>
      )}
    </div>
  );
}

function MediaCard({ item, editing, onEdit, onCancelEdit, onUpdate, onDelete, onPreview }: {
  item: MediaItem; editing: boolean; onEdit: () => void; onCancelEdit: () => void;
  onUpdate: (u: Partial<Pick<MediaItem, "title" | "caption" | "order" | "link_url">>) => void;
  onDelete: () => void; onPreview: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [caption, setCaption] = useState(item.caption);
  const [order, setOrder] = useState(item.order);
  const [linkUrl, setLinkUrl] = useState(item.link_url || "");
  const isVideo = item.type === "video";

  if (editing) {
    return (
      <div className="rounded border border-fire/40 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs tracking-widest uppercase text-fire" style={osw}>Edit Media</span>
          <button onClick={onCancelEdit} className="cursor-pointer border-none bg-transparent text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-col gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul"
            className="w-full rounded border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-fire" />
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Keterangan" rows={2}
            className="w-full resize-none rounded border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-fire" />
          <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Link URL (opsional)"
            className="w-full rounded border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-fire" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/40">Urutan:</label>
            <input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-20 rounded border border-white/15 bg-transparent px-2 py-1 text-sm text-white outline-none focus:border-fire" />
          </div>
          <button onClick={() => onUpdate({ title, caption, order, link_url: linkUrl })}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded bg-fire px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-fire-dark"
            style={osw}><Check className="h-3.5 w-3.5" /> Simpan</button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded border border-white/[0.07] bg-white/[0.03] transition-colors hover:border-white/15">
      <div className="relative h-[170px] overflow-hidden bg-white/5">
        {isVideo ? (
          <>
            <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fire/80"><Film className="h-4 w-4 text-white" /></div>
            </div>
          </>
        ) : (
          <img src={item.url} alt={item.title || "Media"} className="h-full w-full object-cover" loading="lazy" />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
          <button onClick={onPreview} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30" title="Preview"><Eye className="h-4 w-4" /></button>
          <button onClick={onEdit} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white hover:bg-fire" title="Edit"><Edit3 className="h-4 w-4" /></button>
          <button onClick={onDelete} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white hover:bg-red-500" title="Hapus"><Trash2 className="h-4 w-4" /></button>
        </div>
        <div className="absolute top-2 right-2 rounded bg-ink/70 px-2 py-0.5 text-[0.55rem] uppercase tracking-wider text-white">{isVideo ? "Video" : "Foto"}</div>
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-ink/70 px-2 py-0.5 text-[0.55rem] uppercase tracking-wider text-white">
          <GripVertical className="h-3 w-3" /> #{item.order}
        </div>
      </div>
      <div className="p-3">
        <h4 className="truncate text-sm text-white" style={{ ...osw, fontWeight: 500 }}>{item.title || "Tanpa judul"}</h4>
        {item.caption && <p className="mt-0.5 truncate text-xs text-white/30">{item.caption}</p>}
        <div className="mt-2 flex items-center justify-between text-[0.6rem] text-white/20">
          <span className="truncate">{item.original_name}</span>
          <span className="shrink-0 ml-2">{(item.file_size / 1024 / 1024).toFixed(1)} MB</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UPLOAD MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
function UploadModal({ token, nextOrder, uploading, setUploading, onClose, onUploaded, onError }: {
  token: string; nextOrder: number; uploading: boolean; setUploading: (v: boolean) => void;
  onClose: () => void; onUploaded: (item: MediaItem) => void; onError: (msg: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [order, setOrder] = useState(nextOrder);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else if (f.type.startsWith("video/")) {
      setPreview(URL.createObjectURL(f));
    }
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const item = await uploadMedia(file, {
        title, caption,
        type: file.type.startsWith("video/") ? "video" : "image",
        order, link_url: linkUrl,
      }, token);
      onUploaded(item);
    } catch (err: any) {
      onError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !uploading) onClose(); }}>
      <div className="w-full max-w-[520px] rounded border border-white/15 bg-[#1a1a1a] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base uppercase tracking-wider text-white" style={{ ...osw, fontWeight: 600 }}>Upload Media</h3>
          <button onClick={onClose} disabled={uploading} className="cursor-pointer border-none bg-transparent text-white/40 hover:text-white disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>

        {!file ? (
          <div className={`flex h-[180px] cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed transition-colors ${dragActive ? "border-fire bg-fire/5" : "border-white/15 hover:border-white/30"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileInputRef.current?.click()}>
            <Upload className="mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">Drag & drop atau <span className="text-fire underline">pilih file</span></p>
            <p className="mt-1 text-xs text-white/20">JPG, PNG, GIF, MP4, WebM • Maks 50MB</p>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        ) : (
          <div className="relative mb-4 h-[180px] overflow-hidden rounded border border-white/10 bg-white/5">
            {file.type.startsWith("video/") ? (
              <video src={preview || ""} muted playsInline className="h-full w-full object-contain" />
            ) : (
              <img src={preview || ""} alt="Preview" className="h-full w-full object-contain" />
            )}
            <button onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500">
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-2 left-2 rounded bg-ink/70 px-2 py-0.5 text-[0.55rem] text-white">
              {file.name} • {(file.size / 1024 / 1024).toFixed(1)} MB
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3">
          <InputField label="Judul" value={title} onChange={setTitle} placeholder="Judul media" />
          <InputField label="Keterangan" value={caption} onChange={setCaption} placeholder="Keterangan (opsional)" rows={2} />
          <InputField label="Link URL" value={linkUrl} onChange={setLinkUrl} placeholder="Link URL (opsional)" />
          <div className="flex items-center gap-2">
            <label className="text-[0.65rem] tracking-widest uppercase text-white/40">Urutan:</label>
            <input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-20 rounded border border-white/15 bg-transparent px-2 py-1 text-sm text-white outline-none focus:border-fire" />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} disabled={uploading} className="flex-1 cursor-pointer rounded border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white/60 hover:text-white">Batal</button>
          <button onClick={handleUpload} disabled={!file || uploading}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 bg-fire px-4 py-2.5 text-sm uppercase tracking-wider text-white hover:bg-fire-dark disabled:opacity-50"
            style={{ ...osw, fontWeight: 600 }}>
            {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengupload...</> : <><Upload className="h-4 w-4" /> Upload</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
function SettingsPage({ settings, setSettings, token, showToast, loading }: {
  settings: SettingsType; setSettings: (s: SettingsType) => void; token: string;
  showToast: (m: string, t?: "ok" | "err") => void; loading: boolean;
}) {
  const [local, setLocal] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const k of Object.keys(settings)) {
      if (settings[k] !== undefined) map[k] = settings[k] as string;
    }
    setLocal(map);
    setDirty(false);
  }, [settings]);

  const update = (key: string, value: string) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiUpdateSettings(local, token);
      setSettings(local);
      setDirty(false);
      showToast("Pengaturan disimpan");
    } catch (err: any) {
      showToast(err.message, "err");
    } finally {
      setSaving(false);
    }
  };

  const FIELDS: { key: string; label: string; placeholder: string }[] = [
    { key: "store_name", label: "Nama Toko", placeholder: "Nata Teknik" },
    { key: "tagline", label: "Tagline", placeholder: "Pusat Alat Teknik Terpercaya — Bali" },
    { key: "wa_number", label: "WhatsApp (tanpa +)", placeholder: "6282277775595" },
    { key: "wa_display", label: "WhatsApp (display)", placeholder: "0822-7777-5595" },
    { key: "address", label: "Alamat", placeholder: "Jl. Gunung Salak Utara No.88..." },
    { key: "hero_rating", label: "Rating Hero", placeholder: "4.5" },
    { key: "hero_reviews", label: "Jumlah Review", placeholder: "77+" },
  ];

  if (loading) return <SkeletonGrid count={3} />;

  return (
    <div>
      <SectionHeader title="Pengaturan Website">
        <button onClick={handleSave} disabled={saving || !dirty}
          className="flex cursor-pointer items-center gap-2 bg-fire px-5 py-2.5 text-[0.75rem] tracking-wider uppercase text-white transition-all hover:bg-fire-dark disabled:opacity-40"
          style={clipBtn}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Simpan Perubahan
        </button>
      </SectionHeader>

      <div className="max-w-2xl space-y-5">
        {FIELDS.map((f) => (
          <div key={f.key} className="rounded border border-white/[0.07] bg-white/[0.03] p-5">
            <label className="mb-2 block text-[0.65rem] tracking-widest uppercase text-white/40">{f.label}</label>
            <input
              value={local[f.key] || ""}
              onChange={(e) => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full rounded border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-fire"
            />
          </div>
        ))}

        {/* Custom settings */}
        <div className="rounded border border-white/[0.07] bg-white/[0.03] p-5">
          <h4 className="mb-3 text-xs tracking-widest uppercase text-fire" style={osw}>Pengaturan Lainnya</h4>
          <p className="mb-3 text-xs text-white/30">
            Tambah setting kustom melalui Supabase Dashboard → Table "settings" (kolom key & value).
          </p>
          {Object.entries(local)
            .filter(([k]) => !FIELDS.some((f) => f.key === k))
            .map(([key, value]) => (
              <div key={key} className="mb-2 flex items-center gap-3">
                <span className="w-[140px] shrink-0 text-xs text-white/40 font-mono">{key}</span>
                <input value={value} onChange={(e) => update(key, e.target.value)}
                  className="flex-1 rounded border border-white/15 bg-transparent px-3 py-1.5 text-sm text-white outline-none focus:border-fire" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}