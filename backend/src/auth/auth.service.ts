import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, StudentLoginDto, RegisterDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/password-reset.dto';
import { JwtPayload } from './auth.strategy';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) { }

    // School Admin / Teacher login with email
    async loginSchool(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: { school: true },
        });

        if (!user || !['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'].includes(user.role)) {
            throw new UnauthorizedException('Geçersiz kimlik bilgileri');
        }

        const isPasswordValid = await this.comparePassword(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Geçersiz kimlik bilgileri');
        }

        return this.generateToken(user);
    }

    // Student login with studentNumber
    async loginStudent(loginDto: StudentLoginDto) {
        const student = await this.prisma.student.findFirst({
            where: { studentNumber: loginDto.studentNumber },
            include: {
                user: {
                    include: { 
                        school: true,
                    },
                },
                class: {
                    include: {
                        grade: true,
                    },
                },
            },
        });

        if (!student || student.user.role !== 'STUDENT') {
            throw new UnauthorizedException('Geçersiz kimlik bilgileri');
        }

        const isPasswordValid = await this.comparePassword(loginDto.password, student.user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Geçersiz kimlik bilgileri');
        }

        // Include student info in the response
        const userWithStudent = {
            ...student.user,
            student: {
                id: student.id,
                studentNumber: student.studentNumber,
                class: student.class,
            },
        };

        return this.generateToken(userWithStudent);
    }

    // Parent login with student number
    async loginParent(loginDto: StudentLoginDto) {
        // Find student by student number first
        const student = await this.prisma.student.findFirst({
            where: { studentNumber: loginDto.studentNumber },
            include: {
                parent: {
                    include: {
                        user: {
                            include: { school: true },
                        },
                    },
                },
            },
        });

        if (!student || !student.parent || student.parent.user.role !== 'PARENT') {
            throw new UnauthorizedException('Geçersiz kimlik bilgileri');
        }

        const user = student.parent.user;
        const isPasswordValid = await this.comparePassword(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Geçersiz kimlik bilgileri');
        }

        return this.generateToken(user);
    }

    // Register new user
    async register(registerDto: RegisterDto, actor: { role: string; schoolId: string }) {
        if (!actor) {
            throw new UnauthorizedException('Yetkisiz erişim');
        }

        const isSuperAdmin = actor.role === 'SUPER_ADMIN';
        const isSchoolAdmin = actor.role === 'SCHOOL_ADMIN';
        if (!isSuperAdmin && !isSchoolAdmin) {
            throw new ForbiddenException('Bu işlem için yetkiniz yok');
        }

        if (isSchoolAdmin && registerDto.schoolId !== actor.schoolId) {
            throw new ForbiddenException('Sadece kendi okulunuz için kullanıcı oluşturabilirsiniz');
        }

        if (isSchoolAdmin && !['TEACHER', 'STUDENT', 'PARENT'].includes(registerDto.role)) {
            throw new ForbiddenException('Bu rolü oluşturma yetkiniz yok');
        }

        if (!isSuperAdmin && registerDto.role === 'SUPER_ADMIN') {
            throw new ForbiddenException('Bu rolü oluşturma yetkiniz yok');
        }

        const school = await this.prisma.school.findUnique({
            where: { id: registerDto.schoolId },
            select: { id: true },
        });

        if (!school) {
            throw new NotFoundException('Okul bulunamadı');
        }

        if (registerDto.role === 'STUDENT') {
            if (!registerDto.classId) {
                throw new BadRequestException('Öğrenci için classId zorunludur');
            }

            const schoolClass = await this.prisma.class.findFirst({
                where: { id: registerDto.classId, schoolId: registerDto.schoolId },
                select: { id: true },
            });

            if (!schoolClass) {
                throw new BadRequestException('Sınıf bu okula ait değil');
            }
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await this.hashPassword(registerDto.password);

        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                role: registerDto.role,
                schoolId: registerDto.schoolId,
            },
            include: { school: true },
        });

        // If student, create student record
        if (registerDto.role === 'STUDENT' && registerDto.classId) {
            await this.prisma.student.create({
                data: {
                    userId: user.id,
                    schoolId: registerDto.schoolId,
                    classId: registerDto.classId,
                    studentNumber: registerDto.studentNumber,
                    tcNo: registerDto.tcNo,
                },
            });
        }

        // If parent, create parent record
        if (registerDto.role === 'PARENT') {
            await this.prisma.parent.create({
                data: {
                    userId: user.id,
                },
            });
        }

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                schoolId: user.schoolId,
            },
        };
    }

    // Forgot Password - Initiate reset
    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists
            return { message: 'If user exists, email sent' };
        }

        // Generate random token
        const token = crypto.randomBytes(32).toString('hex');
        // Hash token for database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Save token to database
        await this.prisma.passwordResetToken.create({
            data: {
                token: hashedToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 3600000), // 1 hour
            },
        });

        // Send email
        if (user.email) {
            await this.emailService.sendPasswordResetEmail(user.email, token);
        }

        return { message: 'If user exists, email sent' };
    }

    // Reset Password - Complete reset
    async resetPassword(resetDto: ResetPasswordDto) {
        // Hash provided token to compare with database
        const hashedToken = crypto.createHash('sha256').update(resetDto.token).digest('hex');

        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token: hashedToken },
            include: { user: true },
        });

        if (!resetToken) {
            throw new BadRequestException('Invalid or expired token');
        }

        if (resetToken.used || resetToken.expiresAt < new Date()) {
            throw new BadRequestException('Invalid or expired token');
        }

        // Hash new password
        const hashedPassword = await this.hashPassword(resetDto.newPassword);

        // Update user password
        await this.prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        });

        // Mark token as used
        await this.prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true },
        });

        // Clean up old tokens for this user
        await this.prisma.passwordResetToken.deleteMany({
            where: {
                userId: resetToken.userId,
                OR: [
                    { used: true },
                    { expiresAt: { lt: new Date() } }
                ]
            },
        });

        return { message: 'Password reset successful' };
    }

    // Validate reset token
    async validateResetToken(token: string) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token: hashedToken },
        });

        if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
            throw new BadRequestException('Invalid or expired token');
        }

        return { valid: true };
    }

    // Get current user
    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                school: true,
                student: {
                    include: {
                        class: {
                            include: {
                                grade: true,
                            },
                        },
                    },
                },
                parent: {
                    include: {
                        students: {
                            include: {
                                user: true,
                                class: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { password, ...safeUser } = user;
        return safeUser;
    }

    // Hash password
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    // Compare password
    async comparePassword(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }

    // Change password for logged-in user
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verify current password
        const isPasswordValid = await this.comparePassword(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Hash and update new password
        const hashedPassword = await this.hashPassword(newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { message: 'Password changed successfully' };
    }

    // Update avatar seed
    async updateAvatar(userId: string, avatarSeed: string) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { avatarSeed },
            include: { school: true },
        });

        return {
            message: 'Avatar updated successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                schoolId: user.schoolId,
                avatarSeed: user.avatarSeed,
                school: user.school,
            },
        };
    }

    // Generate JWT token
    private generateToken(user: any) {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                schoolId: user.schoolId,
                avatarSeed: user.avatarSeed,
                school: user.school,
                student: user.student, // Include student info if present
            },
        };
    }

    // Test email service
    async testEmailService(testEmail: string) {
        try {
            await this.emailService.sendEmail(
                testEmail,
                'Deneme Takip - E-posta Sistemi Test',
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4F46E5;">E-posta Sistemi Test</h2>
                    <p>Bu e-posta, Deneme Takip sisteminin SMTP yapılandırmasını test etmek için gönderilmiştir.</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Test Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}</p>
                        <p><strong>Sunucu:</strong> ${process.env.SMTP_HOST || 'Yapılandırılmamış'}</p>
                        <p><strong>Port:</strong> ${process.env.SMTP_PORT || 'Yapılandırılmamış'}</p>
                    </div>
                    <p>Bu e-postayı aldıysanız, SMTP ayarlarınız doğru çalışıyor demektir.</p>
                </div>
                `
            );

            return {
                success: true,
                message: 'Test e-postası başarıyla gönderildi',
                details: {
                    to: testEmail,
                    timestamp: new Date().toISOString(),
                },
            };
        } catch (error: any) {
            this.logger.error('SMTP test başarısız', error?.stack || error?.message);
            throw new BadRequestException({
                success: false,
                message: 'E-posta gönderimi başarısız',
            });
        }
    }
}
