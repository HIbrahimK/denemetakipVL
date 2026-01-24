import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';

export interface ParsedExamRow {
    studentNumber: string;
    name?: string;
    class?: string;
    tcNo?: string;
    lessons: Record<string, { correct?: number; incorrect?: number; net?: number; point?: number }>;
    scores: Record<string, number>;
    ranks: Record<string, number>;
    isValid: boolean;
    errorReason: string[];
}

// Fixed column maps for each exam type
const LGS_COLUMN_MAP = {
    dataStartRow: 4,
    expectedColumns: 30,
    columns: {
        studentNumber: 1,
        name: 2,
        class: 3,
        lessons: {
            'Türkçe': [4, 5, 6],
            'Tarih': [7, 8, 9],
            'Din Kültürü': [10, 11, 12],
            'İngilizce': [13, 14, 15],
            'Matematik': [16, 17, 18],
            'Fen Bilimleri': [19, 20, 21]
        },
        skip: [22, 23, 24], // Toplam
        scores: { 'LGS': 25 },
        ranks: { 'Sınıf': 26, 'Kurum': 27, 'İlçe': 28, 'İl': 29, 'Genel': 30 }
    }
};

const TYT_COLUMN_MAP = {
    dataStartRow: 4,
    expectedColumns: 51,
    columns: {
        studentNumber: 1,
        name: 2,
        class: 3,
        lessons: {
            'Türkçe': [4, 5, 6],
            'Tarih': [7, 8, 9],
            'Coğrafya': [10, 11, 12],
            'Felsefe': [13, 14, 15],
            'Din Kültürü': [16, 17, 18],
            'Matematik': [28, 29, 30], // Use TOPLAM only
            'Fizik': [31, 32, 33],
            'Kimya': [34, 35, 36],
            'Biyoloji': [37, 38, 39]
        },
        skip: [19, 20, 21, 22, 23, 24, 25, 26, 27, 40, 41, 42, 43, 44, 45], // All Toplam columns
        scores: { 'TYT': 46 },
        ranks: { 'Sınıf': 47, 'Kurum': 48, 'İlçe': 49, 'İl': 50, 'Genel': 51 }
    }
};

const AYT_COLUMN_MAP = {
    dataStartRow: 4,
    expectedColumns: 72,
    columns: {
        studentNumber: 1,
        name: 2,
        class: 3,
        mergeRules: [
            { name: 'AYT Edebiyat', sources: [[4, 5, 6], [7, 8, 9]] }, // Türkçe + Edebiyat
            { name: 'Felsefe', sources: [[25, 26, 27], [28, 29, 30]] }  // Felsefe + Felsefe Grubu
        ],
        lessons: {
            'Tarih-1': [10, 11, 12],
            'Coğrafya-1': [13, 14, 15],
            'Tarih-2': [19, 20, 21],
            'Coğrafya-2': [22, 23, 24],
            'Din Kültürü': [31, 32, 33],
            'Matematik': [37, 38, 39],
            'Fizik': [40, 41, 42],
            'Kimya': [43, 44, 45],
            'Biyoloji': [46, 47, 48]
        },
        skip: [16, 17, 18, 34, 35, 36, 49, 50, 51, 52, 53, 54], // All Toplam columns
        scores: { 'SÖZ': 55, 'SAY': 61, 'EA': 67 },
        ranks: {
            'SÖZ Sınıf': 56, 'SÖZ Kurum': 57, 'SÖZ İlçe': 58, 'SÖZ İl': 59, 'SÖZ Genel': 60,
            'SAY Sınıf': 62, 'SAY Kurum': 63, 'SAY İlçe': 64, 'SAY İl': 65, 'SAY Genel': 66,
            'EA Sınıf': 68, 'EA Kurum': 69, 'EA İlçe': 70, 'EA İl': 71, 'EA Genel': 72
        }
    }
};

const TYT_PROCESSED_MAP = {
    isProcessed: true,
    dataStartRow: 2,
    expectedColumns: 38,
    keyColumn: 1,
    keys: ['numarasi', 'turkced', 'turkcey', 'turkcen', 'tarihd', 'tarihy', 'tarihn',
        'cogrefyad', 'cografyay', 'cografyan', 'felsefed', 'felsefey', 'felsefen',
        'dind', 'diny', 'dinn', 'matd', 'maty', 'matn', 'fizikd', 'fiziky', 'fizikn',
        'kinyad', 'kimyay', 'kimyan', 'biyod', 'biyoy', 'biyon', 'topd', 'topy', 'topn',
        'tyt', 'dereces', 'dereceo', 'dereceilce', 'derecelil', 'dereceg', 'seviye']
};

const AYT_PROCESSED_MAP = {
    isProcessed: true,
    dataStartRow: 2,
    expectedColumns: 56,
    keyColumn: 1,
    keys: ['numarasi', 'edebd', 'edeby', 'edebn']
};

@Injectable()
export class ExcelParsingService {
    async parseExcel(buffer: Buffer, examType?: string): Promise<ParsedExamRow[]> {
        const workbook = new ExcelJS.Workbook();
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        await workbook.xlsx.read(stream);

        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            throw new Error('Excel dosyasında sayfa bulunamadı.');
        }

        // Smart detection
        const detectedFormat = this.detectFormat(worksheet, examType);

        // Validate exam type match
        this.validateExamTypeMatch(detectedFormat, examType);

        // Parse based on detected format
        return this.parseByColumn(worksheet, detectedFormat);
    }

    private detectFormat(worksheet: ExcelJS.Worksheet, examType?: string) {
        const colCount = worksheet.actualColumnCount;
        const row1 = worksheet.getRow(1);
        const firstCell = row1.getCell(1).text?.trim();

        // Check if processed template (database keys)
        if (firstCell === 'numarasi' || firstCell === 'turkced' || firstCell === 'edebd') {
            if (colCount === 38 || TYT_PROCESSED_MAP.keys.includes(firstCell)) {
                return { type: 'TYT', format: 'PROCESSED', map: TYT_PROCESSED_MAP };
            }
            if (colCount === 56 || AYT_PROCESSED_MAP.keys.includes(firstCell)) {
                return { type: 'AYT', format: 'PROCESSED', map: AYT_PROCESSED_MAP };
            }
        }

        // Raw format detection by column count
        if (colCount === 30) {
            return { type: 'LGS', format: 'RAW', map: LGS_COLUMN_MAP };
        } else if (colCount === 51) {
            return { type: 'TYT', format: 'RAW', map: TYT_COLUMN_MAP };
        } else if (colCount === 72) {
            return { type: 'AYT', format: 'RAW', map: AYT_COLUMN_MAP };
        }

        throw new Error(`Tanımsız dosya formatı (Sütun sayısı: ${colCount}). LGS:30, TYT:51/38, AYT:72/56 olmalı.`);
    }

    private validateExamTypeMatch(detected: any, expected?: string) {
        if (!expected) return;

        if (expected !== detected.type) {
            throw new Error(`HATA: ${expected} sınavına ${detected.type} şablonu yüklenemez!`);
        }
    }

    private findDataStartRow(worksheet: ExcelJS.Worksheet): number {
        // Find first row with numeric student number in column 1
        for (let row = 1; row <= 10; row++) {
            const value = worksheet.getRow(row).getCell(1).text?.trim();
            if (value && /^\d+$/.test(value) && value !== '0') {
                return row;
            }
        }
        return -1;
    }

    private parseByColumn(worksheet: ExcelJS.Worksheet, format: any): ParsedExamRow[] {
        const parsedData: ParsedExamRow[] = [];
        const map = format.map;

        // Smart data row detection (override map default if needed)
        let dataStartRow = this.findDataStartRow(worksheet);
        if (dataStartRow === -1) {
            dataStartRow = map.dataStartRow || 4;
        }

        const seenNumbers = new Set<string>();

        worksheet.eachRow((row, rowIndex) => {
            if (rowIndex < dataStartRow) return;

            const studentNumber = row.getCell(map.columns?.studentNumber || 1).text?.trim() || '';

            // Skip summary rows
            if (!studentNumber || ['Genel', 'Kurum', 'Okul', 'İlçe', 'İl', 'Liste', 'Ortalama'].some(k => studentNumber.includes(k))) {
                return;
            }

            const rowData: ParsedExamRow = {
                studentNumber,
                name: row.getCell(map.columns?.name || 2).text?.trim(),
                class: row.getCell(map.columns?.class || 3).text?.trim(),
                lessons: {},
                scores: {},
                ranks: {},
                isValid: true,
                errorReason: []
            };

            // Validation
            if (studentNumber === '*' || studentNumber === '0' || !studentNumber) {
                rowData.isValid = false;
                rowData.errorReason.push('Geçersiz öğrenci numarası (*, 0 veya boş)');
            } else if (!/\d/.test(studentNumber)) {
                rowData.isValid = false;
                rowData.errorReason.push('Öğrenci numarası sayısal değer içermeli');
            }

            // Duplicate detection
            if (seenNumbers.has(studentNumber)) {
                rowData.isValid = false;
                rowData.errorReason.push('Bu numara dosyada birden fazla (sadece ilk satır kullanılacak)');
                parsedData.push(rowData);
                return; // Skip this duplicate
            }
            seenNumbers.add(studentNumber);

            // Extract lessons (raw format)
            if (format.format === 'RAW' && map.columns.lessons) {
                // Handle merge rules first (AYT)
                if (map.columns.mergeRules) {
                    map.columns.mergeRules.forEach((rule: any) => {
                        const merged = { correct: 0, incorrect: 0, net: 0 };
                        rule.sources.forEach((cols: number[]) => {
                            merged.correct += Number(row.getCell(cols[0]).value) || 0;
                            merged.incorrect += Number(row.getCell(cols[1]).value) || 0;
                            merged.net += Number(row.getCell(cols[2]).value) || 0;
                        });
                        rowData.lessons[rule.name] = merged;
                    });
                }

                // Regular lessons
                Object.entries(map.columns.lessons).forEach(([name, cols]: [string, any]) => {
                    rowData.lessons[name] = {
                        correct: Number(row.getCell(cols[0]).value) || 0,
                        incorrect: Number(row.getCell(cols[1]).value) || 0,
                        net: Number(row.getCell(cols[2]).value) || 0
                    };
                });

                // Scores
                Object.entries(map.columns.scores).forEach(([name, col]: [string, any]) => {
                    rowData.scores[name] = Number(row.getCell(col).value) || 0;
                });

                // Ranks
                Object.entries(map.columns.ranks).forEach(([name, col]: [string, any]) => {
                    rowData.ranks[name] = Number(row.getCell(col).value) || 0;
                });
            }

            parsedData.push(rowData);
        });

        return parsedData;
    }
}
