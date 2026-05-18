import { apiService } from './api.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttributeDefinition {
  key: string;
  options: string[];
}

export interface Variant {
  sku: string;
  variant_name: string;
  attribute_map: Record<string, string>;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
  reorder_level: number;
  is_active: boolean;
}

export interface ProductDetails {
  unit?: string;
  base_sku?: string;
  description?: string;
  attribute_definitions?: AttributeDefinition[];
  variants?: Variant[];
}

export interface SalesInfo {
  account?: string;
  selling_price?: number;
  currency?: string;
  description?: string;
}

export interface PurchaseInfo {
  account?: string;
  cost_price?: number;
  currency?: string;
  description?: string;
}

// ─── Resource Product ────────────────────────────────────────────────────────

export interface ResourceProduct {
  resource_name: string;
  resource_unit: string;
  resource_cost_per_unit: number;
}

// ─── Request ──────────────────────────────────────────────────────────────────

export interface CreateProductRequest {
  name: string;
  is_resource?: boolean;
  product_details?: ProductDetails;
  sales_info?: SalesInfo;
  purchase_info?: PurchaseInfo;
  return_policy?: ReturnPolicy;
  resource_name?: string;
  resource_unit?: string;
  resource_cost_per_unit?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface Manufacturer {
  id: number;
  name: string;
}

export interface ProductDetailsResponse extends ProductDetails {
  manufacturer_id?: number;
  manufacturer?: Manufacturer;
}

export interface Inventory {
  track_inventory: boolean;
}

export interface ReturnPolicy {
  returnable: boolean;
}

export interface Product {
  id: string;
  name: string;
  product_details: ProductDetailsResponse;
  sales_info: SalesInfo;
  purchase_info: PurchaseInfo;
  inventory: Inventory;
  return_policy: ReturnPolicy;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name: string;
  company_id: number;
  company_name: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page?: number;
  limit?: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

const PRODUCTS_ENDPOINT = '/products';

export const productService = {
  /**
   * Get all products with optional pagination and search
   */
  async getProducts(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ProductListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search ? { search } : {}),
    });

    const response = await apiService.get(`${PRODUCTS_ENDPOINT}?${params}`);
    return response.data ?? response;
  },

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<Product> {
    const response = await apiService.get(`${PRODUCTS_ENDPOINT}/${id}`);
    return response.data ?? response;
  },

  /**
   * Create a new product with details, sales info, and purchase info
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await apiService.post(PRODUCTS_ENDPOINT, data);
    return response.data ?? response;
  },

  /**
   * Update an existing product
   */
  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    const response = await apiService.put(`${PRODUCTS_ENDPOINT}/${id}`, data);
    return response.data ?? response;
  },

  /**
   * Delete a product by ID
   */
  async deleteProduct(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiService.delete(`${PRODUCTS_ENDPOINT}/${id}`);
    return {
      success: true,
      message: response?.message ?? 'Product deleted successfully',
    };
  },

  /**
   * Search products by name or SKU
   */
  async searchProducts(query: string, limit: number = 20): Promise<ProductListResponse> {
    const params = new URLSearchParams({ search: query, limit: limit.toString() });
    const response = await apiService.get(`${PRODUCTS_ENDPOINT}?${params}`);
    return response.data ?? response;
  },

  /**
   * Get all manufacturers
   */
  async getManufacturers(): Promise<{ data: Manufacturer[] } | { manufacturers: Manufacturer[] }> {
    const response = await apiService.get('/manufacturers');
    return response.data ?? response;
  },

  /**
   * Check compatibility between bottle and cap
   */
  async checkCompatibility(bottleId: number, capId: number): Promise<{ compatible: boolean }> {
    const response = await apiService.get(`/bottles/${bottleId}/caps/${capId}/compatible`);
    return response.data ?? response;
  },
};

// ─── Bottle Service ───────────────────────────────────────────────────────────

const BOTTLES_ENDPOINT = '/bottles';

export const bottleService = {
  async getBottles(page: number = 1, limit: number = 10): Promise<{ data: any[] }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiService.get(`${BOTTLES_ENDPOINT}?${params}`);
    return response.data ? { data: response.data } : { data: [] };
  },

  async getBottle(id: number): Promise<any> {
    const response = await apiService.get(`${BOTTLES_ENDPOINT}/${id}`);
    return response.data ?? response;
  },

  async createBottle(data: any): Promise<any> {
    const response = await apiService.post(BOTTLES_ENDPOINT, data);
    return response.data ?? response;
  },

  async updateBottle(id: number, data: any): Promise<any> {
    const response = await apiService.put(`${BOTTLES_ENDPOINT}/${id}`, data);
    return response.data ?? response;
  },

  async deleteBottle(id: number): Promise<{ success: boolean }> {
    await apiService.delete(`${BOTTLES_ENDPOINT}/${id}`);
    return { success: true };
  },
};

// ─── Bottle Size Service ──────────────────────────────────────────────────────

const BOTTLE_SIZES_ENDPOINT = '/bottle-sizes';

export const bottleSizeService = {
  async getBottleSizes(page: number = 1, limit: number = 10): Promise<{ data: any[] }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiService.get(`${BOTTLE_SIZES_ENDPOINT}?${params}`);
    return response.data ? { data: response.data } : { data: [] };
  },

  async getBottleSize(id: number): Promise<any> {
    const response = await apiService.get(`${BOTTLE_SIZES_ENDPOINT}/${id}`);
    return response.data ?? response;
  },

  async createBottleSize(data: any): Promise<any> {
    const response = await apiService.post(BOTTLE_SIZES_ENDPOINT, data);
    return response.data ?? response;
  },

  async updateBottleSize(id: number, data: any): Promise<any> {
    const response = await apiService.put(`${BOTTLE_SIZES_ENDPOINT}/${id}`, data);
    return response.data ?? response;
  },

  async deleteBottleSize(id: number): Promise<{ success: boolean }> {
    await apiService.delete(`${BOTTLE_SIZES_ENDPOINT}/${id}`);
    return { success: true };
  },
};

// ─── Cap Service ──────────────────────────────────────────────────────────────

const CAPS_ENDPOINT = '/caps';

export const capService = {
  async getCaps(page: number = 1, limit: number = 10): Promise<{ data: any[] }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiService.get(`${CAPS_ENDPOINT}?${params}`);
    return response.data ? { data: response.data } : { data: [] };
  },

  async getCap(id: number): Promise<any> {
    const response = await apiService.get(`${CAPS_ENDPOINT}/${id}`);
    return response.data ?? response;
  },

  async createCap(data: any): Promise<any> {
    const response = await apiService.post(CAPS_ENDPOINT, data);
    return response.data ?? response;
  },

  async updateCap(id: number, data: any): Promise<any> {
    const response = await apiService.put(`${CAPS_ENDPOINT}/${id}`, data);
    return response.data ?? response;
  },

  async deleteCap(id: number): Promise<{ success: boolean }> {
    await apiService.delete(`${CAPS_ENDPOINT}/${id}`);
    return { success: true };
  },
};