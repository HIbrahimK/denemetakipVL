import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { ExamType } from '@prisma/client';
import { ReportsService, ExamReportSummary, ExamReportDetailed, SubjectReportSummary } from './reports.service';

@Injectable()
export class ExportService {
  constructor(private readonly reportsService: ReportsService) {}

  private safeToFixed(value: any, fractionDigits: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00';
    }
    return Number(value).toFixed(fractionDigits);
  }

  /**
   * Sınav özet raporunu Excel formatında oluşturur
   */
  async generateExamSummaryExcel(
    reports: ExamReportSummary[],
    title: string,
  ): Promise<Buffer> {
    try {
      console.log('Generating Excel with reports count:', reports?.length);
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Deneme Özet Bilgileri');

      // Başlık
      const lessonNames = reports[0]?.lessonAverages?.map(l => l.lessonName) || [];
      const totalColumns = 2 + lessonNames.length + 2 + 1; // Sınav Adı, Tarih, Dersler, Toplam Net, Puan Ort, Katılım
      
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = title;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Boş satır
      worksheet.addRow([]);

      // Rapor yoksa bilgilendirme ekle
      if (!reports || reports.length === 0) {
        worksheet.addRow(['Gösterilecek rapor bulunamadı.']);
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
      }

      // Tablo başlıkları
      const headers = ['Sınav Adı', 'Sınav Tarihi'];
      lessonNames.forEach(lesson => {
        headers.push(lesson);
      });
      headers.push('Toplam Net', 'Puan Ortalaması', 'Katılım');

      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, size: 11 };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Her rapor için bir satır
      reports.forEach((report) => {
        try {
          const rowData: any[] = [
            report.examTitle || 'İsimsiz Sınav',
            new Date(report.examDate).toLocaleDateString('tr-TR')
          ];

          // Her ders için net ortalamasını ekle
          lessonNames.forEach(lessonName => {
            const lesson = (report.lessonAverages || []).find(l => l.lessonName === lessonName);
            rowData.push(lesson ? this.safeToFixed(lesson.averageNet) : '0.00');
          });

          // Toplam net hesapla
          const totalNet = (report.lessonAverages || []).reduce(
            (sum, l) => sum + (Number(l.averageNet) || 0),
            0,
          );
          rowData.push(this.safeToFixed(totalNet));

          // Puan ortalaması
          const avgScore = (report.scoreAverages || []).length > 0
            ? (report.scoreAverages || []).reduce((sum, s) => sum + (Number(s.averageScore) || 0), 0) /
            report.scoreAverages.length
            : 0;
          rowData.push(this.safeToFixed(avgScore));

          // Katılım
          rowData.push(report.participantCount || 0);

          const row = worksheet.addRow(rowData);
          row.alignment = { horizontal: 'center', vertical: 'middle' };
          row.eachCell((cell, colNumber) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            // İlk iki sütun sola hizalı
            if (colNumber <= 2) {
              cell.alignment = { horizontal: 'left', vertical: 'middle' };
            }
            // Sayısal değerler için renk
            if (colNumber > 2 && colNumber <= 2 + lessonNames.length + 1) {
              const value = parseFloat(cell.value as string);
              if (!isNaN(value)) {
                if (colNumber === 2 + lessonNames.length + 1) {
                  // Toplam Net - mavi
                  cell.font = { bold: true, color: { argb: 'FF0066CC' } };
                }
              }
            }
            // Puan ortalaması - yeşil
            if (colNumber === 2 + lessonNames.length + 2) {
              cell.font = { bold: true, color: { argb: 'FF00AA00' } };
            }
          });
        } catch (err) {
          console.error('Error generating row in Excel:', err);
          throw err;
        }
      });

      // Sütun genişlikleri
      worksheet.getColumn(1).width = 30; // Sınav Adı
      worksheet.getColumn(2).width = 15; // Tarih
      for (let i = 3; i <= 2 + lessonNames.length; i++) {
        worksheet.getColumn(i).width = 12; // Dersler
      }
      worksheet.getColumn(2 + lessonNames.length + 1).width = 12; // Toplam Net
      worksheet.getColumn(2 + lessonNames.length + 2).width = 15; // Puan Ort
      worksheet.getColumn(2 + lessonNames.length + 3).width = 10; // Katılım

      // Excel dosyasını buffer olarak döndür
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
    } catch (error) {
      console.error('Error in generateExamSummaryExcel:', error);
      throw new Error(`Excel dosyası oluşturulamadı: ${error.message}`);
    }
  }

  /**
   * Sınav ayrıntılı raporunu Excel formatında oluşturur
   */
  async generateExamDetailedExcel(
    reports: ExamReportDetailed[],
    title: string,
  ): Promise<Buffer> {
    try {
      console.log('Generating Detailed Excel with reports count:', reports?.length);
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Deneme Ayrıntılı Bilgileri');

      // Rapor yoksa bilgilendirme ekle
      if (!reports || reports.length === 0) {
        worksheet.addRow(['Gösterilecek rapor bulunamadı.']);
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
      }

      // Ders adlarını al
      const lessonNames = reports[0]?.lessonAverages?.map(l => l.lessonName) || [];
      
      // Toplam sütun sayısı: Sınav Adı, Tarih + (Her ders için 3 sütun: D,Y,N) + Toplam D, Toplam Y, Toplam Net + Puan Ort + Katılım
      const totalColumns = 2 + (lessonNames.length * 3) + 3 + 2;
      
      // Başlık
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = title;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Boş satır
      worksheet.addRow([]);

      // Tablo başlıkları - İlk satır (Ders adları)
      const headerRow1: any[] = ['Sınav Adı', 'Sınav Tarihi'];
      lessonNames.forEach(lesson => {
        headerRow1.push(lesson, '', ''); // Üç sütun için ders adı
      });
      headerRow1.push('Toplam', '', '', 'Puan', 'Katılım');
      
      const row1 = worksheet.addRow(headerRow1);
      row1.font = { bold: true, size: 11 };
      row1.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Birleştirmeler - İlk satırda ders isimlerini ve toplamı 3 kolon boyunca merge et
      let colIndex = 3;
      lessonNames.forEach(() => {
        worksheet.mergeCells(row1.number, colIndex, row1.number, colIndex + 2);
        colIndex += 3;
      });
      worksheet.mergeCells(row1.number, colIndex, row1.number, colIndex + 2); // Toplam
      // Puan ve Katılım tek hücre olduğu için merge edilmez

      // Tablo başlıkları - İkinci satır (D, Y, N)
      const headerRow2: any[] = ['', '']; // Sınav Adı ve Tarihi boş
      lessonNames.forEach(() => {
        headerRow2.push('D', 'Y', 'N');
      });
      headerRow2.push('D', 'Y', 'N', 'Ort.', '');
      
      const row2 = worksheet.addRow(headerRow2);
      row2.font = { bold: true, size: 10 };
      row2.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Birleştirme: Sınav Adı, Tarihi, Puan ve Katılım (dikey birleştirme iki satır için)
      worksheet.mergeCells(row1.number, 1, row2.number, 1); // Sınav Adı
      worksheet.mergeCells(row1.number, 2, row2.number, 2); // Tarih
      worksheet.mergeCells(row1.number, totalColumns - 1, row2.number, totalColumns - 1); // Puan Ort
      worksheet.mergeCells(row1.number, totalColumns, row2.number, totalColumns); // Katılım

      // Tüm başlık hücrelerine stil ver
      [row1, row2].forEach(row => {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Her rapor için bir satır
      reports.forEach((report) => {
        try {
          const rowData: any[] = [
            report.examTitle || 'İsimsiz Sınav',
            new Date(report.examDate).toLocaleDateString('tr-TR')
          ];

          let totalCorrect = 0;
          let totalIncorrect = 0;
          let totalNet = 0;

          // Her ders için D, Y, N değerlerini ekle
          lessonNames.forEach(lessonName => {
            const lesson = (report.lessonAverages || []).find(l => l.lessonName === lessonName);
            const correct = lesson?.averageCorrect || 0;
            const incorrect = lesson?.averageIncorrect || 0;
            const net = lesson?.averageNet || 0;
            
            rowData.push(
              this.safeToFixed(correct),
              this.safeToFixed(incorrect),
              this.safeToFixed(net)
            );

            totalCorrect += correct;
            totalIncorrect += incorrect;
            totalNet += net;
          });

          // Toplam D, Y, N
          rowData.push(
            this.safeToFixed(totalCorrect),
            this.safeToFixed(totalIncorrect),
            this.safeToFixed(totalNet)
          );

          // Puan ortalaması
          const avgScore = (report.scoreAverages || []).length > 0
            ? (report.scoreAverages || []).reduce((sum, s) => sum + (Number(s.averageScore) || 0), 0) /
            report.scoreAverages.length
            : 0;
          rowData.push(this.safeToFixed(avgScore));

          // Katılım
          rowData.push(report.participantCount || 0);

          const row = worksheet.addRow(rowData);
          row.alignment = { horizontal: 'center', vertical: 'middle' };
          
          row.eachCell((cell, colNum) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            
            // İlk iki sütun sola hizalı
            if (colNum <= 2) {
              cell.alignment = { horizontal: 'left', vertical: 'middle' };
            }
            
            // Renk kodlaması
            const value = parseFloat(cell.value as string);
            if (!isNaN(value) && colNum > 2) {
              // D sütunları yeşil
              if ((colNum - 3) % 3 === 0 || colNum === 2 + (lessonNames.length * 3) + 1) {
                cell.font = { color: { argb: 'FF00AA00' } };
              }
              // Y sütunları kırmızı
              else if ((colNum - 3) % 3 === 1 || colNum === 2 + (lessonNames.length * 3) + 2) {
                cell.font = { color: { argb: 'FFCC0000' } };
              }
              // Toplam Net ve Puan mavi/kalın
              else if (colNum === 2 + (lessonNames.length * 3) + 3 || colNum === 2 + (lessonNames.length * 3) + 4) {
                cell.font = { bold: true, color: { argb: 'FF0066CC' } };
              }
            }
          });
        } catch (err) {
          console.error('Error generating detailed row in Excel:', err);
          throw err;
        }
      });

      // Sütun genişlikleri
      worksheet.getColumn(1).width = 30; // Sınav Adı
      worksheet.getColumn(2).width = 15; // Tarih
      
      let col = 3;
      lessonNames.forEach(() => {
        worksheet.getColumn(col++).width = 10; // D
        worksheet.getColumn(col++).width = 10; // Y
        worksheet.getColumn(col++).width = 10; // N
      });
      worksheet.getColumn(col++).width = 10; // Toplam D
      worksheet.getColumn(col++).width = 10; // Toplam Y
      worksheet.getColumn(col++).width = 12; // Toplam Net
      worksheet.getColumn(col++).width = 15; // Puan Ort
      worksheet.getColumn(col++).width = 10; // Katılım

      // Excel dosyasını buffer olarak döndür
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Error in generateExamDetailedExcel:', error);
      throw new Error(`Ayrıntılı Excel dosyası oluşturulamadı: ${error.message}`);
    }
  }

  /**
   * Ders bazlı raporu Excel formatında oluşturur
   */
  async generateSubjectReportExcel(
    report: SubjectReportSummary,
    title: string,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ders Raporu');

    // Başlık
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `${title} - ${report.lessonName}`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.addRow([]);

    // Tablo başlıkları
    const headerRow = worksheet.addRow([
      'Deneme Adı',
      'Tarih',
      'Katılım',
      'Ortalama Doğru',
      'Ortalama Yanlış',
      'Ortalama Boş',
      'Ortalama Net',
    ]);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Veri satırları
    if (report.exams) {
      report.exams.forEach((exam) => {
        const row = worksheet.addRow([
          exam.examTitle,
          new Date(exam.examDate).toLocaleDateString('tr-TR'),
          exam.participantCount,
          this.safeToFixed(exam.averageCorrect),
          this.safeToFixed(exam.averageIncorrect),
          this.safeToFixed(exam.averageEmpty),
          this.safeToFixed(exam.averageNet),
        ]);
        row.alignment = { vertical: 'middle' };
      });
    }

    // Sütun genişlikleri
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 10;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 15;
    worksheet.getColumn(7).width = 15;

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Sınav özet raporunu PDF formatında oluşturur
   */
  async generateExamSummaryPDF(
    reports: ExamReportSummary[],
    title: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Başlık
      doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown(2);

      // Raporlar
      reports.forEach((report, index) => {
        try {
          if (index > 0) {
            doc.addPage();
          }

          doc.fontSize(14).font('Helvetica-Bold').text(report.examTitle);
          doc.fontSize(10).font('Helvetica');
          doc.text(`Tarih: ${new Date(report.examDate).toLocaleDateString('tr-TR')}`);
          doc.text(`Katılım: ${report.participantCount} öğrenci`);
          doc.moveDown();

          doc.fontSize(12).font('Helvetica-Bold').text('Ders Net Ortalamaları:');
          doc.fontSize(10).font('Helvetica');

          if (report.lessonAverages) {
            report.lessonAverages.forEach((lesson) => {
              doc.text(`${lesson.lessonName}: ${this.safeToFixed(lesson.averageNet)}`);
            });
          }
          doc.moveDown();

          doc.fontSize(12).font('Helvetica-Bold').text('Puan Ortalamaları:');
          doc.fontSize(10).font('Helvetica');

          if (report.scoreAverages) {
            report.scoreAverages.forEach((score) => {
              doc.text(`${score.type}: ${this.safeToFixed(score.averageScore)}`);
            });
          }
        } catch (err) {
          console.error('Error generating PDF page:', err);
        }
      });

      doc.end();
    });
  }

  /**
   * Sınav ayrıntılı raporunu PDF formatında oluşturur
   */
  async generateExamDetailedPDF(
    reports: ExamReportDetailed[],
    title: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Başlık
      doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown(2);

      // Raporlar
      reports.forEach((report, index) => {
        try {
          if (index > 0) {
            doc.addPage();
          }

          doc.fontSize(14).font('Helvetica-Bold').text(report.examTitle);
          doc.fontSize(10).font('Helvetica');
          doc.text(`Tarih: ${new Date(report.examDate).toLocaleDateString('tr-TR')}`);
          doc.text(`Katılım: ${report.participantCount} öğrenci`);
          doc.moveDown();

          doc.fontSize(12).font('Helvetica-Bold').text('Ders Detayları:');
          doc.fontSize(10).font('Helvetica');

          // Tablo başlığı
          const tableTop = doc.y;
          const col1X = 50;
          const col2X = 150;
          const col3X = 220;
          const col4X = 290;
          const col5X = 360;

          doc.font('Helvetica-Bold');
          doc.text('Ders', col1X, tableTop);
          doc.text('Doğru', col2X, tableTop);
          doc.text('Yanlış', col3X, tableTop);
          doc.text('Boş', col4X, tableTop);
          doc.text('Net', col5X, tableTop);

          doc.moveDown();
          doc.font('Helvetica');

          if (report.lessonDetails) {
            report.lessonDetails.forEach((lesson) => {
              const y = doc.y;
              doc.text(lesson.lessonName, col1X, y, { width: 90 });
              doc.text(this.safeToFixed(lesson.averageCorrect), col2X, y);
              doc.text(this.safeToFixed(lesson.averageIncorrect), col3X, y);
              doc.text(this.safeToFixed(lesson.averageEmpty), col4X, y);
              doc.text(this.safeToFixed(lesson.averageNet), col5X, y);
              doc.moveDown();
            });
          }
        } catch (err) {
          console.error('Error generating PDF detailed page:', err);
        }
      });

      doc.end();
    });
  }

  /**
   * Ders bazlı raporu PDF formatında oluşturur
   */
  async generateSubjectReportPDF(
    report: SubjectReportSummary,
    title: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Başlık
      doc.fontSize(16).font('Helvetica-Bold').text(`${title} - ${report.lessonName}`, { align: 'center' });
      doc.moveDown(2);

      // Tablo başlığı
      const tableTop = doc.y;
      const col1X = 50;
      const col2X = 200;
      const col3X = 270;
      const col4X = 320;
      const col5X = 370;
      const col6X = 420;
      const col7X = 470;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Deneme', col1X, tableTop);
      doc.text('Tarih', col2X, tableTop);
      doc.text('Katılım', col3X, tableTop);
      doc.text('Doğru', col4X, tableTop);
      doc.text('Yanlış', col5X, tableTop);
      doc.text('Boş', col6X, tableTop);
      doc.text('Net', col7X, tableTop);

      doc.moveDown();
      doc.font('Helvetica');

      if (report.exams) {
        report.exams.forEach((exam) => {
          const y = doc.y;
          doc.text(exam.examTitle, col1X, y, { width: 140 });
          doc.text(new Date(exam.examDate).toLocaleDateString('tr-TR'), col2X, y);
          doc.text(exam.participantCount.toString(), col3X, y);
          doc.text(this.safeToFixed(exam.averageCorrect), col4X, y);
          doc.text(this.safeToFixed(exam.averageIncorrect), col5X, y);
          doc.text(this.safeToFixed(exam.averageEmpty), col6X, y);
          doc.text(this.safeToFixed(exam.averageNet), col7X, y);
          doc.moveDown();
        });
      }

      doc.end();
    });
  }

  /**
   * Tek bir sınav için detaylı Excel raporu oluşturur
   */
  async generateSingleExamExcel(stats: any): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sınav Sonuçları');

      // Başlık
      worksheet.mergeCells('A1:H1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `${stats.examTitle} - Sonuçlar`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Tarih ve katılım bilgisi
      worksheet.mergeCells('A2:H2');
      const infoCell = worksheet.getCell('A2');
      infoCell.value = `Tarih: ${new Date(stats.examDate).toLocaleDateString('tr-TR')} | Katılım: ${stats.participantCount}`;
      infoCell.font = { size: 11 };
      infoCell.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.addRow([]);

      // Tablo başlıkları
      const headerRow = worksheet.addRow([
        'Sıra',
        'Öğrenci No',
        'Ad Soyad',
        'Şube',
        'Toplam Net',
        stats.examType === 'TYT' ? 'TYT Puan' : 'Puan',
        'Sıralama',
        'Yüzdelik Dilim'
      ]);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Öğrenci verileri
      if (stats.students && Array.isArray(stats.students)) {
        stats.students.forEach((student: any, index: number) => {
          const primaryScore = stats.examType === 'AYT' 
            ? (student.scores?.find((s: any) => ['SAY', 'EA', 'SÖZ'].includes(s.type))?.score || student.scores?.[0]?.score || 0)
            : (student.scores?.[0]?.score || student.score || 0);

          const row = worksheet.addRow([
            index + 1,
            student.studentNumber || '-',
            student.name || 'İsimsiz',
            student.className || '-',
            this.safeToFixed(student.net || 0),
            this.safeToFixed(primaryScore),
            student.rank || '-',
            student.percentile ? `%${this.safeToFixed(student.percentile, 1)}` : '-'
          ]);

          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });
      }

      // Sütun genişlikleri
      worksheet.getColumn(1).width = 8;
      worksheet.getColumn(2).width = 15;
      worksheet.getColumn(3).width = 30;
      worksheet.getColumn(4).width = 12;
      worksheet.getColumn(5).width = 12;
      worksheet.getColumn(6).width = 12;
      worksheet.getColumn(7).width = 12;
      worksheet.getColumn(8).width = 15;

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Error in generateSingleExamExcel:', error);
      throw new Error(`Excel dosyası oluşturulamadı: ${error.message}`);
    }
  }

  /**
   * Tek bir sınav için detaylı PDF raporu oluşturur
   */
  async generateSingleExamPDF(stats: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Başlık
        doc.fontSize(16).font('Helvetica-Bold').text(`${stats.examTitle} - Sonuçlar`, { align: 'center' });
        doc.fontSize(11).font('Helvetica')
          .text(`Tarih: ${new Date(stats.examDate).toLocaleDateString('tr-TR')} | Katılım: ${stats.participantCount}`, { align: 'center' });
        doc.moveDown(2);

        // Tablo başlıkları
        const tableTop = doc.y;
        const col1X = 50;
        const col2X = 90;
        const col3X = 170;
        const col4X = 300;
        const col5X = 360;
        const col6X = 430;
        const col7X = 500;
        const col8X = 560;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Sıra', col1X, tableTop);
        doc.text('Öğrenci No', col2X, tableTop);
        doc.text('Ad Soyad', col3X, tableTop);
        doc.text('Şube', col4X, tableTop);
        doc.text('T.Net', col5X, tableTop);
        doc.text('Puan', col6X, tableTop);
        doc.text('Sıralama', col7X, tableTop);
        doc.text('Dilim', col8X, tableTop);

        doc.moveDown();
        doc.font('Helvetica').fontSize(9);

        // Öğrenci verileri
        if (stats.students && Array.isArray(stats.students)) {
          stats.students.forEach((student: any, index: number) => {
            const primaryScore = stats.examType === 'AYT' 
              ? (student.scores?.find((s: any) => ['SAY', 'EA', 'SÖZ'].includes(s.type))?.score || student.scores?.[0]?.score || 0)
              : (student.scores?.[0]?.score || student.score || 0);

            const y = doc.y;
            
            // Sayfa sonu kontrolü
            if (y > 500) {
              doc.addPage();
              doc.y = 50;
            }

            doc.text((index + 1).toString(), col1X, y);
            doc.text(student.studentNumber || '-', col2X, y);
            doc.text(student.name || 'İsimsiz', col3X, y, { width: 120 });
            doc.text(student.className || '-', col4X, y);
            doc.text(this.safeToFixed(student.net || 0), col5X, y);
            doc.text(this.safeToFixed(primaryScore), col6X, y);
            doc.text((student.rank || '-').toString(), col7X, y);
            doc.text(student.percentile ? `%${this.safeToFixed(student.percentile, 1)}` : '-', col8X, y);
            doc.moveDown(0.5);
          });
        }

        doc.end();
      } catch (error) {
        console.error('Error in generateSingleExamPDF:', error);
        reject(new Error(`PDF dosyası oluşturulamadı: ${error.message}`));
      }
    });
  }

  /**
   * Sınıf sıralama matris raporunu Excel formatında oluşturur
   */
  async generateRankingMatrixExcel(
    classId: string,
    schoolId: string,
    examType?: ExamType,
  ): Promise<Buffer> {
    try {
      // ReportsService'den veriyi al
      const data = await this.reportsService.getClassRankingMatrix(
        classId,
        schoolId,
        examType,
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sıralama Matrisi');

      // Başlık
      const lastColumn = String.fromCharCode(65 + data.exams.length + 2);
      worksheet.mergeCells(`A1:${lastColumn}1`);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `${data.classInfo.gradeName} - ${data.classInfo.name} Öğrenci Sıralama Matrisi`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // Boş satır
      worksheet.addRow([]);

      // Tablo başlıkları
      const headers = ['Öğrenci No', 'Öğrenci Adı'];
      data.exams.forEach(exam => {
        headers.push(exam.title.substring(0, 20));
      });
      headers.push('Ort. Sıra');

      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' },
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Veri satırları
      data.students.forEach(student => {
        const rowData = [
          student.studentNumber,
          student.fullName,
        ];

        student.rankings.forEach(r => {
          rowData.push(r.rank !== null ? String(r.rank) : '-');
        });

        rowData.push(student.averageRank > 0 ? String(student.averageRank) : '-');

        const row = worksheet.addRow(rowData);
        row.alignment = { horizontal: 'center', vertical: 'middle' };

        // Border ekle
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });

        // Renk kodlaması - Sınav sütunları (C'den başlar)
        student.rankings.forEach((r, index) => {
          if (r.rank) {
            const cell = row.getCell(index + 3);
            const totalStudents = data.classInfo.studentCount;
            const percentile = (r.rank / totalStudents) * 100;

            if (percentile <= 20) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } }; // Yeşil
            } else if (percentile >= 80) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } }; // Kırmızı
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE066' } }; // Sarı
            }
          }
        });

        // Ortalama sütunu renklendirme
        const avgCell = row.getCell(data.exams.length + 3);
        if (student.averageRank > 0) {
          const percentile = (student.averageRank / data.classInfo.studentCount) * 100;
          if (percentile <= 20) {
            avgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
            avgCell.font = { bold: true };
          } else if (percentile >= 80) {
            avgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
          } else {
            avgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE066' } };
          }
        }
      });

      // Sütun genişlikleri
      worksheet.getColumn(1).width = 12;
      worksheet.getColumn(2).width = 30;
      for (let i = 3; i <= data.exams.length + 3; i++) {
        worksheet.getColumn(i).width = 14;
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Error in generateRankingMatrixExcel:', error);
      throw new Error(`Excel dosyası oluşturulamadı: ${error.message}`);
    }
  }

  async generateGradeRankingMatrixExcel(
    gradeId: string,
    schoolId: string,
    examType?: ExamType,
  ): Promise<Buffer> {
    try {
      const data = await this.reportsService.getGradeRankingMatrix(
        gradeId, schoolId, examType
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sıralama Matrisi');

      // Başlık
      worksheet.mergeCells('A1:' + String.fromCharCode(65 + data.exams.length + 3) + '1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `${data.classInfo.name} - Öğrenci Sıralama Matrisi`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center' };

      // Tablo başlıkları
      const headers = ['Öğrenci No', 'Öğrenci Adı', 'Şube'];
      data.exams.forEach(exam => {
        headers.push(exam.title.substring(0, 15));
      });
      headers.push('Ort. Sıra');

      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: 'center' };

      // Veri satırları
      data.students.forEach(student => {
        const rowData = [
          student.studentNumber,
          student.fullName,
          student.className,
        ];

        student.rankings.forEach(r => {
          rowData.push(r.rank || '-');
        });

        rowData.push(student.averageRank || '-');

        const row = worksheet.addRow(rowData);
        
        // Renk kodlaması
        student.rankings.forEach((r, index) => {
          if (r.rank) {
            const cell = row.getCell(index + 4);
            const totalStudents = data.classInfo.studentCount;
            const percentile = (r.rank / totalStudents) * 100;
            
            if (percentile <= 20) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
            } else if (percentile >= 80) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE066' } };
            }
          }
        });
      });

      // Sütun genişlikleri
      worksheet.getColumn(1).width = 12;
      worksheet.getColumn(2).width = 25;
      worksheet.getColumn(3).width = 10;
      for (let i = 4; i <= data.exams.length + 4; i++) {
        worksheet.getColumn(i).width = 12;
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Error in generateGradeRankingMatrixExcel:', error);
      throw new Error(`Excel dosyası oluşturulamadı: ${error.message}`);
    }
  }
}
