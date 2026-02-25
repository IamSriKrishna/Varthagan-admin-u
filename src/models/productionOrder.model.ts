export interface ProductionOrderItem {
  id: number;
  item_group_component_id: number;
  item_id: string;
  item_name: string;
  variant_sku: string;
  quantity_required: number;
  quantity_consumed: number;
  inventory_synced?: boolean;
}

export interface ProductionOrder {
  id: string;
  production_order_no: string;
  item_group_id: string;
  item_group_name: string;
  quantity_to_manufacture: number;
  quantity_manufactured: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string | null;
  actual_end_date: string | null;
  manufactured_date: string | null;
  inventory_synced: boolean;
  notes?: string;
  production_order_items: ProductionOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateProductionOrderRequest {
  item_group_id: string;
  quantity_to_manufacture: number;
  planned_start_date: string;
  planned_end_date: string;
  notes?: string;
}

export interface UpdateProductionOrderRequest {
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  quantity_manufactured?: number;
  actual_start_date?: string;
  actual_end_date?: string;
  manufactured_date?: string;
  notes?: string;
}

export interface ProductionOrderResponse {
  success: boolean;
  data: ProductionOrder;
  message: string;
  warnings?: string[];
}

export interface ProductionOrdersListResponse {
  success: boolean;
  data: {
    production_orders: ProductionOrder[];
    total: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  message: string;
}

export interface DeleteProductionOrderResponse {
  success: boolean;
  data: {
    id: string;
    production_order_no: string;
    deleted_at: string;
  };
  message: string;
}

export interface SearchProductionOrdersResponse {
  success: boolean;
  data: {
    production_orders: ProductionOrder[];
    total: number;
  };
  message: string;
}
