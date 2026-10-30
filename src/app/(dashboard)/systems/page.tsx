"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { System, SystemCatalogEntry, SaveSystemCatalogEntryRequest, CreateSystemRequest, UpdateSystemRequest, AppError } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CreateSystemDialog, EditSystemDialog } from "@/components/system-form-dialog";
import { SystemCatalogCard } from "@/components/system-catalog-card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SystemsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [systems, setSystems] = useState<System[]>([]);
  const [catalog, setCatalog] = useState<SystemCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [deleteEntry, setDeleteEntry] = useState<SystemCatalogEntry | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editSystem, setEditSystem] = useState<System | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteSystem, setDeleteSystem] = useState<System | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchSystems = useCallback(async () => {
    try {
      const res = await api.get<System[]>("/system");
      setSystems(res.data || []);
    } catch {
      toast.error("Failed to fetch systems");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await api.get<SystemCatalogEntry[]>("/system-catalog");
      setCatalog(res.data || []);
    } catch {
      toast.error("Failed to fetch the system catalog");
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.role !== "SUPER") {
      router.replace("/users");
      return;
    }
    if (authLoading || user?.role !== "SUPER") {
      return;
    }
    fetchSystems();
    fetchCatalog();
  }, [authLoading, fetchSystems, fetchCatalog, router, user]);

  if (authLoading || user?.role !== "SUPER") {
    return null;
  }

  const handleError = (err: unknown) => {
    if (axios.isAxiosError(err) && err.response?.data) {
      toast.error((err.response.data as AppError).message);
    } else {
      toast.error("An error occurred");
    }
  };

  const handleCreate = async (data: CreateSystemRequest) => {
    setActionLoading(true);
    try {
      await api.post("/system", data);
      toast.success("System created");
      setCreateOpen(false);
      fetchSystems();
    } catch (err) {
      handleError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (id: string, data: UpdateSystemRequest) => {
    setActionLoading(true);
    try {
      await api.put(`/system/${id}`, data);
      toast.success("System updated");
      setEditOpen(false);
      fetchSystems();
    } catch (err) {
      handleError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEntry = async (systemCode: string, data: SaveSystemCatalogEntryRequest): Promise<boolean> => {
    setActionLoading(true);
    try {
      await api.put(`/system-catalog/${encodeURIComponent(systemCode)}`, data);
      toast.success(`${systemCode} saved`);
      fetchCatalog();
      fetchSystems();
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!deleteEntry) return;
    setActionLoading(true);
    try {
      await api.delete(`/system-catalog/${encodeURIComponent(deleteEntry.systemCode)}`);
      toast.success(`${deleteEntry.systemCode} removed from the catalog`);
      setDeleteEntry(null);
      fetchCatalog();
    } catch (err) {
      handleError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteSystem) return;
    setActionLoading(true);
    try {
      await api.delete(`/system/${deleteSystem.id}`);
      toast.success("System deleted");
      setDeleteOpen(false);
      fetchSystems();
    } catch (err) {
      handleError(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Systems</h1>
        <p className="text-sm text-muted-foreground">Describe each system once, then give it to clients</p>
      </div>

      <SystemCatalogCard
        catalog={catalog}
        loading={catalogLoading}
        saving={actionLoading}
        onSave={handleSaveEntry}
        onDelete={setDeleteEntry}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Clients&apos; systems</h2>
          <p className="text-sm text-muted-foreground">Which client has which system, and the API each one uses</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={catalog.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add System to a Client
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>System Name</TableHead>
              <TableHead>System Code</TableHead>
              <TableHead>Client ID</TableHead>
              <TableHead>Host</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : systems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No systems found
                </TableCell>
              </TableRow>
            ) : (
              systems.map((sys) => (
                <TableRow key={sys.id}>
                  <TableCell className="font-medium">{sys.systemName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{sys.systemCode}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{sys.clientId}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {sys.host}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditSystem(sys);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setDeleteSystem(sys);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateSystemDialog open={createOpen} onOpenChange={setCreateOpen} catalog={catalog} onSubmit={handleCreate} loading={actionLoading} />
      <EditSystemDialog open={editOpen} onOpenChange={setEditOpen} system={editSystem} onSubmit={handleEdit} loading={actionLoading} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete System"
        description={`Are you sure you want to delete "${deleteSystem?.systemName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={deleteEntry !== null}
        onOpenChange={(open) => !open && setDeleteEntry(null)}
        title="Remove from catalog"
        description={`Remove "${deleteEntry?.systemCode}" from the catalog? Only possible once no client has it.`}
        onConfirm={handleDeleteEntry}
        loading={actionLoading}
      />
    </div>
  );
}
