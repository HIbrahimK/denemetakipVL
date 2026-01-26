import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
    Query,
    Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: 'Kullanıcıları listele (Yönetici/Öğretmen)' })
    findAll(
        @Request() req,
        @Query('role') role?: Role,
        @Query('search') search?: string,
    ) {
        return this.usersService.findAll(req.user.schoolId, role, search);
    }

    @Post()
    @ApiOperation({ summary: 'Yeni kullanıcı ekle' })
    create(@Request() req, @Body() createUserDto: CreateUserDto) {
        return this.usersService.create(req.user.schoolId, createUserDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Kullanıcı güncelle' })
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(id, req.user.schoolId, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Kullanıcı sil' })
    remove(@Request() req, @Param('id') id: string) {
        return this.usersService.remove(id, req.user.schoolId);
    }

    @Post(':id/change-password')
    @ApiOperation({ summary: 'Kullanıcı şifresini değiştir' })
    changePassword(
        @Request() req,
        @Param('id') id: string,
        @Body('newPassword') newPassword: string,
    ) {
        return this.usersService.changePassword(id, req.user.schoolId, newPassword);
    }
}
