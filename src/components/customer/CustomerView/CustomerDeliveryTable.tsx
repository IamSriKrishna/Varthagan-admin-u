"use client";

import { GOOGLE_MAPS_LINK } from "@/constants/mapConstants";
import { BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import { ICustomerAddress, ICustomerView } from "@/models/ICustomer";
import { Box } from "@mui/material";
import { Star } from "lucide-react";
interface CustomerViewTableProps {
  data?: ICustomerView | null;
}
const CustomerDeliveryTable: React.FC<CustomerViewTableProps> = ({ data }) => {
  const columns: ITableColumn<ICustomerAddress>[] = [
    {
      key: "full_name",
      label: "Full Name",
      render: (row) => (
        <Box display="flex" flexDirection="row" alignItems="center" gap={0.5}>
          {row.is_default && <Star size={16} stroke="none" fill="#FACC15" />}
          <span className="font-medium">{row.full_name}</span>
        </Box>
      ),
      cellStyle: {
        minWidth: 100,
        maxWidth: 200,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    },

    {
      key: "phone_number",
      label: "Phone",
      render: (row) =>
        row.phone_number ? (
          <a href={`tel:${row.phone_number}`} className="text-blue-600 underline hover:text-blue-800 font-medium">
            {row.phone_number}
          </a>
        ) : (
          "-"
        ),
    },

    {
      key: "address",
      label: "Address",
      render: (row) => (
        <div className="font-medium">
          {row.latitude && row.longitude && (
            <a
              href={`${GOOGLE_MAPS_LINK}${row.latitude},${row.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-900 ml-2 text-sm"
            >
              {row.address ?? "-"}
            </a>
          )}
        </div>
      ),
      cellStyle: {
        minWidth: 250,
        maxWidth: 350,
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      },
    },

    {
      key: "landmark",
      label: "Landmark",
      render: (row) => <span className="italic">{row.landmark ?? "-"}</span>,
    },

    {
      key: "address_type",
      label: "Type",
      render: (row) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
          {row.address_type}
        </span>
      ),
    },
  ];

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr", mt: 2 }}>
      <BBTitle title="Delivery Address" />
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <BBTable data={data?.addresses ?? []} columns={columns} totalCount={Number(data?.total) || 0} />
      </Box>
    </Box>
  );
};
export default CustomerDeliveryTable;
