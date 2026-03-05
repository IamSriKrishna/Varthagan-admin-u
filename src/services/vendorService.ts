import { apiService } from '@/lib/api/api.service';
import { 
  Vendor, 
  VendorListResponse, 
  VendorResponse, 
  CreateVendorInput, 
  UpdateVendorInput 
} from '@/models/vendor.model';

/**
 * Vendor Service
 * Handles all vendor-related API calls including creation with complete nested details:
 * - Basic vendor information
 * - Other details (tax, compliance, financial)
 * - Billing & shipping addresses
 * - Contact persons
 * - Bank account details
 *
 * Example usage:
 * const response = await vendorService.createVendor({
 *   first_name: 'Rajesh',
 *   display_name: 'AquaPlast Industries',
 *   mobile: '9876543210',
 *   other_details: {
 *     pan: 'BBCDE1234H',
 *     is_msme_registered: true,
 *     currency: 'INR',
 *     payment_terms: 'Net 45',
 *     tds: '2%',
 *     enable_portal: true
 *   },
 *   billing_address: {
 *     attention: 'Accounts Department',
 *     street: '123 Industrial Estate',
 *     city: 'Bangalore',
 *     state: 'Karnataka',
 *     country: 'India',
 *     postal_code: '560001'
 *   },
 *   bank_details: [{
 *     bank_id: 1,
 *     account_holder_name: 'AquaPlast Industries Pvt Ltd',
 *     account_number: '1234567890123456',
 *     reenter_account_number: '1234567890123456'
 *   }]
 * });
 */
export const vendorService = {
  /**
   * Get all vendors with pagination and optional search
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 100)
   * @param search - Optional search term
   * @returns Promise<VendorListResponse> - List of vendors with pagination
   */
  async getVendors(page: number = 1, limit: number = 10, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    return apiService.get(`/auth/manage/vendors?${params.toString()}`) as Promise<VendorListResponse>;
  },

  /**
   * Get a specific vendor by ID
   * @param id - Vendor ID
   * @returns Promise<VendorResponse> - Complete vendor details with nested objects
   */
  async getVendor(id: string | number) {
    return apiService.get(`/auth/manage/vendors/${id}`) as Promise<VendorResponse>;
  },

  /**
   * Create a new vendor with complete nested details
   * 
   * Request body structure:
   * {
   *   first_name: 'Rajesh',                    // Required
   *   last_name: 'Kumar',                      // Optional
   *   display_name: 'AquaPlast Industries',    // Required
   *   mobile: '9876543210',                    // Recommended
   *   email_address: 'rajesh@aquaplast.com',   // Optional but recommended
   *   vendor_language: 'English',              // Optional
   *   other_details: {                         // Optional nested object
   *     pan: 'BBCDE1234H',
   *     is_msme_registered: true,
   *     currency: 'INR',
   *     payment_terms: 'Net 45',
   *     tds: '2%',
   *     enable_portal: true,
   *     website_url: 'https://www.aquaplast.com',
   *     department: 'Sales',
   *     designation: 'Regional Manager'
   *   },
   *   billing_address: {                       // Optional nested object
   *     attention: 'Accounts Department',
   *     street: '123 Industrial Estate',
   *     address_line2: 'Block A',
   *     city: 'Bangalore',
   *     state: 'Karnataka',
   *     country: 'India',
   *     postal_code: '560001',
   *     phone: '08041234567',
   *     phone_code: '+91'
   *   },
   *   shipping_address: {...},                 // Optional nested object
   *   contact_persons: [{                      // Optional array
   *     first_name: 'Suresh',
   *     last_name: 'Singh',
   *     email_address: 'suresh@aquaplast.com',
   *     mobile: '9876543211'
   *   }],
   *   bank_details: [{                         // Optional array
   *     bank_id: 1,
   *     account_holder_name: 'AquaPlast Industries Pvt Ltd',
   *     account_number: '1234567890123456',
   *     reenter_account_number: '1234567890123456'
   *   }]
   * }
   * 
   * Note: user_id and company_id are automatically set from JWT token
   * @param data - Vendor creation data
   * @returns Promise<VendorResponse> - Created vendor with all nested details
   */
  async createVendor(data: CreateVendorInput) {
    return apiService.post('/auth/manage/vendors', data) as Promise<VendorResponse>;
  },

  /**
   * Update an existing vendor
   * @param id - Vendor ID
   * @param data - Partial vendor data to update
   * @returns Promise<VendorResponse> - Updated vendor details
   */
  async updateVendor(id: string | number, data: UpdateVendorInput) {
    return apiService.put(`/auth/manage/vendors/${id}`, data) as Promise<VendorResponse>;
  },

  /**
   * Delete a vendor
   * @param id - Vendor ID
   * @returns Promise - Deletion response
   */
  async deleteVendor(id: string | number) {
    return apiService.delete(`/auth/manage/vendors/${id}`);
  },

  /**
   * Bulk create vendors
   * @param vendors - Array of vendor data
   * @returns Promise - Bulk creation response
   */
  async createBulkVendors(vendors: CreateVendorInput[]) {
    return apiService.post('/auth/manage/vendors/bulk', { vendors });
  },

  /**
   * Get vendor by email address
   * @param email - Vendor email address
   * @returns Promise<VendorResponse> - Vendor details
   */
  async getVendorByEmail(email: string) {
    return apiService.get(`/auth/manage/vendors/email/${email}`) as Promise<VendorResponse>;
  },
};
