
import { Vendor } from "@/models/vendor.model";

export const initialVendorValues: Vendor = {
  salutation: "Mr",
  first_name: "",
  last_name: "",
  company_name: "",
  display_name: "",
  email_address: "",
  work_phone: "",
  work_phone_code: "+91",
  mobile: "",
  mobile_code: "+91",
  vendor_language: "English",
  gstin: "",
  
  other_details: {
    pan: "",
    is_msme_registered: false,
    currency: "INR- Indian Rupee",
    payment_terms: "Due on Receipt",
    tds: "0%",
    enable_portal: false,
    website_url: "",
    department: "",
    designation: "",
    twitter: "",
    skype_name: "",
    facebook: "",
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
    address_type: "billing",
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
    address_type: "shipping",
  },
  
  contact_persons: [
    {
      salutation: "Mr",
      first_name: "",
      last_name: "",
      email_address: "",
      work_phone: "",
      work_phone_code: "+91",
      mobile: "",
      mobile_code: "+91",
    },
  ],
  
  bank_details: [
    {
      bank_id: "",
      account_holder_name: "",
      account_number: "",
      ifsc_code: "",
      branch_name: "",
      is_primary: true,
      is_active: true,
    },
  ],
  documents: [],
};

export const transformVendorToPayload = (vendor: Vendor): any => {
  const payload = {
    salutation: vendor.salutation,
    first_name: vendor.first_name,
    last_name: vendor.last_name,
    company_name: vendor.company_name,
    display_name: vendor.display_name,
    email_address: vendor.email_address,
    work_phone: vendor.work_phone,
    work_phone_code: vendor.work_phone_code,
    mobile: vendor.mobile,
    mobile_code: vendor.mobile_code,
    vendor_language: vendor.vendor_language,
    gstin: vendor.gstin,
    other_details: vendor.other_details,
    billing_address: {
      ...vendor.billing_address,
      address_type: "billing",
    },
    shipping_address: {
      ...vendor.shipping_address,
      address_type: "shipping",
    },
    contact_persons: vendor.contact_persons,
    bank_details: vendor.bank_details,
  };
  
  return payload;
};