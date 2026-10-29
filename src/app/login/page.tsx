"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { KeyRound, Shield } from "lucide-react";
import axios from "axios";
import type { AppError } from "@/types";
import { PasskeyError, passkeyFailureMessage, passkeysSupported } from "@/lib/passkey";

export default function LoginPage() {
  const { login, loginWithPasskey } = useAuth();
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);

  useEffect(() => {
    setPasskeyAvailable(passkeysSupported());
  }, []);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [system, setSystem] = useState("SM");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ username, password, system });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as AppError;
        if (err.response.status === 429) {
          toast.error("Too many attempts. Please try again later.");
        } else {
          toast.error(data.message || "Login failed");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasskey = async () => {
    setLoading(true);
    try {
      await loginWithPasskey(system);
    } catch (err) {
      if (err instanceof PasskeyError) {
        toast.error(passkeyFailureMessage(err.kind));
      } else if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as AppError;
        toast.error(err.response.status === 429 ? "Too many attempts. Please try again later." : data.message || "Passkey sign-in failed");
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">User Management</CardTitle>
          <CardDescription>Sign in to the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="system">System Code</Label>
              <Input
                id="system"
                placeholder="Enter system code"
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                required
                disabled
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          {passkeyAvailable && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={handlePasskey} disabled={loading}>
                <KeyRound className="mr-2 h-4 w-4" />
                Sign in with a passkey
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
