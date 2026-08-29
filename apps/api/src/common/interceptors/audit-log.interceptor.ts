import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit mutating actions
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const user = request.user;

    return next.handle().pipe(
      tap(async () => {
        if (isMutating && user?.id) {
          try {
            const urlParts = request.url.split('?')[0].split('/');
            const module = urlParts[3] || 'system';

            await this.prisma.auditLog.create({
              data: {
                adminUserId: user.id,
                action: `${method}_${module.toUpperCase()}`,
                module,
                ipAddress: request.ip || request.connection?.remoteAddress,
                userAgent: request.headers['user-agent'],
                changes: {
                  body: request.body,
                  params: request.params,
                  query: request.query,
                },
              },
            });
          } catch (e) {
            // Ignore audit write failures so API request succeeds
          }
        }
      }),
    );
  }
}
