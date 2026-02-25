export const BILL_ENDPOINTS = {
  CREATE: '/bills',
  GET_ALL: '/bills',
  GET_ONE: (id: string) => `/bills/${id}`,
  UPDATE: (id: string) => `/bills/${id}`,
  DELETE: (id: string) => `/bills/${id}`,
  UPDATE_STATUS: (id: string) => `/bills/${id}/status`,
  SEARCH: (query: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;
    return `/bills/search?q=${query}&limit=${limit}&offset=${offset}`;
  },
};
