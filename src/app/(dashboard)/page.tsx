"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import api from "@/lib/api";
import { launchUrl } from "@/lib/launch";
import type { AppError, LaunchableSystem, SSOTicket } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function errorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && err.response?.data) {
    const data = err.response.data as AppError;
    if (data.code === "UM-403-002") return "Your account can no longer use this system.";
    return data.message || fallback;
  }
  return fallback;
}

export default function AppsPage() {
  const [systems, setSystems] = useState<LaunchableSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<LaunchableSystem[]>("/auth/systems");
      setSystems(res.data);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load your systems"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (system: LaunchableSystem) => {
    // Open the tab during the click so the browser allows it, then send it to
    // the ticket URL; UM stays open in this tab.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    setOpening(system.systemCode);
    try {
      const res = await api.post<SSOTicket>("/auth/sso-ticket", { system: system.systemCode });
      const url = launchUrl(system.webUrl, res.data.ticket);
      if (!url) {
        tab?.close();
        toast.error(`${system.systemName} has no valid address. Ask an administrator to set it.`);
        return;
      }
      if (tab) {
        tab.location.href = url;
      } else {
        window.location.assign(url);
      }
    } catch (err) {
      tab?.close();
      toast.error(errorMessage(err, `Could not open ${system.systemName}`));
    } finally {
      setOpening(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Apps</h1>
        <p className="text-sm text-muted-foreground">Open a system you use without signing in again</p>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground" role="status">Loading your systems…</p>
      ) : systems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <LayoutGrid className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="font-medium">No other systems yet</p>
            <p className="text-sm text-muted-foreground">
              Systems appear here once your organization has them and an administrator sets their web URL.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {systems.map((system) => (
            <li key={system.systemCode}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{system.systemName}</CardTitle>
                  <CardDescription>{new URL(system.webUrl).host}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => open(system)}
                    disabled={opening !== null}
                    aria-label={`Open ${system.systemName} in a new tab`}
                  >
                    {opening === system.systemCode ? "Opening…" : "Open"}
                    <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden />
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
