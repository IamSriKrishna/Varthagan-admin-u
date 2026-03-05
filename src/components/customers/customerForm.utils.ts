import { Customer } from "@/models/customer.model";

export const initialCustomerValues: Customer = {
  customer_type: "Business",
  salutation: "Mr.",
  first_name: "",
  last_name: "",
  display_name: "",
  email_address: "",
  work_phone: "",
  work_phone_code: "+91",
  mobile: "",
  mobile_code: "+91",
  customer_language: "English",
  
  other_details: {
    pan: "",
    currency: "INR - Indian Rupee",
    payment_terms: "Due on Receipt",
    enable_portal: false,
  },
  
  billing_address: {
    attention: "",
    country_region: "India",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pin_code: "",
    phone: "",
    phone_code: "+91",
    fax_number: "",
  },
  
  shipping_address: {
    attention: "",
    country_region: "India",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pin_code: "",
    phone: "",
    phone_code: "+91",
    fax_number: "",
    same_as_billing: false,
  },
  
  contact_persons: [
    {
      salutation: "Mr.",
      first_name: "",
      last_name: "",
      email_address: "",
      work_phone: "",
      work_phone_code: "+91",
      mobile: "",
      mobile_code: "+91",
    },
  ],
};

export const transformCustomerToPayload = (customer: Customer): any => {
  const payload = {
    customer_type: customer.customer_type,
    salutation: customer.salutation,
    first_name: customer.first_name,
    last_name: customer.last_name,
    display_name: customer.display_name,
    email_address: customer.email_address,
    work_phone: customer.work_phone,
    work_phone_code: customer.work_phone_code,
    mobile: customer.mobile,
    mobile_code: customer.mobile_code,
    customer_language: customer.customer_language,
    other_details: customer.other_details,
    billing_address: customer.billing_address,
    shipping_address: { ...customer.shipping_address },
    contact_persons: customer.contact_persons,
  };
  
  return payload;
};
