import { config } from "@/config";
import { vendors } from "@/constants/apiConstants";
import { appFetch } from "@/utils/fetchInterceptor";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IVendorItem {
  vendor_id: string;
  name: string;
  [k: string]: unknown;
}

export interface IVendorsState {
  vendors: IVendorItem[];
  loading: boolean;
  error: string | null;
  selectedVendorId?: string | number | null;
}

const initialState: IVendorsState = {
  vendors: [],
  loading: false,
  error: null,
  selectedVendorId: null,
};

export const fetchPublicVendors = createAsyncThunk("vendors/fetchPublicVendors", async () => {
  const url = `${config.vendorDomain}${vendors.getPublicVendors}`;
  const res = await appFetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Failed to fetch vendors: ${res.status}`);
  const json = await res.json();
  return (json.vendors || json.data?.vendors || []) as IVendorItem[];
});

export const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearVendors(state) {
      state.vendors = [];
      state.error = null;
      state.loading = false;
    },
    setSelectedVendor(state, action: PayloadAction<string | number | null>) {
      state.selectedVendorId = action.payload;
      // localStorageUtil.setItem(localStorageVendorKey, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPublicVendors.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchPublicVendors.fulfilled, (state, action: PayloadAction<IVendorItem[]>) => {
      state.loading = false;
      state.vendors = action.payload;
      //  if (!state.selectedVendorId && action.payload.length > 0) {
      //   const firstVendorId = action.payload[0].vendor_id;
      //   state.selectedVendorId = firstVendorId;
      //   localStorageUtil.setItem(localStorageVendorKey, firstVendorId);
      // }
    });
    builder.addCase(fetchPublicVendors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error?.message || "Failed to fetch vendors";
    });
  },
});

export const { clearVendors, setSelectedVendor } = vendorsSlice.actions;
export default vendorsSlice.reducer;
