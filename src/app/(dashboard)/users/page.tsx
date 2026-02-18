"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { User, CreateUserRequest, UpdateUserRequest, AppError } from "@/types";
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
import { MoreHorizontal, Plus, Pencil, Key, ShieldCheck, ToggleLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CreateUserDialog, EditUserDialog, SetPasswordDialog } from "@/components/user-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import axios from "axios";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<"SUPER" | "ADMIN" | "USER">("USER");
  const [statusUser, setStatusUser] = useState<User | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get<User[]>("/user");
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleError = (err: unknown) => {
    if (axios.isAxiosError(err) && err.response?.data) {
      toast.error((err.response.data as AppError).message);
    } else {
      toast.error("An error occurred");
    }
  };

  const handleCreate = async (data: CreateUserRequest) => {
    setActionLoading(true);
    try {
      await api.post("/user", data);
      toast.success("User created");
      setCreateOpen(false);
      fetchUsers();
    } catch (err) {
      handleError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (id: string, data: UpdateUserRequest) => {
    setActionLoading(true);
    try {
      await api.put(`/user/${id}`, data);
      toast.success("User updated");
      setEditOpen(false);
      fetchUsers();
    } catch (err) {
      handleError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPassword = async (id: string, password: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/user/${id}/set-password`, { password });
      toast.success("Password set");
      setPasswordOpen(false);
    } catch (err) {
      handleError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setActionLoading(true);
    try {
      await api.delete(`/user/${deleteUser.id}`);
      toast.success("User deleted");
      setDeleteOpen(false);
      fetchUsers();
    } catch (err) {
      handleError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!roleUser) return;
    setActionLoading(true);
    try {
      await api.patch(`/user/${roleUser.id}/role`, { role: pendingRole });
      toast.success("Role updated");
      setRoleOpen(false);
      fetchUsers();
    } catch (err) {
      handleError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusUser) return;
    const newStatus = statusUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setActionLoading(true);
    try {
      await api.patch(`/user/${statusUser.id}/status`, { status: newStatus });
      toast.success(`Status changed to ${newStatus}`);
      setStatusOpen(false);
      fetchUsers();
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
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Client ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.clientId}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "SUPER"
                          ? "default"
                          : user.role === "ADMIN"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "ACTIVE" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
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
                            setEditUser(user);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setPasswordUser(user);
                            setPasswordOpen(true);
                          }}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Set Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(["SUPER", "ADMIN", "USER"] as const).map((role) => (
                          <DropdownMenuItem
                            key={role}
                            disabled={user.role === role}
                            onClick={() => {
                              setRoleUser(user);
                              setPendingRole(role);
                              setRoleOpen(true);
                            }}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Set {role}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setStatusUser(user);
                            setStatusOpen(true);
                          }}
                        >
                          <ToggleLeft className="mr-2 h-4 w-4" />
                          {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setDeleteUser(user);
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

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} loading={actionLoading} />
      <EditUserDialog open={editOpen} onOpenChange={setEditOpen} user={editUser} onSubmit={handleEdit} loading={actionLoading} />
      <SetPasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} user={passwordUser} onSubmit={handleSetPassword} loading={actionLoading} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteUser?.username}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={roleOpen}
        onOpenChange={setRoleOpen}
        title="Change Role"
        description={`Change ${roleUser?.username}'s role to ${pendingRole}?`}
        onConfirm={handleChangeRole}
        loading={actionLoading}
        variant="default"
      />

      <ConfirmDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        title="Toggle Status"
        description={`${statusUser?.status === "ACTIVE" ? "Deactivate" : "Activate"} user "${statusUser?.username}"?`}
        onConfirm={handleToggleStatus}
        loading={actionLoading}
        variant="default"
      />
    </div>
  );
}
