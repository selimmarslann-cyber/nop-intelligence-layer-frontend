// pages/admin/ai-monitor.jsx
// Admin AI Monitor page (redirects to health for now)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminAIMonitor() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/health");
  }, []);
  return null;
}

