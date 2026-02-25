"use client";

import { Printer } from "lucide-react";
import { ReactNode, RefObject } from "react";
import { useReactToPrint } from "react-to-print";
import BBButton from "../BBButton/BBButton";

type PrintSize = "A4" | "80mm";

type BBPrintProps<T extends HTMLElement = HTMLElement> = {
  componentRef: RefObject<T | null>;
  documentTitle?: string;
  children?: ReactNode;
  printSize?: PrintSize;
};

export default function BBPrint<T extends HTMLElement = HTMLElement>({
  componentRef,
  documentTitle = "Document",
  children,
  printSize = "A4",
  ...buttonProps
}: BBPrintProps<T>) {
  const pageStyle =
    printSize === "A4"
      ? `
    @page {
      size: A4 portrait;
      margin:10mm; 
    }
    @media print {
      html, body {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0mm 2mm 0mm 2mm; 
        box-sizing: border-box;
        background: white !important;
        font-size: 11px;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      table {
        font-size: 11px;
        border-collapse: collapse;
        width: 100% !important;
        table-layout: fixed !important;
        margin-top: 4mm;
      }
      th, td {
        border: 1px solid black;
        padding: 6px;
        text-align: center;
        vertical-align: middle;
        word-wrap: break-word;
      }
      .print-hide { display: none !important; }
      .print-only { display: block !important; }
    }
    @media screen {
      .print-only { display: none !important; }
    }
  `
      : `
    @page {
      size: 80mm auto;
      margin: 3mm 2mm;
    }
    @media print {
      html, body {
        width: 80mm;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      * { font-family: 'Arial', 'Helvetica', sans-serif !important; }
      h1, h2, h3 {
        font-weight: 700 !important;
        margin: 6px 0 !important;
        text-align: center !important;
      }
      h1 { font-size: 22px !important; text-transform: uppercase !important; }
      h2 { font-size: 18px !important; }
      h3 { font-size: 16px !important; }
      p, td, th, span, div { font-size: 13px !important; line-height: 1.5 !important; }
      strong, b, .bold { font-weight: 700 !important; font-size: 14px !important; }
      table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin: 6px 0 !important;
        font-size: 13px !important;
      }
      th, td {
        border: 1px solid #000 !important;
        padding: 4px 3px !important;
        text-align: left !important;
        word-wrap: break-word !important;
      }
      th { background-color: #000 !important; color: #fff !important; font-weight: 700 !important; font-size: 14px !important; }
      .noPrintBox { display: none !important; }
      img { max-width: 100% !important; height: auto !important; }
      hr { border: 1px solid #000 !important; margin: 6px 0 !important; }
      .MuiGrid-root { width: 100% !important; max-width: 100% !important; }
      .MuiCard-root { padding: 4px !important; box-shadow: none !important; }
    }
  `;

  const handlePrint = useReactToPrint({
    contentRef: componentRef ?? null,
    documentTitle,
    pageStyle,
  });

  return (
    <BBButton onClick={handlePrint} variant="contained" startIcon={<Printer size={18} />} {...buttonProps}>
      {children || "Print"}
    </BBButton>
  );
}
