import * as Yup from 'yup';

export const salesOrderValidationSchema = Yup.object({
  customer_id: Yup.number()
    .typeError('Customer is required')
    .required('Customer is required')
    .min(1, 'Please select a valid customer'),
  salesperson_id: Yup.number().optional(),
  reference_no: Yup.string()
    .required('Reference number is required')
    .min(3, 'Reference number must be at least 3 characters'),
  // Support both sales_order_date and date field (Step 5 format)
  sales_order_date: Yup.string().optional(),
  date: Yup.string().optional(),
  // Support both expected_shipment_date and delivery_date (Step 5 format)
  expected_shipment_date: Yup.string().optional(),
  delivery_date: Yup.string().optional(),
  payment_terms: Yup.string().required('Payment terms is required'),
  delivery_method: Yup.string().optional(),
  shipment_preference: Yup.string().optional(),
  line_items: Yup.array()
    .of(
      Yup.object({
        product_id: Yup.string().required('Product is required'),
        product_name: Yup.string().optional(),
        description: Yup.string().optional(),
        sku: Yup.string().optional(),
        account: Yup.string().optional(),
        quantity: Yup.number()
          .required('Quantity is required')
          .positive('Quantity must be greater than 0'),
        rate: Yup.number()
          .required('Rate is required')
          .min(0, 'Rate must be non-negative'),
        delivered_quantity: Yup.number().optional().min(0, 'Delivered quantity cannot be negative'),
        variant_id: Yup.number().optional(),
        variant_sku: Yup.string().optional(),
        variant_details: Yup.object().optional(),
      })
    )
    .min(1, 'At least one line item is required'),
  shipping_charges: Yup.number()
    .optional()
    .min(0, 'Shipping charges cannot be negative'),
  shipping: Yup.number()
    .optional()
    .min(0, 'Shipping cannot be negative'),
  tax_id: Yup.number().optional(),
  tax_rate: Yup.number().optional(),
  adjustment: Yup.number()
    .optional()
    .min(0, 'Adjustment cannot be negative'),
  customer_notes: Yup.string().optional(),
  notes: Yup.string().optional(),
  terms_and_conditions: Yup.string().optional(),
});
