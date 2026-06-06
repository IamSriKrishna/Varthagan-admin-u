/**
 * Raw Material Bag Model
 */
export interface RawMaterialBag {
  id: string;
  purchase_order_id: string;
  purchase_order_no: string;
  vendor_id: number;
  vendor_name: string;
  product_id: string;
  product_name: string;
  bag_number: number;
  expected_kg: number;
  actual_kg: number;
  remaining_kg: number;
  status: "available" | "partial" | "consumed";
  created_at?: string;
  updated_at?: string;
}

/**
 * Raw Material Bag Data from POST request
 */
export interface ReceiveRawMaterialInput {
  purchase_order_id: string;
  product_id: string;
  expected_kg_per_bag: number;
  bags: Array<{
    bag_number: number;
    actual_kg: number;
  }>;
}

/**
 * Response for receiving raw material
 */
export interface ReceiveRawMaterialResponse {
  success: boolean;
  data: {
    purchase_order_id: string;
    product_id: string;
    product_name: string;
    expected_kg: number;
    actual_kg: number;
    shortage_kg: number;
    shortage_grams: number;
    bags: RawMaterialBag[];
  };
  message?: string;
}

/**
 * Response for listing raw materials
 */
export interface RawMaterialListResponse {
  success: boolean;
  data: {
    bags: RawMaterialBag[];
    total: number;
  };
  message?: string;
}

/**
 * Response for getting single raw material bag
 */
export interface RawMaterialResponse {
  success: boolean;
  data: RawMaterialBag;
  message?: string;
}

/**
 * Response for getting raw materials by product
 */
export interface RawMaterialByProductResponse {
  success: boolean;
  data: RawMaterialBag[];
  message?: string;
}

/**
 * Response for getting raw materials by purchase order
 */
export interface RawMaterialByPOResponse {
  success: boolean;
  data: RawMaterialBag[];
  message?: string;
}
