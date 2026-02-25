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
  sales_order_date: Yup.string().required('Sales Order date is required'),
  expected_shipment_date: Yup.string()
    .required('Expected shipment date is required')
    .test(
      'shipment-date-after-so-date',
      'Expected shipment date must be after or equal to sales order date',
      function (value) {
        const { sales_order_date } = this.parent;
        if (!sales_order_date || !value) return true;
        return new Date(value) >= new Date(sales_order_date);
      }
    ),
  payment_terms: Yup.string().required('Payment terms is required'),
  delivery_method: Yup.string().required('Delivery method is required'),
  line_items: Yup.array()
    .of(
      Yup.object({
        item_id: Yup.string().required('Item is required'),
        description: Yup.string().optional(),
        quantity: Yup.number()
          .required('Quantity is required')
          .positive('Quantity must be greater than 0'),
        rate: Yup.number()
          .required('Rate is required')
          .min(0, 'Rate must be non-negative'),
        variant_id: Yup.number().optional(),
        variant_sku: Yup.string().optional(),
        variant_details: Yup.object().optional(),
      })
    )
    .min(1, 'At least one line item is required'),
  shipping_charges: Yup.number()
    .required('Shipping charges is required')
    .min(0, 'Shipping charges cannot be negative'),
  tax_id: Yup.number()
    .typeError('Tax is required')
    .required('Tax is required')
    .test('tax-selected', 'Please select a valid tax', function (value) {
      return value !== null && value !== undefined && value > 0;
    }),
  adjustment: Yup.number()
    .required('Adjustment is required')
    .min(0, 'Adjustment cannot be negative'),
  customer_notes: Yup.string().optional(),
  notes: Yup.string().optional(),
  terms_and_conditions: Yup.string().optional(),
});
