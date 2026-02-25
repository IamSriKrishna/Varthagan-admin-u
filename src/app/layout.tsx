import AppProvider from "@/app/AppProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import "react-quill/dist/quill.snow.css";
import ClientLayout from "./ClientLayout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Varthagan App",
  description: "Varthagan App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <ClientLayout>{children}</ClientLayout>
        </AppProvider>
      </body>
    </html>
  );
}
