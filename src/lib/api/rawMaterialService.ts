import {
  RawMaterialBag,
  RawMaterialListResponse,
  RawMaterialResponse,
  ReceiveRawMaterialInput,
  ReceiveRawMaterialResponse,
  RawMaterialByProductResponse,
  RawMaterialByPOResponse,
} from "@/models/rawMaterial.model";
import { apiService } from "./api.service";

const RAW_MATERIAL_BASE_URL = "/raw-material-bags";

export const rawMaterialService = {
  async receiveBags(data: ReceiveRawMaterialInput): Promise<ReceiveRawMaterialResponse> {
    return apiService.post(`${RAW_MATERIAL_BASE_URL}/receive`, data);
  },

  async getBags(limit: number = 10, offset: number = 0): Promise<RawMaterialListResponse> {
    return apiService.get(`${RAW_MATERIAL_BASE_URL}?limit=${limit}&offset=${offset}`);
  },

  async getBagById(bagId: string): Promise<RawMaterialResponse> {
    return apiService.get(`${RAW_MATERIAL_BASE_URL}/${bagId}`);
  },

  async getBagsByProduct(productId: string): Promise<RawMaterialByProductResponse> {
    return apiService.get(`${RAW_MATERIAL_BASE_URL}/product/${productId}`);
  },

  async getBagsByPurchaseOrder(purchaseOrderId: string): Promise<RawMaterialByPOResponse> {
    return apiService.get(`${RAW_MATERIAL_BASE_URL}/purchase-order/${purchaseOrderId}`);
  },
};
