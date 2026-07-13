import { Customer } from "@/models/customer.model";

const DEFAULT_OTHER_DETAILS = {
  pan: "",
  currency: "INR - Indian Rupee",
  payment_terms: "Due on Receipt",
  enable_portal: false,
};

const DEFAULT_BILLING_ADDRESS = {
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
};

const DEFAULT_CONTACT_PERSON = {
  salutation: "Mr.",
  first_name: "",
  last_name: "",
  email_address: "",
  work_phone: "",
  work_phone_code: "+91",
  mobile: "",
  mobile_code: "+91",
};

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
  other_details: { ...DEFAULT_OTHER_DETAILS },
  billing_address: { ...DEFAULT_BILLING_ADDRESS },
  shipping_address: { ...DEFAULT_BILLING_ADDRESS, same_as_billing: false },
  contact_persons: [{ ...DEFAULT_CONTACT_PERSON }],
};

const normalizeAddress = (address?: any, fallbackAddress?: Record<string, any>): Record<string, any> => ({
  ...DEFAULT_BILLING_ADDRESS,
  ...(fallbackAddress ?? {}),
  ...(address ?? {}),
  address_line1: address?.address_line1 ?? address?.address_line_1 ?? address?.street ?? fallbackAddress?.address_line1 ?? "",
  address_line2: address?.address_line2 ?? address?.address_line_2 ?? fallbackAddress?.address_line2 ?? "",
  city: address?.city ?? fallbackAddress?.city ?? "",
  state: address?.state ?? fallbackAddress?.state ?? "",
  country_region: address?.country_region ?? address?.country ?? fallbackAddress?.country_region ?? "India",
  pin_code: address?.pin_code ?? address?.postal_code ?? address?.zip_code ?? fallbackAddress?.pin_code ?? "",
  phone: address?.phone ?? fallbackAddress?.phone ?? "",
  phone_code: address?.phone_code ?? fallbackAddress?.phone_code ?? "+91",
  fax_number: address?.fax_number ?? fallbackAddress?.fax_number ?? "",
});

const normalizeContactPersons = (contactPersons?: any[]) => {
  if (!Array.isArray(contactPersons) || contactPersons.length === 0) {
    return [{ ...DEFAULT_CONTACT_PERSON }];
  }

  return contactPersons.map((contact) => ({
    ...DEFAULT_CONTACT_PERSON,
    ...contact,
    work_phone_code: contact?.work_phone_code ?? "+91",
    mobile_code: contact?.mobile_code ?? "+91",
  }));
};

export const normalizeCustomerData = (customer?: Partial<Customer> | null): Customer => {
  const source = customer ?? {};
  const billingAddress = normalizeAddress(source.billing_address as any);
  const shippingAddress = normalizeAddress(source.shipping_address as any, billingAddress);

  return {
    ...source,
    customer_type: source.customer_type ?? initialCustomerValues.customer_type,
    salutation: source.salutation ?? initialCustomerValues.salutation,
    first_name: source.first_name ?? "",
    last_name: source.last_name ?? "",
    display_name: source.display_name ?? "",
    email_address: source.email_address ?? "",
    work_phone: source.work_phone ?? "",
    work_phone_code: source.work_phone_code ?? "+91",
    mobile: source.mobile ?? "",
    mobile_code: source.mobile_code ?? "+91",
    customer_language: source.customer_language ?? "English",
    other_details: {
      ...DEFAULT_OTHER_DETAILS,
      ...(source.other_details ?? {}),
      currency: source.other_details?.currency ?? "INR - Indian Rupee",
      payment_terms: source.other_details?.payment_terms ?? "Due on Receipt",
      enable_portal: Boolean(source.other_details?.enable_portal ?? false),
    },
    billing_address: billingAddress,
    shipping_address: {
      ...shippingAddress,
      same_as_billing: Boolean((source.shipping_address as any)?.same_as_billing ?? false),
    },
    contact_persons: normalizeContactPersons(source.contact_persons as any[]),
  };
};

export const transformCustomerToPayload = (customer: Customer): any => {
  const normalized = normalizeCustomerData(customer);

  return {
    customer_type: normalized.customer_type,
    salutation: normalized.salutation,
    first_name: normalized.first_name,
    last_name: normalized.last_name,
    display_name: normalized.display_name,
    email_address: normalized.email_address,
    work_phone: normalized.work_phone,
    work_phone_code: normalized.work_phone_code,
    mobile: normalized.mobile,
    mobile_code: normalized.mobile_code,
    customer_language: normalized.customer_language,
    other_details: normalized.other_details,
    billing_address: normalized.billing_address,
    shipping_address: { ...normalized.shipping_address },
    contact_persons: normalized.contact_persons,
  };
};
