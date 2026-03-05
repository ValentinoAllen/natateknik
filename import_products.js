import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// Supabase URL and Key mapped manually for one-off script
const supabaseUrl = 'https://vuxnsqyeobtxfynuvcyh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eG5zcXllb2J0eGZ5bnV2Y3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDM0ODAsImV4cCI6MjA4NzY3OTQ4MH0.vL8OmoLAmgo_a5chnkCbS_DY-JYiYbYy8PZANUA38fc';
const supabase = createClient(supabaseUrl, supabaseKey);

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

async function importShopeeProducts() {
    console.log("Membaca file Excel...");
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Baca seluruh data dengan header bawaan array (baris-ke-baris)
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Baris informasi ada di index 0-2, data mulai dari index 4 atau biasanya list setelah SKU Induk
    // Kita cari baris yang punya format produk. Biasanya kolom 0 adalah ID atau Nama.
    const products = [];

    for (let i = 3; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 5) continue;

        // Asumsi Shopee Mass Update Format Excel (Bisa bervariasi):
        // Kita cek teks atau nama produk. Berdasarkan field standard: [Kategori Promosi, PSKU, Alasan Gagal, ...] bukan.
        // Tadi hasil output kita: col 4 mungkin nama produk, kita lakukan inspeksi jika bingung.

        // Mari ambil produk jika ada baris yg lebih dari beberapa kolom text!
        // Atau karena formatnya kita kurang jelas, mari kita log datanya sebentar dan batalkan jika format aneh.
    }

    console.log("Raw output baris ke 4:", rows[3].slice(0, 10));
}

importShopeeProducts();
