// Customer Payment Constants

export const PAYMENT_MODES = [
  { label: 'Cash', value: 'cash' },
  { label: 'Online', value: 'online' },
];

export const PAYMENT_STATUS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Partial', value: 'partial' },
  { label: 'Completed', value: 'completed' },
];

// API Endpoints
export const CUSTOMER_PAYMENT_ENDPOINTS = {
  GET_ALL: (page: number = 1, limit: number = 10) => 
    `/customer-payments?page=${page}&limit=${limit}`,
  GET_BY_ID: (id: number | string) => `/customer-payments/${id}`,
  GET_BY_SO: (soId: number | string, page: number = 1, limit: number = 10) => 
    `/customer-payments/sales-order/${soId}?page=${page}&limit=${limit}`,
  GET_BY_CUSTOMER: (customerId: number, page: number = 1, limit: number = 10) => 
    `/customer-payments/customer/${customerId}?page=${page}&limit=${limit}`,
  CREATE: '/customer-payments',
  UPDATE: (id: number | string) => `/customer-payments/${id}`,
  RECORD_PAYMENT: (id: number | string) => `/customer-payments/${id}/record-payment`,
  DELETE: (id: number | string) => `/customer-payments/${id}`,
  SEARCH: (query: string, page: number = 1, limit: number = 10) => 
    `/customer-payments/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
};
