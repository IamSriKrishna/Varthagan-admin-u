"use client";

import { useTokenValidation } from "@/hooks/useTokenValidation";
import React from "react";

/**
 * Token Validator Component
 * 
 * This component handles background token validation
 * Automatically logs out user if token is invalid or expired
 * 
 * Place this component in your layout or app provider
 * 
 * @example
 * // In your app provider or layout
 * <TokenValidator />
 */
export const TokenValidator: React.FC = () => {
  // Validate token every 5 minutes, auto-validate on mount
  const { isValid, isValidating, error } = useTokenValidation({
    autoValidate: true,
    validationInterval: 5 * 60 * 1000, // 5 minutes
    debug: process.env.NODE_ENV === "development",
  });

  // Silent operation - no UI feedback needed
  // Token validation happens in the background
  // If token is invalid, user will be redirected to login automatically
  // via the hook's logout logic

  return null; // This component is for background operation only
};

/**
 * Example: Manual Token Validation in a Component
 * 
 * @example
 * export function MyComponent() {
 *   const { validateToken, isValidating } = useTokenValidation({ autoValidate: false });
 *   
 *   const handleCheckToken = async () => {
 *     const isValid = await validateToken();
 *     if (isValid) {
 *       console.log("Token is valid!");
 *     }
 *   };
 *   
 *   return (
 *     <button onClick={handleCheckToken} disabled={isValidating}>
 *       {isValidating ? "Checking..." : "Check Token"}
 *     </button>
 *   );
 * }
 */
