"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { logout } from "@/store/auth/authSlice";
import {
  validateTokenViaAPI,
  TokenValidationResponse,
  clearAuthData,
} from "@/utils/tokenValidationUtil";

export interface UseTokenValidationOptions {
  /** Auto-validate on component mount */
  autoValidate?: boolean;
  /** Interval to periodically validate token (in milliseconds) */
  validationInterval?: number;
  /** Show console logs for debugging */
  debug?: boolean;
}

/**
 * Custom hook to validate JWT token with the backend API
 * Handles logout if token is invalid or expired
 *
 * @example
 * const { isValid, isValidating, error, validateToken } = useTokenValidation({
 *   autoValidate: true,
 *   validationInterval: 5 * 60 * 1000, // Validate every 5 minutes
 * });
 */
export const useTokenValidation = (options: UseTokenValidationOptions = {}) => {
  const {
    autoValidate = true,
    validationInterval = 5 * 60 * 1000, // Default: 5 minutes
    debug = false,
  } = options;

  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.access_token);

  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<TokenValidationResponse | null>(null);

  const validateToken = useCallback(async (tokenToValidate?: string) => {
    try {
      setIsValidating(true);
      setError(null);

      const result = await validateTokenViaAPI(tokenToValidate);

      if (debug) {
        console.log("[useTokenValidation] Validation result:", result);
      }

      setValidationResult(result);

      if (!result || !result.valid || result.expired) {
        if (debug) {
          console.warn("[useTokenValidation] Token is invalid or expired:", result?.message);
        }

        setIsValid(false);
        dispatch(logout());
        clearAuthData();
        router.push("/login");

        return false;
      }

      setIsValid(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      if (debug) {
        console.error("[useTokenValidation] Error:", errorMessage);
      }
      setError(errorMessage);
      setIsValid(false);

      // On error, also logout to be safe
      dispatch(logout());
      clearAuthData();
      router.push("/login");

      return false;
    } finally {
      setIsValidating(false);
    }
  }, [dispatch, router, debug]);

  // Auto-validate on mount and set up interval
  useEffect(() => {
    if (!token) {
      setIsValid(null);
      return;
    }

    if (autoValidate) {
      // Validate immediately on mount
      validateToken(token);

      // Set up periodic validation
      if (validationInterval > 0) {
        const intervalId = setInterval(() => {
          validateToken(token);
        }, validationInterval);

        return () => clearInterval(intervalId);
      }
    }
  }, [token, autoValidate, validationInterval, validateToken]);

  return {
    /** Is token valid */
    isValid,
    /** Is validation in progress */
    isValidating,
    /** Error message if any */
    error,
    /** Full validation response from backend */
    validationResult,
    /** Manual validation function */
    validateToken,
  };
};
