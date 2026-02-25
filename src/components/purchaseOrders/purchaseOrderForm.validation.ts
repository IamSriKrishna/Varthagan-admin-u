import * as Yup from 'yup';

export const purchaseOrderValidationSchema = Yup.object({
  vendor_id: Yup.number()
    .typeError('Vendor is required')
    .required('Vendor is required')
    .min(1, 'Please select a valid vendor'),
  delivery_address_type: Yup.string()
    .required('Delivery address type is required')
    .oneOf(['organization', 'customer']),
  organization_name: Yup.string().when('delivery_address_type', {
    is: 'organization',
    then: (schema) => schema.required('Organization name is required').min(1, 'Organization name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  organization_address: Yup.string().when('delivery_address_type', {
    is: 'organization',
    then: (schema) => schema.required('Organization address is required').min(1, 'Organization address is required'),
    otherwise: (schema) => schema.optional(),
  }),
  customer_id: Yup.number().when('delivery_address_type', {
    is: 'customer',
    then: (schema) =>
      schema.typeError('Customer is required').required('Customer is required').min(1, 'Please select a valid customer'),
    otherwise: (schema) => schema.optional(),
  }),
  reference_no: Yup.string()
    .required('Reference number is required')
    .min(3, 'Reference number must be at least 3 characters'),
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
  shipment_preference: Yup.string().required('Shipment preference is required'),
  line_items: Yup.array()
    .of(
      Yup.object({
        item_id: Yup.string().required('Item is required'),
        account: Yup.string().required('Account is required'),
        quantity: Yup.number()
          .required('Quantity is required')
          .positive('Quantity must be greater than 0'),
        rate: Yup.number()
          .required('Rate is required')
          .min(0, 'Rate must be non-negative'),
        variant_id: Yup.number().optional(),
        variant_details: Yup.object().optional(),
      })
    )
    .min(1, 'At least one line item is required'),
  discount: Yup.number()
    .required('Discount is required')
    .min(0, 'Discount cannot be negative'),
  discount_type: Yup.string()
    .required('Discount type is required')
    .oneOf(['percentage', 'amount']),
  tax_type: Yup.string()
    .required('Tax type is required')
    .oneOf(['tds', 'tcs']),
  tax_id: Yup.number()
    .typeError('Tax is required')
    .required('Tax is required')
    .min(1, 'Please select a valid tax'),
  adjustment: Yup.number()
    .required('Adjustment is required')
    .min(0, 'Adjustment cannot be negative'),
  notes: Yup.string().optional(),
  terms_and_conditions: Yup.string().optional(),
});
