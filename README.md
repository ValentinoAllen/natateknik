# Nata Teknik - E-Commerce Catalog & Admin Dashboard

Welcome to the frontend codebase for **Nata Teknik**, a modern online catalog for hardware, technical tools, and industrial machines based in Bali. This project provides both a public-facing website and a secure administrative dashboard to easily manage products, brands, categories, media, and store settings.

## 🚀 Features

- **Dynamic Public Site**: Attractive and responsive landing page displaying the store's offerings, powered by live data from the database.
- **Admin Dashboard (`/admin`)**: A comprehensive content management system with:
  - **Product Management**: Add, edit, and delete tools and machines.
  - **Brand & Category Management**: Manage catalogs with integrated drag-and-drop image uploads.
  - **Media Gallery**: A centralized repository to upload, preview, and process images/videos.
  - **Store Settings**: Dynamically update global settings like WhatsApp contact numbers, store addresses, and taglines.
- **Direct Cloud Storage Integration**: Drag-and-drop files directly upload to Supabase Storage buckets, saving URLs immediately to connected databases.

## 💻 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) (Icons)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL Database, Authentication, & Storage)

## 🛠️ Setup & Local Development

### 1. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
npm install
```

### 2. Environment Variables
Create a file named `.env.local` in the root of the project to securely provide your Supabase connection strings:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Start the Development Server
```bash
npm run dev
```
The application will be accessible at `http://127.0.0.1:5173`.

## 🗄️ Database Requirements

To fully run the project with your own Supabase instance, ensure you create the following Tables and Storage Buckets:

**Database Tables**:
- `products` (id, name, brand, category, price, description, etc.)
- `brands` (id, name, image)
- `categories` (id, name, image)
- `media` (id, title, storage_path, url, link_url, dll)
- `settings` (id, wa_number, address, dll)

**Storage Buckets**:
- `media` (Ensure it is public)

*Note: Make sure to enable Row Level Security (RLS) and configure `SELECT` / `ALL` policies for public read and authenticated admin access respectively.*

## 📄 License

Proprietary Software. Internal use for Nata Teknik only.
