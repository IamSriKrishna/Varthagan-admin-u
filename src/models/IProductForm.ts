export interface IProductForm {
  productName: string;
  description: string;
  type: string;
  max_bb_coins: string | number;
  deal_amount?: string | number;
  gst_percentage?: string | number;
  list_price: string | number;
  product_discount?: string | number;
  profile_id?: string | number;
  discount_type?: string;
  categoryId: string;
  tagIds?: string[];
  images: unknown[];
  is_combo?: boolean;
  is_popular?: boolean;
  is_active?: boolean;
  has_style?: boolean;
  is_dynamic?: boolean;
  is_deliverable?: boolean;
  style_data?: string;
}
