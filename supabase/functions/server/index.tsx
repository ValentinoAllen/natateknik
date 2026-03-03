import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const supabase = () =>
  createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

const MEDIA_BUCKET = "make-3d6df8f3-media";

// ── Initialize storage bucket on startup ──────────────────────────────────
(async () => {
  try {
    const sb = supabase();
    const { data: buckets } = await sb.storage.listBuckets();
    const bucketExists = buckets?.some(
      (bucket: any) => bucket.name === MEDIA_BUCKET
    );
    if (!bucketExists) {
      await sb.storage.createBucket(MEDIA_BUCKET, { public: false });
      console.log(`Created storage bucket: ${MEDIA_BUCKET}`);
    }
  } catch (err) {
    console.log("Error initializing storage bucket:", err);
  }
})();

// ── Auto-seed admin user on startup ───────────────────────────────────────
(async () => {
  try {
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminEmail || !adminPassword) {
      console.log("ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin seed.");
      return;
    }
    const sb = supabase();
    // Check if user already exists by trying to list users
    const { data: existingUsers } = await sb.auth.admin.listUsers();
    const exists = existingUsers?.users?.some(
      (u: any) => u.email === adminEmail
    );
    if (!exists) {
      const { data, error } = await sb.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        user_metadata: { name: "Admin" },
        // Automatically confirm the user's email since an email server hasn't been configured.
        email_confirm: true,
      });
      if (error) {
        console.log("Error seeding admin user:", error.message);
      } else {
        console.log("Admin user seeded successfully:", data.user.email);
      }
    } else {
      console.log("Admin user already exists, skipping seed.");
    }
  } catch (err) {
    console.log("Error during admin seed:", err);
  }
})();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// ── Auth helper ───────────────────────────────────────────────────────────
async function requireAuth(request: Request): Promise<string> {
  const accessToken =
    request.headers.get("X-User-Token") ||
    request.headers.get("Authorization")?.split(" ")[1];
  if (!accessToken) throw new Error("No access token");
  const sb = supabase();
  const {
    data: { user },
    error,
  } = await sb.auth.getUser(accessToken);
  if (error || !user?.id) throw new Error("Unauthorized");
  return user.id;
}

// ── Health check ──────────────────────────────────────────────────────────
app.get("/make-server-3d6df8f3/health", (c) => {
  return c.json({ status: "ok" });
});

// ── Products ──────────────────────────────────────────────────────────────
app.get("/make-server-3d6df8f3/products", async (c) => {
  try {
    const sb = supabase();
    const { data, error } = await sb
      .from("products")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      console.log("Error fetching products:", error.message);
      return c.json(
        { error: `Error fetching products: ${error.message}` },
        500
      );
    }
    return c.json({ data: data ?? [] });
  } catch (err) {
    console.log("Unexpected error fetching products:", err);
    return c.json(
      { error: `Unexpected error fetching products: ${err}` },
      500
    );
  }
});

// Create product (auth required)
app.post("/make-server-3d6df8f3/products", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const body = await c.req.json();
    const sb = supabase();
    const { data, error } = await sb
      .from("products")
      .insert(body)
      .select()
      .single();
    if (error) {
      console.log("Error creating product:", error.message);
      return c.json(
        { error: `Error creating product: ${error.message}` },
        500
      );
    }
    return c.json({ data });
  } catch (err) {
    console.log("Unexpected error creating product:", err);
    return c.json(
      { error: `Unexpected error creating product: ${err}` },
      500
    );
  }
});

// Update product (auth required)
app.put("/make-server-3d6df8f3/products/:id", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const sb = supabase();
    const { data, error } = await sb
      .from("products")
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.log("Error updating product:", error.message);
      return c.json(
        { error: `Error updating product: ${error.message}` },
        500
      );
    }
    return c.json({ data });
  } catch (err) {
    console.log("Unexpected error updating product:", err);
    return c.json(
      { error: `Unexpected error updating product: ${err}` },
      500
    );
  }
});

// Delete product (auth required)
app.delete("/make-server-3d6df8f3/products/:id", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const id = c.req.param("id");
    const sb = supabase();
    const { error } = await sb.from("products").delete().eq("id", id);
    if (error) {
      console.log("Error deleting product:", error.message);
      return c.json(
        { error: `Error deleting product: ${error.message}` },
        500
      );
    }
    return c.json({ data: { success: true } });
  } catch (err) {
    console.log("Unexpected error deleting product:", err);
    return c.json(
      { error: `Unexpected error deleting product: ${err}` },
      500
    );
  }
});

// Upload product image (auth required)
app.post("/make-server-3d6df8f3/products/upload-image", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return c.json({ error: "No file provided" }, 400);
    if (!file.type.startsWith("image/"))
      return c.json({ error: "Only image files allowed" }, 400);

    const ext = file.name.split(".").pop() || "jpg";
    const id = `product-${Date.now()}-${Math.random().toString(36).substring(
      2,
      8
    )}`;
    const storagePath = `${id}.${ext}`;

    const sb = supabase();
    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await sb.storage
      .from(MEDIA_BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.log("Product image upload error:", uploadError.message);
      return c.json({ error: `Upload failed: ${uploadError.message}` }, 500);
    }

    const { data: signedData } = await sb.storage
      .from(MEDIA_BUCKET)
      .createSignedUrl(storagePath, 31536000); // 1 year

    return c.json({
      data: { url: signedData?.signedUrl || "", storage_path: storagePath },
    });
  } catch (err) {
    console.log("Unexpected product image upload error:", err);
    return c.json({ error: `Unexpected upload error: ${err}` }, 500);
  }
});

// ── Brands ────────────────────────────────────────────────────────────────
app.get("/make-server-3d6df8f3/brands", async (c) => {
  try {
    const sb = supabase();
    const { data, error } = await sb
      .from("brands")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      console.log("Error fetching brands:", error.message);
      return c.json(
        { error: `Error fetching brands: ${error.message}` },
        500
      );
    }
    return c.json({ data: data ?? [] });
  } catch (err) {
    console.log("Unexpected error fetching brands:", err);
    return c.json(
      { error: `Unexpected error fetching brands: ${err}` },
      500
    );
  }
});

// Create brand (auth required)
app.post("/make-server-3d6df8f3/brands", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const body = await c.req.json();
    const sb = supabase();
    const { data, error } = await sb
      .from("brands")
      .insert(body)
      .select()
      .single();
    if (error) {
      console.log("Error creating brand:", error.message);
      return c.json(
        { error: `Error creating brand: ${error.message}` },
        500
      );
    }
    return c.json({ data });
  } catch (err) {
    console.log("Unexpected error creating brand:", err);
    return c.json(
      { error: `Unexpected error creating brand: ${err}` },
      500
    );
  }
});

// Update brand (auth required)
app.put("/make-server-3d6df8f3/brands/:id", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const sb = supabase();
    const { data, error } = await sb
      .from("brands")
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.log("Error updating brand:", error.message);
      return c.json(
        { error: `Error updating brand: ${error.message}` },
        500
      );
    }
    return c.json({ data });
  } catch (err) {
    console.log("Unexpected error updating brand:", err);
    return c.json(
      { error: `Unexpected error updating brand: ${err}` },
      500
    );
  }
});

// Delete brand (auth required)
app.delete("/make-server-3d6df8f3/brands/:id", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const id = c.req.param("id");
    const sb = supabase();
    const { error } = await sb.from("brands").delete().eq("id", id);
    if (error) {
      console.log("Error deleting brand:", error.message);
      return c.json(
        { error: `Error deleting brand: ${error.message}` },
        500
      );
    }
    return c.json({ data: { success: true } });
  } catch (err) {
    console.log("Unexpected error deleting brand:", err);
    return c.json(
      { error: `Unexpected error deleting brand: ${err}` },
      500
    );
  }
});

// ── Categories (KV-backed) ────────────────────────────────────────────────
app.get("/make-server-3d6df8f3/categories", async (c) => {
  try {
    const items = await kv.getByPrefix("category:");
    const sorted = (items || []).sort((a: any, b: any) => (a.id ?? 0) - (b.id ?? 0));
    return c.json({ data: sorted });
  } catch (err) {
    console.log("Error fetching categories:", err);
    return c.json({ error: `Error fetching categories: ${err}` }, 500);
  }
});

// Create category (auth required)
app.post("/make-server-3d6df8f3/categories", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const body = await c.req.json();
    const id = Date.now();
    const item = {
      id,
      name: body.name || "",
      image: body.image || "",
      created_at: new Date().toISOString(),
    };
    await kv.set(`category:${id}`, item);
    return c.json({ data: item });
  } catch (err) {
    console.log("Error creating category:", err);
    return c.json({ error: `Error creating category: ${err}` }, 500);
  }
});

// Update category (auth required)
app.put("/make-server-3d6df8f3/categories/:id", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`category:${id}`);
    if (!existing) return c.json({ error: "Category not found" }, 404);
    const updated = {
      ...existing,
      name: body.name ?? existing.name,
      image: body.image ?? existing.image,
      updated_at: new Date().toISOString(),
    };
    await kv.set(`category:${id}`, updated);
    return c.json({ data: updated });
  } catch (err) {
    console.log("Error updating category:", err);
    return c.json({ error: `Error updating category: ${err}` }, 500);
  }
});

// Delete category (auth required)
app.delete("/make-server-3d6df8f3/categories/:id", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`category:${id}`);
    if (!existing) return c.json({ error: "Category not found" }, 404);
    await kv.del(`category:${id}`);
    return c.json({ data: { success: true } });
  } catch (err) {
    console.log("Error deleting category:", err);
    return c.json({ error: `Error deleting category: ${err}` }, 500);
  }
});

// ── Settings ──────────────────────────────────────────────────────────────
app.get("/make-server-3d6df8f3/settings", async (c) => {
  try {
    const sb = supabase();
    const { data, error } = await sb.from("settings").select("*");
    if (error) {
      console.log("Error fetching settings:", error.message);
      return c.json(
        { error: `Error fetching settings: ${error.message}` },
        500
      );
    }
    const settingsMap: Record<string, string> = {};
    if (data) {
      for (const row of data) {
        settingsMap[row.key] = row.value;
      }
    }
    return c.json({ data: settingsMap });
  } catch (err) {
    console.log("Unexpected error fetching settings:", err);
    return c.json(
      { error: `Unexpected error fetching settings: ${err}` },
      500
    );
  }
});

// Update settings (auth required) — expects { key: value, key: value }
app.put("/make-server-3d6df8f3/settings", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const body = await c.req.json();
    const sb = supabase();
    const entries = Object.entries(body);
    for (const [key, value] of entries) {
      const { error } = await sb.from("settings").upsert(
        { key, value },
        { onConflict: "key" }
      );
      if (error) {
        console.log(`Error updating setting "${key}":`, error.message);
        return c.json(
          { error: `Error updating setting "${key}": ${error.message}` },
          500
        );
      }
    }
    return c.json({ data: body });
  } catch (err) {
    console.log("Unexpected error updating settings:", err);
    return c.json(
      { error: `Unexpected error updating settings: ${err}` },
      500
    );
  }
});

// ── Admin Signup (one-time) ───────────────────────────────────────────────
app.post("/make-server-3d6df8f3/admin/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: "Email and password required" }, 400);
    }
    const sb = supabase();
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || "Admin" },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });
    if (error) {
      console.log("Admin signup error:", error.message);
      return c.json({ error: `Admin signup error: ${error.message}` }, 400);
    }
    return c.json({ data: { id: data.user.id, email: data.user.email } });
  } catch (err) {
    console.log("Unexpected admin signup error:", err);
    return c.json({ error: `Unexpected signup error: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ── Media Gallery CRUD ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

// List all media (public — for the main website)
app.get("/make-server-3d6df8f3/media", async (c) => {
  try {
    const items = await kv.getByPrefix("media:");
    // Sort by order (ascending), then by created_at (newest first)
    const sorted = (items || []).sort((a: any, b: any) => {
      if (a.order !== b.order) return (a.order ?? 999) - (b.order ?? 999);
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    // Generate signed URLs for each media item
    const sb = supabase();
    const withUrls = await Promise.all(
      sorted.map(async (item: any) => {
        if (item.storage_path) {
          const { data } = await sb.storage
            .from(MEDIA_BUCKET)
            .createSignedUrl(item.storage_path, 3600); // 1 hour
          return { ...item, url: data?.signedUrl || item.url };
        }
        return item;
      })
    );

    return c.json({ data: withUrls });
  } catch (err) {
    console.log("Error listing media:", err);
    return c.json({ error: `Error listing media: ${err}` }, 500);
  }
});

// Upload media (auth required)
app.post("/make-server-3d6df8f3/media/upload", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "";
    const caption = (formData.get("caption") as string) || "";
    const mediaType = (formData.get("type") as string) || "image"; // image | video
    const order = parseInt((formData.get("order") as string) || "0", 10);
    const linkUrl = (formData.get("link_url") as string) || "";

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      return c.json(
        { error: "Only image and video files are allowed" },
        400
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "bin";
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const storagePath = `${id}.${ext}`;

    // Upload to Supabase Storage
    const sb = supabase();
    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await sb.storage
      .from(MEDIA_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.log("Storage upload error:", uploadError.message);
      return c.json(
        { error: `Upload failed: ${uploadError.message}` },
        500
      );
    }

    // Generate signed URL
    const { data: signedData } = await sb.storage
      .from(MEDIA_BUCKET)
      .createSignedUrl(storagePath, 3600);

    // Save metadata to KV store
    const mediaItem = {
      id,
      title,
      caption,
      type: isVideo ? "video" : "image",
      mime_type: file.type,
      storage_path: storagePath,
      url: signedData?.signedUrl || "",
      link_url: linkUrl,
      order,
      file_size: file.size,
      original_name: file.name,
      created_at: new Date().toISOString(),
    };

    await kv.set(`media:${id}`, mediaItem);
    return c.json({ data: mediaItem });
  } catch (err) {
    console.log("Unexpected media upload error:", err);
    return c.json({ error: `Unexpected upload error: ${err}` }, 500);
  }
});

// Update media metadata (auth required)
app.put("/make-server-3d6df8f3/media/:id", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`media:${id}`);
    if (!existing) {
      return c.json({ error: "Media item not found" }, 404);
    }

    const updated = {
      ...existing,
      title: updates.title ?? existing.title,
      caption: updates.caption ?? existing.caption,
      order: updates.order ?? existing.order,
      link_url: updates.link_url ?? existing.link_url,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`media:${id}`, updated);
    return c.json({ data: updated });
  } catch (err) {
    console.log("Error updating media:", err);
    return c.json({ error: `Error updating media: ${err}` }, 500);
  }
});

// Delete media (auth required)
app.delete("/make-server-3d6df8f3/media/:id", async (c) => {
  try {
    await requireAuth(c.req.raw);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const id = c.req.param("id");
    const existing = await kv.get(`media:${id}`);
    if (!existing) {
      return c.json({ error: "Media item not found" }, 404);
    }

    // Delete from storage
    if (existing.storage_path) {
      const sb = supabase();
      await sb.storage.from(MEDIA_BUCKET).remove([existing.storage_path]);
    }

    // Delete from KV
    await kv.del(`media:${id}`);
    return c.json({ data: { success: true } });
  } catch (err) {
    console.log("Error deleting media:", err);
    return c.json({ error: `Error deleting media: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);