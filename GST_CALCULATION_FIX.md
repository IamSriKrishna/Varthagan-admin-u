# GST Calculation Fix - Thermal Invoice

## Issue

The CGST and SGST were being calculated incorrectly from `payment_tax` instead of `gst` field, resulting in wrong tax amounts displayed on the invoice.

## Example Data

```json
{
  "subtotal_amount": 650,
  "bb_coins_discount": 10,
  "gst": 32,
  "total_amount": 672,
  "payment_tax": 2.42 // This is tax on payment gateway fee, NOT order GST
}
```

## Previous Incorrect Calculation

```
Subtotal:        ₹650.00
BB Coins Used:   -₹10.00
CGST (2.5%):     ₹1.21   ❌ WRONG (payment_tax / 2)
SGST (2.5%):     ₹1.21   ❌ WRONG (payment_tax / 2)
TOTAL:           ₹672.00
```

## Corrected Calculation

```
Subtotal:        ₹650.00
BB Coins Used:   -₹10.00
Taxable Amount:  ₹640.00  ✅ (650 - 10)
CGST (2.5%):     +₹16.00  ✅ (gst / 2 = 32 / 2)
SGST (2.5%):     +₹16.00  ✅ (gst / 2 = 32 / 2)
TOTAL:           ₹672.00  ✅ (640 + 16 + 16)
```

## Formula

```
Taxable Amount = Subtotal - BB Coins Discount - Membership Discount
CGST = gst / 2
SGST = gst / 2
Total = Taxable Amount + CGST + SGST
```

## Changes Made

### 1. Added `gst` field to IOrderList interface

**File**: `/src/models/IOrders.ts`

```typescript
export interface IOrderList {
  // ... existing fields
  gst_percentage: number;
  gst: number; // Total GST amount (CGST + SGST)
  paid_at: string;
  // ... rest of fields
}
```

### 2. Updated Payment Summary Section

**File**: `/src/app/(protected)/orders/order/[orderId]/page.tsx`

**Added Taxable Amount line:**

```tsx
<Stack direction="row" justifyContent="space-between">
  <Typography sx={{ fontSize: "13px" }}>Taxable Amount:</Typography>
  <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
    ₹
    {(
      orderData.subtotal_amount -
      (orderData.bb_coins_discount || 0) -
      (orderData.membership_discount_amount || 0)
    ).toFixed(2)}
  </Typography>
</Stack>
```

**Fixed CGST/SGST calculation:**

```tsx
{/* CGST and SGST Breakdown - Using gst field divided by 2 */}
<Stack direction="row" justifyContent="space-between">
  <Typography sx={{ fontSize: "13px" }}>CGST (2.5%):</Typography>
  <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
    +₹{((orderData.gst || 0) / 2).toFixed(2)}
  </Typography>
</Stack>
<Stack direction="row" justifyContent="space-between">
  <Typography sx={{ fontSize: "13px" }}>SGST (2.5%):</Typography>
  <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
    +₹{((orderData.gst || 0) / 2).toFixed(2)}
  </Typography>
</Stack>
```

## Invoice Structure

Now the invoice correctly shows:

1. **Subtotal**: Original order amount before any deductions
2. **BB Coins Used**: Discount applied using BB coins (shown as negative)
3. **Membership Discount**: Membership discount if applicable (shown as negative)
4. **Taxable Amount**: Amount after all discounts (subtotal - discounts)
5. **CGST (2.5%)**: Half of total GST (shown as positive with + sign)
6. **SGST (2.5%)**: Half of total GST (shown as positive with + sign)
7. **TOTAL**: Final amount including all taxes

## Key Points

- ✅ `payment_tax` is NOT the order GST - it's the tax on payment gateway fees
- ✅ `gst` field contains the actual order GST (CGST + SGST combined)
- ✅ CGST = `gst / 2`
- ✅ SGST = `gst / 2`
- ✅ Taxable Amount shown separately for clarity
- ✅ CGST and SGST shown with `+` prefix to indicate addition

## Testing Checklist

- [x] Build successful
- [x] TypeScript validation passed
- [ ] Test with real order data showing correct GST breakdown
- [ ] Verify total calculation: Taxable Amount + CGST + SGST = Total
- [ ] Confirm CGST and SGST are equal (both should be gst/2)

---

**Status**: ✅ Fixed and ready for deployment
**Date**: October 12, 2025
