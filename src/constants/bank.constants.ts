export const BANK_ENDPOINTS = {
  CREATE: `/banks`,
  GET_ALL: (page: number = 1, limit: number = 100) => 
    `/banks?page=${page}&limit=${limit}`,
  GET_BY_ID: (id: number) => `/banks/${id}`,
  UPDATE: (id: number) => `/banks/${id}`,
  DELETE: (id: number) => `/banks/${id}`,
};
