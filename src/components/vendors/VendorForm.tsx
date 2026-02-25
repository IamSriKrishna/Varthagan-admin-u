// app/components/vendor/VendorForm.tsx
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
} from "@mui/material";

// Local Components
import { VendorBasicInfo } from "./VendorBasicInfo";
import { VendorOtherDetails } from "./VendorOtherDetails";
import { VendorAddress } from "./VendorAddress";
import { VendorContactPersons } from "./VendorContactPersons";
import { VendorBankDetails } from "./VendorBankDetails";

// Custom Components
import { BBButton, BBTitle, BBLoader } from "@/lib";

// Models & Constants
import { Vendor } from "@/models/vendor.model";
import { initialVendorValues, transformVendorToPayload } from "./vendorForm.utils";
import { vendorValidationSchema } from "./vendorForm.validation";

// Services & Hooks
import { useVendor } from "@/hooks/useVendor";

// Utils
import { showToastMessage } from "@/utils/toastUtil";
import { RootState } from "@/store";

// Tab configuration
const TAB_CONFIGS = [
  { label: "Other Details", index: 0 },
  { label: "Address", index: 1 },
  { label: "Contact Persons", index: 2 },
  { label: "Bank Details", index: 3 },
];

export const VendorForm: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  
  const { loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { createVendor, updateVendor, getVendor, loading: vendorLoading } = useVendor();
  
  const vendorIdRaw = params?.vendorId;
  const vendorId = Array.isArray(vendorIdRaw) ? vendorIdRaw[0] : vendorIdRaw;
  const isEdit = !!vendorId && vendorId !== "new";
  
  const [initialData, setInitialData] = useState<Vendor>(initialVendorValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && vendorId) {
      loadVendorData();
    }
  }, [vendorId, isEdit]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const vendorData = await getVendor(vendorId);
      setInitialData(vendorData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to load vendor details";
      setError(errorMessage);
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: Vendor, formikHelpers: FormikHelpers<Vendor>) => {
    try {
      setSubmitError(null);
      setValidationErrors([]);
      
      const payload = transformVendorToPayload(values);
      
      if (isEdit && vendorId) {
        await updateVendor(vendorId, payload);
        showToastMessage("Vendor updated successfully!", "success");
      } else {
        await createVendor(payload);
        showToastMessage("Vendor created successfully!", "success");
      }
      
      setTimeout(() => router.push("/vendors"), 100);
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

  const handleGSTPrefill = async (gstin: string, setFieldValue: any) => {
    if (!gstin || gstin.length !== 15) {
      showToastMessage("Please enter a valid 15-digit GSTIN", "error");
      return;
    }

    try {
      // TODO: Replace with actual API call to GST portal
      setFieldValue('company_name', 'Demo Company Pvt Ltd');
      setFieldValue('billing_address.city', 'Chennai');
      setFieldValue('billing_address.state', 'Tamil Nadu');
      setFieldValue('other_details.pan', 'AAAAA1234A');
      showToastMessage("Vendor details prefilled from GST portal", "success");
    } catch (error) {
      showToastMessage("Failed to prefill from GST portal. Please enter details manually.", "error");
    }
  };

  // Validate current tab before allowing navigation
  const validateAndSwitchTab = (newTab: number, validateForm: any) => {
    validateForm().then((errors: any) => {
      if (Object.keys(errors).length === 0) {
        setActiveTab(newTab);
      } else {
        showToastMessage("Please fix errors in the current section", "error");
      }
    });
  };

  if (loading) {
    return <BBLoader enabled={true} />;
  }

  return (
    <Box>
      <BBLoader enabled={authLoading || vendorLoading} />
      
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
        validationSchema={vendorValidationSchema(isEdit)}
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
                title={isEdit ? "Edit Vendor" : "New Vendor"}
                subtitle={isEdit ? "Update vendor information" : "Add a new vendor to your system"}
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
                      disabled={vendorLoading || isSubmitting || (isEdit && !dirty)}
                      loading={vendorLoading || isSubmitting}
                    >
                      {isEdit ? "Update Vendor" : "Create Vendor"}
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

            {/* GST Prefill Section */}
            <Card elevation={1} sx={{ borderRadius: "12px", p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  Prefill Vendor details from the GST portal using the Vendor's GSTIN.
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleGSTPrefill(values.gstin, setFieldValue)}
                  disabled={!values.gstin || values.gstin.length !== 15}
                >
                  Prefill from GST
                </Button>
              </Box>
              {values.gstin && values.gstin.length < 15 && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  GSTIN must be 15 characters long
                </Typography>
              )}
            </Card>

            {/* Basic Information - Always visible */}
            <VendorBasicInfo />

            

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
              {activeTab === 0 && <VendorOtherDetails />}
              {activeTab === 1 && <VendorAddress values={values} setFieldValue={setFieldValue} />}
              {activeTab === 2 && (
                <FieldArray name="contact_persons">
                  {({ push, remove }) => (
                    <VendorContactPersons 
                      values={values} 
                      push={push} 
                      remove={remove} 
                    />
                  )}
                </FieldArray>
              )}
              {activeTab === 3 && (
                <FieldArray name="bank_details">
                  {({ push, remove }) => (
                    <VendorBankDetails 
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
                disabled={vendorLoading || isSubmitting || (isEdit && !dirty)}
                loading={vendorLoading || isSubmitting}
              >
                {isEdit ? "Update Vendor" : "Create Vendor"}
              </BBButton>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default VendorForm;