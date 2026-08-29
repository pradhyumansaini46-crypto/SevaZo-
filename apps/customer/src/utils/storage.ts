import { Platform } from 'react-native';

class SafeStorage {
  private memoryStore: Record<string, string> = {};

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return this.memoryStore[key] || null;
    } catch {
      return this.memoryStore[key] || null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      this.memoryStore[key] = value;
    } catch {
      this.memoryStore[key] = value;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      delete this.memoryStore[key];
    } catch {
      delete this.memoryStore[key];
    }
  }

  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      this.memoryStore = {};
    } catch {
      this.memoryStore = {};
    }
  }
}

export const appStorage = new SafeStorage();
