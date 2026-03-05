import xlsx from 'xlsx';

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const rawData = xlsx.utils.sheet_to_json(sheet, { header: "1" }); // using array of arrays actually

for (let i = 0; i < 4; i++) {
    console.log(`--- ROW ${i} ---`);
    if (!rawData[i]) continue;
    console.log(JSON.stringify(rawData[i]).slice(0, 150));
}
