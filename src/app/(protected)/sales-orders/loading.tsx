'use client';

import React from 'react';
import {
  Container,
  Card,
  CardContent,
  Skeleton,
  Box,
  Grid,
} from '@mui/material';

export default function Loading() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} />
        </Box>

        {/* Content Skeleton */}
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6 }} key={i}>
                  <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={40} />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
