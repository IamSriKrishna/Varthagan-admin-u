'use client';

import React, { useState } from 'react';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Factory } from 'lucide-react';
import ConversionRulesList from '@/components/conversion/ConversionRulesList';
import ConversionRecordsList from '@/components/conversion/ConversionRecordsList';

const TABS = ['Conversion Rules', 'Conversion Records'];

export default function ConversionPage() {
  const [currentTab, setCurrentTab] = useState(0);

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
              <Factory size={22} color="white" />
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
                Conversion Management
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                Define rules and track every raw-to-finished conversion
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Toolbar Tabs */}
      <Box
        sx={{
          mx: 3,
          mt: 2.5,
          borderRadius: '14px 14px 0 0',
          border: '1px solid #eeeff5',
          borderBottom: 'none',
          bgcolor: '#ffffff',
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, value) => setCurrentTab(value)}
          sx={{
            minHeight: 38,
            '& .MuiTab-root': {
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              minHeight: 38,
              px: 2,
              color: '#9ca3af',
            },
            '& .Mui-selected': {
              color: '#4f63d2 !important',
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
              height: 2.5,
              borderRadius: 2,
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab} label={tab} />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <Box
        sx={{
          mx: 3,
          mb: 3,
          borderRadius: '0 0 14px 14px',
          border: '1px solid #eeeff5',
          borderTop: 'none',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        }}
      >
        {currentTab === 0 && <ConversionRulesList />}
        {currentTab === 1 && <ConversionRecordsList />}
      </Box>
    </Box>
  );
}