import { Box, Typography } from "@mui/material";
import React, { ReactNode } from "react";

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value?: string | number | ReactNode;
  action?: ReactNode;
  onClick?: () => void;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, action, onClick }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: { xs: 36, sm: 40 },
          height: { xs: 36, sm: 40 },
          borderRadius: "10px",
          bgcolor: "rgba(99, 102, 241, 0.1)",
          color: "white",
          mr: { xs: 1.5, sm: 2 },
          opacity: 0.9,
          flexShrink: 0,
        }}
      >
        <Icon size={18} style={{ color: "#6366f1" }} strokeWidth={2.5} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          fontWeight={500}
          sx={{
            fontSize: { xs: "0.875rem", sm: "1rem" },
            wordBreak: "break-word",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: onClick ? "pointer" : "default",
            color: onClick ? "primary.main" : "text.primary",
            textDecoration: onClick ? "underline" : "none",
            textDecorationStyle: "dashed",
            textUnderlineOffset: "3px",
          }}
          onClick={onClick}
        >
          {value || "N/A"}
        </Typography>
      </Box>
      {action && <Box sx={{ ml: 1, flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
};

export default InfoRow;
