import xlsx from 'xlsx';

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// In Shopee Basic Info Export, Row 1 = En headers, Row 2 = Id headers, Row 3 = Data Start
const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

if (rawData.length >= 3) {
    console.log("Found rows:", rawData.length);
    console.log("================= ROW 2 (Headers) =================");
    console.log(JSON.stringify(rawData[1].slice(0, 15), null, 2));
    console.log("================= ROW 4 (Sample Data) =============");
    console.log(JSON.stringify(rawData[3].slice(0, 15), null, 2));
} else {
    console.log("ROWS < 3!");
}
