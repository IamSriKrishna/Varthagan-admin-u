"use client";

import { Box, Typography, TextField } from "@mui/material";
import React from "react";
import * as classes from "./BBRichTextEditorBase.styles";

interface BBRichTextEditorBaseProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  isError?: boolean;
  errorMessage?: string;
}

const BBRichTextEditorBase: React.FC<BBRichTextEditorBaseProps> = ({
  label,
  value,
  placeholder,
  onChange,
  onBlur,
  isError,
  errorMessage,
}) => {
  return (
    <Box>
      <Typography sx={classes.labelStyle}>{label}</Typography>

      <TextField
        multiline
        rows={6}
        fullWidth
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder || ""}
        error={isError}
        sx={{
          border: "1px solid",
          borderColor: isError ? "#d32f2f" : "#ccc",
          borderRadius: "8px",
          "& .MuiOutlinedInput-root": {
            fontSize: "16px",
            fontFamily: "inherit",
            "& fieldset": {
              border: "none",
            },
            "&:hover fieldset": {
              border: "none",
            },
            "&.Mui-focused fieldset": {
              border: "none",
            },
          },
          "& .MuiOutlinedInput-input": {
            padding: "12px",
          },
        }}
      />

      {isError && (
        <Typography variant="caption" color="error" mt={1}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default BBRichTextEditorBase;
