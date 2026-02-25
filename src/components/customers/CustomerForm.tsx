// src/components/customers/CustomerForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, FieldArray, FormikHelpers } from "formik";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import {
  Box,
  Card,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Container,
  CircularProgress,
} from "@mui/material";

// Local Components
import { CustomerBasicInfo } from "./CustomerBasicInfo";
import { CustomerOtherDetails } from "./CustomerOtherDetails";
import { CustomerAddress } from "./CustomerAddress";
import { CustomerContactPersons } from "./CustomerContactPersons";

// Custom Components
import { BBButton, BBTitle, BBLoader } from "@/lib";

// Models & Constants
import { Customer } from "@/models/customer.model";
import { initialCustomerValues, transformCustomerToPayload } from "./customerForm.utils";
import { customerValidationSchema } from "./customerForm.validation";

// Services & Hooks
import { useCustomer } from "@/hooks/useCustomer";

// Utils
import { showToastMessage } from "@/utils/toastUtil";
import { RootState } from "@/store";

// Tab configuration
const TAB_CONFIGS = [
  { label: "Other Details", index: 0 },
  { label: "Address", index: 1 },
  { label: "Contact Persons", index: 2 },
];

const CustomerForm: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  
  const { loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { createCustomer, updateCustomer, getCustomer, loading: customerLoading } = useCustomer();
  
  const customerIdRaw = params?.customerId;
  const customerId = Array.isArray(customerIdRaw) ? customerIdRaw[0] : customerIdRaw;
  const isEdit = !!customerId && customerId !== "new";
  
  const [initialData, setInitialData] = useState<Customer>(initialCustomerValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && customerId) {
      loadCustomerData();
    }
  }, [customerId, isEdit]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const customerData = await getCustomer(customerId);
      setInitialData(customerData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to load customer details";
      setError(errorMessage);
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: Customer, formikHelpers: FormikHelpers<Customer>) => {
    
    try {
      setSubmitError("");
      setValidationErrors([]);

      const payload = transformCustomerToPayload(values);
      
      if (isEdit) {
        await updateCustomer(customerId, payload);
        showToastMessage("Customer updated successfully", "success");
      } else {
        await createCustomer(payload);
        showToastMessage("Customer created successfully", "success");
      }
      
      setTimeout(() => router.push("/customers"), 100);
    } catch (error: any) {
      // Handle different types of errors
      let errorMessage = "Something went wrong. Please try again.";
      let fieldErrors: string[] = [];

      if (error?.response?.data) {
        const responseData = error.response.data;
        
        // Handle validation errors from backend
        if (responseData.errors && Array.isArray(responseData.errors)) {
          fieldErrors = responseData.errors.map((err: any) => 
            typeof err === 'string' ? err : err.message || 'Validation error'
          );
          errorMessage = "Please fix the validation errors below";
        } 
        // Handle single error message
        else if (responseData.message) {
          errorMessage = responseData.message;
        }
        // Handle field-specific errors
        else if (responseData.field_errors) {
          const errors = responseData.field_errors;
          Object.keys(errors).forEach(field => {
            formikHelpers.setFieldError(field, errors[field]);
          });
          errorMessage = "Please check the highlighted fields";
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setSubmitError(errorMessage);
      setValidationErrors(fieldErrors);
      showToastMessage(errorMessage, "error");
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => router.back();

  if (loading) {
    return <BBLoader enabled={true} />;
  }

  return (
    <Box>
      <BBLoader enabled={authLoading || customerLoading} />
      
      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Submit Error Display */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
          <AlertTitle>Submission Failed</AlertTitle>
          {submitError}
          {validationErrors.length > 0 && (
            <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </Box>
          )}
        </Alert>
      )}

      <Formik
        initialValues={initialData}
        validationSchema={customerValidationSchema(isEdit)}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ handleSubmit, dirty, values, setFieldValue, errors, touched, validateForm, isSubmitting }) => (
          <Form onSubmit={handleSubmit} noValidate>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <BBTitle
                title={isEdit ? "Edit Customer" : "New Customer"}
                subtitle={isEdit ? "Update customer information" : "Add a new customer to your system"}
                rightContent={
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <BBButton 
                      variant="outlined" 
                      onClick={handleBack} 
                      startIcon={<ArrowLeft size={20} />}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </BBButton>
                    <BBButton
                      type="submit"
                      variant="contained"
                      disabled={customerLoading || isSubmitting || (isEdit && !dirty)}
                      loading={customerLoading || isSubmitting}
                    >
                      {isEdit ? "Update Customer" : "Create Customer"}
                    </BBButton>
                  </Box>
                }
              />
            </Box>
            {/* Show validation summary if there are errors */}
            {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <AlertTitle>Validation Errors</AlertTitle>
                Please check and fix the errors in the form before submitting.
              </Alert>
            )}

            {/* Basic Information - Always visible */}
            <CustomerBasicInfo />

            {/* Horizontal Tabs for Other Sections */}
            <Card elevation={1} sx={{ borderRadius: "12px", p: 3, mb: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Box sx={{ display: 'flex', overflowX: 'auto' }}>
                  {TAB_CONFIGS.map((tab) => (
                    <Button
                      key={tab.label}
                      onClick={() => setActiveTab(tab.index)}
                      sx={{
                        flex: 1,
                        py: 2,
                        borderBottom: activeTab === tab.index ? 2 : 'none',
                        borderColor: 'primary.main',
                        color: activeTab === tab.index ? 'primary.main' : 'text.secondary',
                        fontWeight: activeTab === tab.index ? 600 : 400,
                        borderRadius: 0,
                        minWidth: 'fit-content',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* Tab Content */}
              {activeTab === 0 && <CustomerOtherDetails />}
              {activeTab === 1 && <CustomerAddress values={values} setFieldValue={setFieldValue} />}
              {activeTab === 2 && (
                <FieldArray name="contact_persons">
                  {({ push, remove }) => (
                    <CustomerContactPersons 
                      values={values} 
                      push={push} 
                      remove={remove} 
                    />
                  )}
                </FieldArray>
              )}
            </Card>

            {/* Bottom Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <BBButton 
                variant="outlined" 
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Cancel
              </BBButton>
              <BBButton
                type="submit"
                variant="contained"
                disabled={customerLoading || isSubmitting || (isEdit && !dirty)}
                loading={customerLoading || isSubmitting}
              >
                {isEdit ? "Update Customer" : "Create Customer"}
              </BBButton>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default CustomerForm;
