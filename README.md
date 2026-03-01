# Nata Teknik — Website & Admin Dashboard

Pusat alat teknik, mesin industri, dan perlengkapan bangunan di Denpasar, Bali.

## Files

| File | Description |
|------|-------------|
| `index.html` | Public storefront — product catalog, contact info, WhatsApp ordering |
| `admin.html` | Admin dashboard — manage products, brands, and store settings |

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind CDN + custom), vanilla JavaScript
- **Backend/DB**: [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage)
- **Fonts**: Oswald, DM Sans (Google Fonts)
- **Icons**: Font Awesome 6

## Setup

### 1. Supabase Project

Create a project at [supabase.com](https://supabase.com). Update `SB_URL` and `SB_KEY` in both HTML files if using a different project.

### 2. Database Tables

Open **Supabase → SQL Editor** and run these queries (also visible in Admin → Pengaturan):

```sql
-- Products table (create manually or via Supabase UI)
-- Required columns: id (int), name (text), brand (text), price (text), image (text), description (text)

ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_products"  ON products FOR SELECT USING (true);
CREATE POLICY "auth_insert_products"  ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_update_products"  ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_products"  ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id   SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read"    ON brands FOR SELECT USING (true);
CREATE POLICY "auth_insert"    ON brands FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_delete"    ON brands FOR DELETE USING (auth.role() = 'authenticated');

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id    SERIAL PRIMARY KEY,
  key   TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_settings"  ON settings FOR SELECT USING (true);
CREATE POLICY "auth_manage_settings"  ON settings FOR ALL USING (auth.role() = 'authenticated');
INSERT INTO settings (key, value) VALUES ('wa_number', '0822-7777-5595') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('address', 'Jl. Gunung Salak Utara No.88 Block B-C-D, Denpasar') ON CONFLICT (key) DO NOTHING;
```

### 3. Storage

Create a bucket named `product-images` with public access in **Supabase → Storage**.

### 4. Auth

Create an admin user in **Supabase → Authentication** for dashboard login.

## Features

### Storefront (`index.html`)
- Dynamic product catalog from Supabase
- Brand filtering
- Pagination (12 products per page + load more)
- Product detail modal
- WhatsApp ordering integration
- Settings loaded from database (WA number, address)
- Responsive design

### Admin Dashboard (`admin.html`)
- Session-based auto-login
- CRUD for products (with image upload to Supabase Storage)
- Brand management
- Store settings saved to database
- Image cleanup on delete/update
- File size validation (max 5MB)
- Product description field

## License

© Nata Teknik — All Rights Reserved
