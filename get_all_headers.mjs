import xlsx from 'xlsx';

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
if (rawData.length > 2) {
    const headers = rawData[2];
    headers.forEach((h, i) => console.log(`${i}: ${h}`));
}
