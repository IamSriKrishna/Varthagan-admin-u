import * as Yup from "yup";

export const purchaseDispenseValidationSchema = Yup.object({
  purchase_order_id: Yup.string().required("Purchase order is required"),

  purchase_claim_id: Yup.string().required("Purchase claim is required"),

  purchase_claim_item_id: Yup.number()
    .typeError("Claim item is required")
    .positive("Claim item is required")
    .required("Claim item is required"),

  quantity: Yup.number()
    .typeError("Quantity is required")
    .moreThan(0, "Quantity must be greater than zero")
    .required("Quantity is required"),

  unit: Yup.string().trim().required("Unit is required"),

  dispense_date: Yup.string().required("Dispense date is required"),

  notes: Yup.string().max(2000, "Notes cannot exceed 2000 characters"),
});
