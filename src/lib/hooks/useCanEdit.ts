"use client";

import { useApp } from "@/app/providers";

export function useCanEdit() {
  const { user } = useApp();

  // Contributor is now a flag, not a role. Users with isContributor flag can edit content.
  // Managers, ward admins, and senior admins can always edit.
  const canEdit = user && (
    user.isContributor ||
    user.role === "manager" ||
    user.role === "ward_admin" ||
    user.role === "senior_admin"
  );
  const canDelete = user && user.role === "senior_admin";
  const canApprove = user && (user.role === "ward_admin" || user.role === "manager" || user.role === "senior_admin");

  return {
    canEdit: !!canEdit,
    canDelete: !!canDelete,
    canApprove: !!canApprove,
  };
}
