const xlsx = require('xlsx');

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length > 0) {
        console.log("FIRST ROW KEYS:", Object.keys(data[0]));
        console.log("FIRST ROW DATA:", data[0]);
        console.log("TOTAL ROWS:", data.length);
    } else {
        console.log("SHEET IS EMPTY");
    }
} catch (err) {
    console.error("ERROR READING EXCEL:", err.message);
}
