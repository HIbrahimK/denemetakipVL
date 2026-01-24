const ExcelJS = require('exceljs');
const fs = require('fs');

async function analyzeTemplate(filePath, label) {
    if (!fs.existsSync(filePath)) {
        return `${label}: DOSYA BULUNAMADI\n`;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    let output = `\n${'='.repeat(60)}\n${label}\n${'='.repeat(60)}\n`;
    output += `Toplam Sütun: ${worksheet.actualColumnCount}\n\n`;

    // İlk 3 satır başlıklar
    output += "İLK 3 SATIR (Başlıklar):\n" + "-".repeat(60) + "\n";
    for (let r = 1; r <= 3; r++) {
        const row = worksheet.getRow(r);
        output += `Satır ${r}:\n`;
        for (let c = 1; c <= Math.min(worksheet.actualColumnCount, 80); c++) {
            const val = row.getCell(c).text;
            if (val) {
                output += `  [${c}]: ${val}\n`;
            }
        }
    }

    // Örnek veri satırı (4. satır)
    output += `\nÖRNEK VERİ SATIRI (Satır 4):\n${"-".repeat(60)}\n`;
    const dataRow = worksheet.getRow(4);
    for (let c = 1; c <= Math.min(worksheet.actualColumnCount, 80); c++) {
        const val = dataRow.getCell(c).text;
        if (val) {
            output += `  [${c}]: ${val}\n`;
        }
    }

    return output;
}

async function run() {
    let fullOutput = '';

    fullOutput += await analyzeTemplate('d:\\denemetakip\\lgs.xlsx', 'LGS HAM ŞABLON');
    fullOutput += await analyzeTemplate('d:\\denemetakip\\lgsSablon.xls', 'LGS İŞLENMİŞ ŞABLON');
    fullOutput += await analyzeTemplate('d:\\denemetakip\\tyt.xlsx', 'TYT HAM ŞABLON');
    fullOutput += await analyzeTemplate('d:\\denemetakip\\TYTSablon.xlsx', 'TYT İŞLENMİŞ ŞABLON');
    fullOutput += await analyzeTemplate('d:\\denemetakip\\ayt.xlsx', 'AYT HAM ŞABLON');
    fullOutput += await analyzeTemplate('d:\\denemetakip\\AYTSablon.xlsx', 'AYT İŞLENMİŞ ŞABLON');

    fs.writeFileSync('template-analysis.txt', fullOutput);
    console.log('Analiz tamamlandı: template-analysis.txt');
}

run().catch(console.error);
