import { Body, Controller, Get, Post, Put, UseGuards, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, StudentLoginDto, RegisterDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login-school')
    async loginSchool(@Body() loginDto: LoginDto) {
        return this.authService.loginSchool(loginDto);
    }

    @Post('login-student')
    async loginStudent(@Body() loginDto: StudentLoginDto) {
        return this.authService.loginStudent(loginDto);
    }

    @Post('login-parent')
    async loginParent(@Body() loginDto: StudentLoginDto) {
        return this.authService.loginParent(loginDto);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
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
}
