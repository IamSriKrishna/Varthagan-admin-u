import { apiService } from '@/lib/api/api.service';
import { 
  Customer, 
  CustomerListResponse, 
  CustomerResponse, 
  CreateCustomerInput, 
  UpdateCustomerInput 
} from '@/models/customer.model';

/**
 * Customer Service
 * Handles all customer-related API calls including creation with complete nested details:
 * - Basic customer information
 * - Other details (tax, financial terms)
 * - Billing & shipping addresses
 * - Contact persons
 *
 * Example usage:
 * const response = await customerService.createCustomer({
 *   customer_type: 'Business',
 *   first_name: 'Amit',
 *   display_name: 'Fresh Water Retail',
 *   mobile: '9876543200',
 *   other_details: {
 *     pan: 'BBCDE1234H',
 *     currency: 'INR',
 *     payment_terms: 'Net 30',
 *     enable_portal: true
 *   },
 *   billing_address: {
 *     street: '456 Market Street',
 *     city: 'Bangalore',
 *     state: 'Karnataka',
 *     country: 'India',
 *     postal_code: '560002'
 *   }
 * });
 */
export const customerService = {
  /**
   * Get all customers with pagination and optional search
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 100)
   * @param search - Optional search term
   * @returns Promise<CustomerListResponse> - List of customers with pagination
   */
  async getCustomers(page: number = 1, limit: number = 10, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    return apiService.get(`/auth/manage/customers?${params.toString()}`) as Promise<CustomerListResponse>;
  },

  /**
   * Get a specific customer by ID
   * @param id - Customer ID
   * @returns Promise<CustomerResponse> - Complete customer details with nested objects
   */
  async getCustomer(id: string | number) {
    return apiService.get(`/auth/manage/customers/${id}`) as Promise<CustomerResponse>;
  },

  /**
   * Create a new customer with complete nested details
   * 
   * Request body structure:
   * {
   *   customer_type: 'Business',        // Required: Business or Individual
   *   first_name: 'Amit',               // Required
   *   display_name: 'Fresh Water',      // Required
   *   mobile: '9876543200',             // Recommended
   *   email_address: 'amit@example.com',// Optional but recommended
   *   other_details: {                  // Optional nested object
   *     pan: 'BBCDE1234H',
   *     currency: 'INR',
   *     payment_terms: 'Net 30',
   *     enable_portal: true
   *   },
   *   billing_address: {                // Optional nested object
   *     attention: 'Finance',
   *     street: '456 Market Street',
   *     city: 'Bangalore',
   *     state: 'Karnataka',
   *     postal_code: '560002'
   *   },
   *   contact_persons: [...]            // Optional array
   * }
   * 
   * Note: user_id and company_id are automatically set from JWT token
   * @param data - Customer creation data
   * @returns Promise<CustomerResponse> - Created customer with all nested details
   */
  async createCustomer(data: CreateCustomerInput) {
    return apiService.post('/auth/manage/customers', data) as Promise<CustomerResponse>;
  },

  /**
   * Update an existing customer
   * @param id - Customer ID
   * @param data - Partial customer data to update
   * @returns Promise<CustomerResponse> - Updated customer details
   */
  async updateCustomer(id: string | number, data: UpdateCustomerInput) {
    return apiService.put(`/auth/manage/customers/${id}`, data) as Promise<CustomerResponse>;
  },

  /**
   * Delete a customer
   * @param id - Customer ID
   * @returns Promise - Deletion response
   */
  async deleteCustomer(id: string | number) {
    return apiService.delete(`/auth/manage/customers/${id}`);
  },

  /**
   * Bulk create customers
   * @param customers - Array of customer data
   * @returns Promise - Bulk creation response
   */
  async createBulkCustomers(customers: CreateCustomerInput[]) {
    return apiService.post('/auth/manage/customers/bulk', { customers });
  },
};
