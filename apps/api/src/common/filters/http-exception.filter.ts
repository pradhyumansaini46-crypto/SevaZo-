import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const requestId =
      request.requestId ||
      (request.headers['x-request-id'] as string) ||
      `req_${crypto.randomBytes(6).toString('hex')}`;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'An internal server error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
        errorCode = exception.name;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const respObj = exceptionResponse as Record<string, any>;
        errorMessage = Array.isArray(respObj.message)
          ? respObj.message.join(', ')
          : respObj.message || exception.message;
        errorCode = respObj.error || exception.name;
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      this.logger.error(`Unhandled error [${requestId}]: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
      requestId,
      timestamp: new Date().toISOString(),
    });
  }
}
