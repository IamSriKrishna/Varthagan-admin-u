/**
 * Employee Utility Functions
 * Provides helper functions for employee-related operations including
 * validation, formatting, and file handling.
 */

/**
 * Validate employee data before submission
 */
export interface EmployeeValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const employeeValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-']+$/,
    errorMessage: 'Name must be 2-100 characters and contain only letters, spaces, hyphens, or apostrophes',
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: 'Invalid email format',
  },
  number: {
    required: true,
    minLength: 10,
    maxLength: 15,
    pattern: /^[0-9+\-\s()]+$/,
    errorMessage: 'Phone number must be 10-15 digits',
  },
  address: {
    required: true,
    minLength: 10,
    maxLength: 500,
    errorMessage: 'Address must be 10-500 characters',
  },
  monthly_salary: {
    required: true,
    min: 0,
    errorMessage: 'Monthly salary must be greater than 0',
  },
};

export function validateEmployeeData(data: Record<string, any>): EmployeeValidationResult {
  const errors: Record<string, string> = {};

  // Validate name
  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  } else if (data.name.length < 2 || data.name.length > 100) {
    errors.name = 'Name must be 2-100 characters';
  } else if (!employeeValidationRules.name.pattern.test(data.name)) {
    errors.name = employeeValidationRules.name.errorMessage;
  }

  // Validate email (optional but must be valid if provided)
  if (data.email && !employeeValidationRules.email.pattern.test(data.email)) {
    errors.email = employeeValidationRules.email.errorMessage;
  }

  // Validate phone number
  if (!data.number?.trim()) {
    errors.number = 'Phone number is required';
  } else if (data.number.replace(/\D/g, '').length < 10) {
    errors.number = 'Phone number must contain at least 10 digits';
  } else if (!employeeValidationRules.number.pattern.test(data.number)) {
    errors.number = employeeValidationRules.number.errorMessage;
  }

  // Validate address
  if (!data.address?.trim()) {
    errors.address = 'Address is required';
  } else if (data.address.length < 10 || data.address.length > 500) {
    errors.address = 'Address must be 10-500 characters';
  }

  // Validate monthly salary
  if (data.monthly_salary === undefined || data.monthly_salary === null || data.monthly_salary === '') {
    errors.monthly_salary = 'Monthly salary is required';
  } else if (parseFloat(data.monthly_salary) < 0) {
    errors.monthly_salary = 'Monthly salary must be greater than 0';
  }

  // Validate employee type
  if (!data.employee_type) {
    errors.employee_type = 'Employee type is required';
  } else if (!['full-time', 'part-time'].includes(data.employee_type)) {
    errors.employee_type = 'Employee type must be either full-time or part-time';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format salary with currency
 */
export function formatSalary(salary: number, currency: string = 'INR'): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(salary);
}

/**
 * Format employee type for display
 */
export function formatEmployeeType(type: 'full-time' | 'part-time'): string {
  return type === 'full-time' ? 'Full-time' : 'Part-time';
}

/**
 * Validate file for document upload
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB

export function validateDocumentFile(file: File): FileValidationResult {
  // Check file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not allowed. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG',
    };
  }

  // Check file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Convert file to Base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => {
      reject(new Error(`Failed to convert file to base64: ${error}`));
    };
  });
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if employee is recently created (within last 24 hours)
 */
export function isRecentlyCreated(createdAt: string): boolean {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  return diffInHours < 24;
}

/**
 * Export employee data as CSV
 */
export function exportEmployeesToCsv(employees: any[], filename: string = 'employees.csv'): void {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Address', 'Type', 'Monthly Salary', 'Created At'];
  const rows = employees.map((emp) => [
    emp.id,
    emp.name,
    emp.email || '-',
    emp.number,
    emp.address,
    emp.employee_type,
    emp.monthly_salary,
    formatDate(emp.created_at),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
