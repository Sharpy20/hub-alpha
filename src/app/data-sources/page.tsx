"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DataSourcesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dev-panel?section=data-sources");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting to Dev Panel...</p>
    </div>
  );
}
