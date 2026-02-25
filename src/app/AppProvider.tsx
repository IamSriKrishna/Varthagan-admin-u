"use client";

import { persistor, store } from "@/store";
import { setStorageLoadedTrue } from "@/store/auth/authSlice";
import BBThemeProvider from "@/theme/BBThemeProvider";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PersistGate
          loading={null}
          persistor={persistor}
          onBeforeLift={() => {
            store.dispatch(setStorageLoadedTrue());
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BBThemeProvider>{children}</BBThemeProvider>
          </LocalizationProvider>
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  );
};

export default AppProvider;
