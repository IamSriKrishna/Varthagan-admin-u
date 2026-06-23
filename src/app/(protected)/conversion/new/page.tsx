'use client';

import React from 'react';
import { Box } from '@mui/material';
import ConversionForm from '@/components/conversion/ConversionForm';

export default function NewConversionPage() {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        m: 0,
        p: 0,
        bgcolor: '#f8fafc',
      }}
    >
      <ConversionForm isEdit={false} />
    </Box>
  );
}