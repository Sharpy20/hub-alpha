"use client";

import { useApp, UserRole } from "@/app/providers";
import { ReactNode } from "react";

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { user } = useApp();

  if (!user) return fallback;
  if (!allowedRoles.includes(user.role)) return fallback;

  return <>{children}</>;
}
