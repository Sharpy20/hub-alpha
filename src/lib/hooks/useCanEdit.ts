"use client";

import { useApp } from "@/app/providers";
import { useIsV3 } from "@/lib/hooks/useV2";

export function useCanEdit() {
  const { user } = useApp();
  const isV3 = useIsV3();

  // 3.0 has no logins, so the editor is open to anyone. That is safe because
  // the editor only ever changes a copy in the author's own browser: readers
  // see published guides, and publishing goes through a person (25 Oct 2026).
  // Nothing in 3.0 deletes or approves, so those stay off.
  if (isV3) return { canEdit: true, canDelete: false, canApprove: false };

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
