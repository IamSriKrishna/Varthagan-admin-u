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
  unit: string;
  base_sku: string;
  upc?: string;
  description: string;
  attribute_definitions: AttributeDefinition[];
  manufacturer_id: number;
  variants: Variant[];
}

export interface SalesInfo {
  account: string;
  selling_price: number;
  markup_percent?: number;
}

export interface PurchaseInfo {
  account: string;
  cost_price: number;
}

// ─── Request ──────────────────────────────────────────────────────────────────

export interface CreateProductRequest {
  name: string;
  product_details: ProductDetails;
  sales_info: SalesInfo;
  purchase_info: PurchaseInfo;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface Manufacturer {
  id: number;
  name: string;
}

export interface ProductDetailsResponse extends Omit<ProductDetails, 'manufacturer_id'> {
  manufacturer_id: number;
  manufacturer: Manufacturer;
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
};