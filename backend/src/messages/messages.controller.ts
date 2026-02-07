import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Sse,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { SaveDraftDto } from './dto/save-draft.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Observable, interval, map, switchMap, from } from 'rxjs';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
  ) {}

  @Post('upload')
  @Roles('SCHOOL_ADMIN', 'TEACHER')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/public/message-attachments';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Sadece PDF, JPG, JPEG ve PNG dosyaları yüklenebilir'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenemedi');
    }
    return {
      filename: file.filename,
      originalname: file.originalname,
      path: `/uploads/message-attachments/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post()
  @Roles('SCHOOL_ADMIN', 'TEACHER')
  create(@Body() createMessageDto: CreateMessageDto, @CurrentUser() user: any) {
    return this.messagesService.create(createMessageDto, user.id, user.schoolId);
  }

  @Get('inbox')
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  findInbox(@CurrentUser() user: any) {
    return this.messagesService.findInbox(user.id, user.schoolId);
  }

  @Get('sent')
  @Roles('SCHOOL_ADMIN', 'TEACHER')
  findSent(@CurrentUser() user: any) {
    return this.messagesService.findSent(user.id, user.schoolId);
  }

  @Get('unread-count')
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  getUnreadCount(@CurrentUser() user: any) {
    return this.messagesService.getUnreadCount(user.id, user.schoolId);
  }

  @Sse('stream')
  async streamMessages(@CurrentUser() user: any): Promise<Observable<MessageEvent>> {
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return interval(3000).pipe(
      switchMap(() => from(this.messagesService.getUnreadCount(user.id, user.schoolId))),
      map((data) => ({ data } as MessageEvent)),
    );
  }

  @Get('drafts')
  @Roles('SCHOOL_ADMIN', 'TEACHER')
  getDrafts(@CurrentUser() user: any) {
    return this.messagesService.getDrafts(user.id, user.schoolId);
  }

  @Post('drafts')
  @Roles('SCHOOL_ADMIN', 'TEACHER')
  saveDraft(@Body() saveDraftDto: SaveDraftDto, @CurrentUser() user: any) {
    return this.messagesService.saveDraft(saveDraftDto, user.id, user.schoolId);
  }

  @Delete('drafts/:id')
  @Roles('SCHOOL_ADMIN', 'TEACHER')
  deleteDraft(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.deleteDraft(id, user.id);
  }

  @Get('templates')
  @Roles('SCHOOL_ADMIN', 'TEACHER')
  getTemplates(@CurrentUser() user: any) {
    return this.messagesService.getTemplates(user.schoolId);
  }

  @Post('templates')
  @Roles('SCHOOL_ADMIN')
  createTemplate(@Body() createTemplateDto: CreateTemplateDto, @CurrentUser() user: any) {
    return this.messagesService.createTemplate(createTemplateDto, user.schoolId);
  }

  @Delete('templates/:id')
  @Roles('SCHOOL_ADMIN')
  deleteTemplate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.deleteTemplate(id, user.schoolId);
  }

  @Get('settings')
  @Roles('SCHOOL_ADMIN')
  getSettings(@CurrentUser() user: any) {
    return this.messagesService.getOrCreateSettings(user.schoolId);
  }

  @Patch('settings')
  @Roles('SCHOOL_ADMIN')
  updateSettings(@Body() updateSettingsDto: UpdateSettingsDto, @CurrentUser() user: any) {
    return this.messagesService.updateSettings(user.schoolId, updateSettingsDto);
  }

  @Get(':id')
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.findOne(id, user.id, user.schoolId);
  }

  @Patch(':id')
  @Roles('SCHOOL_ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.update(id, updateMessageDto, user.id, user.schoolId);
  }

  @Delete(':id')
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.remove(id, user.id, user.schoolId);
  }

  @Patch(':id/read')
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.markAsRead(id, user.id);
  }

  @Patch(':id/favorite')
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  toggleFavorite(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.toggleFavorite(id, user.id);
  }

  @Post(':id/replies')
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  createReply(
    @Param('id') id: string,
    @Body() createReplyDto: CreateReplyDto,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.createReply(id, createReplyDto, user.id, user.schoolId);
  }

  @Post(':id/approve')
  @Roles('SCHOOL_ADMIN')
  approveMessage(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.approveMessage(id, user.id, user.schoolId);
  }

  @Get(':id/delivery-report')
  @Roles('SCHOOL_ADMIN', 'TEACHER')
  exportDeliveryReport(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.exportDeliveryReport(id, user.id, user.schoolId);
  }
}
