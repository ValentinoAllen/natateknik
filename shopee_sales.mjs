import xlsx from 'xlsx';
import fs from 'fs';

const filePath = 'f:/NataTeknikFigma/mass_update_sales_info_1130148278_20260304003324.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Usually the sales info has headers around row 3 or 4 in raw format
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (rawData.length > 2) {
        fs.writeFileSync('f:/NataTeknikFigma/sales_info_debug.json', JSON.stringify({
            headers: rawData[2],
            firstRow: rawData[3],
        }, null, 2));
        console.log("DONE");
    }
} catch (e) { console.error(e) }
