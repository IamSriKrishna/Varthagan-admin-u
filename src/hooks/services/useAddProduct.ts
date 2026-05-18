import { products } from "@/constants/apiConstants";
import { IProductForm } from "@/models/IProductForm";
import useApi from "../useApi";
type IProductResponse = {
  id: string;
  product_name: string;
  description: string;
  is_active: boolean;
  type: string;
  category_id: string;
  tag_ids: string[];
  deal_amount: number;
  product_discount: number;
  discount_type: "percentage" | "fixed";
  max_bb_coins: number;
  created_at?: string;
  updated_at?: string;
  has_style?: boolean;
  style_data?: string;
  profile_id?: string;
};
type AddProductResponse = {
  data: IProductResponse;
  id: string;
  success: boolean;
  message: string;
};

const useAddProduct = (): {
  addOrUpdateProduct: (productData: IProductForm, productId?: string) => Promise<AddProductResponse>;
  loading: boolean;
} => {
  const { mutateApi: createProduct, loading: createLoading } = useApi(products.postProduct, "POST");
  const updateApiPath = (id: string) => `${products.postProduct}/${id}`;
  const { mutateApi: updateProduct, loading: updateLoading } = useApi("", "PUT");

  const addOrUpdateProduct = async (productData: IProductForm, productId?: string): Promise<AddProductResponse> => {
    const data = productData as any;
    const profile_id =
      data.categoryId == "d6ac1894-91aa-4388-8053-1f3548234163"
        ? 1
        : data.categoryId == "af4c5c77-0715-4481-82f5-732c82115357"
          ? 2
          : null;
    const payload = {
      product_name: data.productName,
      description: data.description,
      is_active: data.is_active,
      type: data.type,
      category_id: data.categoryId,
      tag_ids: data.tagIds,
      list_price: Number(data.list_price),
      deal_amount: Number(data.deal_amount),
      gst_percentage: Number(data.gst_percentage),
      product_discount: Number(data.product_discount),
      discount_type: data.discount_type,
      max_bb_coins: Number(data.max_bb_coins),
      profile_id: profile_id,
      has_style: data.has_style,
      is_dynamic: data.is_dynamic,
      is_deliverable: data.is_deliverable,
      style_data: data.style_data ? data.style_data : "{}",
      metadata: JSON.stringify({
        is_combo: data.is_combo,
        is_popular: data.is_popular,
      }),
    };
    const response = productId ? await updateProduct(payload, updateApiPath(productId)) : await createProduct(payload);

    return response as AddProductResponse;
  };

  return {
    addOrUpdateProduct,
    loading: createLoading || updateLoading,
  };
};

export default useAddProduct;
