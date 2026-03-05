import xlsx from 'xlsx';

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Parse without headers to see the raw array structure first, because Shopee usually has
    // headers on row 1, 2, or 3.
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Find the row that contains 'Nama Produk' or similar common column
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(5, data.length); i++) {
        if (data[i] && data[i].some(cell => cell && cell.toString().includes('Nama Produk') || cell === 'Nama')) {
            headerRowIndex = i;
            break;
        }
    }

    console.log("Found Headers at row:", headerRowIndex);
    console.log("Headers:");
    console.log(data[headerRowIndex]);
    console.log("Sample Data Row 1:");
    console.log(data[headerRowIndex + 1]);

} catch (err) {
    console.error(err);
}
