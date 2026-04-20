"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function DashboardHome() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  useEffect(() => {
    if (isLoading) return;
    const landing = user?.role === "USER" ? "/profile" : "/users";
    router.replace(landing);
  }, [router, user, isLoading]);
  return null;
}
