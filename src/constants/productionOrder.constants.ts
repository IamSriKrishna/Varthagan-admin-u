export const PRODUCTION_ORDER_STATUS = [
  { label: 'Planned', value: 'planned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

// API Endpoints
export const PRODUCTION_ORDER_ENDPOINTS = {
  GET_ALL: '/production-orders',
  GET_ONE: (id: string) => `/production-orders/${id}`,
  CREATE: '/production-orders',
  UPDATE: (id: string) => `/production-orders/${id}`,
  DELETE: (id: string) => `/production-orders/${id}`,
  SEARCH: '/production-orders/search',
  CONSUME_ITEM: (id: string) => `/production-orders/${id}/consume-item`,
};
