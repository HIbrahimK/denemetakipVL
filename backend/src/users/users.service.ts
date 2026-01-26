import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(schoolId: string, role?: Role, search?: string) {
        return this.prisma.user.findMany({
            where: {
                schoolId,
                ...(role && { role }),
                ...(search && {
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ],
                }),
                // Usually, we manage staff in this page, but we can manage everyone
                NOT: {
                    role: { in: [Role.STUDENT, Role.PARENT] }
                }
            },
            orderBy: { firstName: 'asc' },
        });
    }

    async findOne(id: string, schoolId: string) {
        const user = await this.prisma.user.findFirst({
            where: { id, schoolId },
        });
        if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
        return user;
    }

    async create(schoolId: string, dto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) throw new ConflictException('Bu e-posta adresi zaten kullanımda');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.user.create({
            data: {
                ...dto,
                password: hashedPassword,
                schoolId,
            },
        });
    }

    async update(id: string, schoolId: string, dto: UpdateUserDto) {
        await this.findOne(id, schoolId);

        if (dto.email) {
            const existing = await this.prisma.user.findFirst({
                where: { email: dto.email, NOT: { id } },
            });
            if (existing) throw new ConflictException('Bu e-posta adresi zaten kullanımda');
        }

        const data: any = { ...dto };
        if (dto.password) {
            data.password = await bcrypt.hash(dto.password, 10);
        }

        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, schoolId: string) {
        await this.findOne(id, schoolId);
        return this.prisma.user.delete({ where: { id } });
    }

    async changePassword(id: string, schoolId: string, newPassword: string) {
        await this.findOne(id, schoolId);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    }
}
