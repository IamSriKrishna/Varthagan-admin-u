"use client";

import { config } from "@/config";
import { localStorageAuthKey } from "@/constants/localStorageConstant";
import { LoginResponse } from "@/models/IUser";

export interface TokenValidationResponse {
  valid: boolean;
  expired: boolean;
  message: string;
  userID?: string;
  userType?: string;
  role?: string;
  expiresAt?: string;
  expiresIn?: number;
}

export interface TokenValidationError {
  isExpired: boolean;
  message: string;
}

/**
 * Get the current auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const persistedRoot = localStorage.getItem(localStorageAuthKey);
    if (!persistedRoot) return null;

    const rootData = JSON.parse(persistedRoot);
    if (!rootData.auth) return null;

    const authData = JSON.parse(rootData.auth) as LoginResponse;
    return authData.access_token || null;
  } catch (e) {
    console.error("Failed to get token from localStorage:", e);
    return null;
  }
};

/**
 * Validate token using backend API
 * @param token - Token to validate (if not provided, uses current token from localStorage)
 * @returns TokenValidationResponse with validation status
 */
export const validateTokenViaAPI = async (
  token?: string
): Promise<TokenValidationResponse | null> => {
  try {
    const tokenToValidate = token || getAuthToken();

    if (!tokenToValidate) {
      return {
        valid: false,
        expired: true,
        message: "No token found",
      };
    }

    const baseUrl =
      config.loginDomain || process.env.NEXT_PUBLIC_LOGIN_DOMAIN || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/auth/validate-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: tokenToValidate }),
    });

    if (!response.ok) {
      console.error("Token validation API error:", response.status);
      return {
        valid: false,
        expired: true,
        message: "Token validation failed",
      };
    }

    const data: TokenValidationResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error validating token:", error);
    return {
      valid: false,
      expired: true,
      message: error instanceof Error ? error.message : "Token validation error",
    };
  }
};

/**
 * Clear auth data and logout user
 */
export const clearAuthData = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.clear();
    // Redirect to login page
    window.location.href = "/login";
  } catch (e) {
    console.error("Failed to clear auth data:", e);
  }
};

/**
 * Handle token validation result
 * If token is invalid or expired, clears auth and redirects to login
 * @param validationResult - Result from validateTokenViaAPI
 * @returns true if token is valid, false otherwise
 */
export const handleTokenValidationResult = (
  validationResult: TokenValidationResponse | null
): boolean => {
  if (!validationResult) {
    console.error("Token validation returned null");
    clearAuthData();
    return false;
  }

  if (!validationResult.valid) {
    console.warn("Token is invalid or expired:", validationResult.message);
    clearAuthData();
    return false;
  }

  if (validationResult.expired) {
    console.warn("Token is expired");
    clearAuthData();
    return false;
  }

  return true;
};

/**
 * Complete token validation flow:
 * 1. Validates token via API
 * 2. If invalid/expired, logs out user
 * 3. Returns validation status
 * @param token - Optional token to validate
 * @returns true if token is valid, false otherwise
 */
export const validateAndHandleToken = async (token?: string): Promise<boolean> => {
  const validationResult = await validateTokenViaAPI(token);
  return handleTokenValidationResult(validationResult);
};
