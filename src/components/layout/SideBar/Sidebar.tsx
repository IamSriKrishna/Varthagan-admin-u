"use client";

import BrandLogo from "@/components/layout/BrandLogo/BrandLogo";
import VendorsSelect from "@/components/vendors/VendorsSelect";
import { persistor, RootState } from "@/store";
import { logout } from "@/store/auth/authSlice";
import { clearVendors, setSelectedVendor } from "@/store/vendors/vendorsSlice";
import { gradients } from "@/styles/gradients";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popover,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ChevronDown,
  ChevronRight,
  Handshake,
  Home,
  LayoutGrid,
  Package,
  Settings,
  Settings2,
  ShoppingCart,
  Ticket,
  User,
  Landmark,
  Boxes,
  Factory,
  Fingerprint,
  IndianRupee,
  Box as BoxIcon,
  User2Icon,
  BoxesIcon,
  Receipt,
  Plus,
  Truck,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import * as classes from "./Sidebar.styles";

const drawerWidth = 240;

const baseMenuItems: Array<{
  key: string;
  icon?: React.ElementType;
  label: string;
  path?: string;
  type?: "section";
  children?: Array<{
    key: string;
    icon?: React.ElementType;
    label: string;
    path: string;
  }>;
}> = [
  {
    key: "dashboard",
    icon: Home,
    label: "Dashboard",
    path: "/",
  },
  {
    key: "apps-pages-section",
    type: "section",
    label: "APPS & PAGES",
  },
  {
    key: "employee",
    icon: User,
    label: "Employees",
    children: [
      { key: "employees", icon: User, label: "Employees", path: "/employees" },
      { key: "employeeAttendance", icon: Fingerprint, label: "Employee Attendance", path: "/employee-attendance" },
    ],
  },
  {
    key: "customers",
    icon: User,
    label: "Customers",
    children: [
      { key: "customers", icon: User, label: "Customers", path: "/customers" },
      // { key: "customerPrices", icon: IndianRupee, label: "Customer Price", path: "/customer-price" },
    ],
  },
  {
    key: "items",
    icon: BoxIcon,
    label: "Items",
    children: [
      { key: "item", icon: BoxIcon, label: "Item", path: "/items" },
      { key: "itemGroups", icon: Boxes, label: "Item Groups", path: "/item-groups" },
    ],
  },
  {
    key: "products",
    icon: Package,
    label: "Products",
    children: [
      { key: "productList", icon: Package, label: "Products", path: "/products" },
      { key: "productGroups", icon: Boxes, label: "Product Groups", path: "/products/product-groups" },
    ],
  },
  {
    key: "shipments",
    icon: Truck,
    label: "Shipments",
    children: [
      { key: "shipments", icon: Truck, label: "Shipments", path: "/shipments" },
      { key: "tracking", icon: Truck, label: "Tracking", path: "/shipments/tracking" },
    ],
  },
  // {
  //   key: "sales",
  //   icon: BoxesIcon,
  //   label: "Sales",
  //   children: [{ key: "customer", icon: User2Icon, label: "Customer", path: "/customer" }],
  // },
  {
    key: "purchases",
    icon: User,
    label: "Purchases",
    children: [
      { key: "vendors", icon: User, label: "Vendors", path: "/vendors" },
      { key: "purchaseOrders", icon: ShoppingCart, label: "Purchase Orders", path: "/purchase-orders" },
      { key: "salesOrders", icon: ShoppingCart, label: "Sales Orders", path: "/sales-orders" },
      { key: "packages", icon: Package, label: "Packages", path: "/packages" },
      { key: "bills", icon: Receipt, label: "Bills", path: "/bills" },
      { key: "invoices", icon: Receipt, label: "Invoices", path: "/invoices" },
    ],
  },
  {
    key: "Inventory",
    icon: User,
    label: "Inventory",
    children: [
      { key: "inventory", icon: Boxes, label: "Product Management", path: "/inventory" },
      { key: "stock", icon: Boxes, label: "Stock Management", path: "/stock" },
    ],
  },
  {
    key: "Manufacturing",
    icon: Factory,
    label: "Manufacturing",
    children: [
      { key: "production", icon: Factory, label: "Production Orders", path: "/production-orders" },
    ],
  },
  {
    key: "settings",
    icon: Settings,
    label: "Settings",
    children: [
      { key: "users", icon: User, label: "Users", path: "/users" },
      { key: "banks", icon: Landmark, label: "Banks", path: "/banks" },
      { key: "companySettings", icon: Settings2, label: "Company Setting", path: "/company-settings" },
    ],
  },
];

export default function Sidebar({
  mobileOpen,
  drawerOpen,
  handleDrawerToggle,
  openMenuKey,
  setOpenMenuKey,
}: {
  mobileOpen: boolean;
  drawerOpen: boolean;
  handleDrawerToggle: () => void;
  openMenuKey: string | null;
  setOpenMenuKey: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const selectedVendorId = useSelector((s: RootState) => s.vendors?.selectedVendorId ?? null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const accessMap = useSelector((state: RootState) => state.auth.accessMap);
  const userName = useSelector((state: RootState) => state.auth.user?.username || "");
  const userType = useSelector((state: RootState) => state.auth.user?.user_type || "");
  const user = useSelector((state: RootState) => state.auth.user);
  const [popoverAnchor, setPopoverAnchor] = useState<{
    element: HTMLElement;
    children: (typeof baseMenuItems)[0]["children"];
  } | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const savedOpenMenuKey = localStorage.getItem("sidebar-open-menu");
    if (savedOpenMenuKey) {
      setOpenMenuKey(savedOpenMenuKey);
    }
  }, [setOpenMenuKey]);

  useEffect(() => {
    if (openMenuKey) {
      localStorage.setItem("sidebar-open-menu", openMenuKey);
    } else {
      localStorage.removeItem("sidebar-open-menu");
    }
  }, [openMenuKey]);

  // ============================================
  // 🔍 DEBUG LOGGING - START
  // ============================================
  console.group('🔍 SIDEBAR DEBUG - Access Map');
  console.log('Full accessMap:', accessMap);
  console.log('accessMap.nav:', accessMap?.nav);
  console.log('purchases key:', accessMap?.nav?.purchases);
  console.log('purchaseOrders key:', accessMap?.nav?.purchaseOrders);
  console.log('vendors key:', accessMap?.nav?.vendors);
  console.groupEnd();

  console.group('👤 USER INFO');
  console.log('User Type:', userType);
  console.log('User Name:', userName);
  console.log('Full User Object:', user);
  console.groupEnd();

  console.group('📋 BASE MENU ITEMS');
  const purchasesItem = baseMenuItems.find(item => item.key === 'purchases');
  console.log('Purchases menu item:', purchasesItem);
  console.log('Purchases children:', purchasesItem?.children);
  console.groupEnd();
  // ============================================
  // 🔍 DEBUG LOGGING - END
  // ============================================

  const menuItems = baseMenuItems
    .map((item) => {
      console.log(`\n--- Processing item: ${item.key} ---`);
      
      if (item.children && item.children.length > 0) {
        console.log(`  Item has ${item.children.length} children`);
        
        // Always show these items regardless of access control
        const alwaysShowItems = ['purchaseOrders', 'vendors',"bills", "invoices", "salesOrders", "packages", "shipments"];
        
        // Add employee items and items menu children if user is admin
        const isAdmin = userType === 'admin';
        if (isAdmin) {
          alwaysShowItems.push('employees', 'employeeAttendance', 'item', 'itemGroups', 'productList', 'productGroups');
        }
        
        const filteredChildren = item.children.filter((child) => {
          const hasAccess = (accessMap?.nav as Record<string, boolean | undefined>)?.[child.key];
          console.log(`    Child: ${child.key}, Access: ${hasAccess}`);
          return hasAccess || alwaysShowItems.includes(child.key);
        });
        
        console.log(`  Filtered children count: ${filteredChildren.length}`);
        console.log(`  Filtered children:`, filteredChildren.map(c => c.key));
        
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter((item) => {
      if (item.type === "section") {
        console.log(`  Section: ${item.label} - KEEPING`);
        return true;
      }

      const hasAccess = (accessMap?.nav as Record<string, boolean | undefined>)?.[item.key];
      const hasVisibleChildren = !!item.children && item.children.length > 0;

      // Show employee menu only for admin users
      if (item.key === 'employee') {
        const shouldShow = userType === 'admin';
        console.log(`  ${item.key}: Admin check - ${userType} === 'admin' = ${shouldShow}`);
        return shouldShow;
      }

      // Show items menu only for admin users
      if (item.key === 'items') {
        const shouldShow = userType === 'admin';
        console.log(`  ${item.key}: Admin check - ${userType} === 'admin' = ${shouldShow}`);
        return shouldShow;
      }

      // Show products menu only for admin users
      if (item.key === 'products') {
        const shouldShow = userType === 'admin';
        console.log(`  ${item.key}: Admin check - ${userType} === 'admin' = ${shouldShow}`);
        return shouldShow;
      }

      // Show shipments menu for all users
      if (item.key === 'shipments') {
        console.log(`  ${item.key}: Showing for all users`);
        return true;
      }

      // Hide settings menu for admin users
      if (item.key === 'settings') {
        const shouldShow = userType !== 'admin';
        console.log(`  ${item.key}: Hiding from admin - ${userType} !== 'admin' = ${shouldShow}`);
        return shouldShow;
      }

      console.log(`  ${item.key}:`);
      console.log(`    - hasAccess: ${hasAccess}`);
      console.log(`    - hasVisibleChildren: ${hasVisibleChildren}`);
      console.log(`    - Will show: ${hasAccess || hasVisibleChildren}`);

      return hasAccess || hasVisibleChildren;
    });

  console.group('✅ FINAL MENU ITEMS');
  console.log('Total menu items:', menuItems.length);
  console.log('Menu item keys:', menuItems.map(item => item.key));
  const finalPurchases = menuItems.find(item => item.key === 'purchases');
  console.log('Purchases in final menu:', finalPurchases);
  console.log('Purchases children in final menu:', finalPurchases?.children);
  console.groupEnd();

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(clearVendors());
    dispatch(setSelectedVendor(null));
    await persistor.purge();
    router.replace("/login");
  };

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement>,
    children?: (typeof baseMenuItems)[0]["children"],
  ) => {
    if (!drawerOpen && children && children.length > 0) {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        setCloseTimeout(null);
      }
      setPopoverAnchor({ element: event.currentTarget, children });
    }
  };

  const handlePopoverClose = () => {
    const timeout = setTimeout(() => setPopoverAnchor(null), 150);
    setCloseTimeout(timeout);
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", height: 64 }}>
        <BrandLogo open={drawerOpen} onClose={handleDrawerToggle} isSmallScreen={isMobile} />
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", pr: drawerOpen ? 2 : 1, py: 2 }}>
        <List>
          {menuItems.map((item) => {
            if (item.type == "section") {
              if (!drawerOpen) return null;
              return (
                <Box key={item.key} sx={{ my: 2, display: { xs: "none", sm: "flex" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <Box sx={{ flex: 0.5, height: 1.5, backgroundColor: "#2E263D1F" }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "Inter",
                        fontWeight: 400,
                        fontSize: "13px",
                        lineHeight: "18px",
                        letterSpacing: "0.4px",
                        color: theme.palette.text.disabled,
                        mx: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Box sx={{ flex: 1, height: 1.5, backgroundColor: "#2E263D1F" }} />
                  </Box>
                </Box>
              );
            }

            const { key, icon: Icon, label, path, children } = item;
            const hasChildren = !!children?.length;
            const isOpen = openMenuKey === key;
            const isParentActive = pathname === path || children?.some((child) => child.path === pathname);

            return (
              <Box key={key}>
                <Tooltip title={!drawerOpen ? label : ""} placement="right" arrow>
                  <ListItemButton
                    onMouseEnter={(e) => handlePopoverOpen(e, children)}
                    onMouseLeave={handlePopoverClose}
                    onClick={() => {
                      if (hasChildren) {
                        setOpenMenuKey((prev) => (prev === key ? null : key));
                      } else if (path) {
                        setOpenMenuKey(null);
                        router.push(path);
                        if (isMobile) handleDrawerToggle();
                      }
                    }}
                    selected={isParentActive}
                    sx={{
                      ...classes.mainListItemButton,
                      ...(isParentActive && {
                        background: gradients.primary,
                        color: "#fff",
                        "& .MuiListItemIcon-root": {
                          color: "#fff",
                        },
                      }),
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: drawerOpen ? 40 : "unset", justifyContent: "center" }}>
                      {Icon && <Icon size={18} />}
                    </ListItemIcon>

                    {drawerOpen && (
                      <>
                        <ListItemText
                          primary={label}
                          slotProps={{
                            primary: {
                              sx: {
                                fontSize: "14px",
                              },
                            },
                          }}
                        />
                        {hasChildren && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {hasChildren && drawerOpen && (
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    {children.map((child) => {
                      const isSelected = pathname === child.path;
                      return (
                        <Tooltip key={child.key} title={child.label} placement="right" arrow>
                          <Box
                            sx={{
                              ...classes.SubMainBox,
                              ...(isSelected && {
                                background: gradients.secondary,
                              }),
                            }}
                          >
                            <ListItemButton
                              onClick={() => {
                                router.push(child.path);
                                if (isMobile) handleDrawerToggle();
                              }}
                              selected={isSelected}
                              sx={classes.subListItemButton(isSelected, drawerOpen)}
                            >
                              {child.icon && (
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  <child.icon size={16} />
                                </ListItemIcon>
                              )}

                              <ListItemText
                                primary={child.label}
                                slotProps={{
                                  primary: {
                                    sx: classes.subListItemText(isSelected),
                                  },
                                }}
                              />
                            </ListItemButton>
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      <Box sx={{ borderTop: "1px solid #E0E0E0", p: 1 }}>
        {drawerOpen && (
          <Box
            sx={{
              mb: 2,
              display: userType === "superadmin" ? { xs: "block", md: "none" } : "none",
            }}
          >
            <VendorsSelect
              label=""
              blurOnSelect={true}
              value={selectedVendorId}
              disableClear={true}
              onChange={(a: string | number | null, b?: string | number | null) => {
                const v = b !== undefined ? b : a;
                dispatch(setSelectedVendor(v));
              }}
            />
          </Box>
        )}

        <ProfileMenu drawerOpen={drawerOpen} userName={userName} userType={userType} handleLogout={handleLogout} />
      </Box>
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor?.element}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          pointerEvents: "none",
          "& .MuiPopover-paper": {
            pointerEvents: "auto",
            ml: 1,
            boxShadow: theme.shadows[8],
          },
        }}
        disableRestoreFocus
      >
        <Paper
          onMouseEnter={() => {
            if (closeTimeout) {
              clearTimeout(closeTimeout);
              setCloseTimeout(null);
            }
          }}
          onMouseLeave={handlePopoverClose}
          sx={{
            minWidth: 200,
            maxWidth: 280,
          }}
        >
          <List sx={{ py: 1 }}>
            {popoverAnchor?.children?.map((child) => {
              const isSelected = pathname === child.path;
              return (
                <ListItemButton
                  key={child.key}
                  onClick={() => {
                    router.push(child.path);
                    handlePopoverClose();
                    if (isMobile) handleDrawerToggle();
                  }}
                  selected={isSelected}
                  sx={{
                    py: 1,
                    px: 2,
                    ...(isSelected && {
                      background: gradients.secondary,
                      "&:hover": {
                        background: gradients.secondary,
                      },
                    }),
                  }}
                >
                  {child.icon && (
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <child.icon size={18} />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={child.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "14px",
                          fontWeight: isSelected ? 500 : 400,
                        },
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Paper>
      </Popover>
    </Box>
  );

  return (
    <Box component="nav" sx={classes.drawerBox(drawerOpen, drawerWidth)}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
          hideBackdrop: true,
        }}
        sx={classes.smallScreenDrawer(drawerWidth)}
      >
        {drawerContent}
      </Drawer>

      <Drawer variant="permanent" open sx={classes.largeScreenDrawer(drawerOpen, drawerWidth)}>
        {drawerContent}
      </Drawer>
    </Box>
  );
}