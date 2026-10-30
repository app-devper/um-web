"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { System, SystemCatalogEntry, CreateSystemRequest, UpdateSystemRequest } from "@/types";

interface CreateSystemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: SystemCatalogEntry[];
  onSubmit: (data: CreateSystemRequest) => Promise<void>;
  loading?: boolean;
}

const emptyCreate: CreateSystemRequest = { clientId: "", systemCode: "", host: "" };

export function CreateSystemDialog({ open, onOpenChange, catalog, onSubmit, loading }: CreateSystemDialogProps) {
  const [form, setForm] = useState<CreateSystemRequest>(emptyCreate);
  const chosen = catalog.find((entry) => entry.systemCode === form.systemCode);

  const choose = (systemCode: string) => {
    const entry = catalog.find((e) => e.systemCode === systemCode);
    setForm((prev) => ({ ...prev, systemCode, host: entry?.host || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(emptyCreate);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add System to a Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="cs-clientId">Client ID *</Label>
            <Input id="cs-clientId" value={form.clientId} onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cs-systemCode">System *</Label>
            <Select value={form.systemCode} onValueChange={choose}>
              <SelectTrigger id="cs-systemCode" className="w-full">
                <SelectValue placeholder={catalog.length ? "Choose from the catalog" : "Add a system to the catalog first"} />
              </SelectTrigger>
              <SelectContent>
                {catalog.map((entry) => (
                  <SelectItem key={entry.systemCode} value={entry.systemCode}>
                    {entry.systemName} ({entry.systemCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cs-host">Host *</Label>
            <Input id="cs-host" type="url" value={form.host} onChange={(e) => setForm((p) => ({ ...p, host: e.target.value }))} required placeholder="https://example.com" />
            <p className="text-xs text-muted-foreground">
              This client&apos;s API address{chosen?.host ? " — prefilled from the catalog, change it only if this client runs its own API" : ""}.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading || !form.systemCode}>{loading ? "Adding..." : "Add"}</Button>
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
  const [host, setHost] = useState("");
  const [prevSystem, setPrevSystem] = useState(system);

  if (system !== prevSystem) {
    setPrevSystem(system);
    if (system) setHost(system.host || "");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (system) await onSubmit(system.id, { host });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit {system?.systemName} for client {system?.clientId}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="es-host">Host *</Label>
            <Input id="es-host" type="url" value={host} onChange={(e) => setHost(e.target.value)} required />
            <p className="text-xs text-muted-foreground">This client&apos;s API address. Name and web URL are set in the catalog.</p>
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
