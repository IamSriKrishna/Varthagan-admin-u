import { Box } from "@mui/material";
import { Loader, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import * as classes from "./BBFileUploadBase.styles";
export interface BBFileUploadBaseProps {
  name?: string;
  label?: string;
  onFileChange?: (event: React.ChangeEvent<HTMLInputElement> | FileList) => void;
  buttonLabel?: string;
  multiple?: boolean;
  loading?: boolean;
  accept?: string;
}
const BBFileUploadBase: React.FC<BBFileUploadBaseProps> = ({
  onFileChange,
  multiple = true,
  loading = false,
  accept = "image/*",
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleClick = () => inputRef.current?.click();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length === 0) return;
    onFileChange?.(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange?.(e);
  };

  return (
    <Box
      sx={classes.dropZone(isDragging)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        accept={accept || "image/*"}
        ref={inputRef}
        onChange={handleInputChange}
        style={{ display: "none" }}
        multiple={multiple}
      />
      <Box sx={{ mb: 1 }}>
        {loading ? (
          <Box sx={classes.loaderIconStyle}>
            <Loader size={24} />
          </Box>
        ) : (
          <Upload size={28} />
        )}
      </Box>
      <Box sx={{ fontWeight: 500 }}>
        Upload your files
        <Box component="span" sx={{ textDecoration: "underline", ml: 0.5 }}>
          here
        </Box>
      </Box>
      <Box sx={{ color: "text.secondary", fontSize: 14 }}>Or you can drag and drop your file</Box>
    </Box>
  );
};

export default BBFileUploadBase;
