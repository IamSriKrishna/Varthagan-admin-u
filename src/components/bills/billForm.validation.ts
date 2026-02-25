import * as Yup from 'yup';

export const billValidationSchema = Yup.object({
  vendor_id: Yup.number()
    .typeError('Vendor is required')
    .required('Vendor is required')
    .min(1, 'Please select a valid vendor'),
  billing_address: Yup.string()
    .required('Billing address is required')
    .min(5, 'Billing address must be at least 5 characters'),
  order_number: Yup.string()
    .required('Order number is required')
    .min(1, 'Order number is required'),
  bill_date: Yup.string()
    .required('Bill date is required'),
  due_date: Yup.string()
    .required('Due date is required')
    .test(
      'due-date-after-bill-date',
      'Due date must be after or equal to bill date',
      function (value) {
        const { bill_date } = this.parent;
        if (!bill_date || !value) return true;
        return new Date(value) >= new Date(bill_date);
      }
    ),
  payment_terms: Yup.string()
    .required('Payment terms is required'),
  subject: Yup.string()
    .required('Subject is required')
    .min(3, 'Subject must be at least 3 characters')
    .max(250, 'Subject must not exceed 250 characters'),
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
        description: Yup.string().optional(),
      })
    )
    .min(1, 'At least one line item is required'),
  discount: Yup.number()
    .required('Discount is required')
    .min(0, 'Discount cannot be negative'),
  tax_id: Yup.number()
    .typeError('Tax is required')
    .required('Tax is required')
    .min(1, 'Please select a valid tax'),
  adjustment: Yup.number()
    .required('Adjustment is required')
    .min(0, 'Adjustment cannot be negative'),
  notes: Yup.string().optional(),
});
