// Vendor Payment Constants

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
export const VENDOR_PAYMENT_ENDPOINTS = {
  GET_ALL: (page: number = 1, limit: number = 10) => 
    `/vendor-payments?page=${page}&limit=${limit}`,
  GET_BY_ID: (id: number | string) => `/vendor-payments/${id}`,
  GET_BY_PO: (poId: number | string, page: number = 1, limit: number = 10) => 
    `/vendor-payments/purchase-order/${poId}?page=${page}&limit=${limit}`,
  CREATE: '/vendor-payments',
  RECORD_PAYMENT: (id: number | string) => `/vendor-payments/${id}/record-payment`,
  SEARCH: (query: string, page: number = 1, limit: number = 10) => 
    `/vendor-payments/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
};
