"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User, CreateUserRequest, UpdateUserRequest, Role } from "@/types";

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserRequest) => Promise<void>;
  loading?: boolean;
  callerRole?: Role;
}

type CreatableRole = "ADMIN" | "MANAGER" | "USER";

const emptyCreateForm: CreateUserRequest = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  username: "",
  password: "",
  clientId: "",
  role: "USER",
};

export function CreateUserDialog({ open, onOpenChange, onSubmit, loading, callerRole }: CreateDialogProps) {
  const roleOptions = useMemo<CreatableRole[]>(() => {
    if (callerRole === "SUPER") return ["ADMIN", "MANAGER", "USER"];
    if (callerRole === "ADMIN") return ["MANAGER", "USER"];
    return [];
  }, [callerRole]);

  const defaultRole: CreatableRole = callerRole === "SUPER" ? "ADMIN" : "USER";
  const [form, setForm] = useState<CreateUserRequest>({ ...emptyCreateForm, role: defaultRole });

  useEffect(() => {
    if (open) setForm({ ...emptyCreateForm, role: defaultRole });
  }, [open, defaultRole]);

  const handleChange = (field: keyof CreateUserRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="c-firstName">First Name</Label>
              <Input id="c-firstName" value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-lastName">Last Name</Label>
              <Input id="c-lastName" value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-username">Username *</Label>
            <Input id="c-username" value={form.username} onChange={(e) => handleChange("username", e.target.value)} required minLength={3} maxLength={50} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-password">Password *</Label>
            <Input id="c-password" type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} required minLength={8} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-clientId">Client ID *</Label>
            <Input id="c-clientId" value={form.clientId} onChange={(e) => handleChange("clientId", e.target.value)} required minLength={3} maxLength={3} placeholder="3 characters" />
          </div>
          {roleOptions.length > 1 && (
            <div className="space-y-1">
              <Label htmlFor="c-role">Role *</Label>
              <select
                id="c-role"
                value={form.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-phone">Phone</Label>
              <Input id="c-phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (id: string, data: UpdateUserRequest) => Promise<void>;
  loading?: boolean;
}

export function EditUserDialog({ open, onOpenChange, user, onSubmit, loading }: EditDialogProps) {
  const [form, setForm] = useState<UpdateUserRequest>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (field: keyof UpdateUserRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) await onSubmit(user.id, form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="e-firstName">First Name *</Label>
              <Input id="e-firstName" value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} required minLength={1} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="e-lastName">Last Name *</Label>
              <Input id="e-lastName" value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} required minLength={1} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="e-email">Email</Label>
            <Input id="e-email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="e-phone">Phone</Label>
            <Input id="e-phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface SetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (id: string, password: string) => Promise<void>;
  loading?: boolean;
}

export function SetPasswordDialog({ open, onOpenChange, user, onSubmit, loading }: SetPasswordDialogProps) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) setPassword("");
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) await onSubmit(user.id, password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Password for {user?.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="sp-password">New Password *</Label>
            <Input id="sp-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Setting..." : "Set Password"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
