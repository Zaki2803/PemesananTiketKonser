import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Resolve the API host for every Expo target.
 * `localhost` points to the phone/emulator, not to the computer running Node.
 * EXPO_PUBLIC_API_URL can still be used for production or a custom backend.
 */
function getBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredUrl) {
    const normalized = configuredUrl.endsWith('/')
      ? configuredUrl.slice(0, -1)
      : configuredUrl;
    return normalized.endsWith('/api') ? normalized : normalized + '/api';
  }

  if (Platform.OS === 'web') return 'http://localhost:3000/api';

  // Expo development client/Metro exposes the computer address in hostUri.
  // It is available on both a physical device and an emulator.
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  const host = hostUri?.split(':')[0];
  if (host) {
    return `http://${host}:3000/api`;
  }

  // Android emulator fallback; iOS simulator uses localhost.
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'
    : 'http://localhost:3000/api';
}

export const BASE_URL = getBaseUrl();

async function getStoredToken(): Promise<string | null> {
  try {
    if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) {
      return await SecureStore.getItemAsync('token');
    }
  } catch {
    // Fall back to AsyncStorage when SecureStore is unavailable.
  }
  return AsyncStorage.getItem('token');
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token ke setiap request
api.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
