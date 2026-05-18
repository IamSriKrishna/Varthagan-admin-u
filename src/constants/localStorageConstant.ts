export const localStorageAuthKey = "persist:root";
export const appBarHeight = 64;
export const localStorageVendorKey = "selectedVendorId";

/**
 * Get authentication token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const authState = localStorage.getItem(localStorageAuthKey);
    if (!authState) return null;
    const parsed = JSON.parse(authState);
    return parsed?.auth?.token || null;
  } catch {
    return null;
  }
}
