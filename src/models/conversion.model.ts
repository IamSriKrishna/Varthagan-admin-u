// Conversion Rule
export interface IConversionRule {
  id: string;
  raw_product_id: string;
  raw_product_name: string;
  raw_product_spec: string;
  finished_product_id: string;
  finished_product_name: string;
  finished_product_spec: string;
  finished_variant_sku?: string;
  conversion_ratio: number;
  loss_percentage: number;
  is_active: boolean;
  notes?: string;
  created_by: string;
  created_by_user_name: string;
  created_at: string;
  updated_at: string;
}

// Conversion Rule Form
export interface IConversionRuleForm {
  raw_product_id: string;
  finished_product_id: string;
  finished_variant_sku?: string;
  conversion_ratio: number;
  loss_percentage: number;
  is_active: boolean;
  notes?: string;
}

// Bag Usage Input
export interface IRawMaterialBagInput {
  bag_id: string;
  finished_quantity: number;
}

// Bag Usage Output
export interface IConversionRecordBagUsage {
  id: string;
  bag_id: string;
  bag_number: number;
  product_id: string;
  product_name: string;
  quantity_used_kg: number;
  created_at: string;
}

// Conversion Execution Request
export interface IConversionExecutionRequest {
  conversion_id: string;
  raw_quantity_used?: number;
  raw_material_bags?: IRawMaterialBagInput[];
  conversion_date?: string;
  notes?: string;
  execute_conversion: boolean;
  finished_variant_sku?: string;
}

// Conversion Execution Response
export interface IConversionExecutionResponse {
  record_id: string;
  status: "COMPLETED" | "FAILED" | "PENDING";
  raw_product_name: string;
  raw_quantity_used: number;
  finished_product_name: string;
  finished_quantity_produced: number;
  loss_quantity: number;
  message: string;
  bags_used?: IConversionRecordBagUsage[];
}

// Conversion Record
export interface IConversionRecord {
  id: string;
  conversion_id: string;
  raw_product_id: string;
  raw_product_name: string;
  raw_quantity_used: number;
  finished_product_id: string;
  finished_product_name: string;
  finished_quantity_produced: number;
  loss_quantity: number;
  conversion_date: string;
  status: "COMPLETED" | "FAILED" | "PENDING";
  bags_used?: IConversionRecordBagUsage[];
  created_by_user_name: string;
  created_at: string;
}

// Paginated Response for Conversions
export interface IConversionsPaginatedResponse {
  conversions: IConversionRule[];
  total: number;
  page: number;
  limit: number;
}

// Paginated Response for Records
export interface IConversionRecordsPaginatedResponse {
  records: IConversionRecord[];
  total: number;
  page: number;
  limit: number;
}

// Query Params
export interface IConversionQueryParams {
  page?: number;
  limit?: number;
}

// Table Row Data
export interface IConversionTableRow {
  id: string;
  raw_product_name: string;
  raw_product_spec: string;
  finished_product_name: string;
  finished_product_spec: string;
  conversion_ratio: number;
  loss_percentage: number;
  is_active: boolean;
  created_by_user_name: string;
  created_at: string;
}

// Record Table Row
export interface IConversionRecordTableRow {
  id: string;
  raw_product_name: string;
  raw_quantity_used: number;
  finished_product_name: string;
  finished_quantity_produced: number;
  loss_quantity: number;
  conversion_date: string;
  status: string;
  created_by_user_name: string;
  created_at: string;
}
