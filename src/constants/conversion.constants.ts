// Conversion Status
export const CONVERSION_STATUS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
];

// API Endpoints
export const CONVERSION_ENDPOINTS = {
  // Conversion Rules
  GET_ALL: '/product-conversions',
  GET_ONE: (id: string) => `/product-conversions/${id}`,
  CREATE: '/product-conversions',
  UPDATE: (id: string) => `/product-conversions/${id}`,
  DELETE: (id: string) => `/product-conversions/${id}`,
  GET_ACTIVE: '/product-conversions/active',
  GET_BY_RAW: '/product-conversions/by-raw',
  GET_BY_FINISHED: '/product-conversions/by-finished',
  
  // Conversion Execution
  EXECUTE: '/product-conversions/execute',
  
  // Conversion Records
  GET_RECORDS: '/product-conversions/records',
  GET_RECORD: (recordId: string) => `/product-conversions/records/${recordId}`,
  GET_RECORDS_BY_RULE: '/product-conversions/records/by-rule',
  GET_RECORDS_BY_DATE_RANGE: '/product-conversions/records/by-date-range',
};
