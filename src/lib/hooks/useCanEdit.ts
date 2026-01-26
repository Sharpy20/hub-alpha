"use client";

import { useApp } from "@/app/providers";

export function useCanEdit() {
  const { user } = useApp();

  const canEdit = user && (user.role === "contributor" || user.role === "senior_admin");
  const canDelete = user && user.role === "senior_admin";
  const canApprove = user && (user.role === "ward_admin" || user.role === "senior_admin");

  return {
    canEdit: !!canEdit,
    canDelete: !!canDelete,
    canApprove: !!canApprove,
  };
}
