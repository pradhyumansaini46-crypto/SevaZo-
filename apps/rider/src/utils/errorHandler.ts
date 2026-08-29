import axios, { AxiosError } from 'axios';

export interface ApiErrorResponse {
  statusCode?: number;
  message: string | string[];
  error?: string;
}

/**
 * Global Error Handler utility to extract friendly user-facing messages
 */
export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  if (typeof error === 'string') return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Network / Offline Error
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return 'Request timed out. Please check your internet connection.';
      }
      return 'Network connection failed. Please check your internet.';
    }

    const data = axiosError.response.data;

    // NestJS structured errors
    if (data) {
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      if (typeof data.message === 'string') {
        return data.message;
      }
      if (data.error) {
        return data.error;
      }
    }

    // HTTP Status Code Fallbacks
    switch (axiosError.response.status) {
      case 400:
        return 'Invalid request details provided.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment before trying again.';
      case 500:
      case 502:
      case 503:
        return 'Server temporarily unavailable. Please try again later.';
      default:
        return `Server error (${axiosError.response.status}).`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
