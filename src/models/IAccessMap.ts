export interface IAccessMap {
  nav: {
    dashboard?: boolean;
    categories?: boolean;
    campaigns?: boolean;
    campaignmanagement?: boolean;
    usermanagement?: boolean;
    settings?: boolean;
    partners?: boolean;
    partnerreport?: boolean;
    orderreport?: boolean;
    coupons?: boolean;
    // New ones for settings
    users?: boolean;
    banks?: boolean;
    companySettings?: boolean;
    // Parent menu items - ADD THESE
    items?: boolean;           // ← Add this
    purchases?: boolean;       // ← Add this
    employee?: boolean;        // ← Add this
    Inventory?: boolean;       // ← Add this
    Manufacturing?: boolean;   // ← Add this
    //Manufacturing management (children)
    item?: boolean;
    itemGroups?: boolean;
    products?: boolean;
    production?: boolean;
    // Inventory management (children)
    inventory?: boolean;
    purchase?: boolean;
    sales?: boolean;
    orders?: boolean;
    dailyExpenses?: boolean;
    stockAdjustment?: boolean;
    // Vendors management
    vendors?: boolean;
    // Purchase Orders management
    purchaseOrders?: boolean;
    vendorPrices?: boolean;
    // customer management
    customers?: boolean;
    customerPrices?: boolean;
    //employee management (children)
    employees?: boolean;
    employeeAttendance?: boolean;

    bills?: boolean;
  };
}