import { IsEnum } from 'class-validator';

export class UpdateSupportTicketStatusDto {
  @IsEnum(['OPEN', 'IN_PROGRESS', 'ANSWERED', 'CLOSED'])
  status: 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';
}