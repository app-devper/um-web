"use client";

import { useState, useEffect } from "react";
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
import type { System, CreateSystemRequest, UpdateSystemRequest } from "@/types";

interface CreateSystemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSystemRequest) => Promise<void>;
  loading?: boolean;
}

export function CreateSystemDialog({ open, onOpenChange, onSubmit, loading }: CreateSystemDialogProps) {
  const [form, setForm] = useState<CreateSystemRequest>({
    clientId: "",
    systemName: "",
    systemCode: "",
    host: "",
  });

  const handleChange = (field: keyof CreateSystemRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm({ clientId: "", systemName: "", systemCode: "", host: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create System</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cs-clientId">Client ID *</Label>
              <Input id="cs-clientId" value={form.clientId} onChange={(e) => handleChange("clientId", e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cs-systemCode">System Code *</Label>
              <Input id="cs-systemCode" value={form.systemCode} onChange={(e) => handleChange("systemCode", e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cs-systemName">System Name *</Label>
            <Input id="cs-systemName" value={form.systemName} onChange={(e) => handleChange("systemName", e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cs-host">Host *</Label>
            <Input id="cs-host" value={form.host} onChange={(e) => handleChange("host", e.target.value)} required placeholder="https://example.com" />
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

interface EditSystemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  system: System | null;
  onSubmit: (id: string, data: UpdateSystemRequest) => Promise<void>;
  loading?: boolean;
}

export function EditSystemDialog({ open, onOpenChange, system, onSubmit, loading }: EditSystemDialogProps) {
  const [form, setForm] = useState<UpdateSystemRequest>({
    systemName: "",
    host: "",
  });

  useEffect(() => {
    if (system) {
      setForm({
        systemName: system.systemName || "",
        host: system.host || "",
      });
    }
  }, [system]);

  const handleChange = (field: keyof UpdateSystemRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (system) await onSubmit(system.id, form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit System</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="es-systemName">System Name *</Label>
            <Input id="es-systemName" value={form.systemName} onChange={(e) => handleChange("systemName", e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="es-host">Host *</Label>
            <Input id="es-host" value={form.host} onChange={(e) => handleChange("host", e.target.value)} required />
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
