export interface ApiErrorPayload {
  code?: string;
  message: string;
  statusCode?: number;
  missingSections?: string[];
  details?: any;
}

export class AppError extends Error {
  code: string;
  statusCode: number;
  missingSections?: string[];
  details?: any;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'AppError';
    this.code = payload.code || 'UNKNOWN_ERROR';
    this.statusCode = payload.statusCode || 500;
    this.missingSections = payload.missingSections;
    this.details = payload.details;
  }
}

export const normalizeApiError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error?.response?.data) {
    const data = error.response.data;
    const message =
      data?.error?.message ||
      data?.message ||
      (Array.isArray(data?.message) ? data.message.join(', ') : null) ||
      'An unexpected server error occurred. Please try again.';
    const code = data?.error?.code || data?.statusCode || 'SERVER_ERROR';
    const missingSections = data?.error?.missingSections || data?.missingSections;

    return new AppError({
      message,
      code: String(code),
      statusCode: error.response.status || 500,
      missingSections,
      details: data,
    });
  }

  if (error?.message === 'Network Error' || error?.code === 'ECONNABORTED') {
    return new AppError({
      message: 'Network connectivity lost. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      statusCode: 0,
    });
  }

  return new AppError({
    message: error?.message || 'Something went wrong. Please try again.',
    code: 'CLIENT_ERROR',
    statusCode: 400,
  });
};
