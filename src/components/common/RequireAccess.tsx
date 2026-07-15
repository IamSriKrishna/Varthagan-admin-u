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
  fallbackPageKey?: PageKey;
}

export function RequireAccess({
  pageKey,
  fallbackPageKey,
  children,
}: RequireAccessProps) {
  const accessMap = useSelector((state: RootState) => state.auth.accessMap);
  const nav = accessMap?.nav as Record<string, boolean | undefined>;

  const hasPermission = Boolean(nav?.[pageKey]);
  const hasFallbackPermission = fallbackPageKey
    ? Boolean(nav?.[fallbackPageKey])
    : false;

  if (!hasPermission && !hasFallbackPermission) {
    return <Forbidden />;
  }
  return <>{children}</>;
}
