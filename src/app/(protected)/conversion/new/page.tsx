'use client';

import React from 'react';
import { Container } from '@mui/material';
import ConversionForm from '@/components/conversion/ConversionForm';

export default function NewConversionPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <ConversionForm isEdit={false} />
    </Container>
  );
}
