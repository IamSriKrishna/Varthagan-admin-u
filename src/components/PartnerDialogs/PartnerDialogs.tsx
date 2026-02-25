// import { BBDialog, BBDropdownBase } from "@/lib";
// import { IOrderItem } from "@/models/IOrders";
// import { IPartner } from "@/models/IPartners";
// import { Box, Grid, Paper, Typography } from "@mui/material";
// import React, { useEffect, useState } from "react";
// import * as classes from "./PartnerDialog.styles";

// interface PartnerSelectionDialogProps {
//   open: boolean;
//   onClose: () => void;
//   onConfirm: (partnerIds: string[]) => void;
//   partners: IPartner[];
//   loading?: boolean;
//   orderInfo: {
//     id: string;
//     customer_name?: string;
//     product_name?: string;
//     payment_status?: string;
//     items?: IOrderItem[];
//   };
// }

// export const PartnerSelectionDialog: React.FC<PartnerSelectionDialogProps> = ({
//   open,
//   onClose,
//   onConfirm,
//   partners,
//   loading = false,
//   orderInfo,
// }) => {
//   const itemCount = orderInfo?.items?.length || 0;

//   // Store selected partner ID for each item
//   const [partnersByItem, setPartnersByItem] = useState<string[]>(Array(itemCount).fill(""));

//   useEffect(() => {
//     if (open) {
//       setPartnersByItem(Array(itemCount).fill(""));
//     }
//   }, [open, itemCount]);

//   const handlePartnerChange = (index: number, partnerId: string) => {
//     setPartnersByItem((prev) => {
//       const updated = [...prev];
//       updated[index] = partnerId;

//       if (index === 0) {
//         return Array(itemCount).fill(partnerId);
//       }

//       return updated;
//     });
//   };

//   const handleConfirm = () => {
//     if (partnersByItem.some((p) => !p)) return;

//     onConfirm(partnersByItem);
//     setPartnersByItem(Array(itemCount).fill(""));
//     onClose();
//   };

//   const handleClose = () => {
//     setPartnersByItem(Array(itemCount).fill(""));
//     onClose();
//   };

//   const partnerOptions = partners
//     .filter((p) => p.is_active)
//     .map((p) => ({
//       value: p.id,
//       label: p.name,
//       // label: (
//       //   <Box sx={classes.partnerOptionBox}>
//       //     <Box sx={classes.partnerOptionInnerBox}>
//       //       <Typography variant="body2" fontWeight={500} color="text.primary">
//       //         {p.email}
//       //       </Typography>

//       //       <Box sx={classes.partnerDetailsRow}>
//       //         {p.name && (
//       //           <Typography variant="caption" color="text.secondary">
//       //             {p.name}
//       //           </Typography>
//       //         )}
//       //         {p.specialization && (
//       //           <Chip label={p.specialization} size="small" variant="outlined" sx={classes.specializationChip} />
//       //         )}
//       //         {p.rating && (
//       //           <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
//       //             ⭐ {p.rating}/5
//       //           </Typography>
//       //         )}
//       //       </Box>
//       //     </Box>
//       //   </Box>
//       // ),
//     }));

//   return (
//     <>
//       <BBDialog
//         open={open}
//         onClose={handleClose}
//         maxWidth="md"
//         title={<Box sx={classes.dialogTitleBox}>Assign Partner to Order</Box>}
//         content={
//           <Box sx={{ ...classes.partnerOptionInnerBox, gap: 3 }}>
//             {/* Order Details Box */}
//             <Paper elevation={0} sx={classes.orderDetailsPaper}>
//               <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
//                 Order Details
//               </Typography>

//               <Grid container spacing={3} component="div">
//                 <Grid size={{ xs: 12, md: 6 }} component="div">
//                   <Typography variant="body2" color="text.secondary">
//                     <strong>Order ID:</strong> {orderInfo?.id || "-"}
//                   </Typography>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 6 }} component="div">
//                   <Typography variant="body2" color="text.secondary">
//                     <strong>Status:</strong> {orderInfo?.payment_status || "-"}
//                   </Typography>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 6 }} component="div">
//                   {orderInfo?.customer_name && (
//                     <Typography variant="body2" color="text.secondary">
//                       <strong>Customer:</strong> {orderInfo.customer_name}
//                     </Typography>
//                   )}
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 6 }} component="div">
//                   {orderInfo?.product_name && (
//                     <Typography variant="body2" color="text.secondary">
//                       <strong>Product:</strong> {orderInfo.product_name}
//                     </Typography>
//                   )}
//                 </Grid>
//               </Grid>
//             </Paper>

//             <Grid container spacing={3}>
//               {orderInfo?.items?.map((item, index) => (
//                 <Grid size={{ xs: 12, md: 6 }} key={item.id} component="div">
//                   <Box>
//                     <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
//                       {item.product_name}
//                     </Typography>

//                     <BBDropdownBase
//                       name={`partner-${index}`}
//                       label=""
//                       options={partnerOptions}
//                       value={partnersByItem[index] || ""}
//                       onDropdownChange={(_, __, value) => handlePartnerChange(index, value as string)}
//                     />
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         }
//         onConfirm={handleConfirm}
//         confirmText="Start Work"
//         cancelText="Cancel"
//         loading={loading}
//         disabled={partnersByItem.some((p) => !p) || loading}
//         confirmColor="primary"
//       />
//     </>
//   );
// };
import { BBDialog, BBDropdownBase } from "@/lib";
import { IPartner } from "@/models/IPartners";
import { Box, Chip, Grid, Paper, Typography } from "@mui/material";
import React, { useState } from "react";
import * as classes from "./PartnerDialog.styles";
interface PartnerSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (partnerId: string) => void;
  partners: IPartner[];
  loading?: boolean;
  orderInfo: {
    id: string;
    customer_name?: string;
    product_name?: string;
    payment_status?: string;
  };
}
export const PartnerSelectionDialog: React.FC<PartnerSelectionDialogProps> = ({
  open,
  onClose,
  onConfirm,
  partners,
  loading = false,
  orderInfo,
}) => {
  const [selectedPartner, setSelectedPartner] = useState<IPartner | null>(null);
  const handleConfirm = () => {
    if (selectedPartner) {
      onConfirm(selectedPartner?.user_id);
      setSelectedPartner(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedPartner(null);
    onClose();
  };
  const partnerOptions = partners
    .filter((p) => p.is_active)
    .map((p) => ({
      value: p.id,
      label: (
        <Box sx={classes.partnerOptionBox}>
          <Box sx={classes.partnerOptionInnerBox}>
            <Typography variant="body2" fontWeight={500} color="text.primary">
              {p.email}
            </Typography>

            <Box sx={classes.partnerDetailsRow}>
              {p.name && (
                <Typography variant="caption" color="text.secondary">
                  {p.name}
                </Typography>
              )}
              {p.specialization && (
                <Chip label={p.specialization} size="small" variant="outlined" sx={classes.specializationChip} />
              )}
              {p.rating && (
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                  ⭐ {p.rating}/5
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      ),
    }));

  return (
    <>
      <BBDialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        title={<Box sx={classes.dialogTitleBox}>Assign Partner to Order</Box>}
        content={
          <Box sx={{ ...classes.partnerOptionInnerBox, gap: 3 }}>
            <Paper elevation={0} sx={classes.orderDetailsPaper}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                Order Details
              </Typography>

              <Grid container spacing={3} component="div">
                <Grid size={{ xs: 12, md: 6 }} component="div">
                  <Typography variant="body2" color="text.secondary">
                    <strong>Order ID:</strong> {orderInfo?.id || "-"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} component="div">
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong> {orderInfo?.payment_status || "-"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} component="div">
                  {orderInfo?.customer_name && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Customer:</strong> {orderInfo.customer_name}
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} component="div">
                  {orderInfo?.product_name && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Product:</strong> {orderInfo.product_name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>

            <Box>
              <BBDropdownBase
                name="partner"
                label="Select Partner"
                options={partnerOptions}
                value={selectedPartner?.id || ""}
                onDropdownChange={(_, __, value) => {
                  const partner = partners.find((p) => p.id === value);
                  setSelectedPartner(partner || null);
                }}
              />
            </Box>
          </Box>
        }
        onConfirm={handleConfirm}
        confirmText="Start Work"
        cancelText="Cancel"
        loading={loading}
        disabled={!selectedPartner || loading}
        confirmColor="primary"
      />
    </>
  );
};
