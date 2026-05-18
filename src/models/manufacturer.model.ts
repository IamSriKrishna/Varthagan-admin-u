export interface ManufacturerEmployee {
  id?: number;
  manufacturer_id?: string;
  employee_id: number;
  employee?: {
    id: number;
    name: string;
    email: string;
    number: string;
  };
  service_cost: number;
  cost_type: 'fixed' | 'per_unit';
  created_at?: string;
  updated_at?: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  product_group_id: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed';
  description?: string;
  employees: ManufacturerEmployee[];
  created_at: string;
  updated_at: string;
}

export interface CreateManufacturerRequest {
  name: string;
  product_group_id: string;
  quantity: number;
  description?: string;
  employees: ManufacturerEmployee[];
}

export interface UpdateManufacturerRequest {
  name?: string;
  quantity?: number;
  status?: 'pending' | 'in_progress' | 'completed';
  description?: string;
  employees?: ManufacturerEmployee[];
}

export interface ManufacturerResponse {
  success: boolean;
  data: Manufacturer;
  message?: string;
}

export interface ManufacturersListResponse {
  success: boolean;
  data: {
    manufacturers: Manufacturer[];
    total_count: number;
  };
}

export interface DeleteManufacturerResponse {
  success: boolean;
  message: string;
}
