import { config } from "@/config";
import { coupon } from "@/constants/apiConstants";
import { ICoupon } from "@/models/ICoupon";
import useApi from "../useApi";
type AddCouponResponse = {
  data: ICoupon;
  id: string;
  success: boolean;
  message: string;
};

const useAddCoupon = (): {
  addOrUpdateCoupons: (productData: ICoupon, couponId?: string) => Promise<AddCouponResponse>;
  loading: boolean;
} => {
  const { mutateApi: createCoupon, loading: createLoading } = useApi(
    coupon.getCoupons,
    "POST",
    undefined,
    config.orderDomain,
  );
  const updateApiPath = (id: string) => coupon.getCouponById(id);
  const { mutateApi: updateCoupons, loading: updateLoading } = useApi("", "PUT", undefined, config.orderDomain);

  const addOrUpdateCoupons = async (couponsData: ICoupon, couponId?: string): Promise<AddCouponResponse> => {
    const payload = {
      title: couponsData.title,
      code: couponsData.code,
      coupon_type: couponsData.coupon_type,
      scope: couponsData.scope,
      description: couponsData.description,
      terms_and_conditions: couponsData.terms_and_conditions,
      starts_at: couponsData.starts_at,
      expires_at: couponsData.expires_at,
      is_active: couponsData.is_active,
      max_discount: couponsData.coupon_type == "percentage" ? Number(couponsData.max_discount) : undefined,
      discount_value: Number(couponsData.discount_value),
      min_order_value: Number(couponsData.min_order_value),
      max_usage_total: Number(couponsData.max_usage_total),
      max_usage_per_customer: Number(couponsData.max_usage_per_customer),
      vendor_id: couponsData.scope == "vendor" ? couponsData.vendor_id : undefined,
      category_id: couponsData.scope == "category" ? couponsData.category_id : undefined,
      customer_id: couponsData.scope == "customer" ? couponsData.customer_id : undefined,
    };
    const response = couponId ? await updateCoupons(payload, updateApiPath(couponId)) : await createCoupon(payload);

    return response as AddCouponResponse;
  };

  return {
    addOrUpdateCoupons,
    loading: createLoading || updateLoading,
  };
};

export default useAddCoupon;
