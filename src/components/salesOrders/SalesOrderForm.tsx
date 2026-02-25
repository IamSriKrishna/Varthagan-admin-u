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
import { showToastMessage } from '@/utils/toastUtil';
import DescriptionIcon from '@mui/icons-material/Description';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SalesOrder } from '@/models/salesOrder.model';
import { salesOrderValidationSchema } from './salesOrderForm.validation';
import {
  initialSalesOrderValues,
  transformSOToPayload,
} from './salesOrderForm.utils';
import { useSalesOrder } from '@/hooks/useSalesOrder';
import SalesOrderBasicInfo from './SalesOrderBasicInfo';
import SalesOrderLineItems from './SalesOrderLineItems';
import SalesOrderBilling from './SalesOrderBilling';
import { CreateSalespersonDialog } from './CreateSalespersonDialog';
import BBButton from '@/lib/BBButton/BBButton';
import BBTitle from '@/lib/BBTitle/BBTitle';

interface SalesOrderFormProps {
  salesOrderId?: string;
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

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({
  salesOrderId,
}) => {
  const router = useRouter();
  const { getSalesOrder, createSalesOrder, updateSalesOrder, loading, error } =
    useSalesOrder();
  const [tabValue, setTabValue] = useState(0);
  const [initialValues, setInitialValues] = useState<SalesOrder>(
    initialSalesOrderValues
  );
  const [pageError, setPageError] = useState<string | null>(null);
  const [openCreateSalesperson, setOpenCreateSalesperson] = useState(false);
  const [salespersonRefreshTrigger, setSalespersonRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadSalesOrder = async () => {
      if (salesOrderId && salesOrderId !== 'new') {
        try {
          const so = await getSalesOrder(salesOrderId);
          setInitialValues(so);
        } catch (err) {
          setPageError('Failed to load sales order');
        }
      }
    };
    loadSalesOrder();
  }, [salesOrderId, getSalesOrder]);

  const formik = useFormik<SalesOrder>({
    enableReinitialize: true,
    initialValues,
    validationSchema: salesOrderValidationSchema,
    onSubmit: async (values) => {
      try {
        setPageError(null);
        console.log('Form submitted with values:', values);
        
        const payload = transformSOToPayload(values);
        console.log('Transformed payload:', payload);

        if (salesOrderId && salesOrderId !== 'new') {
          console.log('Updating sales order:', salesOrderId);
          await updateSalesOrder(salesOrderId, payload);
          showToastMessage('Sales order updated successfully', 'success');
        } else {
          console.log('Creating new sales order');
          const newSO = await createSalesOrder(payload);
          console.log('Created sales order:', newSO);
          showToastMessage('Sales order created successfully', 'success');
          // Redirect to the sales orders list
          router.push('/sales-orders');
          return;
        }

        router.push('/sales-orders');
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to save sales order';
        console.error('Form submission error:', err);
        setPageError(errorMessage);
        showToastMessage(errorMessage, 'error');
      }
    },
  });

  const handleSalespersonCreated = (newSalesperson: any) => {
    // Set the newly created salesperson as selected
    formik.setFieldValue('salesperson_id', newSalesperson.id);
    formik.setFieldValue('salesperson', newSalesperson);
    setOpenCreateSalesperson(false);
    // Trigger refetch of salesperson list
    setSalespersonRefreshTrigger(prev => prev + 1);
  };

  const isEditMode = salesOrderId && salesOrderId !== 'new' ? true : false;
  const steps = ['Basic Info', 'Line Items', 'Billing'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <BBTitle
            title={isEditMode ? 'Edit Sales Order' : 'Create Sales Order'}
            subtitle={
              isEditMode
                ? `Sales Order: ${formik.values.sales_order_no}`
                : 'Create a new sales order with customer details and line items'
            }
          />
        </Box>

        {/* Error Alert */}
        {pageError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {pageError}
          </Alert>
        )}

        {/* Validation Errors Alert */}
        {!formik.isValid && Object.keys(formik.errors).length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Please fix the following errors:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {Object.entries(formik.errors).map(([field, error]: any) => (
                <li key={field}>
                  <Typography variant="body2">
                    <strong>{field}:</strong> {typeof error === 'string' ? error : 'Invalid value'}
                  </Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Loading State */}
        {loading && <LinearProgress />}

        {/* Form Card */}
        <Card>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={(_, value) => setTabValue(value)}
              aria-label="sales order form tabs"
            >
              <Tab
                label="Basic Information"
                icon={<DescriptionIcon />}
                iconPosition="start"
              />
              <Tab
                label="Line Items"
                icon={<ShoppingCartIcon />}
                iconPosition="start"
              />
              <Tab
                label="Billing"
                icon={<PaymentIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <CardContent>
            {/* Basic Info Tab */}
            <TabPanel value={tabValue} index={0}>
              <SalesOrderBasicInfo 
                formik={formik} 
                isEditMode={isEditMode}
                onOpenCreateSalesperson={() => setOpenCreateSalesperson(true)}
                salespersonRefreshTrigger={salespersonRefreshTrigger}
              />
            </TabPanel>

            {/* Line Items Tab */}
            <TabPanel value={tabValue} index={1}>
              <SalesOrderLineItems formik={formik} />
              {formik.touched.line_items && formik.errors.line_items && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {typeof formik.errors.line_items === 'string'
                    ? formik.errors.line_items
                    : 'Line items error'}
                </Alert>
              )}
            </TabPanel>

            {/* Billing Tab */}
            <TabPanel value={tabValue} index={2}>
              <SalesOrderBilling formik={formik} />
            </TabPanel>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mt: 4,
                pt: 3,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <BBButton
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => formik.handleSubmit()}
                disabled={loading || !formik.isValid}
                loading={loading}
                fullWidth={false}
              >
                {isEditMode ? 'Update Sales Order' : 'Create Sales Order'}
              </BBButton>

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Create Salesperson Dialog */}
        <CreateSalespersonDialog
          open={openCreateSalesperson}
          onClose={() => setOpenCreateSalesperson(false)}
          onSuccess={handleSalespersonCreated}
        />
      </Box>
    </Container>
  );
};

export default SalesOrderForm;
