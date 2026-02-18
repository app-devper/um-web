"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { System, CreateSystemRequest, UpdateSystemRequest, AppError } from "@/types";
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
import { ConfirmDialog } from "@/components/confirm-dialog";
import axios from "axios";

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchSystems();
  }, [fetchSystems]);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Systems</h1>
          <p className="text-sm text-muted-foreground">Manage system configurations</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add System
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

      <CreateSystemDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} loading={actionLoading} />
      <EditSystemDialog open={editOpen} onOpenChange={setEditOpen} system={editSystem} onSubmit={handleEdit} loading={actionLoading} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete System"
        description={`Are you sure you want to delete "${deleteSystem?.systemName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}
