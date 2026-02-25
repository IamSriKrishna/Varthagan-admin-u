// "use client";

// import BrandLogo from "@/components/layout/BrandLogo/BrandLogo";
// import { BBButton, BBInput } from "@/lib";
// import BBLoginImage from "@/lib/BBLoginImage/BBLoginImage";
// import { RootState } from "@/store";
// import { setError, setLoading } from "@/store/auth/authSlice";
// import {
//   loginContainer,
//   loginFormBox,
//   loginFormContainerBox,
//   loginImageBox,
//   textForgotPassword,
//   textParagraph,
//   textTypography,
// } from "@/styles/login.styles";
// import { Alert, Box, Stack, Typography } from "@mui/material";
// import { Formik } from "formik";
// import { useRouter } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import * as Yup from "yup";

// const validationSchema = Yup.object().shape({
//   email: Yup.string().email("Invalid email").required("Email is required"),
// });

// const Page = () => {
//   const dispatch = useDispatch();
//   const { loading, error } = useSelector((state: RootState) => state.auth);
//   {
//   }

//   const handleSubmit = async (
//     values: { email: string },
//     { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
//   ) => {
//     console.log(values.email);

//     try {
//       dispatch(setLoading(true));
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Invalid OTP. Please try again.";
//       dispatch(setError(errorMessage));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleResendOtp = async () => {
//     try {
//       dispatch(setLoading(true));
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Failed to resend OTP";
//       dispatch(setError(errorMessage));
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };

//   return (
//     <Box>
//       <BrandLogo />

//       <Box sx={loginContainer}>
//         <Box sx={loginFormContainerBox}>
//           <Box sx={loginFormBox}>
//             <Typography sx={textTypography} fontWeight={600} gutterBottom>
//               Verify your email
//             </Typography>
//             <Typography sx={textParagraph}>
//               {" "}
//               Account activation link sent to your email address: Example@email.com Please follow the link inside to
//               continue.
//             </Typography>
//             <Formik initialValues={{ email: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
//               {({ handleSubmit, isSubmitting }) => (
//                 <form onSubmit={handleSubmit}>
//                   <Stack spacing={2}>
//                     <BBInput name="email" label="Email" loading={loading} placeholder="email@gmail.com" />
//                     {error && <Alert severity="error">{error}</Alert>}

//                     <Stack direction="column" alignItems="center" spacing={2}>
//                       <BBButton fullWidth type="submit" variant="contained" loading={isSubmitting || loading}>
//                         Verify My Account
//                       </BBButton>
//                       <Typography sx={textForgotPassword}>
//                         Didn&apos;t get the mail?{" "}
//                         <Box
//                           component="span"
//                           onClick={handleResendOtp}
//                           sx={{
//                             color: "primary.main",
//                             cursor: "pointer",
//                             textDecoration: "underline",
//                             display: "inline",
//                           }}
//                         >
//                           Resend
//                         </Box>
//                       </Typography>
//                     </Stack>
//                   </Stack>
//                 </form>
//               )}
//             </Formik>
//           </Box>
//         </Box>
//         <Box sx={loginImageBox}>
//           <BBLoginImage />
//         </Box>
//       </Box>
//     </Box>
//   );
// };
// export default Page;
