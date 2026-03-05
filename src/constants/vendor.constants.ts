export const SALUTATION_OPTIONS = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
  { value: "Dr", label: "Dr" },
];

export const COUNTRY_OPTIONS = [
  { value: "India", label: "India" },
  { value: "USA", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "UAE", label: "United Arab Emirates" },
];

export const CURRENCY_OPTIONS = [
  { value: "INR- Indian Rupee", label: "INR- Indian Rupee" },
  { value: "USD - US Dollar", label: "USD - US Dollar" },
  { value: "EUR - Euro", label: "EUR - Euro" },
  { value: "GBP - British Pound", label: "GBP - British Pound" },
];

export const PAYMENT_TERMS_OPTIONS = [
  { value: "Due on Receipt", label: "Due on Receipt" },
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 45", label: "Net 45" },
  { value: "Net 60", label: "Net 60" },
  { value: "Due end of the month", label: "Due end of the month" },
  { value: "Due end of next month", label: "Due end of next month" },
];

export const TDS_OPTIONS = [
  { value: "0%", label: "0%" },
  { value: "1%", label: "1%" },
  { value: "2%", label: "2%" },
  { value: "5%", label: "5%" },
  { value: "10%", label: "10%" },
  { value: "194C", label: "194C - Payments to contractors" },
  { value: "194I", label: "194I - Rent" },
  { value: "194J", label: "194J - Professional fees" },
  { value: "194H", label: "194H - Commission/brokerage" },
];

export const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "Tamil", label: "Tamil" },
  { value: "Telugu", label: "Telugu" },
  { value: "Kannada", label: "Kannada" },
  { value: "Malayalam", label: "Malayalam" },
];

export const PHONE_CODE_OPTIONS = [
  { value: "+91", label: "+91" },
  { value: "+1", label: "+1" },
  { value: "+44", label: "+44" },
  { value: "+971", label: "+971" },
];

export const VENDOR_ENDPOINTS = {
  CREATE: "/auth/manage/vendors",
  GET_ALL: (page: number = 1, limit: number = 10, search?: string) =>
    `/auth/manage/vendors?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`,
  GET_BY_ID: (id: string | number) => `/auth/manage/vendors/${id}`,
  UPDATE: (id: string | number) => `/auth/manage/vendors/${id}`,
  DELETE: (id: string | number) => `/auth/manage/vendors/${id}`,
  SEARCH: (query: string, page: number = 1, limit: number = 10) =>
    `/auth/manage/vendors/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
} as const;
