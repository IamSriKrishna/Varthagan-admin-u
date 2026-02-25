"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";

interface CompanyProfileViewProps {
  companyId: string;
}

export default function CompanyProfileView({
  companyId,
}: CompanyProfileViewProps) {
  const [tabValue, setTabValue] = useState(0);
  const router = useRouter();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <h1>Company Profile</h1>
          <Button
            variant="outlined"
            onClick={() => router.push("/company-settings")}
          >
            Back to Setup
          </Button>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label="Contact" />
          <Tab label="Address" />
          <Tab label="Payment" />
          <Tab label="Settings" />
        </Tabs>

        <Box sx={{ minHeight: 400 }}>
          {tabValue === 0 && (
            <Alert severity="info">
              Company profile loaded. Company ID: {companyId}
            </Alert>
          )}
          {tabValue === 1 && <Alert severity="info">Contact Information</Alert>}
          {tabValue === 2 && <Alert severity="info">Address Information</Alert>}
          {tabValue === 3 && <Alert severity="info">Payment Methods</Alert>}
          {tabValue === 4 && <Alert severity="info">Settings</Alert>}
        </Box>
      </Paper>
    </Container>
  );
}
