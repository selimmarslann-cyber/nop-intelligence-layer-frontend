// pages/admin/withdraws.jsx
// Redirect to withdrawals page
"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminWithdraws() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/withdrawals");
  }, []);
  return null;
}

