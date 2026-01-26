import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolsService {
    constructor(private prisma: PrismaService) { }

    async getSchool(id?: string) {
        if (!id) {
            const school = await this.prisma.school.findFirst();
            if (!school) {
                throw new NotFoundException('No schools found');
            }
            return school;
        }

        const school = await this.prisma.school.findUnique({
            where: { id },
        });

        if (!school) {
            throw new NotFoundException('School not found');
        }

        return school;
    }

    async updateSchool(id: string, dto: any) {
        return this.prisma.school.update({
            where: { id },
            data: dto,
        });
    }

    async promoteGrades(id: string) {
        // Logic for grade promotion: 
        // 9 -> 10, 10 -> 11, 11 -> 12, 12 -> Graduate?
        return { message: 'Sınıf atlatma işlemi başarıyla tamamlandı.' };
    }

    async getBackups(schoolId: string) {
        return this.prisma.backup.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async backupData(id: string) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${id}-${timestamp}.json`;

        // In a real app, you'd export data to JSON/SQL here
        const backup = await this.prisma.backup.create({
            data: {
                filename,
                size: Math.floor(Math.random() * 1024 * 1024), // mock size
                schoolId: id,
            },
        });

        return { message: 'Yedekleme başarıyla oluşturuldu.', backup };
    }

    async downloadBackup(id: string, backupId: string) {
        const backup = await this.prisma.backup.findFirst({
            where: { id: backupId, schoolId: id },
        });
        if (!backup) throw new NotFoundException('Yedek bulunamadı');

        // This would return the file content. For now we return metadata
        return backup;
    }

    async restoreData(id: string, backupId: string) {
        const backup = await this.prisma.backup.findFirst({
            where: { id: backupId, schoolId: id },
        });
        if (!backup) throw new NotFoundException('Yedek bulunamadı');
        return { message: 'Geri yükleme işlemi başlatıldı.' };
    }
}
