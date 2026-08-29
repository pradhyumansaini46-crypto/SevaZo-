import { ENV } from '../constants/env';

/**
 * Authentication Storage Service
 * Provides secure token persistence with universal fallback (Web/Native memory/localStorage)
 */
class AuthStorageService {
  private inMemoryStorage: Map<string, string> = new Map();

  async getAccessToken(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(ENV.TOKEN_STORAGE_KEY);
      }
      return this.inMemoryStorage.get(ENV.TOKEN_STORAGE_KEY) || null;
    } catch {
      return this.inMemoryStorage.get(ENV.TOKEN_STORAGE_KEY) || null;
    }
  }

  async setAccessToken(token: string): Promise<void> {
    try {
      this.inMemoryStorage.set(ENV.TOKEN_STORAGE_KEY, token);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(ENV.TOKEN_STORAGE_KEY, token);
      }
    } catch {
      this.inMemoryStorage.set(ENV.TOKEN_STORAGE_KEY, token);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(ENV.REFRESH_TOKEN_STORAGE_KEY);
      }
      return this.inMemoryStorage.get(ENV.REFRESH_TOKEN_STORAGE_KEY) || null;
    } catch {
      return this.inMemoryStorage.get(ENV.REFRESH_TOKEN_STORAGE_KEY) || null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    try {
      this.inMemoryStorage.set(ENV.REFRESH_TOKEN_STORAGE_KEY, token);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(ENV.REFRESH_TOKEN_STORAGE_KEY, token);
      }
    } catch {
      this.inMemoryStorage.set(ENV.REFRESH_TOKEN_STORAGE_KEY, token);
    }
  }

  async clearAuthTokens(): Promise<void> {
    try {
      this.inMemoryStorage.delete(ENV.TOKEN_STORAGE_KEY);
      this.inMemoryStorage.delete(ENV.REFRESH_TOKEN_STORAGE_KEY);
      this.inMemoryStorage.delete(ENV.USER_STORAGE_KEY);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(ENV.TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(ENV.REFRESH_TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(ENV.USER_STORAGE_KEY);
      }
    } catch {
      // Memory cleared
    }
  }
}

export const authStorage = new AuthStorageService();
export default authStorage;
