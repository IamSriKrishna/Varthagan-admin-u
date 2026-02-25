import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: IUser | null;
  access_token: string;
  refresh_token: string;
  loading: boolean;
  error: string | null;
  isStorageDataLoaded?: boolean;
  accessMap?: IAccessMap;
}

import { getAccessMapFromRole } from "@/utils/getAccessMapFromRole";
import { IUser, LoginResponse } from "@/models/IUser";
import { IAccessMap } from "@/models/IAccessMap";

const initialState: AuthState = {
  user: null,
  access_token: "",
  refresh_token: "",
  loading: false,
  error: null,
  isStorageDataLoaded: false,
  accessMap: {
    nav: {},
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    setAuthData: (state, action: PayloadAction<LoginResponse>) => {
      state.user = action.payload.user;
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
      state.loading = false;
      state.error = null;
      const role = action.payload.user?.role || "";
      state.accessMap = getAccessMapFromRole(role);
    },
    setStorageLoadedTrue: (state) => {
      state.isStorageDataLoaded = true;
    },
    logout: (state) => {
      state.user = null;
      state.access_token = "";
      state.refresh_token = "";
      state.error = null;
      localStorage.clear();
    },
  },
});

export const { setLoading, setError, setAuthData, setStorageLoadedTrue, logout } = authSlice.actions;
export default authSlice.reducer;
