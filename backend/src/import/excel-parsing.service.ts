import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';

export interface ParsedExamRow {
    studentNumber: string;
    name?: string;
    class?: string;
    grade?: string; // Çıkarılan sınıf seviyesi (9, 10, 11, 12)
    section?: string; // Çıkarılan şube (A, B, C, SÖZ, SAY, EA vb)
    lessons: Record<string, { correct?: number; incorrect?: number; net?: number; point?: number }>;
    scores: Record<string, number>;
    ranks: Record<string, number>; // Sıralamalar burada tutulacak
    isValid: boolean;
    errorReason: string[];
    validationStatus?: 'valid' | 'invalid_number' | 'duplicate_in_file' | 'duplicate_in_exam' | 'not_registered';
}

// --- DERS SIRALAMALARI (Sablon Dosyaları İçin) ---
const TYT_LESSON_ORDER = [
    'Türkçe', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü',
    'Matematik', 'Fizik', 'Kimya', 'Biyoloji'
];

const AYT_LESSON_ORDER = [
    'AYT Edebiyat', 'Tarih-1', 'Coğrafya-1', 'Tarih-2', 'Coğrafya-2',
    'Felsefe', 'Din Kültürü', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji'
];

// --- AYARLAR VE FORMATLAR ---

// 1. FORMAT: SABLON DOSYALARI (PROCESSED)
// Konumsal (Positional) okuma yapar. Başlık isimlerine bakmaz.
const TYT_PROCESSED_MAP = {
    isProcessed: true,
    dataStartRow: 2,
    lessonStartCol: 4,
    lessonOrder: TYT_LESSON_ORDER,
    // 4 + (9 ders * 3) = 31. sütun Toplam Net başlangıcı
    // 31, 32, 33 (Top Net) -> 34 (TYT Puan)
    scoreCols: {
        'TYT': 34
    },
    // 35'ten itibaren sıralamalar başlar
    rankStartCol: 35,
    rankOrder: ['Sınıf', 'Okul', 'İlçe', 'İl', 'Genel']
};

const AYT_PROCESSED_MAP = {
    isProcessed: true,
    dataStartRow: 2,
    lessonStartCol: 4,
    lessonOrder: AYT_LESSON_ORDER,
    // 4 + (11 ders * 3) = 37. sütun Toplam Net başlangıcı
    // 37, 38, 39 (Top Net) -> 40 (SAY Puan)
    scoreCols: {
        'SAY': 40,
        'EA': 46,  // SAY sıralamaları (5 adet) geçince
        'SÖZ': 52  // EA sıralamaları (5 adet) geçince
    },
    // Puan türüne göre sıralama başlangıç indeksleri
    rankGroups: {
        'SAY': 41, // 40. sütun puan, 41-45 sıralama
        'EA': 47,  // 46. sütun puan, 47-51 sıralama
        'SÖZ': 53  // 52. sütun puan, 53-57 sıralama
    },
    rankOrder: ['Sınıf', 'Okul', 'İlçe', 'İl', 'Genel']
};

// 2. FORMAT: KURUM NET LİSTESİ (RAW)
const TYT_COLUMN_MAP = {
    dataStartRow: 4,
    columns: {
        studentNumber: 1, name: 2, class: 3,
        lessons: {
            'Türkçe': [4, 5, 6], 'Tarih': [7, 8, 9], 'Coğrafya': [10, 11, 12],
            'Felsefe': [13, 14, 15], 'Din Kültürü': [16, 17, 18],
            'Matematik': [31, 32, 33], 'Fizik': [34, 35, 36],
            'Kimya': [37, 38, 39], 'Biyoloji': [40, 41, 42]
        },
        scores: { 'TYT': 49 },
        // TYT Raw dosyasında sıralamalar 47-51 arasındadır
        ranks: {
            'Sınıf': 50, 'Okul': 51, 'İlçe': 52, 'İl': 53, 'Genel': 54
        }
    }
};

const AYT_COLUMN_MAP = {
    dataStartRow: 4,
    columns: {
        studentNumber: 1, name: 2, class: 3,
        mergeRules: [
            { name: 'AYT Edebiyat', sources: [[4, 5, 6], [7, 8, 9]] },
            { name: 'Felsefe', sources: [[25, 26, 27], [28, 29, 30]] }
        ],
        lessons: {
            'Tarih-1': [10, 11, 12], 'Coğrafya-1': [13, 14, 15],
            'Tarih-2': [19, 20, 21], 'Coğrafya-2': [22, 23, 24], 'Din Kültürü': [31, 32, 33],
            'Matematik': [37, 38, 39], 'Fizik': [40, 41, 42], 'Kimya': [43, 44, 45], 'Biyoloji': [46, 47, 48]
        },
        scores: { 'SÖZ': 55, 'SAY': 61, 'EA': 67 },
        // AYT Raw dosyasında sıralamalar bloklar halindedir
        ranks: {
            // SÖZ Sıralamaları (56-60)
            'SÖZ Sınıf': 56, 'SÖZ Okul': 57, 'SÖZ İlçe': 58, 'SÖZ İl': 59, 'SÖZ Genel': 60,
            // SAY Sıralamaları (62-66)
            'SAY Sınıf': 62, 'SAY Okul': 63, 'SAY İlçe': 64, 'SAY İl': 65, 'SAY Genel': 66,
            // EA Sıralamaları (68-72)
            'EA Sınıf': 68, 'EA Okul': 69, 'EA İlçe': 70, 'EA İl': 71, 'EA Genel': 72
        }
    }
};

const LGS_COLUMN_MAP = {
    dataStartRow: 4,
    columns: {
        studentNumber: 1, name: 2, class: 3,
        lessons: {
            'Türkçe': [4, 5, 6], 'Tarih': [7, 8, 9], 'Din Kültürü': [10, 11, 12],
            'İngilizce': [13, 14, 15], 'Matematik': [16, 17, 18], 'Fen Bilimleri': [19, 20, 21]
        },
        scores: { 'LGS': 25 },
        // LGS Raw dosyasında sıralamalar 26-30 arasındadır
        ranks: {
            'Sınıf': 26, 'Okul': 27, 'İlçe': 28, 'İl': 29, 'Genel': 30
        }
    }
};

@Injectable()
export class ExcelParsingService {
    /**
     * Sınıf bilgisini (örn: "11/B", "12-Mezun", "12A") grade ve section'a ayırır
     * Örnekler:
     * - "9-A" -> grade: "9", section: "A"
     * - "10/B" -> grade: "10", section: "B"
     * - "11-SÖZ" -> grade: "11", section: "SÖZ"
     * - "12-Mezun" -> grade: "12", section: "Mezun"
     * - "12A" -> grade: "12", section: "A"
     * - "5" -> grade: "5", section: "A" (varsayılan)
     */
    private parseGradeAndSection(classText?: string): { grade: string; section: string } {
        if (!classText) return { grade: 'Diğer', section: 'A' };
        
        classText = classText.trim();
        
        // Regex: İlk sayıları (grade) ve geri kalanını (section) ayır
        // Sayılar: 5-12 arasında geçerli
        const match = classText.match(/^(\d+)[\-\/\s]*(.*)$/);
        
        if (match) {
            const grade = match[1];
            let section = match[2]?.trim() || 'A';
            
            // Sınıf seviyesi validasyonu (5-12 arası)
            if (grade && /^\d+$/.test(grade)) {
                const gradeNum = parseInt(grade, 10);
                if (gradeNum >= 5 && gradeNum <= 12) {
                    return { grade, section: section || 'A' };
                }
            }
        }
        
        // Eğer format parçalanamazsa, tüm string section olur
        return { grade: 'Diğer', section: classText };
    }

    async parseExcel(buffer: Buffer, examType?: string): Promise<ParsedExamRow[]> {
        const workbook = new ExcelJS.Workbook();
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        await workbook.xlsx.read(stream);

        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) throw new Error('Excel sayfası bulunamadı.');

        const detectedFormat = this.detectFormat(worksheet, examType);
        this.validateExamTypeMatch(detectedFormat, examType);

        return this.parseByColumn(worksheet, detectedFormat);
    }

    private detectFormat(worksheet: ExcelJS.Worksheet, examType?: string) {
        const colCount = worksheet.actualColumnCount;
        const row1 = worksheet.getRow(1);
        const firstCell = row1.getCell(1).text?.trim().toLowerCase();

        console.log(`[ExcelParsing] Format Algılanıyor. Sütun: ${colCount}, Hücre1: "${firstCell}"`);

        // 1. SABLON DOSYALARI (PROCESSED)
        if (firstCell && (firstCell === 'numarasi' || firstCell.includes('no'))) {
            if (colCount >= 55) return { type: 'AYT', format: 'PROCESSED', map: AYT_PROCESSED_MAP };
            if (colCount >= 35) return { type: 'TYT', format: 'PROCESSED', map: TYT_PROCESSED_MAP };
        }

        // 2. KURUM NET LISTESI (RAW)
        if (colCount >= 30 && colCount <= 35) return { type: 'LGS', format: 'RAW', map: LGS_COLUMN_MAP };
        if (colCount >= 51 && colCount <= 55) return { type: 'TYT', format: 'RAW', map: TYT_COLUMN_MAP };
        if (colCount >= 70) return { type: 'AYT', format: 'RAW', map: AYT_COLUMN_MAP };

        throw new Error(`Bilinmeyen dosya formatı. Sütun Sayısı: ${colCount}`);
    }

    private validateExamTypeMatch(detected: any, expected?: string) {
        if (expected && expected !== detected.type) {
            throw new Error(`HATA: ${expected} alanına ${detected.type} dosyası yüklenemez.`);
        }
    }

    private parseByColumn(worksheet: ExcelJS.Worksheet, format: any): ParsedExamRow[] {
        const parsedData: ParsedExamRow[] = [];
        const map = format.map;

        let startRow = map.dataStartRow;
        // Raw formatta bazen satır kayabilir, sayıyı bul
        if (format.format === 'RAW') {
            for (let r = 1; r <= 10; r++) {
                const val = worksheet.getRow(r).getCell(1).text?.trim();
                if (val && /^\d+$/.test(val) && val !== '0') { startRow = r; break; }
            }
        }

        const seenNumbers = new Set<string>();

        worksheet.eachRow((row, rowIndex) => {
            if (rowIndex < startRow) return;

            const studentNumber = row.getCell(1).text?.trim();
            if (!studentNumber || ['Genel', 'Ortalama', 'Liste'].some(k => studentNumber.includes(k))) return;

            const rowData: ParsedExamRow = {
                studentNumber,
                name: row.getCell(2).text?.trim(),
                class: row.getCell(3).text?.trim(),
                lessons: {},
                scores: {},
                ranks: {},
                isValid: true,
                errorReason: []
            };

            // Grade ve section'ı ayır
            const { grade, section } = this.parseGradeAndSection(rowData.class);
            rowData.grade = grade;
            rowData.section = section;

            if (!/^\d+$/.test(studentNumber)) {
                rowData.isValid = false;
                rowData.errorReason.push('Geçersiz Numara');
            }

            if (seenNumbers.has(studentNumber)) return;
            seenNumbers.add(studentNumber);

            // --- YÖNTEM 1: POZİSYONEL OKUMA (PROCESSED / SABLON) ---
            if (format.format === 'PROCESSED') {
                const lessonOrder: string[] = map.lessonOrder;
                const startCol = map.lessonStartCol;

                // A) DERSLER
                lessonOrder.forEach((lessonName, index) => {
                    const dCol = startCol + (index * 3);
                    rowData.lessons[lessonName] = {
                        correct: Number(row.getCell(dCol).value) || 0,
                        incorrect: Number(row.getCell(dCol + 1).value) || 0,
                        net: Number(row.getCell(dCol + 2).value) || 0
                    };
                });

                // B) PUANLAR
                if (map.scoreCols) {
                    Object.entries(map.scoreCols).forEach(([name, col]: [string, any]) => {
                        rowData.scores[name] = Number(row.getCell(col).value) || 0;
                    });
                }

                // C) SIRALAMALAR (TYT vs AYT Farklı Mantık)
                if (map.rankStartCol) {
                    // TYT GİBİ TEK BLOK SIRALAMA
                    map.rankOrder.forEach((rankName, idx) => {
                        const col = map.rankStartCol + idx;
                        rowData.ranks[rankName] = Number(row.getCell(col).value) || 0;
                    });
                }
                else if (map.rankGroups) {
                    // AYT GİBİ ÇOKLU BLOK SIRALAMA
                    Object.entries(map.rankGroups).forEach(([groupName, startCol]: [string, any]) => {
                        map.rankOrder.forEach((rankName, idx) => {
                            const col = startCol + idx;
                            const fullKey = `${groupName} ${rankName}`; // Örn: SAY Genel, EA İlçe
                            rowData.ranks[fullKey] = Number(row.getCell(col).value) || 0;
                        });
                    });
                }
            }

            // --- YÖNTEM 2: MAP TABANLI OKUMA (RAW / KURUM NET LİSTESİ) ---
            else {
                // A) Merge Rules
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

                // B) Normal Dersler
                if (map.columns.lessons) {
                    Object.entries(map.columns.lessons).forEach(([name, cols]: [string, any]) => {
                        if (rowData.lessons[name]) return;
                        rowData.lessons[name] = {
                            correct: Number(row.getCell(cols[0]).value) || 0,
                            incorrect: Number(row.getCell(cols[1]).value) || 0,
                            net: Number(row.getCell(cols[2]).value) || 0
                        };
                    });
                }

                // C) Puanlar
                if (map.columns.scores) {
                    Object.entries(map.columns.scores).forEach(([name, col]: [string, any]) => {
                        rowData.scores[name] = Number(row.getCell(col).value) || 0;
                    });
                }

                // D) Sıralamalar (RAW formatta tek tek elle maplenmiştir)
                if (map.columns.ranks) {
                    Object.entries(map.columns.ranks).forEach(([name, col]: [string, any]) => {
                        rowData.ranks[name] = Number(row.getCell(col).value) || 0;
                    });
                }
            }

            parsedData.push(rowData);
        });

        return parsedData;
    }
}