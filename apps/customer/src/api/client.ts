import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG, STORAGE_KEYS } from '../constants';
import { appStorage } from '../utils/storage';

let activeAuthToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export const setAuthToken = (token: string | null) => {
  activeAuthToken = token;
  if (token) {
    appStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } else {
    appStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
};

export const getAuthToken = () => activeAuthToken;

export const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!activeAuthToken) {
      activeAuthToken = await appStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    if (activeAuthToken && config.headers) {
      config.headers.Authorization = `Bearer ${activeAuthToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Auto-Refresh and Normalized Errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await appStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const res = await axios.post(`${APP_CONFIG.apiBaseUrl}/customer/auth/refresh`, {
          refreshToken,
        });

        const newToken = res.data.token;
        setAuthToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAuthToken(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalized error format
    const errorMessage =
      (error.response?.data as any)?.message ||
      error.message ||
      'An unexpected network error occurred';

    return Promise.reject({
      status: error.response?.status || 500,
      message: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
      originalError: error,
    });
  }
);
