import xlsx from 'xlsx';
import fs from 'fs';

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

fs.writeFileSync('f:/NataTeknikFigma/dump.json', JSON.stringify({
    row1: rawData[0],
    row2: rawData[1],
    row3: rawData[2],
    row4: rawData[3]
}, null, 2));
