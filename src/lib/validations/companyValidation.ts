// Form validation utilities for company setup

export const validationRules = {
  companyName: {
    min: 1,
    max: 255,
    required: true,
    error: "Company name must be between 1-255 characters",
  },
  gstNumber: {
    length: 15,
    optional: true,
    error: "GST number must be 15 characters",
  },
  panNumber: {
    length: 10,
    optional: true,
    error: "PAN number must be 10 characters",
  },
  mobile: {
    min: 10,
    max: 15,
    required: true,
    error: "Mobile number must be 10-15 digits",
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    error: "Invalid email address",
  },
  addressLine1: {
    min: 1,
    max: 255,
    required: true,
    error: "Address line 1 is required",
  },
  city: {
    min: 1,
    max: 100,
    required: true,
    error: "City is required",
  },
  pincode: {
    min: 4,
    max: 10,
    required: true,
    error: "Pincode must be 4-10 characters",
  },
  ifscCode: {
    length: 11,
    optional: true,
    error: "IFSC code must be 11 characters",
  },
  invoicePrefix: {
    min: 1,
    max: 10,
    required: true,
    error: "Invoice prefix must be 1-10 characters",
  },
  invoiceStartNumber: {
    min: 1,
    required: true,
    error: "Invoice start number must be at least 1",
  },
  timezone: {
    required: true,
    error: "Timezone is required",
  },
  dateFormat: {
    required: true,
    error: "Date format is required",
  },
  currencyCode: {
    length: 3,
    required: true,
    error: "Currency code must be 3 characters",
  },
};

export const validateField = (
  fieldName: string,
  value: any,
  rules: any
): string | null => {
  if (!value) {
    if (rules.required) {
      return `${fieldName} is required`;
    }
    return null;
  }

  if (rules.length && String(value).length !== rules.length) {
    return rules.error;
  }

  if (rules.min && String(value).length < rules.min) {
    return rules.error;
  }

  if (rules.max && String(value).length > rules.max) {
    return rules.error;
  }

  if (rules.pattern && !rules.pattern.test(String(value))) {
    return rules.error;
  }

  return null;
};

export const validateForm = (
  formData: any,
  fieldsToValidate: Record<string, any>,
  validationRulesMap: Record<string, any>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.entries(fieldsToValidate).forEach(([key, value]) => {
    const rules = validationRulesMap[key];
    if (rules) {
      const error = validateField(key, value, rules);
      if (error) {
        errors[key] = error;
      }
    }
  });

  return errors;
};
