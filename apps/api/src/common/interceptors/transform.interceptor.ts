import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';

export interface StandardApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  requestId: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const requestId =
      request.headers['x-request-id'] ||
      `req_${crypto.randomBytes(6).toString('hex')}`;
    request.requestId = requestId;

    return next.handle().pipe(
      map((data) => {
        let message = 'Operation completed successfully';
        let payload = data;

        if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
          message = data.message;
          payload = data.data;
        }

        return {
          success: true,
          data: payload,
          message,
          requestId,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
