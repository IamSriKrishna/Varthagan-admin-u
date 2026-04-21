import {
  CreateProductRequest,
  ProductFormData,
  ProductVariantFormData,
  AttributeDefinition,
  ProductDetailsInput,
} from '@/models/product';

/**
 * Initialize form data for creating a new product
 */
export const getInitialProductFormData = (): ProductFormData => ({
  name: '',
  unit: 'pieces',
  base_sku: '',
  upc: '',
  ean: '',
  description: '',
  manufacturer_id: null,
  sales_account: '',
  selling_price: 0,
  markup_percent: 0,
  purchase_account: '',
  cost_price: 0,
  preferred_vendor_id: undefined,
  attribute_definitions: [],
  variants: [],
});

/**
 * Calculate profit from cost and selling price
 */
export const calculateProfit = (
  sellingPrice: number,
  costPrice: number
): number => {
  return sellingPrice - costPrice;
};

/**
 * Calculate profit percentage from cost and selling price
 */
export const calculateProfitPercent = (
  sellingPrice: number,
  costPrice: number
): number => {
  if (costPrice === 0) return 0;
  return ((sellingPrice - costPrice) / costPrice) * 100;
};

/**
 * Calculate selling price from cost price and markup percentage
 */
export const calculateSellingPriceFromMarkup = (
  costPrice: number,
  markupPercent: number
): number => {
  if (costPrice === 0) return 0;
  return costPrice + (costPrice * markupPercent) / 100;
};

/**
 * Transform form data into API request payload
 */
export const transformFormDataToPayload = (
  formData: ProductFormData
): CreateProductRequest => {
  return {
    name: formData.name,
    product_details: {
      unit: formData.unit,
      base_sku: formData.base_sku,
      upc: formData.upc && formData.upc.trim() ? formData.upc : undefined,
      ean: formData.ean && formData.ean.trim() ? formData.ean : undefined,
      description: formData.description && formData.description.trim() ? formData.description : undefined,
      manufacturer_id: formData.manufacturer_id !== null ? formData.manufacturer_id : null,
      attribute_definitions:
        formData.attribute_definitions && formData.attribute_definitions.length > 0
          ? formData.attribute_definitions
          : undefined,
      variants:
        formData.variants && formData.variants.length > 0
          ? formData.variants.map(v => ({
              sku: v.sku || '',
              variant_name: v.variant_name || '',
              attribute_map: v.attribute_map || {},
              selling_price: Number(v.selling_price) || 0,
              cost_price: Number(v.cost_price) || 0,
              stock_quantity: Number(v.stock_quantity) || 0,
              is_active: v.is_active !== undefined ? v.is_active : true,
            }))
          : undefined,
    },
    sales_info: {
      account: formData.sales_account,
      selling_price: Number(formData.selling_price) || 0,
      markup_percent: Number(formData.markup_percent) || 0,
    },
    purchase_info: {
      account: formData.purchase_account,
      cost_price: Number(formData.cost_price) || 0,
      preferred_vendor_id: formData.preferred_vendor_id || null,
    },
  };
};

/**
 * Initialize a new variant form data
 */
export const getInitialVariantFormData = (): ProductVariantFormData => ({
  sku: '',
  variant_name: '',
  attribute_map: {},
  selling_price: 0,
  cost_price: 0,
  profit: 0,
  profit_percent: 0,
  stock_quantity: 0,
  is_active: true,
});

/**
 * Generate variant name from attribute map
 */
export const generateVariantName = (
  attributeMap: Record<string, string>,
  baseName?: string
): string => {
  if (!attributeMap || Object.keys(attributeMap).length === 0) {
    return baseName || 'Default Variant';
  }

  const attributes = Object.entries(attributeMap)
    .map(([key, value]) => `${value}`)
    .join(' / ');

  return attributes || baseName || 'Variant';
};

/**
 * Generate SKU from base SKU and variant attributes
 */
export const generateVariantSku = (
  baseSku: string,
  attributeMap: Record<string, string>
): string => {
  if (!attributeMap || Object.keys(attributeMap).length === 0) {
    return baseSku;
  }

  const attributes = Object.values(attributeMap)
    .map(v => v.substring(0, 2).toUpperCase())
    .join('-');

  return `${baseSku}-${attributes}`;
};

/**
 * Validate attribute definitions
 */
export const validateAttributeDefinitions = (
  attributes: AttributeDefinition[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!attributes || attributes.length === 0) {
    return { valid: true, errors: [] };
  }

  attributes.forEach((attr, index) => {
    if (!attr.key || attr.key.trim() === '') {
      errors.push(`Attribute ${index + 1}: Name is required`);
    }

    if (!attr.options || attr.options.length === 0) {
      errors.push(`Attribute ${index + 1}: At least 1 option is required`);
    }

    // Check for duplicate options
    const uniqueOptions = new Set(attr.options);
    if (uniqueOptions.size !== attr.options.length) {
      errors.push(`Attribute ${index + 1}: Duplicate options found`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate variant combinations with attributes
 */
export const validateVariantsAgainstAttributes = (
  variants: ProductVariantFormData[] | any[],
  attributes: AttributeDefinition[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!attributes || attributes.length === 0) {
    // No attributes defined, variants are optional
    return { valid: true, errors: [] };
  }

  if (!variants || variants.length === 0) {
    return {
      valid: false,
      errors: [
        'At least one variant is required when attributes are defined',
      ],
    };
  }

  variants.forEach((variant, index) => {
    // Check if all attribute keys have values
    attributes.forEach(attr => {
      if (!variant.attribute_map || !variant.attribute_map[attr.key]) {
        errors.push(
          `Variant ${index + 1}: Missing value for attribute "${attr.key}"`
        );
      } else {
        // Validate that the value is in the defined options
        if (!attr.options.includes(variant.attribute_map[attr.key])) {
          errors.push(
            `Variant ${index + 1}: Invalid value "${variant.attribute_map[attr.key]}" for attribute "${attr.key}"`
          );
        }
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Generate all possible variant combinations from attributes
 */
export const generateVariantCombinations = (
  attributes: AttributeDefinition[]
): Record<string, string>[] => {
  if (!attributes || attributes.length === 0) {
    return [{}];
  }

  const combinations: Record<string, string>[] = [{}];

  attributes.forEach(attr => {
    const newCombinations: Record<string, string>[] = [];

    combinations.forEach(combo => {
      attr.options.forEach(option => {
        newCombinations.push({
          ...combo,
          [attr.key]: option,
        });
      });
    });

    combinations.length = 0;
    combinations.push(...newCombinations);
  });

  return combinations;
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Format profit percentage for display
 */
export const formatProfitPercent = (profitPercent: number): string => {
  return profitPercent.toFixed(2);
};
