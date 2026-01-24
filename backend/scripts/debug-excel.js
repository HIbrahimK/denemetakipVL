const ExcelJS = require('exceljs');
const path = require('path');

async function checkExcel(filePath) {
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        console.log(`File: ${filePath}`);
        console.log(`Column Count: ${worksheet.actualColumnCount}`);
        console.log(`Row Count: ${worksheet.actualRowCount}`);

        const row1 = worksheet.getRow(1);
        console.log('Row 1 values:');
        row1.eachCell((cell, colNumber) => {
            console.log(`  Col ${colNumber}: ${cell.text}`);
        });
    } catch (err) {
        console.error('Error reading file:', err.message);
    }
}

const file = process.argv[2] || 'd:\\denemetakip\\AYTSablon.xlsx';
checkExcel(file);
