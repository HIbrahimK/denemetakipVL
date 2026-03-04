import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export const SKIP_LICENSE_CHECK = 'skipLicenseCheck';

@Injectable()
export class LicenseGuard implements CanActivate {
  private readonly logger = new Logger(LicenseGuard.name);

  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if license check should be skipped
    const skipCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_LICENSE_CHECK,
      [context.getHandler(), context.getClass()],
    );
    if (skipCheck) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // No user (public endpoint) or SUPER_ADMIN → always allow
    if (!user || user.role === 'SUPER_ADMIN') {
      return true;
    }

    const schoolId = user.schoolId;
    if (!schoolId) return true;

    // Find active license for this school
    const license = await this.prisma.schoolLicense.findFirst({
      where: { schoolId },
      orderBy: { endDate: 'desc' },
    });

    // No license → allow (free tier / legacy schools)
    if (!license) return true;

    const response = context.switchToHttp().getResponse();

    switch (license.status) {
      case 'ACTIVE':
        // Check if license has expired but status not yet updated
        if (new Date() > license.endDate) {
          // Auto-transition to GRACE period (7 days)
          const graceDays = 7;
          const graceEnd = new Date(license.endDate);
          graceEnd.setDate(graceEnd.getDate() + graceDays);

          if (new Date() <= graceEnd) {
            await this.prisma.schoolLicense.update({
              where: { id: license.id },
              data: { status: 'GRACE' },
            });
            response.setHeader('X-License-Warning', 'grace');
          } else {
            await this.prisma.schoolLicense.update({
              where: { id: license.id },
              data: { status: 'EXPIRED' },
            });
            return this.handleExpired(request);
          }
        }
        return true;

      case 'GRACE':
        response.setHeader('X-License-Warning', 'grace');
        // Check if grace period exceeded
        const graceEnd2 = new Date(license.endDate);
        graceEnd2.setDate(graceEnd2.getDate() + 7);
        if (new Date() > graceEnd2) {
          await this.prisma.schoolLicense.update({
            where: { id: license.id },
            data: { status: 'EXPIRED' },
          });
          return this.handleExpired(request);
        }
        return true;

      case 'EXPIRED':
        return this.handleExpired(request);

      case 'SUSPENDED':
        throw new ForbiddenException(
          'Okulunuzun lisansı askıya alınmıştır. Lütfen yönetici ile iletişime geçin.',
        );

      default:
        return true;
    }
  }

  private handleExpired(request: any): boolean {
    // Read-only mode: only allow GET requests
    const method = request.method.toUpperCase();
    if (method === 'GET') {
      return true;
    }
    throw new ForbiddenException(
      'Okulunuzun lisans süresi dolmuştur. Yazma işlemleri kısıtlanmıştır. Lütfen lisansınızı yenileyiniz.',
    );
  }
}
