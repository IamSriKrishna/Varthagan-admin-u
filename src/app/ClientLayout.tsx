"use client";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { BBSnackbar } from "@/lib";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { toast, closeToast } = useGlobalToast();

  return (
    <>
      {children}
      <BBSnackbar open={toast.open} message={toast.message} onClose={closeToast} variant={toast.variant} />
    </>
  );
}
