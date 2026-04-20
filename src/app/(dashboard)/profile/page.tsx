"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import type { UpdateUserRequest, ChangePasswordRequest, AppError, System, Session } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import axios from "axios";
import { Monitor, Smartphone, Trash2 } from "lucide-react";

function describeUserAgent(ua: string): string {
  if (!ua) return "Unknown device";
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(ua);
  let browser = "Browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";
  let os = "";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";
  return [browser, os].filter(Boolean).join(" on ") + (isMobile ? " (mobile)" : "");
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState<UpdateUserRequest>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    oldPassword: "",
    newPassword: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentSystem, setCurrentSystem] = useState<System | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);
  const [revokeAllLoading, setRevokeAllLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<System>("/auth/system")
      .then((res) => {
        if (!cancelled) setCurrentSystem(res.data);
      })
      .catch(() => {
        if (!cancelled) setCurrentSystem(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await api.get<Session[]>("/auth/sessions");
      setSessions(res.data || []);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      toast.success("Session revoked");
      fetchSessions();
    } catch (err) {
      handleError(err);
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevokeAllLoading(true);
    try {
      const res = await api.delete<{ revoked: number }>("/auth/sessions");
      toast.success(`Signed out ${res.data.revoked} other session(s)`);
      setRevokeAllOpen(false);
      fetchSessions();
    } catch (err) {
      handleError(err);
    } finally {
      setRevokeAllLoading(false);
    }
  };

  const handleError = (err: unknown) => {
    if (axios.isAxiosError(err) && err.response?.data) {
      toast.error((err.response.data as AppError).message);
    } else {
      toast.error("An error occurred");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.put("/user/info", profileForm);
      toast.success("Profile updated");
      await refreshUser();
    } catch (err) {
      handleError(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await api.put("/user/change-password", passwordForm);
      toast.success("Password changed");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      handleError(err);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
            <CardDescription>Your account details (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-24">Username:</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-24">Role:</span>
              <Badge>{user.role}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-24">Status:</span>
              <Badge variant={user.status === "ACTIVE" ? "default" : "destructive"}>{user.status}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-24">Client ID:</span>
              <Badge variant="outline">{user.clientId}</Badge>
            </div>
            {currentSystem && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-24">System:</span>
                <Badge variant="secondary">{currentSystem.systemCode}</Badge>
                <span className="text-muted-foreground">{currentSystem.systemName}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-firstName">First Name *</Label>
                <Input
                  id="p-firstName"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                  minLength={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-lastName">Last Name *</Label>
                <Input
                  id="p-lastName"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))}
                  required
                  minLength={1}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-email">Email</Label>
              <Input
                id="p-email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-phone">Phone</Label>
              <Input
                id="p-phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-oldPassword">Current Password *</Label>
              <Input
                id="p-oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, oldPassword: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-newPassword">New Password *</Label>
              <Input
                id="p-newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Devices currently signed in to your account</CardDescription>
          </div>
          {sessions.filter((s) => !s.current).length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setRevokeAllOpen(true)}>
              Sign out everywhere else
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No active sessions</div>
          ) : (
            <ul className="space-y-3">
              {sessions.map((s) => {
                const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(s.userAgent);
                const Icon = isMobile ? Smartphone : Monitor;
                return (
                  <li
                    key={s.sessionId}
                    className="flex items-start gap-3 rounded-md border p-3"
                  >
                    <Icon className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{describeUserAgent(s.userAgent)}</span>
                        {s.current && <Badge variant="secondary">This device</Badge>}
                        {s.system && <Badge variant="outline">{s.system}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.ipAddress && <span>IP {s.ipAddress} · </span>}
                        Signed in {formatRelative(s.createdAt)} · Active {formatRelative(s.lastActivity)}
                      </div>
                    </div>
                    {!s.current && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRevoke(s.sessionId)}
                        disabled={revokingId === s.sessionId}
                        title="Revoke session"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={revokeAllOpen}
        onOpenChange={setRevokeAllOpen}
        title="Sign out everywhere else"
        description="This will end all other active sessions. This device will stay signed in."
        onConfirm={handleRevokeAll}
        loading={revokeAllLoading}
      />
    </div>
  );
}
