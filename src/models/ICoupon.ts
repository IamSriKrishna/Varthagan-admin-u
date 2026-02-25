export interface ICoupon {
  id?: string;

  title: string;
  code: string;

  coupon_type?: "flat" | "percentage" | "cashback";
  scope?: "public" | "vendor" | "customer" | "hidden" | "category";

  discount_value?: number | string;
  max_discount?: number | string;
  min_order_value?: number | string;

  max_usage_total?: number | string;
  max_usage_per_customer?: number | string;

  vendor_id?: string;
  customer_id?: string;
  category_id?: string;

  description: string;
  terms_and_conditions?: string;

  is_active?: boolean;

  starts_at?: string | null;
  expires_at?: string | null;

  created_at?: string;
  updated_at?: string;

  current_usage_count?: number;
  expires_in_days?: number;
  is_expiring_soon?: boolean;
  is_expiring_today?: boolean;
}

export interface ICouponResponse {
  coupons: ICoupon[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
