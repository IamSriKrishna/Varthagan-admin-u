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
      Yup.object().shape(
        {
          product_id: Yup.string().optional(),
          product_name: Yup.string().optional(),
          sku: Yup.string().optional(),
          account: Yup.string().required('Account is required'),
          is_raw_material: Yup.boolean(),
          quantity: Yup.number().when('is_raw_material', {
            is: false,
            then: (schema) => schema
              .required('Quantity is required')
              .min(0.01, 'Quantity must be greater than 0'),
            otherwise: (schema) => schema.optional(),
          }),
          purchase_unit: Yup.string().optional(),
          rate: Yup.number()
            .required('Rate is required')
            .min(0.01, 'Rate must be greater than 0'),
          // Raw material fields
          raw_material_unit: Yup.string().when('is_raw_material', {
            is: true,
            then: (schema) => schema.required('Unit is required'),
            otherwise: (schema) => schema.optional(),
          }),
          number_of_packs: Yup.number().when('is_raw_material', {
            is: true,
            then: (schema) => schema
              .required('Number of packs is required')
              .min(1, 'Must be greater than 0'),
            otherwise: (schema) => schema.optional(),
          }),
          quantity_per_pack: Yup.number().when('is_raw_material', {
            is: true,
            then: (schema) => schema
              .required('Quantity per pack is required')
              .min(0.01, 'Must be greater than 0'),
            otherwise: (schema) => schema.optional(),
          }),
        }
      )
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
