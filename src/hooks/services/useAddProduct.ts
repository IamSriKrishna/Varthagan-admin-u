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
  data?: IProductResponse;
  id?: string;
  success: boolean;
  message?: string;
};

const buildProductPayload = (data: IProductForm) => {
  const payload: Record<string, unknown> = {
    name: data.name,
    is_resource: data.is_resource ?? false,
    is_raw: data.is_raw ?? false,
    resource_name: data.resource_name,
    resource_unit: data.resource_unit,
    resource_cost_per_unit: data.resource_cost_per_unit,
    product_details: data.product_details,
    sales_info: data.sales_info,
    purchase_info: data.purchase_info,
    return_policy: data.return_policy,
  };

  const inventory = (data as any)._inventory;
  if (inventory) {
    payload.inventory = inventory;
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
};

const useAddProduct = (): {
  addOrUpdateProduct: (productData: IProductForm, productId?: string) => Promise<AddProductResponse>;
  loading: boolean;
} => {
  const { mutateApi: createProduct, loading: createLoading } = useApi(products.postProduct, "POST");
  const updateApiPath = (id: string) => `${products.postProduct}/${id}`;
  const { mutateApi: updateProduct, loading: updateLoading } = useApi("", "PUT");

  const addOrUpdateProduct = async (productData: IProductForm, productId?: string): Promise<AddProductResponse> => {
    const payload = buildProductPayload(productData);
    const response = productId ? await updateProduct(payload, updateApiPath(productId)) : await createProduct(payload);

    if (response && typeof response === "object") {
      const normalized = response as Record<string, unknown>;
      return {
        ...(response as AddProductResponse),
        success: true,
        message: (normalized.message as string | undefined) || (productId ? "Product updated successfully" : "Product created successfully"),
        data: (normalized.data as IProductResponse | undefined) || (response as unknown as IProductResponse),
        id: (normalized.id as string | undefined) || (normalized.data as any)?.id || (response as any)?.id,
      } as AddProductResponse;
    }

    return { success: true, message: productId ? "Product updated successfully" : "Product created successfully" } as AddProductResponse;
  };

  return {
    addOrUpdateProduct,
    loading: createLoading || updateLoading,
  };
};

export default useAddProduct;
