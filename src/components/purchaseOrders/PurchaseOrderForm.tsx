'use client';

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Divider,
  alpha,
  Fade,
  Typography,
  LinearProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PurchaseOrder } from '@/models/purchaseOrder.model';
import { purchaseOrderValidationSchema } from './purchaseOrderForm.validation';
import {
  initialPurchaseOrderValues,
  transformPOToPayload,
} from './purchaseOrderForm.utils';
import { usePurchaseOrder } from '@/hooks/usePurchaseOrder';
import PurchaseOrderBasicInfo from './PurchaseOrderBasicInfo';
import PurchaseOrderLineItems from './PurchaseOrderLineItems';
import PurchaseOrderBilling from './PurchaseOrderBilling';
import BBButton from '@/lib/BBButton/BBButton';
import BBTitle from '@/lib/BBTitle/BBTitle';

interface PurchaseOrderFormProps {
  purchaseOrderId?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && (
        <Fade in timeout={300}>
          <Box sx={{ pt: 3 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  purchaseOrderId,
}) => {
  const router = useRouter();
  const { getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder, loading, error } =
    usePurchaseOrder();
  const [tabValue, setTabValue] = useState(0);
  const [initialValues, setInitialValues] = useState<PurchaseOrder>(
    initialPurchaseOrderValues
  );
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const loadPurchaseOrder = async () => {
      if (purchaseOrderId && purchaseOrderId !== 'new') {
        try {
          const po = await getPurchaseOrder(purchaseOrderId);
          setInitialValues(po);
        } catch (err) {
          setPageError('Failed to load purchase order');
        }
      }
    };
    loadPurchaseOrder();
  }, [purchaseOrderId, getPurchaseOrder]);

  const formik = useFormik<PurchaseOrder>({
    enableReinitialize: true,
    initialValues,
    validationSchema: purchaseOrderValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setPageError(null);
        const payload = transformPOToPayload(values);
        console.log('Submitting payload:', payload);
        
        if (purchaseOrderId && purchaseOrderId !== 'new') {
          console.log('Updating purchase order:', purchaseOrderId);
          await updatePurchaseOrder(purchaseOrderId, payload);
        } else {
          console.log('Creating new purchase order');
          await createPurchaseOrder(payload);
        }
        console.log('Purchase order saved successfully');
        router.push('/purchase-orders');
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save purchase order';
        setPageError(errorMessage);
        console.error('Form submission error:', err);
      }
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStepIcon = (step: number) => {
    const icons = [
      <DescriptionIcon key="desc" />,
      <ShoppingCartIcon key="shop" />,
      <PaymentIcon key="pay" />,
    ];
    return icons[step];
  };

  if (loading && purchaseOrderId && purchaseOrderId !== 'new') {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Purchase Order...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {purchaseOrderId && purchaseOrderId !== 'new'
                ? `Edit Purchase Order - ${initialValues.purchase_order_no}`
                : 'New Purchase Order'}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 3 }}>
            {purchaseOrderId && purchaseOrderId !== 'new'
              ? 'Update the details of your purchase order'
              : 'Create a new purchase order for your business'}
          </Typography>
        </Box>
      </Fade>

      {/* Enhanced Progress Stepper */}
      <Fade in timeout={600}>
        <Card
          sx={{
            mb: 4,
            boxShadow: 2,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha('#667eea', 0.05)} 0%, ${alpha('#764ba2', 0.05)} 100%)`,
          }}
        >
          <CardContent sx={{ pb: 3 }}>
            <Stepper
              activeStep={tabValue}
              sx={{
                '& .MuiStepLabel-root .Mui-completed': {
                  color: '#22c55e',
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: '#667eea',
                },
                '& .MuiStepConnector-line': {
                  borderColor: alpha('#667eea', 0.3),
                },
                '& .Mui-completed .MuiStepConnector-line': {
                  borderColor: '#22c55e',
                },
              }}
            >
              <Step>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: tabValue >= 0 ? '#667eea' : alpha('#667eea', 0.2),
                        color: 'white',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {tabValue > 0 ? <CheckCircleIcon /> : <DescriptionIcon />}
                    </Box>
                  )}
                >
                  Basic Information
                </StepLabel>
              </Step>
              <Step>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: tabValue >= 1 ? '#667eea' : alpha('#667eea', 0.2),
                        color: tabValue >= 1 ? 'white' : 'text.disabled',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {tabValue > 1 ? <CheckCircleIcon /> : <ShoppingCartIcon />}
                    </Box>
                  )}
                >
                  Line Items
                </StepLabel>
              </Step>
              <Step>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: tabValue >= 2 ? '#667eea' : alpha('#667eea', 0.2),
                        color: tabValue >= 2 ? 'white' : 'text.disabled',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <PaymentIcon />
                    </Box>
                  )}
                >
                  Billing
                </StepLabel>
              </Step>
            </Stepper>
          </CardContent>
        </Card>
      </Fade>

      {/* Error Alerts */}
      {(pageError || error) && (
        <Fade in>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: '#ffebee',
              borderLeft: '4px solid #d32f2f',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Error
            </Typography>
            {pageError || error}
          </Alert>
        </Fade>
      )}

      {/* Validation Errors Alert */}
      {Object.keys(formik.errors).length > 0 && Object.keys(formik.touched).length > 0 && (
        <Fade in>
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: '#fff3e0',
              borderLeft: '4px solid #ff9800',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Please fix the following errors:
            </Typography>
            <Box component="ul" sx={{ mb: 0, pl: 2 }}>
              {Object.entries(formik.errors)
                .filter(([key]) => formik.touched[key as keyof typeof formik.touched])
                .map(([key, error]) => (
                  <Typography
                    key={key}
                    component="li"
                    variant="body2"
                    sx={{ color: '#e65100', mb: 0.5 }}
                  >
                    {String(error)}
                  </Typography>
                ))}
            </Box>
          </Alert>
        </Fade>
      )}

      {/* Main Form Card */}
      <Fade in timeout={700}>
        <Card
          sx={{
            boxShadow: 3,
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha('#667eea', 0.1)}`,
          }}
        >
          {loading && <LinearProgress sx={{ height: 2 }} />}
          <CardContent sx={{ p: 0 }}>
            <form onSubmit={formik.handleSubmit}>
              {/* Enhanced Tabs */}
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="purchase order form tabs"
                sx={{
                  borderBottom: 2,
                  borderColor: 'divider',
                  background: `linear-gradient(135deg, ${alpha('#f8f9fa', 1)} 0%, ${alpha('#e9ecef', 1)} 100%)`,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2.5,
                    px: 4,
                    transition: 'all 0.3s ease',
                    minHeight: 64,
                    '&:hover': {
                      backgroundColor: alpha('#667eea', 0.08),
                    },
                  },
                  '& .Mui-selected': {
                    color: '#667eea',
                    backgroundColor: alpha('#667eea', 0.12),
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    backgroundColor: '#667eea',
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab
                  icon={<DescriptionIcon sx={{ mr: 1 }} />}
                  iconPosition="start"
                  label="Basic Information"
                />
                <Tab
                  icon={<ShoppingCartIcon sx={{ mr: 1 }} />}
                  iconPosition="start"
                  label="Line Items"
                />
                <Tab
                  icon={<PaymentIcon sx={{ mr: 1 }} />}
                  iconPosition="start"
                  label="Billing"
                />
              </Tabs>

              {/* Tab Content */}
              <Box sx={{ p: 4, minHeight: 400 }}>
                <TabPanel value={tabValue} index={0}>
                  <PurchaseOrderBasicInfo formik={formik} />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <PurchaseOrderLineItems formik={formik} />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <PurchaseOrderBilling formik={formik} />
                </TabPanel>
              </Box>

              {/* Enhanced Action Buttons */}
              <Divider />
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: `linear-gradient(135deg, ${alpha('#f8f9fa', 1)} 0%, ${alpha('#e9ecef', 1)} 100%)`,
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {tabValue > 0 && (
                    <Button
                      variant="outlined"
                      onClick={() => setTabValue(tabValue - 1)}
                      disabled={loading}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.2,
                        px: 3,
                        borderRadius: 2,
                      }}
                    >
                      Previous
                    </Button>
                  )}
                  {tabValue < 2 && (
                    <Button
                      variant="outlined"
                      onClick={() => setTabValue(tabValue + 1)}
                      disabled={loading}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.2,
                        px: 3,
                        borderRadius: 2,
                      }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <BBButton
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => router.push('/purchase-orders')}
                    disabled={loading}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.2,
                      px: 3,
                      borderRadius: 2,
                    }}
                  >
                    Cancel
                  </BBButton>
                  <BBButton
                    type="submit"
                    variant="contained"
                    startIcon={loading ? undefined : <SaveIcon />}
                    disabled={loading || !formik.isValid}
                    title={!formik.isValid ? 'Please fill all required fields' : ''}
                    sx={{
                      boxShadow: 3,
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1.2,
                      px: 4,
                      minWidth: 140,
                      borderRadius: 2,
                      background: !formik.isValid 
                        ? 'linear-gradient(135deg, #ccc 0%, #999 100%)' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        boxShadow: formik.isValid ? 6 : 3,
                        transform: formik.isValid ? 'translateY(-2px)' : 'none',
                        transition: 'all 0.3s ease',
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Save Purchase Order'
                    )}
                  </BBButton>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
};

export default PurchaseOrderForm;