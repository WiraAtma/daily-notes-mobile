import * as SecureStore from 'expo-secure-store';

import { apiRequest } from './api';
import type { AuthResponse } from '@/types/api';

const ACCESS_TOKEN_KEY = 'daily-notes-access-token';

async function saveAuthResponse(
  path: '/auth/login' | '/auth/register',
  body: object,
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>(path, {
    method: 'POST',
    body,
  });
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, response.access_token);
  return response;
}

export function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return saveAuthResponse('/auth/login', { email, password });
}

export function registerWithEmailPassword(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return saveAuthResponse('/auth/register', { name, email, password });
}

export function getStoredAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export function removeStoredAccessToken(): Promise<void> {
  return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
