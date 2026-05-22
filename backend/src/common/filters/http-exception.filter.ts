import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  error?: string;
  message?: string | string[];
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = this.normalizeError(exception, status);

    response.status(status).json(payload);
  }

  private normalizeError(
    exception: unknown,
    statusCode: number,
  ): Required<ErrorResponse> {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode,
        error: 'INTERNAL_ERROR',
        message: 'Ocorreu um erro inesperado.',
      };
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return {
        statusCode,
        error: this.defaultErrorCode(statusCode),
        message: response,
      };
    }

    const errorResponse = response as ErrorResponse;
    const message = Array.isArray(errorResponse.message)
      ? errorResponse.message.join(' ')
      : (errorResponse.message ?? exception.message);

    return {
      statusCode,
      error: errorResponse.error ?? this.defaultErrorCode(statusCode),
      message,
    };
  }

  private defaultErrorCode(statusCode: number): string {
    const errorCodes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
      [HttpStatus.NOT_FOUND]: 'PRODUCT_NOT_FOUND',
      [HttpStatus.CONFLICT]: 'INSUFFICIENT_STOCK',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'ERP_UNAVAILABLE',
    };

    return errorCodes[statusCode] ?? 'INTERNAL_ERROR';
  }
}
