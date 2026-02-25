export const config = {
  loginDomain: process.env.NEXT_PUBLIC_LOGIN_DOMAIN,
  apiDomain: process.env.NEXT_PUBLIC_API_DOMAIN,
  orderDomain: process.env.NEXT_PUBLIC_ORDER_DOMAIN,
  partnerDomain: process.env.NEXT_PUBLIC_PARTNER_DOMAIN,
  vendorDomain: process.env.NEXT_PUBLIC_VENDOR_DOMAIN,
  campaginDomain: process.env.NEXT_PUBLIC_CAMPAIGN_DOMAIN,
  customerDomain: process.env.NEXT_PUBLIC_CUSTOMER_DOMAIN,
  // Razorpay configuration
  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },
  appConfig: {
    gstPercentage: 5,
  },
};
