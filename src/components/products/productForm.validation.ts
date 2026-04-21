import * as Yup from 'yup';

export const productFormValidationSchema = Yup.object({
  // Basic Info
  name: Yup.string()
    .required('Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name cannot exceed 200 characters'),

  unit: Yup.string()
    .required('Unit is required'),

  base_sku: Yup.string()
    .required('Base SKU is required')
    .min(2, 'Base SKU must be at least 2 characters'),

  upc: Yup.string().optional(),
  ean: Yup.string().optional(),

  description: Yup.string()
    .optional()
    .max(1000, 'Description cannot exceed 1000 characters'),

  manufacturer_id: Yup.number().required('Manufacturer is required').nullable(),

  // Sales Info
  sales_account: Yup.string()
    .required('Sales account is required'),

  selling_price: Yup.number()
    .required('Selling price is required')
    .min(0, 'Selling price cannot be negative')
    .typeError('Selling price must be a number'),

  markup_percent: Yup.number()
    .required('Markup percent is required')
    .min(0, 'Markup percent cannot be negative')
    .typeError('Markup percent must be a number'),

  // Purchase Info
  purchase_account: Yup.string()
    .required('Purchase account is required'),

  cost_price: Yup.number()
    .required('Cost price is required')
    .min(0, 'Cost price cannot be negative')
    .typeError('Cost price must be a number'),

  preferred_vendor_id: Yup.number().optional().nullable(),

  // Attributes & Variants
  attribute_definitions: Yup.array().optional(),

  variants: Yup.array()
    .of(
      Yup.object({
        sku: Yup.string()
          .required('Variant SKU is required'),

        variant_name: Yup.string()
          .required('Variant name is required'),

        attribute_map: Yup.object().required('Attribute mapping is required'),

        selling_price: Yup.number()
          .required('Variant selling price is required')
          .min(0, 'Variant selling price cannot be negative'),

        cost_price: Yup.number()
          .required('Variant cost price is required')
          .min(0, 'Variant cost price cannot be negative'),

        stock_quantity: Yup.number()
          .required('Stock quantity is required')
          .min(0, 'Stock quantity cannot be negative'),

        is_active: Yup.boolean(),
      })
    )
    .optional(),
});

// Schema for attribute definitions
export const attributeDefinitionSchema = Yup.object({
  key: Yup.string()
    .required('Attribute name is required'),
  options: Yup.array()
    .of(Yup.string().required('Option cannot be empty'))
    .min(1, 'At least one option is required'),
});

// Schema for product variants
export const productVariantSchema = Yup.object({
  sku: Yup.string()
    .required('SKU is required'),
  variant_name: Yup.string()
    .required('Variant name is required'),
  selling_price: Yup.number()
    .required('Selling price is required')
    .min(0, 'Selling price cannot be negative'),
  cost_price: Yup.number()
    .required('Cost price is required')
    .min(0, 'Cost price cannot be negative'),
  attribute_map: Yup.object().required('Attribute mapping is required'),
  stock_quantity: Yup.number()
    .required('Stock quantity is required')
    .min(0, 'Stock quantity cannot be negative'),
  is_active: Yup.boolean(),
});
