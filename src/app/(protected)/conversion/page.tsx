'use client';

import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import ConversionRulesList from '@/components/conversion/ConversionRulesList';
import ConversionRecordsList from '@/components/conversion/ConversionRecordsList';

const TABS = ['Conversion Rules', 'Conversion Records'];

export default function ConversionPage() {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f7f6f2',
        backgroundImage: `radial-gradient(circle, #d1cfc7 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              bgcolor: '#1a1a1a',
              borderRadius: '100px',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#4ade80',
                boxShadow: '0 0 8px #4ade80',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
            <Box
              component="span"
              sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              Production Module
            </Box>
          </Box>

          <Box
            component="h1"
            sx={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 800,
              color: '#0f0f0f',
              lineHeight: 1.1,
              m: 0,
              letterSpacing: '-0.03em',
            }}
          >
            Conversion
            <Box component="span" sx={{ color: '#16a34a' }}> Management</Box>
          </Box>
          <Box
            component="p"
            sx={{ fontSize: '0.9rem', color: '#78716c', mt: 1, mb: 0, fontWeight: 400 }}
          >
            Define rules and track every raw-to-finished conversion in one place.
          </Box>
        </Box>

        {/* Custom Tabs */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 3,
            p: 0.75,
            bgcolor: '#efefeb',
            borderRadius: '16px',
            width: 'fit-content',
            border: '1px solid #e2e0d8',
          }}
        >
          {TABS.map((tab, idx) => (
            <Box
              key={tab}
              onClick={() => setCurrentTab(idx)}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                ...(currentTab === idx
                  ? {
                      bgcolor: '#ffffff',
                      color: '#0f0f0f',
                      boxShadow: '0 1px 8px rgba(0,0,0,0.10)',
                    }
                  : {
                      color: '#78716c',
                      '&:hover': { color: '#0f0f0f' },
                    }),
              }}
            >
              {tab}
            </Box>
          ))}
        </Box>

        {/* Tab Panels */}
        <Box
          sx={{
            bgcolor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e7e5df',
            boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {currentTab === 0 && <ConversionRulesList />}
          {currentTab === 1 && <ConversionRecordsList />}
        </Box>
      </Container>

      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
    </Box>
  );
}