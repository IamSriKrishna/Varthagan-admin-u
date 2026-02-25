import { store } from "../store";
import { showToast, hideToast } from "../store/snackbar/toastSlice";

export const showToastMessage = (message: string, variant: "success" | "error" | "info") => {
  store.dispatch(showToast({ message, variant }));
};

export const hideToastMessage = () => {
  store.dispatch(hideToast());
};
