'use client';

import { Box, Container, Skeleton, Grid, Paper, alpha } from '@mui/material';

export default function Loading() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Skeleton variant="text" width={250} height={48} />
            <Skeleton variant="text" width={300} height={24} sx={{ mt: 1 }} />
          </Box>
          <Skeleton variant="rectangular" width={200} height={48} sx={{ borderRadius: 2 }} />
        </Box>
      </Box>

      {/* Stats Cards Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[...Array(4)].map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{
                borderRadius: 3,
                animation: 'wave',
                animationDelay: `${index * 0.1}s`,
              }}
            />
          </Grid>
        ))}
      </Grid>

      {/* Search Bar Skeleton */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 3,
          border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Paper>

      {/* Table Skeleton */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" height={48} sx={{ mb: 1.5, borderRadius: 2 }} />
          {[...Array(5)].map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={60}
              sx={{
                mb: 0.75,
                borderRadius: 2,
                animationDelay: `${index * 0.1}s`,
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Pagination Skeleton */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          p: 2,
          borderRadius: 2,
        }}
      >
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="rectangular" width={300} height={32} sx={{ borderRadius: 2 }} />
      </Box>
    </Container>
  );
}