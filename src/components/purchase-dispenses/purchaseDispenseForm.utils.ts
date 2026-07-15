import dayjs from "dayjs";
import { CreatePurchaseDispenseRequest, PurchaseDispenseFormValues } from "@/models/purchaseDispense.model";

export const initialPurchaseDispenseValues: PurchaseDispenseFormValues = {
  purchase_order_id: "",
  purchase_claim_id: "",
  purchase_claim_item_id: "",
  quantity: "",
  unit: "",
  dispense_date: dayjs().format("YYYY-MM-DD"),
  notes: "",
};

export function transformPurchaseDispenseToPayload(values: PurchaseDispenseFormValues): CreatePurchaseDispenseRequest {
  return {
    purchase_claim_item_id: Number(values.purchase_claim_item_id),
    quantity: Number(values.quantity),
    unit: values.unit.trim(),
    dispense_date: dayjs(values.dispense_date).startOf("day").toISOString(),
    notes: values.notes.trim(),
  };
}

export function getDispenseDefaultUnit(baseUnit: string, isRawMaterial: boolean): string {
  if (!isRawMaterial) {
    return baseUnit || "pieces";
  }

  if (baseUnit === "gram") {
    return "kg";
  }

  return baseUnit || "kg";
}

export function convertDispenseToBaseQuantity(quantity: number, unit: string, isRawMaterial: boolean): number {
  if (!isRawMaterial) {
    return quantity;
  }

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
