export const login = {
  postLogin: "/auth/login/password",
};
export const usermangement = {
  refreshToken: "/auth/refresh-token",
  getUsers: "/auth/admin/users",
  postUsers: "/auth/admin/create-user",
  deleteUser: "/auth/admin/users",
  resetUser: "/auth/admin/reset-password",
  changePassword: "/auth/change-password",
};
export const products = {
  //get by id
  getProducts: "/products",
  //create,update,delete,get
  postProduct: "/products",
};
export const productsimage = {
  //update and delete and post
  postProductimage: "/products/images",
  //update by id
  getProductImagesByProductId: (id: string) => `/products/${id}/images`,
};

export const categoryimage = {
  postCategoryimage: "/admin/categories/images",
  getCategoryImagesByCategoryId: (id: string) => `/admin/categories/${id}/images`,
};
export const membership = {
  postMemberShip: (id: number) => `/admin/customers/${id}/membership`,
};
export const tags = {
  //get and get by id
  getTags: "/public/tags",
  //post-put-delete
  postTags: "/admin/tags",
};
export const upload = {
  postUpload: "/admin/media/presigned-url",
};

export const category = {
  //get list and get by id
  getCategory: "/public/categories",
  //post-put-delete
  postCategory: "/admin/categories",
};

export const orders = {
  //get list and get by id
  getDashboardStats: "/auth/admin/dashboard/stats",
  getDashboard: "/admin/dashboard/orders",
  getDashboardById: (vendor_id: string) => `/vendors/${vendor_id}/dashboard/orders`,
  getOrders: "/admin/orders",
  getOrderReport: "/admin/reports/commission",
  getOrderById: (order_id: string) => `/admin/orders/${order_id}`,
  postOrders: (customer_id: string) => `/customers/${customer_id}/orders`,
  updateOrder: (order_id: string) => `/admin/orders/${order_id}`,
  deleteOrders: (customer_id: string, order_id: string) => `/customers/${customer_id}/orders/${order_id}`,
};
export const coupon = {
  getCoupons: "/admin/coupons",
  getCouponById: (coupon_id: string) => `/admin/coupons/${coupon_id}`,
};
export const partners = {
  getPartners: "/public/partners",
  getPartnerById: (partner_id: string) => `/admin/partners/${partner_id}`,
  getPartnerOrders: (partner_id: string) => `/partners/${partner_id}/orders`,
  postPartner: "/admin/partners/profile",
  updatePartner: (partner_id: string) => `/admin/partners/${partner_id}/profile`,
  deletePartner: (partner_id: string) => `/admin/partners/${partner_id}`,
};

export const vendors = {
  getVendors: "/admin/vendors",
  getPublicVendors: "/public/vendors",
  getVendorById: (vendor_id: string) => `/admin/vendors/${vendor_id}`,
  getVendorOrderReport: (vendor_id: string) => `/vendors/${vendor_id}/reports/commission`,
  postVendor: "/admin/vendors",
  getVendorOrder: (vendor_id: string) => `/vendors/${vendor_id}/orders`,
  updateVendor: (vendor_id: string) => `/admin/vendors/${vendor_id}`,
  deleteVendor: (vendor_id: string) => `/admin/vendors/${vendor_id}`,
};
export const campagin = {
  //get list
  getCampagin: "/public/campaigns",
  //get by id,put,delete
  getCampaginDetails: (campaign_id: string) => `/public/campaigns/${campaign_id}`,
  //get by id,put,delete
  updateCampaginDetails: (campaign_id: string) => `/admin/campaigns/${campaign_id}`,
  getCampaginSliders: (campaign_id: string) => `/public/campaigns/${campaign_id}/slides`,
  postCampaign: "/admin/campaigns",
  deleteCampaign: (customer_id: string, order_id: string) => `/customers/${customer_id}/orders/${order_id}`,
};
export const campaignmanagement = {
  getCampaignManagement: "/public/home-screen-config",
  postCampaignManagement: "/admin/home-screen-config",
};

export const payments = {
  postPayment: "/admin/payments/razorpay/orders",
  pollPayments: (orderId: string) => `/admin/payments/orders/${orderId}/status`,
  cashPayment: (orderId: string) => `/admin/payments/orders/${orderId}/cash`,
};
export const slider = {
  postSlider: (campaign_id: string) => `/admin/campaigns/${campaign_id}/slides`,
  getSlider: (campaign_id: string) => `/public/campaigns/${campaign_id}/slides`,
  putSlider: (campaign_id: string, slide_id: string) => `/admin/campaigns/${campaign_id}/slides/${slide_id}`,
  SliderReorder: (campaign_id: string) => `/admin/campaigns/${campaign_id}/slides/reorder`,
};
export const customers = {
  getCustomers: "/admin/customers",
  postCustomer: "/admin/customers",
  getCustomerAddress: (customer_id: string) => `/admin/${customer_id}/addresses`,
  getCustomerById: (customer_id: string) => `/admin/customers/${customer_id}`,
  getCustomerOrders: (customer_id: string) => `/customers/${customer_id}/orders`,
  updateCustomer: (customer_id: string) => `/admin/customers/${customer_id}/profile`,
};

export const bank = {
  getBanks: "/banks",
  postBank: "/banks",
};

export const companySettings = {
  getCompanySettings: "/auth/admin/company-settings",
  postCompanySettings: "/auth/admin/company-settings",
  updateCompanySettings: (id: string | number) => `/auth/admin/company-settings/${id}`,
  deleteCompanySettings: (id: string | number) => `/auth/admin/company-settings/${id}`,
};

export const invoices = {
  getInvoices: "/invoices",
  getInvoiceById: (id: string) => `/invoices/${id}`,
  getInvoicesByStatus: (status: string) => `/invoices/status/${status}`,
  getInvoicesByCustomer: (customerId: string) => `/customers/${customerId}/invoices`,
  getPaymentsByInvoice: (invoiceId: string) => `/invoices/${invoiceId}/payments`,
  postInvoice: "/invoices",
  updateInvoice: (id: string) => `/invoices/${id}`,
  deleteInvoice: (id: string) => `/invoices/${id}`,
  updateInvoiceStatus: (id: string) => `/invoices/${id}/status`,
};

export const salespersons = {
  getSalespersons: "/salespersons",
  getSalespersonById: (id: string) => `/salespersons/${id}`,
  postSalesperson: "/salespersons",
  updateSalesperson: (id: string) => `/salespersons/${id}`,
  deleteSalesperson: (id: string) => `/salespersons/${id}`,
};

export const taxes = {
  getTaxes: "/admin/taxes",
  getTaxById: (id: string) => `/admin/taxes/${id}`,
  postTax: "/admin/taxes",
  updateTax: (id: string) => `/admin/taxes/${id}`,
  deleteTax: (id: string) => `/admin/taxes/${id}`,
};

export const dashboard = {
  // Main dashboard endpoints
  getDashboard: "/dashboard",
  getActivity: "/dashboard/activity",
  getStock: "/dashboard/stock",
  getShipmentTracking: (shipment_id: string) => `/dashboard/shipment/${shipment_id}/tracking`,
  addShipmentTracking: (shipment_id: string) => `/dashboard/shipment/${shipment_id}/tracking`,
  getTrends: (entity_type: string) => `/dashboard/trends/${entity_type}`,
  refreshDashboard: "/dashboard/refresh",
};