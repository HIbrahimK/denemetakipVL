import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AccessLogsService } from './access-logs.service';

@Injectable()
export class AccessLogsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AccessLogsInterceptor.name);

  constructor(private readonly accessLogsService: AccessLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap({
        next: () => this.persistLog(request, response),
        error: () => this.persistLog(request, response),
      }),
    );
  }

  private shouldSkip(path: string, user: any) {
    if (!user?.id || !user?.schoolId) {
      return true;
    }

    return (
      path.startsWith('/messages/stream') ||
      path.startsWith('/admin/access-logs') ||
      path.startsWith('/health') ||
      path.startsWith('/uploads/')
    );
  }

  private inferArea(path: string) {
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) {
      return 'root';
    }

    if (segments[0] === 'dashboard' && segments[1]) {
      return segments[1];
    }

    if (segments[0] === 'admin' && segments[1]) {
      return `admin:${segments[1]}`;
    }

    return segments[0];
  }

  private persistLog(request: any, response: any) {
    const user = request.user;
    const path = request.originalUrl || request.url;

    if (this.shouldSkip(path, user)) {
      return;
    }

    const route = request.route?.path
      ? `${request.baseUrl || ''}${request.route.path}`
      : undefined;

    const ipAddress =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.ip ||
      request.socket?.remoteAddress;

    void this.accessLogsService
      .capture({
        schoolId: user.schoolId,
        userId: user.id,
        method: request.method,
        path,
        route,
        area: this.inferArea(path),
        ipAddress,
        userAgent: request.headers['user-agent'],
        statusCode: response.statusCode || 200,
      })
      .catch((error) => {
        this.logger.warn(
          `Access log kaydedilemedi: ${error?.message || 'unknown error'}`,
        );
      });
  }
}