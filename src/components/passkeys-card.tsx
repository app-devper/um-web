"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { KeyRound, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { createPasskey, PasskeyError, passkeyFailureMessage, passkeysSupported } from "@/lib/passkey";
import type { AppError, Passkey, PasskeyOptions } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";

function formatDate(iso?: string): string {
  if (!iso || iso.startsWith("0001-")) return "never";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof PasskeyError) return passkeyFailureMessage(err.kind);
  if (axios.isAxiosError(err) && err.response?.data) {
    const data = err.response.data as AppError;
    if (data.code === "UM-400-002") return "Wrong password.";
    if (data.code === "UM-404-002") return "Passkeys are not enabled on this server.";
    return data.message || fallback;
  }
  return fallback;
}

export function PasskeysCard() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Passkey | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get<Passkey[]>("/auth/passkeys");
      setPasskeys(res.data);
      setEnabled(true);
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.data as AppError | undefined)?.code === "UM-404-002") {
        setEnabled(false);
      } else {
        toast.error(errorMessage(err, "Failed to load passkeys"));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSupported(passkeysSupported());
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const options = await api.post<PasskeyOptions>("/auth/passkeys/options", { password });
      const credential = await createPasskey(options.data);
      const res = await api.post<Passkey>("/auth/passkeys", {
        ceremonyId: options.data.ceremonyId,
        name,
        credential,
      });
      setPasskeys((list) => [...list, res.data]);
      setName("");
      toast.success(`Passkey "${res.data.name}" added`);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add passkey"));
    } finally {
      setPassword("");
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/auth/passkeys/${encodeURIComponent(pendingDelete.id)}`);
      setPasskeys((list) => list.filter((p) => p.id !== pendingDelete.id));
      toast.success("Passkey removed");
      setPendingDelete(null);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to remove passkey"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passkeys</CardTitle>
        <CardDescription>
          Sign in with your fingerprint, face or device PIN on every devper.app system. Your password keeps working.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!enabled ? (
          <p className="text-sm text-muted-foreground">Passkeys are not enabled on this server.</p>
        ) : !supported ? (
          <p className="text-sm text-muted-foreground">This browser cannot create passkeys. Try a current Chrome, Edge, Safari or Firefox.</p>
        ) : (
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pk-password">Current password *</Label>
              <Input
                id="pk-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pk-name">Device name</Label>
              <Input id="pk-name" placeholder="e.g. Work laptop" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={adding}>
                <KeyRound className="mr-2 h-4 w-4" />
                {adding ? "Waiting for your device..." : "Add a passkey"}
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Loading passkeys...</div>
        ) : enabled && passkeys.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">No passkeys yet</div>
        ) : (
          <ul className="space-y-3">
            {passkeys.map((p) => (
              <li key={p.id} className="flex items-start gap-3 rounded-md border p-3">
                <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Added {formatDate(p.createdDate)}
                    <br />
                    Last used {formatDate(p.lastUsedDate)}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setPendingDelete(p)} title={`Remove ${p.name}`} aria-label={`Remove passkey ${p.name}`}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove passkey "${pendingDelete?.name ?? ""}"?`}
        description="That device will no longer be able to sign in with it. You can add it again later."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </Card>
  );
}
