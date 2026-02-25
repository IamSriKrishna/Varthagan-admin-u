"use client";
//////////Right now we are not using this page localStorageUtil
export const localStorageUtil = {
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};
