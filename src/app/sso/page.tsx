"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { LoginResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

type Status = "working" | "error";

export default function SSOExchangePage() {
  const [status, setStatus] = useState<Status>("working");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get("ticket");
    const returnTo = params.get("return") || "/profile";
    const safeReturn = returnTo.startsWith("/") ? returnTo : "/profile";

    if (!ticket) {
      setStatus("error");
      setMessage("Missing ticket");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await api.post<LoginResponse>("/auth/exchange", { ticket });
        if (cancelled) return;
        sessionStorage.setItem("accessToken", res.data.accessToken);
        window.location.replace(safeReturn);
      } catch {
        if (cancelled) return;
        setStatus("error");
        setMessage("Session handoff failed. The link may have expired.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">
            {status === "working" ? "Signing you in..." : "Sign-in failed"}
          </CardTitle>
          {status === "error" && <CardDescription>{message}</CardDescription>}
        </CardHeader>
        <CardContent className="flex justify-center">
          {status === "working" ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          ) : (
            <Button onClick={() => (window.location.href = "/login")}>Go to login</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
