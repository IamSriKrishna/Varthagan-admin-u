"use client";
import logo from "@/assets/images/login.jpg";
import { Box } from "@mui/material";
import Image from "next/image";
import { BBLoginImageBox, BBLoginImageStyle } from "./BBLoginImage.styles";

const BBLoginImage = () => {
  return (
    <Box sx={BBLoginImageBox}>
      <Image
        src={logo}
        alt="Login Illustration"
        width={430}
        height={400}
        style={BBLoginImageStyle as React.CSSProperties}
      />
    </Box>
  );
};

export default BBLoginImage;
