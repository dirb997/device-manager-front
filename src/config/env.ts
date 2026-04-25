const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const apiBaseFromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const wsUrlFromEnv = (import.meta.env.VITE_WS_URL as string | undefined)?.trim();
const tokenStorageKeyFromEnv = (import.meta.env.VITE_TOKEN_STORAGE_KEY as string | undefined)?.trim();

export const API_BASE_URL = stripTrailingSlash(apiBaseFromEnv || 'http://localhost:8000/api');
export const AUTH_API_URL = `${API_BASE_URL}/auth`;
export const WS_URL = wsUrlFromEnv || 'ws://localhost:8000/api/ws';
export const TOKEN_STORAGE_KEY = tokenStorageKeyFromEnv || 'dm_access_token';
