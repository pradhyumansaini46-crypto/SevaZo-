import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { APP_CONFIG, STORAGE_KEYS } from '../constants';
import { Storage, normalizeApiError, AppError } from '../utils';

export const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

// 2. Response Interceptor: Handle Token Refresh & Normalize Errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized for token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(normalizeApiError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await Storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new AppError({ message: 'Session expired. Please login again.', statusCode: 401 });
        }

        const refreshResponse: any = await axios.post(`${APP_CONFIG.API_BASE_URL}/vendor/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = refreshResponse.data?.accessToken || refreshResponse.accessToken;
        const newRefreshToken = refreshResponse.data?.refreshToken || refreshResponse.refreshToken;

        if (newAccessToken) {
          await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
          if (newRefreshToken) {
            await Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          }

          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new AppError({ message: 'Failed to refresh authentication token.', statusCode: 401 });
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        await Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        return Promise.reject(normalizeApiError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);
