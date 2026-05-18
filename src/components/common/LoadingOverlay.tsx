// "use client";

// import { useLoading } from "@/context/LoadingContext";
// import { CircularProgress, Box, Typography } from "@mui/material";
// import styles from "./LoadingOverlay.module.css";

// export const LoadingOverlay = () => {
//   const { isLoading } = useLoading();

//   if (!isLoading) return null;

//   return (
//     <div className={styles.overlay}>
//       <Box className={styles.loadingDialog}>
//         <CircularProgress 
//           size={60}
//           sx={{
//             color: '#1976d2',
//             marginBottom: 2,
//           }}
//         />
//         <Typography 
//           variant="h6" 
//           sx={{
//             color: '#333',
//             fontWeight: 500,
//             textAlign: 'center',
//           }}
//         >
//           Loading...
//         </Typography>
//       </Box>
//     </div>
//   );
// };
