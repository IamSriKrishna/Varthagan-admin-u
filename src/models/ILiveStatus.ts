export interface LiveStatusResponse {
  customers: {
    total: number;
    active: number;
  };
  vendors: {
    total: number;
    active: number;
  };
  products: {
    total: number;
    total_stock: number;
    low_stock_items: number;
    out_of_stock_items: number;
  };
  stock: {
    total_items: number;
    total_quantity: number;
    low_stock: number;
    out_of_stock: number;
  };
  last_updated_at: string;
  generated_at: string;
}
