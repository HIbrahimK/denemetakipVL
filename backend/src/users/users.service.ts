import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(schoolId: string, role?: Role, search?: string, actorRole?: string) {
    const isSuperAdmin = actorRole === 'SUPER_ADMIN';

    return this.prisma.user.findMany({
      where: {
        // SUPER_ADMIN with schoolId: filter by that school; SUPER_ADMIN without: all users
        ...(isSuperAdmin ? (schoolId ? { schoolId } : {}) : { schoolId }),
        ...(role && { role }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
        // SUPER_ADMIN listing: no role exclusion; school admins: exclude students/parents/super_admins
        ...(!isSuperAdmin && {
          NOT: {
            role: { in: [Role.STUDENT, Role.PARENT, Role.SUPER_ADMIN] },
          },
        }),
      },
      include: { school: { select: { id: true, name: true } } },
      orderBy: { firstName: 'asc' },
    });
  }

  async findOne(id: string, schoolId: string, actorRole?: string) {
    const where = actorRole === 'SUPER_ADMIN' ? { id } : { id, schoolId };
    const user = await this.prisma.user.findFirst({ where });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return user;
  }

  async create(schoolId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing)
      throw new ConflictException('Bu e-posta adresi zaten kullanımda');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        schoolId,
      },
    });
  }

  async update(id: string, schoolId: string, dto: UpdateUserDto, actorRole?: string) {
    await this.findOne(id, schoolId, actorRole);

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (existing)
        throw new ConflictException('Bu e-posta adresi zaten kullanımda');
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

  async remove(id: string, schoolId: string, actorRole?: string) {
    if (actorRole === 'SUPER_ADMIN') {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    } else {
      await this.findOne(id, schoolId);
    }
    return this.prisma.user.delete({ where: { id } });
  }

  async changePassword(id: string, schoolId: string, newPassword: string, actorRole?: string) {
    await this.findOne(id, schoolId, actorRole);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  // Kullanıcının kendi profilini güncellemesi (yetki kontrolü yok)
  async updateMyProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    // Sadece belirli alanların güncellenmesine izin ver
    const allowedFields: any = {};
    if (dto.firstName) allowedFields.firstName = dto.firstName;
    if (dto.lastName) allowedFields.lastName = dto.lastName;
    if (dto.phone) allowedFields.phone = dto.phone;
    if (dto.branch) allowedFields.branch = dto.branch;
    if (dto.avatar && user.role !== Role.STUDENT) {
      allowedFields.avatar = dto.avatar;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: allowedFields,
    });
  }
}
