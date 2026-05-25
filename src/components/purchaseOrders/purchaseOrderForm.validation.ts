import * as Yup from 'yup';

export const purchaseOrderValidationSchema = Yup.object({
  vendor_id: Yup.number()
    .typeError('Vendor is required')
    .required('Vendor is required')
    .min(1, 'Please select a valid vendor'),
  reference_no: Yup.string().optional(),
  date: Yup.string().required('Date is required'),
  delivery_date: Yup.string()
    .required('Delivery date is required')
    .test(
      'delivery-date-after-date',
      'Delivery date must be after or equal to date',
      function (value) {
        const { date } = this.parent;
        if (!date || !value) return true;
        return new Date(value) >= new Date(date);
      }
    ),
  payment_terms: Yup.string().required('Payment terms is required'),
  shipment_preference: Yup.string().optional(),
  line_items: Yup.array()
    .of(
      Yup.object({
        product_id: Yup.string().optional(),
        product_name: Yup.string().optional(),
        sku: Yup.string().optional(),
        account: Yup.string().required('Account is required'),
        quantity: Yup.number()
          .required('Quantity is required')
          .positive('Quantity must be greater than 0'),
        rate: Yup.number()
          .required('Rate is required')
          .min(0, 'Rate must be non-negative'),
      })
    )
    .min(1, 'At least one line item is required'),
  discount: Yup.number().optional().min(0, 'Discount cannot be negative'),
  discount_type: Yup.string().optional().oneOf(['percentage', 'amount']),
  tax_type: Yup.string().optional(),
  tax_id: Yup.number().optional(),
  adjustment: Yup.number().optional().min(0, 'Adjustment cannot be negative'),
  notes: Yup.string().optional(),
  terms_and_conditions: Yup.string().optional(),
  attachments: Yup.array().of(Yup.string()).optional(),
});
