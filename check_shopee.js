import xlsx from 'xlsx';

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (rawData.length >= 3) {
        console.log("=== ROW 1 ===");
        console.log(rawData[0].slice(0, 15).join(" | "));
        console.log("=== ROW 2 ===");
        console.log(rawData[1].slice(0, 15).join(" | "));
        console.log("=== ROW 3 ===");
        console.log(rawData[2].slice(0, 15).join(" | "));
        console.log("=== ROW 4 ===");
        console.log(rawData[3].slice(0, 15).join(" | "));
    }
} catch (err) {
    console.error(err);
}
