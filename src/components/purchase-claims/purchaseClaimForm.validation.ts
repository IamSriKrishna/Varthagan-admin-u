
import * as Yup from "yup";

export const purchaseClaimValidationSchema = Yup.object({
  purchase_order_id: Yup.string().required(
    "Purchase order is required"
  ),

  date: Yup.string().required("Claim date is required"),

  notes: Yup.string().max(
    2000,
    "Notes cannot exceed 2000 characters"
  ),

  items: Yup.array()
    .of(
      Yup.object({
        purchase_order_item_id: Yup.number()
          .typeError("Purchase order item is required")
          .positive("Purchase order item is required")
          .required("Purchase order item is required"),

        type: Yup.string()
          .oneOf(["missing", "damaged"])
          .required("Claim type is required"),

        quantity: Yup.number()
          .typeError("Quantity is required")
          .moreThan(
            0,
            "Quantity must be greater than zero"
          )
          .required("Quantity is required"),

        unit: Yup.string()
          .trim()
          .required("Unit is required"),

        reason: Yup.string()
          .trim()
          .min(
            3,
            "Reason must contain at least 3 characters"
          )
          .required("Reason is required"),

        action: Yup.string()
          .oneOf([
            "replacement",
            "credit_note",
            "return_to_vendor",
            "scrap",
            "adjustment_only",
          ])
          .required("Resolution is required"),
      })
    )
    .min(1, "At least one claim item is required")
    .required(),
});
