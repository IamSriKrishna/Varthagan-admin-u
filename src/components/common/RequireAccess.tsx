"use client";

import Forbidden from "@/components/common/Forbidden";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { IAccessMap } from "@/models/IAccessMap";
import React from "react";

type PageKey = keyof IAccessMap["nav"];

interface RequireAccessProps {
  pageKey: PageKey;
  children: React.ReactNode;
}

export function RequireAccess({ pageKey, children }: RequireAccessProps) {
  const accessMap = useSelector((state: RootState) => state.auth.accessMap);
  if (!Boolean((accessMap?.nav as Record<string, boolean | undefined>)?.[pageKey])) {
    return <Forbidden />;
  }
  return <>{children}</>;
}
