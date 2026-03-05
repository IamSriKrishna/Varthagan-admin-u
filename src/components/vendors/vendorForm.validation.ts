import * as Yup from "yup";

export const vendorValidationSchema = (isEdit: boolean) => {
  const baseSchema = Yup.object().shape({
    // Basic Information
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    display_name: Yup.string().required("Display name is required"),
    email_address: Yup.string().email("Invalid email").required("Email is required"),
    work_phone: Yup.string().required("Work phone is required"),
    mobile: Yup.string().required("Mobile is required"),
    gstin: Yup.string()
      .nullable()
      .matches(/^[0-9A-Z]{15}$/, "Invalid GSTIN format"),

    // Other Details
    other_details: Yup.object().shape({
      pan: Yup.string()
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
        .nullable(),
      currency: Yup.string().required("Currency is required"),
      payment_terms: Yup.string().required("Payment terms are required"),
      website_url: Yup.string().url("Invalid URL format").nullable(),
    }),

    // Billing Address
    billing_address: Yup.object().shape({
      address_line1: Yup.string().required("Address line 1 is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      pin_code: Yup.string().required("PIN code is required"),
      country_region: Yup.string().required("Country is required"),
    }),

    // Contact Persons
    contact_persons: Yup.array()
      .of(
        Yup.object().shape({
          first_name: Yup.string().required("First name is required"),
          last_name: Yup.string().required("Last name is required"),
          email_address: Yup.string().email("Invalid email").required("Email is required"),
          mobile: Yup.string().required("Mobile is required"),
        }),
      )
      .min(1, "At least one contact person is required"),

    // Bank Details
    bank_details: Yup.array()
      .of(
        Yup.object().shape({
          bank_id: Yup.string().required("Bank is required"),
          account_holder_name: Yup.string().required("Account holder name is required"),
          account_number: Yup.string().required("Account number is required"),
          is_primary: Yup.boolean(),
          is_active: Yup.boolean(),
        }),
      )
      .min(1, "At least one bank detail is required"),
  });

  return baseSchema;
};
