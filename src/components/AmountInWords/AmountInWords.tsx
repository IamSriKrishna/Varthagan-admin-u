"use client";

import React from "react";

interface AmountInWordsProps {
  amount?: number;
  currencyLabel?: string;
  showOnlyIfPositive?: boolean;
}

const AmountInWords: React.FC<AmountInWordsProps> = ({
  amount = 0,
  currencyLabel = "Rupees",
  showOnlyIfPositive = true,
}) => {
  if (showOnlyIfPositive && amount <= 0) return null;

  const numberToWords = (num: number): string => {
    if (num === 0) return "Zero";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convertLessThanThousand(n % 100) : "");
    };

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const hundred = num % 1000;

    let result = "";
    if (crore > 0) result += convertLessThanThousand(crore) + " Crore ";
    if (lakh > 0) result += convertLessThanThousand(lakh) + " Lakh ";
    if (thousand > 0) result += convertLessThanThousand(thousand) + " Thousand ";
    if (hundred > 0) result += convertLessThanThousand(hundred);

    return result.trim();
  };

  const convertToWords = (value: number): string => {
    const rupees = Math.floor(value);
    const paise = Math.round((value - rupees) * 100);

    let result = `${numberToWords(rupees)} ${currencyLabel}`;
    if (paise > 0) {
      result += ` and ${numberToWords(paise)} Paise`;
    }
    result += " Only";
    return result;
  };

  return <>{convertToWords(amount)}</>;
};

export default AmountInWords;
