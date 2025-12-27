import Cookies from 'js-cookie';
import { COOKIE_KEYS } from '@/constants';
import { User } from '@/types';

/**
 * Set auth token in cookie
 */
export const setAuthToken = (token: string): void => {
  Cookies.set(COOKIE_KEYS.AUTH_TOKEN, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

/**
 * Get auth token from cookie
 */
export const getAuthToken = (): string | undefined => {
  return Cookies.get(COOKIE_KEYS.AUTH_TOKEN);
};

/**
 * Remove auth token from cookie
 */
export const removeAuthToken = (): void => {
  Cookies.remove(COOKIE_KEYS.AUTH_TOKEN);
};

/**
 * Set user data in cookie
 */
export const setUserData = (user: User): void => {
  Cookies.set(COOKIE_KEYS.USER_DATA, JSON.stringify(user), {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

/**
 * Get user data from cookie
 */
export const getUserData = (): User | null => {
  const userData = Cookies.get(COOKIE_KEYS.USER_DATA);
  if (!userData) return null;
  try {
    return JSON.parse(userData) as User;
  } catch {
    return null;
  }
};

/**
 * Remove user data from cookie
 */
export const removeUserData = (): void => {
  Cookies.remove(COOKIE_KEYS.USER_DATA);
};

/**
 * Clear all auth data
 */
export const clearAuthData = (): void => {
  removeAuthToken();
  removeUserData();
};

