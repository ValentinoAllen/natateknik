import xlsx from 'xlsx';
import fs from 'fs';

const filePath = 'f:/NataTeknikFigma/mass_update_sales_info_1130148278_20260304003324.xlsx';
const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
fs.writeFileSync('f:/NataTeknikFigma/shopee_sales_debug.json', JSON.stringify(rawData.slice(0, 5), null, 2));
console.log("Written!");
