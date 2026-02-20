import { Body, Controller, Get, Post, Put, UseGuards, Request, Param, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, StudentLoginDto, RegisterDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login-school')
    async loginSchool(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const data = await this.authService.loginSchool(loginDto);
        this.setAuthCookie(res, data.access_token, loginDto.rememberMe);
        return data;
    }

    @Post('login-student')
    async loginStudent(@Body() loginDto: StudentLoginDto, @Res({ passthrough: true }) res: Response) {
        const data = await this.authService.loginStudent(loginDto);
        this.setAuthCookie(res, data.access_token, loginDto.rememberMe);
        return data;
    }

    @Post('login-parent')
    async loginParent(@Body() loginDto: StudentLoginDto, @Res({ passthrough: true }) res: Response) {
        const data = await this.authService.loginParent(loginDto);
        this.setAuthCookie(res, data.access_token, loginDto.rememberMe);
        return data;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
    @Post('register')
    async register(@Request() req, @Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto, req.user);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Get('validate-reset-token/:token')
    async validateResetToken(@Param('token') token: string) {
        return this.authService.validateResetToken(token);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() req) {
        return this.authService.getMe(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    async changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string }) {
        return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Put('update-avatar')
    async updateAvatar(@Request() req, @Body() updateAvatarDto: UpdateAvatarDto) {
        return this.authService.updateAvatar(req.user.id, updateAvatarDto.avatarSeed);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
    @Post('test-email')
    async testEmail(@Body() body: { email: string }) {
        return this.authService.testEmailService(body.email);
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('token', { path: '/' });
        return { success: true };
    }

    private setAuthCookie(res: Response, token: string, rememberMe?: boolean) {
        const isProd = process.env.NODE_ENV === 'production';
        // rememberMe true ise 30 gün, false/undefined ise 7 gün
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
        
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: isProd,
            maxAge,
            path: '/',
        });
    }
}
