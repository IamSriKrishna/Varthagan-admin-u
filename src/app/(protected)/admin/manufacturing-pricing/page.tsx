'use client';

import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { BadgeIndianRupee } from 'lucide-react';
import CustomerPricingScreen from '@/components/customer/CustomerPricingScreen';

export default function CustomerPricingPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#f8f9fc',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #f0f0f5',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '13px',
                background:
                  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.3)',
                flexShrink: 0,
              }}
            >
              <BadgeIndianRupee size={22} color="white" />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#1a1d2e',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '-0.4px',
                  lineHeight: 1.15,
                }}
              >
                Customer Pricing
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                Set per-customer rates for new sales orders
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Content */}
      <Box
        sx={{
          mx: 3,
          mt: 2.5,
          mb: 2,
          borderRadius: '14px',
          border: '1px solid #eeeff5',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <CustomerPricingScreen />
        </Box>
      </Box>

      {/* Footer Note */}
      <Box
        sx={{
          mx: 3,
          mb: 3,
          px: 2,
          py: 1.25,
          borderRadius: '10px',
          bgcolor: '#f0fdf6',
          border: '1px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: '#22c55e',
            boxShadow: '0 0 6px rgba(34,197,94,0.6)',
            flexShrink: 0,
          }}
        />

        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: '#15803d',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
          }}
        >
          Changes take effect immediately on new sales orders. Existing orders keep
          their original rate.
        </Typography>
      </Box>
    </Box>
  );
}