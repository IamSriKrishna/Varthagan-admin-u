
import dayjs from "dayjs";
import {
  CreatePurchaseClaimRequest,
  PurchaseClaim,
  PurchaseClaimFormValues,
  PurchaseOrderClaimSourceItem,
} from "@/models/purchaseClaim.model";

export const initialPurchaseClaimValues: PurchaseClaimFormValues = {
  purchase_order_id: "",
  date: dayjs().format("YYYY-MM-DD"),
  notes: "",
  items: [
    {
      purchase_order_item_id: "",
      type: "missing",
      quantity: "",
      unit: "",
      reason: "",
      action: "replacement",
    },
  ],
};

export function createEmptyPurchaseClaimItem() {
  return {
    purchase_order_item_id: "" as const,
    type: "missing" as const,
    quantity: "" as const,
    unit: "",
    reason: "",
    action: "replacement" as const,
  };
}

export function getDefaultClaimUnit(
  item?: PurchaseOrderClaimSourceItem
): string {
  if (!item) return "";

  if (item.is_raw_material) {
    return item.ordered_unit || "kg";
  }

  return item.base_unit || item.ordered_unit || "pieces";
}

export function convertClaimToBaseQuantity(
  quantity: number,
  unit: string,
  isRawMaterial: boolean
): number {
  if (!isRawMaterial) return quantity;

  switch (unit.trim().toLowerCase()) {
    case "kg":
    case "kilogram":
    case "kilograms":
      return quantity * 1000;

    case "g":
    case "gram":
    case "grams":
      return quantity;

    case "mg":
    case "milligram":
    case "milligrams":
      return quantity / 1000;

    case "ton":
    case "tons":
    case "tonne":
    case "tonnes":
      return quantity * 1_000_000;

    default:
      return quantity;
  }
}

export function getMaximumClaimQuantity(
  item: PurchaseOrderClaimSourceItem,
  claimType: "missing" | "damaged"
): number {
  return claimType === "missing"
    ? item.missing_remaining_base
    : item.damaged_remaining_base;
}

export function transformPurchaseClaimToPayload(
  values: PurchaseClaimFormValues
): CreatePurchaseClaimRequest {
  return {
    purchase_order_id: values.purchase_order_id,
    date: dayjs(values.date).startOf("day").toISOString(),
    notes: values.notes.trim(),
    items: values.items.map((item) => ({
      purchase_order_item_id: Number(
        item.purchase_order_item_id
      ),
      type: item.type,
      quantity: Number(item.quantity),
      unit: item.unit.trim(),
      reason: item.reason.trim(),
      action: item.action,
    })),
  };
}

export function mapPurchaseClaimToFormValues(
  claim: PurchaseClaim
): PurchaseClaimFormValues {
  return {
    purchase_order_id: claim.purchase_order_id || "",
    date: dayjs(claim.date).format("YYYY-MM-DD"),
    notes: claim.notes || "",
    items: (claim.items || []).map((item) => ({
      purchase_order_item_id: item.purchase_order_item_id || "",
      type: item.type,
      quantity: item.quantity || "",
      unit: item.unit || "",
      reason: item.reason || "",
      action: item.action,
    })),
  };
}
