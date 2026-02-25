import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ToastState {
  open: boolean;
  message: string;
  variant: "success" | "error" | "info";
}

const initialState: ToastState = {
  open: false,
  message: "",
  variant: "success",
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ message: string; variant: "success" | "error" | "info" }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.variant = action.payload.variant;
    },
    hideToast: (state) => {
      state.open = false;
      state.message = "";
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
