/**
 * Parses company API errors and returns user-friendly error messages
 */

interface ParsedError {
  message: string;
  fieldErrors?: Record<string, string>;
}

const ERROR_PATTERNS: Record<string, { message: string; details?: string }> = {
  pan_number_too_long: {
    message: "PAN Number is too long",
    details: "PAN Number should be a maximum of 10 characters",
  },
  gst_number_too_long: {
    message: "GST Number is too long",
    details: "GST Number should be a maximum of 15 characters",
  },
  company_name_too_long: {
    message: "Company Name is too long",
    details: "Company Name should be a reasonable length",
  },
  email_too_long: {
    message: "Email is too long",
    details: "Email should be a maximum of 255 characters",
  },
  mobile_invalid: {
    message: "Mobile Number is invalid",
    details: "Mobile Number should be a valid 10 digit number",
  },
  account_number_too_long: {
    message: "Account Number is too long",
    details: "Account Number format is invalid",
  },
  ifsc_code_invalid: {
    message: "IFSC Code is invalid",
    details: "IFSC Code should be an 11-character code",
  },
  pincode_invalid: {
    message: "Pincode is invalid",
    details: "Pincode should be a valid 6-digit code",
  },
};

export function parseCompanyError(error: any): ParsedError {
  const errorText = 
    error.message ||
    error.response?.data?.error ||
    error.response?.data?.message ||
    "Failed to setup company";

  if (!errorText) {
    return { message: "An unexpected error occurred" };
  }

  // Check for 'Data too long' errors
  const dataTooLongMatch = errorText.match(/Data too long for column '(\w+)'/i);
  if (dataTooLongMatch) {
    const columnName = dataTooLongMatch[1];
    const fieldKey = `${columnName}_too_long`;
    
    if (ERROR_PATTERNS[fieldKey]) {
      const pattern = ERROR_PATTERNS[fieldKey];
      return {
        message: pattern.message,
        fieldErrors: {
          [columnName]: pattern.details || pattern.message,
        },
      };
    }

    // Fallback for unknown columns
    return {
      message: `${columnName.replace(/_/g, " ")} is too long`,
      fieldErrors: {
        [columnName]: `Please check the ${columnName.replace(/_/g, " ")} field length`,
      },
    };
  }

  // Check for duplicate entry errors
  if (errorText.includes("Duplicate entry")) {
    return {
      message: "This record already exists",
      fieldErrors: {},
    };
  }

  // Check for constraint errors
  if (errorText.includes("constraint")) {
    return {
      message: "Invalid data submitted",
      fieldErrors: {},
    };
  }

  // Check for validation errors
  if (errorText.includes("invalid") || errorText.includes("Invalid")) {
    return {
      message: "Please check your input fields",
      fieldErrors: {},
    };
  }

  // Default: return the error message as is
  return { message: errorText };
}

/**
 * Formats error message with details if available
 */
export function formatErrorMessage(error: any): string {
  const parsed = parseCompanyError(error);
  
  if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
    const details = Object.values(parsed.fieldErrors)
      .filter(Boolean)
      .join(", ");
    return details ? `${parsed.message}: ${details}` : parsed.message;
  }
  
  return parsed.message;
}
