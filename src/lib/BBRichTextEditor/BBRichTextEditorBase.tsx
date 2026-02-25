"use client";

import { Box, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import React from "react";
import "react-quill/dist/quill.snow.css";
import * as classes from "./BBRichTextEditorBase.styles";
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});
interface BBRichTextEditorBaseProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  isError?: boolean;
  errorMessage?: string;
}

const toolbarOptions = [
  [{ header: [1, 2, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
];

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

      <Box sx={classes.editorWrapper(isError)}>
        <ReactQuill
          theme="snow"
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder || ""}
          modules={{ toolbar: toolbarOptions }}
          formats={["header", "bold", "italic", "underline", "list", "bullet", "align"]}
        />
      </Box>

      {isError && (
        <Typography variant="caption" color="error" mt={1}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default BBRichTextEditorBase;
