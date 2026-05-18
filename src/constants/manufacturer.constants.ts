export const MANUFACTURER_ENDPOINTS = {
  GET_ALL: '/manufacturers',
  GET_ONE: (id: string) => `/manufacturers/${id}`,
  CREATE: '/manufacturers',
  UPDATE: (id: string) => `/manufacturers/${id}`,
  DELETE: (id: string) => `/manufacturers/${id}`,
  GET_BY_PRODUCT_GROUP: (productGroupId: string) => `/manufacturers/product-group/${productGroupId}`,
};
