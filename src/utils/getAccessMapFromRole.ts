import { Role } from "@/constants/authroizationConstants";
import { IAccessMap } from "@/models/IAccessMap";

// Utility to generate access map based on a single user role
export const getAccessMapFromRole = (role?: Role): IAccessMap => {
  const nav: IAccessMap["nav"] = {};
  if (role === undefined || role === null) return { nav };
  
  if (role === Role.SuperAdmin) {
    // Dashboard & Reports
    nav["dashboard"] = true;
    nav["orderreport"] = true;
    nav["orders"] = true;

    // ============================================
    // PARENT MENUS - MUST BE SET TO TRUE
    // ============================================
    nav["employee"] = true;
    nav["customers"] = true;
    nav["items"] = true;
    nav["sales"] = true;          // Add this if missing
    nav["purchases"] = true;      // ✅ Parent menu
    nav["Inventory"] = true;
    nav["Manufacturing"] = true;
    nav["settings"] = true;

    // ============================================
    // EMPLOYEE CHILDREN
    // ============================================
    nav["employees"] = true;
    nav["employeeAttendance"] = true;

    // ============================================
    // CUSTOMER CHILDREN
    // ============================================
    nav["customers"] = true;      // This is both parent and child
    nav["customerPrices"] = true;

    // ============================================
    // ITEMS CHILDREN
    // ============================================
    nav["item"] = true;
    nav["itemGroups"] = true;


    // ============================================
    // PURCHASES CHILDREN - THIS IS THE FIX! ✅
    // ============================================
    nav["vendors"] = true;
    nav["purchaseOrders"] = true;  
    nav["bills"] = true;  

    // ============================================
    // INVENTORY CHILDREN
    // ============================================
    nav["inventory"] = true;
    nav["purchase"] = true;
    nav["sales"] = true;
    nav["dailyExpenses"] = true;
    nav["stockAdjustment"] = true;

    // ============================================
    // MANUFACTURING CHILDREN
    // ============================================
    nav["item"] = true;
    nav["itemGroups"] = true;
    nav["products"] = true;
    nav["production"] = true;

    // ============================================
    // SETTINGS CHILDREN
    // ============================================
    nav["users"] = true;
    nav["banks"] = true;
    nav["companySettings"] = true;
  } 
  else if (role === Role.User) {
    nav["dashboard"] = true;
    nav["orders"] = true;
    nav["campaigns"] = true;
    nav["purchaseOrders"] = true;  // ✅ Make sure this is here for regular users too
    nav["campaignmanagement"] = true;
    nav["usermanagement"] = true;
    nav["settings"] = true;
    nav["partners"] = true;
    nav["partnerreport"] = true;
    nav["customers"] = true;
    nav["orderreport"] = true;
    
    // ============================================
    // EMPLOYEE CHILDREN - ADMIN ACCESS
    // ============================================
    nav["employee"] = true;
    nav["employees"] = true;
    nav["employeeAttendance"] = true;
    
    // Add parent menu access for regular users
    nav["purchases"] = true;       // ✅ Parent menu
    nav["vendors"] = true;         // ✅ Child menu
    nav["bills"] = true;           // ✅ Bills access
  }
  
  // Add more roles/pages as needed
  return { nav };
};