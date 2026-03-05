import fs from 'fs';
import * as xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

async function main() {
    try {
        console.log("Reading file:", filePath);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Start from row 3 (if headers are complex), or typical Shopee row 1.
        // Let's just convert it and see the headers. 
        // Usually Shopee has 2-3 header rows. We'll dump the top 5 rows.
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        console.log("ROWS 0-5:");
        console.log(JSON.stringify(data.slice(0, 5), null, 2));

    } catch (e) {
        console.error("FAILED:", e.message);
    }
}

main();
