import {
  Package,
  CreatePackageRequest,
  PackageLineItem,
} from '@/models/package.model';

export const initialPackageValues: Package = {
  sales_order_id: '',
  customer_id: 0,
  package_date: new Date().toISOString().split('T')[0],
  items: [],
  internal_notes: '',
  status: 'created',
};

export const transformPackageToPayload = (
  pkg: Package
): CreatePackageRequest => {
  // Validate items
  if (!pkg.items || pkg.items.length === 0) {
    throw new Error('At least one item is required');
  }

  // Convert date to ISO format if it's just a date string
  const packageDate = pkg.package_date.includes('T')
    ? pkg.package_date
    : `${pkg.package_date}T00:00:00Z`;

  return {
    sales_order_id: pkg.sales_order_id,
    customer_id: pkg.customer_id,
    package_date: packageDate,
    items: pkg.items.map((item) => ({
      sales_order_item_id: item.sales_order_item_id,
      packed_qty: item.packed_qty,
    })),
    internal_notes: pkg.internal_notes || '',
  };
};

export const calculateTotalPacked = (items: PackageLineItem[]): number => {
  return items.reduce((total, item) => total + item.packed_qty, 0);
};

export const calculateTotalOrdered = (items: PackageLineItem[]): number => {
  return items.reduce((total, item) => total + item.ordered_qty, 0);
};
