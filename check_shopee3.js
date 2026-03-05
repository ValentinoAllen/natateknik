import xlsx from 'xlsx';

const filePath = 'f:/NataTeknikFigma/mass_update_basic_info_1130148278_20260303235543.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (rawData.length >= 3) {
        for (let i = 0; i < 4; i++) {
            console.log(`--- ROW ${i + 1} ---`);
            const row = rawData[i];
            if (!row) continue;
            for (let j = 0; j < Math.min(row.length, 10); j++) {
                console.log(`Col ${j}: ${row[j]}`);
            }
        }
    }
} catch (err) {
    console.error(err);
}
