import { Box, TextField } from "@mui/material";
import React, { useEffect, useRef } from "react";

interface BBOTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const BBOTPInput: React.FC<BBOTPInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  error = false,
  helperText,
}) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (value.length < length) {
      inputsRef.current[value.length]?.focus();
    }
  }, [value, length]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;

    const newValue = value.substring(0, index) + char + value.substring(index + 1);
    onChange(newValue);

    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key == "Backspace" && !value[index] && index > 0) {
      onChange(value.substring(0, index - 1) + " " + value.substring(index + 1));
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <Box display="flex" justifyContent="center" gap={3}>
      {Array.from({ length }).map((_, i) => (
        <TextField
          key={i}
          inputRef={(el) => (inputsRef.current[i] = el)}
          value={value[i] || ""}
          size="small"
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, i)}
          inputProps={{
            maxLength: 1,
            style: {
              textAlign: "center",
              fontSize: "1.5rem",
              width: "1.5rem",
              height: "2rem",
            },
          }}
          disabled={disabled}
          error={error}
        />
      ))}
      {error && helperText && (
        <Box position="absolute" bottom={-20}>
          <Box color="error.main" fontSize="0.8rem">
            {helperText}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BBOTPInput;
