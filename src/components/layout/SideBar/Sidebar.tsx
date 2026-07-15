"use client";

import { persistor, RootState } from "@/store";
import { logout } from "@/store/auth/authSlice";
import {
  clearVendors,
  setSelectedVendor,
} from "@/store/vendors/vendorsSlice";
import {
  Box,
  Collapse,
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
  Boxes,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Factory,
  Fingerprint,
  Home,
  IndianRupee,
  Landmark,
  Package,
  Receipt,
  Settings,
  Settings2,
  ShoppingCart,
  Shuffle,
  Truck,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ElementType,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import * as classes from "./Sidebar.styles";

const drawerWidth = 240;

type ChildMenuItem = {
  key: string;
  icon?: ElementType;
  label: string;
  path: string;
};

type MenuItem = {
  key: string;
  icon?: ElementType;
  label: string;
  path?: string;
  type?: "section";
  children?: ChildMenuItem[];
};

const baseMenuItems: MenuItem[] = [
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
      {
        key: "employees",
        icon: User,
        label: "Employees",
        path: "/employees",
      },
      {
        key: "employeeAttendance",
        icon: Fingerprint,
        label: "Employee Attendance",
        path: "/employee-attendance",
      },
    ],
  },
  {
    key: "customers",
    icon: User,
    label: "Customers",
    children: [
      {
        key: "customers",
        icon: User,
        label: "Customers",
        path: "/customers",
      },
    ],
  },
  {
    key: "products",
    icon: Package,
    label: "Items",
    children: [
      {
        key: "productList",
        icon: Package,
        label: "Items",
        path: "/products",
      },
      {
        key: "productGroups",
        icon: Boxes,
        label: "Item Groups",
        path: "/products/product-groups",
      },
    ],
  },
  {
    key: "shipments",
    icon: Truck,
    label: "Shipments",
    children: [
      {
        key: "shipments",
        icon: Truck,
        label: "Shipments",
        path: "/shipments",
      },
      {
        key: "tracking",
        icon: Truck,
        label: "Tracking",
        path: "/shipments/tracking",
      },
    ],
  },
  {
    key: "purchases",
    icon: User,
    label: "Purchases",
    children: [
      {
        key: "vendors",
        icon: User,
        label: "Vendors",
        path: "/vendors",
      },
      {
        key: "purchaseOrders",
        icon: ShoppingCart,
        label: "Purchase Orders",
        path: "/purchase-orders",
      },
      {
        key: "purchase_claims",
        icon: Package,
        label: "Purchase Claims",
        path: "/purchase-claims",
      },
      {
        key: "vendorPayments",
        icon: CreditCard,
        label: "Vendor Payments",
        path: "/vendor-payments",
      },
      {
        key: "customerPayments",
        icon: CreditCard,
        label: "Customer Payments",
        path: "/customer-payments",
      },
      {
        key: "bills",
        icon: Receipt,
        label: "Bills",
        path: "/bills",
      },
      {
        key: "invoices",
        icon: Receipt,
        label: "Invoices",
        path: "/invoices",
      },
    ],
  },
  {
    key: "supplyChain",
    icon: Factory,
    label: "Supply Chain",
    children: [
      {
        key: "rawMaterials",
        icon: Boxes,
        label: "Raw Materials",
        path: "/raw-materials",
      },
      {
        key: "conversion",
        icon: Shuffle,
        label: "Conversion",
        path: "/conversion",
      },
      {
        key: "salesOrders",
        icon: ShoppingCart,
        label: "Sales Orders",
        path: "/sales-orders",
      },
      {
        key: "packages",
        icon: Package,
        label: "Packages",
        path: "/packages",
      },
      {
        key: "manufacturing",
        icon: Factory,
        label: "Manufacturing",
        path: "/manufacturing",
      },
      {
        key: "customerPricing",
        icon: IndianRupee,
        label: "Customer Pricing",
        path: "/admin/manufacturing-pricing",
      },
    ],
  },
  {
    key: "Inventory",
    icon: User,
    label: "Inventory",
    children: [
      {
        key: "inventory",
        icon: Boxes,
        label: "Product Management",
        path: "/inventory",
      },
      {
        key: "stock",
        icon: Boxes,
        label: "Stock Management",
        path: "/stock",
      },
    ],
  },
  {
    key: "settings",
    icon: Settings,
    label: "Settings",
    children: [
      {
        key: "users",
        icon: User,
        label: "Users",
        path: "/users",
      },
      {
        key: "banks",
        icon: Landmark,
        label: "Banks",
        path: "/banks",
      },
      {
        key: "companySettings",
        icon: Settings2,
        label: "Company Setting",
        path: "/company-settings",
      },
    ],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  drawerOpen: boolean;
  handleDrawerToggle: () => void;
  openMenuKey: string | null;
  setOpenMenuKey: React.Dispatch<
    React.SetStateAction<string | null>
  >;
}

export default function Sidebar({
  mobileOpen,
  drawerOpen,
  handleDrawerToggle,
  openMenuKey,
  setOpenMenuKey,
}: SidebarProps) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  const selectedVendorId = useSelector(
    (state: RootState) =>
      state.vendors?.selectedVendorId ?? null,
  );

  const isMobile = useMediaQuery(
    theme.breakpoints.down("md"),
  );

  const accessMap = useSelector(
    (state: RootState) => state.auth.accessMap,
  );

  const userName = useSelector(
    (state: RootState) =>
      state.auth.user?.username || "",
  );

  const userType = useSelector(
    (state: RootState) =>
      state.auth.user?.user_type || "",
  );

  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  const [popoverAnchor, setPopoverAnchor] =
    useState<{
      element: HTMLElement;
      children: ChildMenuItem[] | undefined;
    } | null>(null);

  const [closeTimeout, setCloseTimeout] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedOpenMenuKey = localStorage.getItem(
      "sidebar-open-menu",
    );

    if (savedOpenMenuKey) {
      setOpenMenuKey(savedOpenMenuKey);
    }
  }, [setOpenMenuKey]);

  useEffect(() => {
    if (openMenuKey) {
      localStorage.setItem(
        "sidebar-open-menu",
        openMenuKey,
      );
    } else {
      localStorage.removeItem("sidebar-open-menu");
    }
  }, [openMenuKey]);

  const menuItems = baseMenuItems
    .map((item) => {
      if (item.children && item.children.length > 0) {
        const alwaysShowItems = [
          "purchaseOrders",
          "purchase_claims",
          "vendors",
          "vendorPayments",
          "customerPayments",
          "bills",
          "invoices",
          "salesOrders",
          "packages",
          "manufacturing",
          "customerPricing",
          "shipments",
          "conversion",
          "rawMaterials",
        ];

        const isAdmin = userType === "admin";

        if (isAdmin) {
          alwaysShowItems.push(
            "employees",
            "employeeAttendance",
            "item",
            "itemGroups",
            "productList",
            "productGroups",
          );
        }

        const filteredChildren = item.children.filter(
          (child) => {
            const hasAccess = (
              accessMap?.nav as Record<
                string,
                boolean | undefined
              >
            )?.[child.key];

            return (
              hasAccess ||
              alwaysShowItems.includes(child.key)
            );
          },
        );

        return {
          ...item,
          children: filteredChildren,
        };
      }

      return item;
    })
    .filter((item) => {
      if (item.type === "section") {
        return true;
      }

      const hasAccess = (
        accessMap?.nav as Record<
          string,
          boolean | undefined
        >
      )?.[item.key];

      const hasVisibleChildren =
        !!item.children && item.children.length > 0;

      if (item.key === "employee") {
        return userType === "admin";
      }

      if (item.key === "items") {
        return userType === "admin";
      }

      if (item.key === "products") {
        return userType === "admin";
      }

      if (item.key === "shipments") {
        return true;
      }

      if (item.key === "settings") {
        return userType !== "admin";
      }

      return hasAccess || hasVisibleChildren;
    });

  /*
   * Only super admin is handled separately.
   *
   * Every other user type continues using the existing
   * access-map and menu-filtering behavior above.
   */
const isSuperAdmin =
  userType === "super_admin" ||
  userType === "superadmin";

const visibleMenuItems = isSuperAdmin
  ? baseMenuItems.filter(
      (item) =>
        item.key === "dashboard" ||
        item.type === "section" ||
        item.key === "settings",
    )
  : menuItems;

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(clearVendors());
    dispatch(setSelectedVendor(null));

    await persistor.purge();

    router.replace("/");
  };

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement>,
    children?: ChildMenuItem[],
  ) => {
    if (
      !drawerOpen &&
      children &&
      children.length > 0
    ) {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        setCloseTimeout(null);
      }

      setPopoverAnchor({
        element: event.currentTarget,
        children,
      });
    }
  };

  const handlePopoverClose = () => {
    const timeout = setTimeout(() => {
      setPopoverAnchor(null);
    }, 150);

    setCloseTimeout(timeout);
  };

  const drawerContent = (
    <Box sx={classes.sidebarInner}>
      <Box sx={classes.sidebarMenuArea(drawerOpen)}>
        <List>
          {visibleMenuItems.map((item) => {
            if (item.type === "section") {
              if (!drawerOpen) {
                return null;
              }

              return (
                <Box
                  key={item.key}
                  sx={classes.sectionWrapper}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box sx={classes.sectionLine} />

                    <Typography
                      sx={classes.sectionText}
                    >
                      {item.label}
                    </Typography>

                    <Box sx={classes.sectionLine} />
                  </Box>
                </Box>
              );
            }

            const {
              key,
              icon: Icon,
              label,
              path,
              children,
            } = item;

            const hasChildren =
              !!children?.length;

            const isOpen =
              openMenuKey === key;

            const isParentActive =
              pathname === path ||
              children?.some(
                (child) =>
                  child.path === pathname,
              );

            return (
              <Box key={key}>
                <Tooltip
                  title={!drawerOpen ? label : ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    data-no-loading
                    onMouseEnter={(event) =>
                      handlePopoverOpen(
                        event,
                        children,
                      )
                    }
                    onMouseLeave={
                      handlePopoverClose
                    }
                    onClick={() => {
                      if (hasChildren) {
                        setOpenMenuKey((previous) =>
                          previous === key
                            ? null
                            : key,
                        );
                      } else if (path) {
                        setOpenMenuKey(null);
                        router.push(path);

                        if (isMobile) {
                          handleDrawerToggle();
                        }
                      }
                    }}
                    selected={Boolean(
                      isParentActive,
                    )}
                    sx={
                      classes.mainListItemButton
                    }
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: drawerOpen
                          ? 40
                          : "unset",
                        justifyContent: "center",
                      }}
                    >
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

                        {hasChildren &&
                          (isOpen ? (
                            <ChevronDown
                              size={16}
                            />
                          ) : (
                            <ChevronRight
                              size={16}
                            />
                          ))}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {hasChildren && drawerOpen && (
                  <Collapse
                    in={isOpen}
                    timeout="auto"
                    unmountOnExit
                  >
                    {children.map((child) => {
                      const isSelected =
                        pathname === child.path;

                      const ChildIcon =
                        child.icon;

                      return (
                        <Tooltip
                          key={child.key}
                          title={child.label}
                          placement="right"
                          arrow
                        >
                          <Box
                            sx={
                              classes.SubMainBox
                            }
                          >
                            <ListItemButton
                              data-no-loading
                              onClick={() => {
                                router.push(
                                  child.path,
                                );

                                if (isMobile) {
                                  handleDrawerToggle();
                                }
                              }}
                              selected={isSelected}
                              sx={classes.subListItemButton(
                                isSelected,
                                drawerOpen,
                              )}
                            >
                              {ChildIcon && (
                                <ListItemIcon
                                  sx={{
                                    minWidth: 30,
                                  }}
                                >
                                  <ChildIcon
                                    size={16}
                                  />
                                </ListItemIcon>
                              )}

                              <ListItemText
                                primary={
                                  child.label
                                }
                                slotProps={{
                                  primary: {
                                    sx: classes.subListItemText(
                                      isSelected,
                                    ),
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

      <Box sx={classes.profileArea(drawerOpen)}>
        <ProfileMenu
          drawerOpen={drawerOpen}
          userName={userName}
          userType={userType}
          handleLogout={handleLogout}
        />
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
            background: "transparent",
            boxShadow: "none",
            overflow: "visible",
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
          sx={classes.popoverPaper}
        >
          <List sx={{ py: 0.5 }}>
            {popoverAnchor?.children?.map(
              (child) => {
                const isSelected =
                  pathname === child.path;

                const ChildIcon =
                  child.icon;

                return (
                  <ListItemButton
                    key={child.key}
                    data-no-loading
                    onClick={() => {
                      router.push(child.path);
                      handlePopoverClose();

                      if (isMobile) {
                        handleDrawerToggle();
                      }
                    }}
                    selected={isSelected}
                    sx={classes.popoverListItem(
                      isSelected,
                    )}
                  >
                    {ChildIcon && (
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                        }}
                      >
                        <ChildIcon size={18} />
                      </ListItemIcon>
                    )}

                    <ListItemText
                      primary={child.label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontFamily:
                              "'Inter', sans-serif",
                            fontSize: "13px",
                            fontWeight:
                              isSelected
                                ? 700
                                : 500,
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                );
              },
            )}
          </List>
        </Paper>
      </Popover>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={classes.drawerBox(
        drawerOpen,
        drawerWidth,
      )}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
          hideBackdrop: true,
        }}
        sx={classes.smallScreenDrawer(
          drawerWidth,
        )}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={classes.largeScreenDrawer(
          drawerOpen,
          drawerWidth,
        )}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}