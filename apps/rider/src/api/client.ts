import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ENV } from '../constants/env';
import { authStorage } from '../services/authStorage';
import { ENDPOINTS } from './endpoints';

/**
 * Production-ready Axios API Client for SevaZo Rider App
 * Features:
 * - Bearer Access Token injection
 * - Automated Refresh Token handling on 401 Unauthorized
 * - Request queue during refresh
 * - Standardized error transformation
 */

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.DEFAULT_TIMEOUT_MS,
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

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await authStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle standard NestJS response unwrapping, 401 and Token Refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data &&
      response.data.data !== undefined
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't intercept auth login/otp endpoints to avoid infinite refresh loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/rider/auth/login') &&
      !originalRequest.url?.includes('/rider/auth/send-otp') &&
      !originalRequest.url?.includes('/rider/auth/verify-otp') &&
      !originalRequest.url?.includes('/rider/auth/refresh-token')
    ) {
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
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await authStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axios.post(`${ENV.API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
          refreshToken,
        });

        const newAccessToken = refreshResponse.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.refreshToken || refreshToken;

        if (newAccessToken) {
          await authStorage.setAccessToken(newAccessToken);
          if (newRefreshToken) {
            await authStorage.setRefreshToken(newRefreshToken);
          }

          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        await authStorage.clearAuthTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export default apiClient;
