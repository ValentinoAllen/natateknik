import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase
const supabaseUrl = 'https://vuxnsqyeobtxfynuvcyh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eG5zcXllb2J0eGZ5bnV2Y3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDM0ODAsImV4cCI6MjA4NzY3OTQ4MH0.vL8OmoLAmgo_a5chnkCbS_DY-JYiYbYy8PZANUA38fc';
const supabase = createClient(supabaseUrl, supabaseKey);

const filePath = 'f:/NataTeknikFigma/mass_update_sales_info_1130148278_20260304003324.xlsx';

async function importProducts() {
    console.log("Membaca file Shopee Sales Info...");

    let workbook;
    try {
        workbook = xlsx.readFile(filePath);
    } catch (e) {
        console.error("Gagal membaca file excel:", e.message);
        return;
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Baris ke-3 (index 2) di export shopee adalah kolom yg digunakan
    const headers = rawData[2];

    // Mencari offset kolom secara dinamis 
    let cName = headers.findIndex(h => h && h.toString().toLowerCase().includes('nama'));
    let cDesc = headers.findIndex(h => h && h.toString().toLowerCase().includes('deskripsi'));
    let cPrice = headers.findIndex(h => h && h.toString().toLowerCase().includes('harga'));
    let cStock = headers.findIndex(h => h && h.toString().toLowerCase().includes('stok'));
    let cCat = headers.findIndex(h => h && h.toString().toLowerCase().includes('kategori'));

    console.log(`Ditemukan Kolom -> Nama: ${cName}, Desk: ${cDesc}, Harga: ${cPrice}, Stok: ${cStock}`);

    // Jika karena suatu alasan tidak ketemu namanya persis 'nama produk' / 'harga', berikan default standard Export Shopee:
    if (cName === -1) cName = 2;   // Biasanya kolom C   
    if (cPrice === -1) cPrice = 8; // Banyak variasi, tapi fallback 8

    const insertData = [];

    // Row data sesungguhnya mulai dari index 4 (baris ke-5 di excel) karena ada info parent sku dll.
    for (let i = 3; i < rawData.length; i++) {
        const row = rawData[i];

        // Skip jika baris ini hanyalah variant dari SKU Induk tanpa nama lengkap, atau baris kosong
        if (!row || !row[cName]) continue;

        const rawPrice = row[cPrice] || 0;
        // Bersihkan nilai Harga dan ubah ke Rupiah (Kalo bukan angka set 0)
        let priceNumeric = parseInt(rawPrice.toString().replace(/[^0-9]/g, ''));
        if (isNaN(priceNumeric)) priceNumeric = 0;
        const cleanPrice = "Rp " + priceNumeric.toLocaleString("id-ID");

        let description = (cDesc !== -1 && row[cDesc]) ? row[cDesc] : "Di-import dari Shopee sales info.";
        let category = (cCat !== -1 && row[cCat]) ? row[cCat] : "Umum";

        insertData.push({
            name: row[cName].toString().substring(0, 200), // batasi teks
            price: cleanPrice,
            description: description.toString().substring(0, 1000),
            image: null, // excel sales info tdk punya gambar biasanya, atau kita harus crawl
            brand: "Unknown",
            category: category.toString().substring(0, 50)
        });
    }

    console.log(`Total produk siap insert: ${insertData.length}`);

    if (insertData.length > 0) {
        const { data, error } = await supabase.from('products').insert(insertData).select();
        if (error) {
            console.error("Gagal Upload:", error.message);
        } else {
            console.log("SUKSES Upload:", data.length, "Produk!");
        }
    }
}

importProducts();
