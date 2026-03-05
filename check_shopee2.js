import xlsx from 'xlsx';

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // Use row 2 (index 1) as headers
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 2 });
    console.log("Found rows:", rawData.length);
    if (rawData.length > 0) {
        console.log("SAMPLE DATA 0 (Keys):", Object.keys(rawData[0]));
        console.log("SAMPLE DATA 0 (Values):", JSON.stringify(rawData[0]).slice(0, 100));
    }
} catch (err) {
    console.error(err);
}
