import { RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { showToast, hideToast } from "../store/snackbar/toastSlice";

export const useGlobalToast = () => {
  const dispatch = useDispatch();
  const toast = useSelector((state: RootState) => state.toast);

  const triggerToast = (message: string, variant: "success" | "error" | "info") => {
    dispatch(showToast({ message, variant }));
  };

  const closeToast = () => {
    dispatch(hideToast());
  };

  return { toast, triggerToast, closeToast };
};
