import * as Yup from "yup";

export const customerValidationSchema = (isEdit: boolean) => {
  const baseSchema = Yup.object().shape({
    // Basic Information
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    company_name: Yup.string().required("Company name is required"),
    display_name: Yup.string().required("Display name is required"),
    email_address: Yup.string().email("Invalid email").required("Email is required"),
    work_phone: Yup.string().required("Work phone is required"),
    mobile: Yup.string().required("Mobile is required"),

    // Other Details
    other_details: Yup.object().shape({
      pan: Yup.string()
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
        .nullable(),
      currency: Yup.string().required("Currency is required"),
      payment_terms: Yup.string().required("Payment terms are required"),
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
  });

  return baseSchema;
};
