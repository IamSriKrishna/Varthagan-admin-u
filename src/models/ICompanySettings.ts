export interface ICompanySettings {
    id?: number;
    company_id?: number;
    name: string;
    // Contact
    mobile: string;
    alternate_mobile?: string;
    email: string;
    // Address
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
    // Business info
    gst_number?: string;
    pan_number?: string;
    business_type?: string;
    // Bank Details
    bank_name?: string;
    account_holder_name?: string;
    account_number?: string;
    ifsc_code?: string;
    branch_name?: string;
    // UPI details
    upi_id?: string;
    upi_qr_url?: string;
    // Invoice settings
    invoice_prefix?: string;
    invoice_start_number?: number;
    show_logo?: boolean;
    show_signature?: boolean;
    // Tax settings
    gst_enabled?: boolean;
    tax_type?: "GST" | "VAT" | "NONE";
    // Currency & locale
    currency?: string;
    currency_symbol?: string;
    language?: string;
    timezone?: string;
    // Other settings
    low_stock_alert?: boolean;
    round_off_invoice?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default ICompanySettings;
