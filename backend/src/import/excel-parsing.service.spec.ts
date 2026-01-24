import { Test, TestingModule } from '@nestjs/testing';
import { ExcelParsingService } from './excel-parsing.service';
import * as ExcelJS from 'exceljs';

describe('ExcelParsingService', () => {
    let service: ExcelParsingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ExcelParsingService],
        }).compile();

        service = module.get<ExcelParsingService>(ExcelParsingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('detectFormat', () => {
        it('should detect LGS format with 30 columns', () => {
            const mockWorksheet = {
                actualColumnCount: 30,
                getRow: jest.fn().mockReturnValue({
                    getCell: jest.fn().mockReturnValue({ text: 'Some Header' })
                })
            } as any;

            const result = (service as any).detectFormat(mockWorksheet, 'LGS');
            expect(result.type).toBe('LGS');
            expect(result.format).toBe('RAW');
        });

        it('should detect LGS format with 32 columns (tolerance)', () => {
            const mockWorksheet = {
                actualColumnCount: 32,
                getRow: jest.fn().mockReturnValue({
                    getCell: jest.fn().mockReturnValue({ text: 'Some Header' })
                })
            } as any;

            const result = (service as any).detectFormat(mockWorksheet, 'LGS');
            expect(result.type).toBe('LGS');
        });

        it('should detect TYT PROCESSED format by headers', () => {
            const mockWorksheet = {
                actualColumnCount: 39,
                getRow: jest.fn().mockReturnValue({
                    getCell: jest.fn().mockReturnValue({ text: 'numarasi' })
                })
            } as any;

            const result = (service as any).detectFormat(mockWorksheet, 'TYT');
            expect(result.type).toBe('TYT');
            expect(result.format).toBe('PROCESSED');
        });

        it('should detect AYT PROCESSED format by headers', () => {
            const mockWorksheet = {
                actualColumnCount: 56,
                getRow: jest.fn().mockReturnValue({
                    getCell: jest.fn().mockReturnValue({ text: 'numarasi' })
                })
            } as any;

            const result = (service as any).detectFormat(mockWorksheet, 'AYT');
            expect(result.type).toBe('AYT');
            expect(result.format).toBe('PROCESSED');
        });

        it('should throw error for unknown column count', () => {
            const mockWorksheet = {
                actualColumnCount: 10,
                getRow: jest.fn().mockReturnValue({
                    getCell: jest.fn().mockReturnValue({ text: 'Unknown' })
                })
            } as any;

            expect(() => (service as any).detectFormat(mockWorksheet, 'TYT')).toThrow('Tanımsız dosya formatı');
        });
    });
});
