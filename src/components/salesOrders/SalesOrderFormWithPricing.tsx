'use client';

/**
 * Sales Order Form Integration with Customer Pricing
 * 
 * This example shows how to integrate customer pricing with the sales order form
 * so that manufacturer rates are automatically populated from customer pricing
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Alert,
  Button,
  MenuItem,
  TextField,
  Autocomplete,
  CircularProgress,
  InputAdornment,
  Tooltip,
  IconButton,
  Stack,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { customerPricingService } from '@/lib/api/customerPricing.service';
import { CustomerPricing, CustomerPricingLineItem } from '@/models/customerPricing.model';
import { Manufacturer } from '@/models/manufacturer.model';
import { getToken } from '@/constants/localStorageConstant';

interface SalesOrderFormWithPricingProps {
  customerId?: number;
  onLineItemsChange?: (items: any[]) => void;
  existingLineItems?: any[];
}

export function SalesOrderFormWithCustomerPricing({
  customerId,
  onLineItemsChange,
  existingLineItems = [],
}: SalesOrderFormWithPricingProps) {
  const [customerPricing, setCustomerPricing] = useState<CustomerPricing | null>(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [rate, setRate] = useState<string>('');
  const [rateSource, setRateSource] = useState<'pricing' | 'custom'>('pricing');
  const [lineItems, setLineItems] = useState(existingLineItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceOverrideNote, setPriceOverrideNote] = useState<string>('');

  // Fetch customer pricing when customer changes
  useEffect(() => {
    if (customerId) {
      fetchCustomerPricing();
    }
  }, [customerId]);

  const fetchCustomerPricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      // Get customer pricing
      const pricingResponse = await customerPricingService.getByCustomerId(customerId!);

      if (pricingResponse.data && pricingResponse.data.pricings && pricingResponse.data.pricings.length > 0) {
        setCustomerPricing(pricingResponse.data.pricings[0]);
        // Extract unique manufacturers
        const manufacturerSet = new Set<string>();
        pricingResponse.data.pricings[0].line_items.forEach((item) => {
          if (item.manufacturer_id) {
            manufacturerSet.add(item.manufacturer_id);
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer pricing');
      setCustomerPricing(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManufacturerSelect = (manufacturer: Manufacturer | null) => {
    setSelectedManufacturer(manufacturer);
    if (manufacturer && customerPricing) {
      // Find pricing for this manufacturer
      const pricingItem = customerPricing.line_items.find(
        (item) => item.manufacturer_id === manufacturer.id,
      );
      if (pricingItem) {
        setRate(pricingItem.rate.toString());
        setRateSource('pricing');
        setPriceOverrideNote('');
      } else {
        setRate('');
        setRateSource('custom');
        setPriceOverrideNote('No pricing configured for this manufacturer');
      }
    }
  };

  const handleRateChange = (newRate: string) => {
    setRate(newRate);
    if (customerPricing && selectedManufacturer) {
      const pricingItem = customerPricing.line_items.find(
        (item) => item.manufacturer_id === selectedManufacturer.id,
      );
      if (pricingItem && pricingItem.rate.toString() !== newRate) {
        setRateSource('custom');
        setPriceOverrideNote(`Overridden from ₹${pricingItem.rate.toFixed(2)}`);
      } else {
        setRateSource('pricing');
        setPriceOverrideNote('');
      }
    }
  };

  const handleAddLineItem = () => {
    if (!selectedManufacturer || !rate || !quantity) {
      setError('Please fill in all required fields');
      return;
    }

    const newItem = {
      id: `so-li-${Date.now()}`,
      manufacturer_id: selectedManufacturer.id,
      manufacturer_name: selectedManufacturer.name,
      quantity: parseInt(quantity),
      rate: parseFloat(rate),
      amount: parseInt(quantity) * parseFloat(rate),
      account: 'SALES_REVENUE',
      rateSource, // Track if rate came from pricing or was custom
      priceOverrideNote,
    };

    const updatedItems = [...lineItems, newItem];
    setLineItems(updatedItems);
    onLineItemsChange?.(updatedItems);

    // Reset form
    setSelectedManufacturer(null);
    setQuantity('1');
    setRate('');
    setRateSource('pricing');
    setPriceOverrideNote('');
    setError(null);
  };

  const handleRemoveLineItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
    onLineItemsChange?.(updatedItems);
  };

  const getPricingInfo = (): React.ReactNode => {
    if (!customerPricing) {
      return null;
    }

    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Customer Pricing Active:</strong> This customer has {customerPricing.line_items.length}{' '}
        configured pricing rates. Rates will be automatically populated below.
      </Alert>
    );
  };

  const getPricingWarning = (): React.ReactNode => {
    if (
      !customerPricing ||
      !selectedManufacturer ||
      customerPricing.line_items.some((item) => item.manufacturer_id === selectedManufacturer.id)
    ) {
      return null;
    }

    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        ⚠️ No pricing configured for {selectedManufacturer.name}. Please enter a custom rate.
      </Alert>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Pricing Info */}
      {getPricingInfo()}
      {getPricingWarning()}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={20} />
          <span>Loading customer pricing...</span>
        </Box>
      )}

      {/* Line Item Input Section */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
        <Stack spacing={2}>
          {/* Manufacturer Selection */}
          <Autocomplete
            options={manufacturers}
            getOptionLabel={(option) => `${option.name} (${option.id})`}
            value={selectedManufacturer}
            onChange={(_, value) => handleManufacturerSelect(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Manufacturer"
                placeholder="Select manufacturer..."
                disabled={loading}
              />
            )}
          />

          {/* Quantity */}
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: '1', step: '1' }}
            disabled={loading}
          />

          {/* Rate with Pricing Indicator */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TextField
                label="Rate"
                type="number"
                value={rate}
                onChange={(e) => handleRateChange(e.target.value)}
                inputProps={{ min: '0', step: '0.01' }}
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
              {rateSource === 'pricing' && customerPricing && (
                <Tooltip title="Rate from customer pricing configuration">
                  <IconButton size="small" color="success">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {rateSource === 'custom' && (
                <Tooltip title={priceOverrideNote || 'Custom rate'}>
                  <IconButton size="small" color="warning">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {priceOverrideNote && (
              <Alert severity="info" sx={{ py: 0.5, fontSize: '0.85rem' }}>
                {priceOverrideNote}
              </Alert>
            )}
          </Box>

          {/* Add Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddLineItem}
            disabled={loading || !selectedManufacturer || !rate}
          >
            Add to Order
          </Button>
        </Stack>
      </Box>

      {/* Display Line Items */}
      {lineItems.length > 0 && (
        <Box>
          <h4>Order Line Items</h4>
          {lineItems.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                p: 2,
                mb: 1,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <strong>{item.manufacturer_name}</strong>
                <br />
                Qty: {item.quantity} × ₹{item.rate.toFixed(2)} = ₹{item.amount.toFixed(2)}
                {item.rateSource === 'custom' && (
                  <span style={{ marginLeft: '1rem', color: '#ff9800', fontSize: '0.85rem' }}>
                    (Custom Rate)
                  </span>
                )}
              </Box>
              <Button
                color="error"
                size="small"
                onClick={() => handleRemoveLineItem(index)}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

/**
 * Usage Example in Sales Order Form:
 * 
 * ```tsx
 * import { SalesOrderFormWithCustomerPricing } from '@/components/salesOrders/SalesOrderFormWithPricing';
 * 
 * export function SalesOrderForm() {
 *   const [customerId, setCustomerId] = useState<number | null>(null);
 *   const [lineItems, setLineItems] = useState([]);
 * 
 *   return (
 *     <form>
 *       <TextField
 *         label="Customer ID"
 *         value={customerId}
 *         onChange={(e) => setCustomerId(parseInt(e.target.value))}
 *       />
 *       
 *       <SalesOrderFormWithCustomerPricing
 *         customerId={customerId}
 *         onLineItemsChange={setLineItems}
 *       />
 *       
 *       <button type="submit">Create Sales Order</button>
 *     </form>
 *   );
 * }
 * ```
 */
