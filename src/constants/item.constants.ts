
export const ITEM_ENDPOINTS = {
  CREATE: "/items",
  GET_ALL: (page: number = 1, limit: number = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append("search", search);
    }
    return `/items?${params.toString()}`;
  },
  GET_BY_ID: (id: string | number) => `/items/${id}`,
  UPDATE: (id: string | number) => `/items/${id}`,
  DELETE: (id: string | number) => `/items/${id}`,
  SEARCH: (query: string, page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams({
      search: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    return `/items?${params.toString()}`;
  },
};