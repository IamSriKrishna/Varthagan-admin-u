import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_DOMAIN ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8088';

/* ─────────────────────────────────────────────────────────────────
   Auth helpers
───────────────────────────────────────────────────────────────── */
const getToken = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const persistedRoot = localStorage.getItem(localStorageAuthKey);
    if (!persistedRoot) return '';
    const rootData = JSON.parse(persistedRoot);
    if (!rootData.auth) return '';
    const authData = JSON.parse(rootData.auth) as LoginResponse;
    return authData.access_token || '';
  } catch (e) {
    console.error('Failed to get token from persisted auth:', e);
    return '';
  }
};

const getHeaders = (contentType = 'application/json') => ({
  'Content-Type': contentType,
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return { success: true, data: [] };

  try {
    return await response.json();
  } catch (e) {
    throw new Error(
      `Failed to parse response as JSON: ${e instanceof Error ? e.message : String(e)}`
    );
  }
};

/* ═══════════════════════════════════════════════════════════════════
   ENDPOINT 1 — GET /api/stock/summary
   Used by: Stock tab (variant-level detail)

   Actual response:
   {
     "stocks": [
       {
         "product_id":      "prod_28ccf422",
         "product_name":    "Water Bottle",
         "type":            "variant",
         "sku":             "WB-001-BLU",
         "variant_name":    "WB-001-BLU",
         "current_stock":   150,
         "available_stock": 150,
         "reserved_stock":  0,
         "purchased_total": 350,          <-- NOTE: purchased_total (not purchased_stock)
         "sold_total":      200,          <-- NOTE: sold_total (not sold_stock)
         "average_cost":    100,
         "stock_value":     15000,
         "last_purchased":  "2026-04-08T03:53:02.08+05:30",   <-- NOTE: last_purchased
         "last_sold":       "2026-04-08T03:57:47.329+05:30"   <-- NOTE: last_sold
       }
     ],
     "total_stock_value":        45000,
     "total_sold_product_value": 1010000
   }
═══════════════════════════════════════════════════════════════════ */
export interface StockSummaryItem {
  product_id:      string;
  product_name:    string;
  /** "variant" | "product" or any future value */
  type:            string;
  sku:             string;
  variant_name:    string;
  current_stock:   number;
  available_stock: number;
  reserved_stock:  number;
  /** Total units ever purchased — API field name: purchased_total */
  purchased_total: number;
  /** Total units ever sold — API field name: sold_total */
  sold_total:      number;
  average_cost:    number;
  stock_value:     number;
  /** ISO date string — API field name: last_purchased */
  last_purchased:  string | null;
  /** ISO date string — API field name: last_sold */
  last_sold:       string | null;
}

export interface StockSummaryResponse {
  stocks:                   StockSummaryItem[];
  total_stock_value:        number;
  total_sold_product_value: number;
}

/* ═══════════════════════════════════════════════════════════════════
   ENDPOINT 2 — GET /dashboard/stock
   Used by: Inventory tab (product-level with status flags)

   Actual response:
   {
     "data": [
       {
         "product_id":          "prod_28ccf422",
         "product_name":        "Water Bottle",
         "current_stock":       450,
         "available_stock":     450,
         "reserved_stock":      0,
         "purchased_stock":     10550,        <-- NOTE: purchased_stock (not purchased_total)
         "sold_stock":          10100,        <-- NOTE: sold_stock (not sold_total)
         "average_cost":        100,
         "revaluation_amount":  0,
         "last_purchased_date": "2026-04-08T03:55:12.693+05:30",  <-- NOTE: last_purchased_date
         "last_sold_date":      "2026-04-08T03:57:47.329+05:30",  <-- NOTE: last_sold_date
         "status":              "in_stock"
       }
     ],
     "total_products":    2,
     "in_stock_count":    2,
     "low_stock_count":   0,
     "out_of_stock_count": 0,
     "total_quantity":    450
   }
═══════════════════════════════════════════════════════════════════ */
export interface DashboardStockItem {
  product_id:          string;
  product_name:        string;
  current_stock:       number;
  available_stock:     number;
  reserved_stock:      number;
  /** Total units ever purchased — API field name: purchased_stock */
  purchased_stock:     number;
  /** Total units ever sold — API field name: sold_stock */
  sold_stock:          number;
  average_cost:        number;
  revaluation_amount:  number;
  /** ISO date string — API field name: last_purchased_date */
  last_purchased_date: string | null;
  /** ISO date string — API field name: last_sold_date */
  last_sold_date:      string | null;
  status:              'in_stock' | 'low_stock' | 'out_of_stock';
}

/** Backward-compat alias — prefer DashboardStockItem for new code */
export type StockItem = DashboardStockItem;

export interface DashboardStockResponse {
  data:               DashboardStockItem[];
  total_products:     number;
  in_stock_count:     number;
  low_stock_count:    number;
  out_of_stock_count: number;
  total_quantity:     number;
}

/* ═══════════════════════════════════════════════════════════════════
   ENDPOINT 3 — GET /api/stock/product/:id/movements?offset=0&limit=10
═══════════════════════════════════════════════════════════════════ */
export interface StockMovement {
  id:                 number;
  product_id:         string;
  movement_type:      string;
  quantity:           number;
  rate:               number;
  amount:             number;
  reference_type:     string;
  reference_id:       string;
  reference_number:   string;
  balance_before_qty: number;
  balance_after_qty:  number;
  notes:              string;
  created_at:         string;
}

export interface StockMovementResponse {
  movements: StockMovement[];
  total:     number;
}

/* ═══════════════════════════════════════════════════════════════════
   stockService
═══════════════════════════════════════════════════════════════════ */
export const stockService = {

  // ─────────────────────────────────────────────────────────────────
  // GET /api/stock/summary
  //
  // Variant-level stock rows. Key field names (different from dashboard):
  //   purchased_total  | sold_total | last_purchased | last_sold
  //
  // Pass optional viewUserId to filter stock for a specific user (superadmin only).
  // Used by: Stock tab in Dashboard
  // ─────────────────────────────────────────────────────────────────
  async getStockSummary(viewUserId?: number): Promise<StockSummaryResponse> {
    const params = new URLSearchParams();
    if (viewUserId) {
      params.append('view_user_id', String(viewUserId));
    }
    const url = `${API_BASE_URL}/api/stock/summary${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Stock summary API error: ${response.status} ${response.statusText} — ${errorText}`
      );
    }

    const result: StockSummaryResponse = await response.json();
    return result;
  },

  // ─────────────────────────────────────────────────────────────────
  // GET /dashboard/stock
  //
  // Product-level rows with status flags. Key field names (different from summary):
  //   purchased_stock | sold_stock | last_purchased_date | last_sold_date
  //
  // Pass your dashboard base URL (e.g. config.dashboardDomain) as baseUrl.
  // Pass optional viewUserId to filter stock for a specific user (superadmin only).
  // Used by: Inventory tab in Dashboard
  // ─────────────────────────────────────────────────────────────────
  async getDashboardStock(baseUrl: string, viewUserId?: number): Promise<DashboardStockResponse> {
    const params = new URLSearchParams();
    if (viewUserId) {
      params.append('view_user_id', String(viewUserId));
    }
    const url = `${baseUrl}/dashboard/stock${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Dashboard stock API error: ${response.status} ${response.statusText} — ${errorText}`
      );
    }

    const result: DashboardStockResponse = await response.json();
    return result;
  },

  // ─────────────────────────────────────────────────────────────────
  // GET /api/stock/product/:productId/movements?offset=0&limit=10
  // ─────────────────────────────────────────────────────────────────
  async getProductMovements(
    productId: string,
    offset = 0,
    limit  = 10
  ): Promise<StockMovementResponse> {
    const params = new URLSearchParams({
      offset: String(offset),
      limit:  String(limit),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/stock/product/${productId}/movements?${params}`,
      { method: 'GET', headers: getHeaders() }
    );

    return handleResponse(response);
  },

  // ─────────────────────────────────────────────────────────────────
  // Convenience: find one variant by product_id from /api/stock/summary.
  // Returns null on error or not found.
  // ─────────────────────────────────────────────────────────────────
  async getStockByProductId(productId: string): Promise<StockSummaryItem | null> {
    try {
      const { stocks } = await this.getStockSummary();
      return stocks.find((s) => s.product_id === productId) ?? null;
    } catch (error) {
      console.error('Error fetching stock by product ID:', error);
      return null;
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // Convenience: sum available_stock across ALL variants of a product.
  // Returns null on error.
  // ─────────────────────────────────────────────────────────────────
  async getAvailableStock(productId: string): Promise<number | null> {
    try {
      const { stocks } = await this.getStockSummary();
      const total = stocks
        .filter((s) => s.product_id === productId)
        .reduce((sum, s) => sum + s.available_stock, 0);
      return total > 0 ? total : null;
    } catch (error) {
      console.error('Error fetching available stock:', error);
      return null;
    }
  },
};