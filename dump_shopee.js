import xlsx from 'xlsx';
import fs from 'fs';

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Shopee usually has 3 rows of headers. We can try to parse the raw array first.
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (rawData.length >= 3) {
        fs.writeFileSync('f:/NataTeknikFigma/shopee_debug.json', JSON.stringify({
            row1: rawData[0],
            row2: rawData[1],
            row3: rawData[2],
            row4: rawData[3]
        }, null, 2));
        console.log("Dumped to shopee_debug.json");
    } else {
        console.log("File has less than 3 rows");
    }

} catch (err) {
    console.error(err);
}
