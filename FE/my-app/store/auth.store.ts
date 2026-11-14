import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Fallback ke AsyncStorage jika SecureStore tidak tersedia (web/emulator)
const storage = {
  async get(key: string): Promise<string | null> {
    try {
      if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) {
        return await SecureStore.getItemAsync(key);
      }
    } catch {}
    return await AsyncStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) {
        await SecureStore.setItemAsync(key, value);
        return;
      }
    } catch {}
    await AsyncStorage.setItem(key, value);
  },
  async remove(key: string): Promise<void> {
    try {
      if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) {
        await SecureStore.deleteItemAsync(key);
        return;
      }
    } catch {}
    await AsyncStorage.removeItem(key);
  },
};

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: async (user, token) => {
    await storage.set('token', token);
    await storage.set('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  updateUser: async (updatedData) => {
    const current = get().user;
    if (!current) return;
    const newUser = { ...current, ...updatedData };
    await storage.set('user', JSON.stringify(newUser));
    set({ user: newUser });
  },

  logout: async () => {
    await storage.remove('token');
    await storage.remove('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadToken: async () => {
    try {
      const token = await storage.get('token');
      const userStr = await storage.get('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      }
    } catch {
      // token tidak valid, biarkan unauthenticated
    }
  },
}));
