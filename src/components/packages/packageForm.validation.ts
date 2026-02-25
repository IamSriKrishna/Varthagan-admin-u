import * as Yup from 'yup';

export const packageValidationSchema = Yup.object().shape({
  sales_order_id: Yup.string()
    .required('Sales Order is required'),
  customer_id: Yup.number()
    .required('Customer is required')
    .positive('Customer must be selected'),
  package_date: Yup.string()
    .required('Package date is required'),
  items: Yup.array()
    .of(
      Yup.object().shape({
        sales_order_item_id: Yup.number().required('Item ID is required'),
        ordered_qty: Yup.number().required('Ordered quantity is required'),
        packed_qty: Yup.number()
          .required('Packed quantity is required')
          .min(0, 'Packed quantity cannot be negative')
          .typeError('Packed quantity must be a number'),
      })
    )
    .min(1, 'At least one item is required'),
  internal_notes: Yup.string(),
});
