/**
 * Advanced Token Validation Integration for Fetch Interceptor
 * 
 * This file shows how to integrate token validation with your existing fetchInterceptor.ts
 * 
 * Usage: Copy relevant parts to your fetchInterceptor.ts as needed
 */

import { validateTokenViaAPI } from "@/utils/tokenValidationUtil";

/**
 * Enhanced error handler with token validation
 * 
 * Integrates into your existing appFetch function to handle 401 errors
 * by validating the token first
 */
export async function handleAuthError(
  response: Response,
  input: RequestInfo
): Promise<Response | null> {
  if (response.status !== 401) {
    return response;
  }

  // Before attempting refresh, validate token
  const validationResult = await validateTokenViaAPI();

  if (!validationResult) {
    console.warn("[FetchInterceptor] Token validation failed");
    return null; // Let the existing refresh flow handle it
  }

  if (validationResult.expired) {
    console.warn("[FetchInterceptor] Token is expired");
    // Trigger logout via existing refresh flow
    return null;
  }

  if (!validationResult.valid) {
    console.warn("[FetchInterceptor] Token is invalid:", validationResult.message);
    // Trigger logout
    return null;
  }

  // Token is valid, request might fail for other reasons
  return response;
}

/**
 * Middleware-level token validation
 * 
 * Can be used in Next.js middleware to validate token before routing
 * 
 * Example implementation in middleware.ts:
 */
export async function validateTokenInMiddleware(token?: string): Promise<boolean> {
  if (!token) return false;

  try {
    const result = await validateTokenViaAPI(token);
    return result?.valid ?? false;
  } catch (error) {
    console.error("[Middleware] Token validation error:", error);
    return false;
  }
}

/**
 * Axios interceptor integration (if using axios)
 * 
 * Place this in your axios config/interceptor setup:
 */
export function setupAxiosTokenValidation(axiosInstance: any): void {
  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      // Check if it's an auth error
      if (error.response?.status === 401) {
        // Validate token
        const validationResult = await validateTokenViaAPI();

        if (!validationResult?.valid || validationResult?.expired) {
          console.warn("Token invalid, logging out...");
          // Logout handled in validateTokenViaAPI
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );
}

/**
 * React Query integration
 * 
 * Validate token before making queries
 */
export function createQueryClientConfig(): any {
  return {
    defaultOptions: {
      queries: {
        retry: async (failureCount, error: any) => {
          // Validate token on retry
          if (error?.response?.status === 401) {
            const isValid = await validateTokenViaAPI();
            if (!isValid) {
              return false; // Don't retry, token is invalid
            }
            return failureCount < 3; // Retry max 3 times if token is valid
          }
          return failureCount < 3;
        },
      },
    },
  };
}

/**
 * Enhanced request interceptor for appFetch
 * 
 * Add this logic to your existing appFetch function in fetchInterceptor.ts:
 * 
 * @example
 * export const appFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
 *   const fetchInit: RequestInit = { ...(init || {}), ... };
 *   const res = await fetch(input, fetchInit);
 *   
 *   // NEW: Validate token on 401 error
 *   if (res.status === 401) {
 *     const validationResult = await validateTokenViaAPI();
 *     if (!validationResult?.valid) {
 *       // Token is invalid, proceed with logout via refresh flow
 *       // existing code...
 *     }
 *   }
 *   
 *   return res;
 * };
 */

/**
 * Preemptive token validation before critical operations
 * 
 * Use before making important API calls:
 */
export async function ensureValidToken(): Promise<boolean> {
  const validationResult = await validateTokenViaAPI();

  if (!validationResult?.valid || validationResult?.expired) {
    console.error("Token is not valid, operation cancelled");
    // Auto-logout will be triggered by validateTokenViaAPI
    return false;
  }

  return true;
}

/**
 * Example: Critical operation with token validation
 */
export async function performCriticalAPIOperation(
  operationFn: () => Promise<any>
): Promise<any> {
  // Ensure token is valid before proceeding
  if (!(await ensureValidToken())) {
    throw new Error("User is not authenticated");
  }

  try {
    return await operationFn();
  } catch (error) {
    // If operation fails with 401, it might be due to token expiration
    if (error instanceof Error && error.message.includes("401")) {
      const isValid = await validateTokenViaAPI();
      if (!isValid) {
        throw new Error("Session expired");
      }
    }
    throw error;
  }
}
