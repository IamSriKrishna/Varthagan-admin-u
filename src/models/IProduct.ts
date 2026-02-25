export interface IProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  image_type?: string;
}

export interface IProduct {
  id: string;
  product_name: string;
  images?: IProductImage[];
  description: string;
  is_active: boolean;
  type: string;
  category_id: string;
  // tag_ids: string[];
  tag_ids?: string[] | string | null;
  rating_summary: number;
  deal_amount: number;
  list_price: number;
  product_discount: number;
  discount_type: string;
  max_bb_coins: number | string;
  created_at: string;
  updated_at: string;
  // is_combo?: boolean;
  // is_popular?: boolean;
  metadata?: string;
  is_dynamic?: boolean;
  is_deliverable?: boolean;
  has_style?: boolean;
  style_data?: string;
  gst_percentage?: number;
}

export type IProducts = {
  data: {
    products: IProduct[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};
