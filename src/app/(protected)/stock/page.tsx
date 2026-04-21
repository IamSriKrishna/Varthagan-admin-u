'use client';

import StockManagement from '@/components/stock/StockManagement';
import { Box } from '@mui/material';

export default function StockPage() {
  return (
    <Box sx={{ width: '100%' }}>
      <StockManagement />
    </Box>
  );
}
