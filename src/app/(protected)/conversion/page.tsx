'use client';

import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import ConversionRulesList from '@/components/conversion/ConversionRulesList';
import ConversionRecordsList from '@/components/conversion/ConversionRecordsList';

const TABS = ['Conversion Rules', 'Conversion Records'];

const T = {
  bg: '#f8fafc',
  surface: '#ffffff',
  border: '#e5e7eb',
  text: '#111827',
  sub: '#6b7280',
  primary: '#2563eb',
  success: '#16a34a',
};

export default function ConversionPage() {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: T.bg,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 2.5 }}>
          <Box
            sx={{
              display: 'inline-flex',
              px: 1.5,
              py: 0.55,
              mb: 1.25,
              borderRadius: '999px',
              bgcolor: '#ecfdf5',
              color: T.success,
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Production Module
          </Box>

          <Box
            component="h1"
            sx={{
              m: 0,
              fontSize: '1.8rem',
              fontWeight: 800,
              color: T.text,
              letterSpacing: '-0.025em',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Conversion Management
          </Box>

          <Box
            component="p"
            sx={{
              mt: 0.5,
              mb: 0,
              fontSize: '0.9rem',
              color: T.sub,
              fontWeight: 500,
            }}
          >
            Define rules and track every raw-to-finished conversion.
          </Box>
        </Box>

        <Box
          sx={{
            display: 'inline-flex',
            gap: 0.5,
            mb: 2,
            p: 0.5,
            bgcolor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: '14px',
            boxShadow: '0 4px 14px rgba(15,23,42,0.04)',
          }}
        >
          {TABS.map((tab, idx) => (
            <Box
              key={tab}
              onClick={() => setCurrentTab(idx)}
              sx={{
                px: 2.25,
                py: 0.9,
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                userSelect: 'none',
                transition: '0.18s ease',
                color: currentTab === idx ? '#ffffff' : T.sub,
                bgcolor: currentTab === idx ? T.primary : 'transparent',
                '&:hover': {
                  bgcolor: currentTab === idx ? T.primary : '#f3f4f6',
                  color: currentTab === idx ? '#ffffff' : T.text,
                },
              }}
            >
              {tab}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            bgcolor: T.surface,
            borderRadius: '18px',
            border: `1px solid ${T.border}`,
            boxShadow: '0 10px 32px rgba(15,23,42,0.05)',
            overflow: 'hidden',
          }}
        >
          {currentTab === 0 && <ConversionRulesList />}
          {currentTab === 1 && <ConversionRecordsList />}
        </Box>
      </Container>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
    </Box>
  );
}