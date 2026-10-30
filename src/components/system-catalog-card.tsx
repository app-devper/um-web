"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import type { SaveSystemCatalogEntryRequest, SystemCatalogEntry } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SystemCatalogCardProps {
  catalog: SystemCatalogEntry[];
  loading: boolean;
  saving: boolean;
  onSave: (systemCode: string, data: SaveSystemCatalogEntryRequest) => Promise<boolean>;
  onDelete: (entry: SystemCatalogEntry) => void;
}

const CODE_PATTERN = "[A-Z0-9][A-Z0-9_\\-]{0,49}";

type Editing = { isNew: boolean; systemCode: string } & SaveSystemCatalogEntryRequest;

export function SystemCatalogCard({ catalog, loading, saving, onSave, onDelete }: SystemCatalogCardProps) {
  const [editing, setEditing] = useState<Editing | null>(null);

  const startNew = () => setEditing({ isNew: true, systemCode: "", systemName: "", webUrl: "", host: "" });
  const startEdit = (e: SystemCatalogEntry) => setEditing({ isNew: false, ...e, webUrl: e.webUrl || "", host: e.host || "" });

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editing) return;
    const { systemCode, systemName, webUrl, host } = editing;
    if (await onSave(systemCode, { systemName, webUrl, host })) setEditing(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle>System catalog</CardTitle>
          <CardDescription>
            Each system once: its name, where users open it (shown on Apps) and the API new clients start with.
          </CardDescription>
        </div>
        <Button onClick={startNew} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add to catalog
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Web URL</TableHead>
                <TableHead>Default host</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : catalog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No systems in the catalog</TableCell>
                </TableRow>
              ) : (
                catalog.map((entry) => (
                  <TableRow key={entry.systemCode}>
                    <TableCell><Badge variant="secondary">{entry.systemCode}</Badge></TableCell>
                    <TableCell className="font-medium">{entry.systemName}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[220px] truncate">
                      {entry.webUrl || <span className="text-amber-600">not set — hidden on Apps</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[220px] truncate">{entry.host || "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${entry.systemCode}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEdit(entry)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(entry)}>
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
      </CardContent>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.isNew ? "Add system to the catalog" : `Edit ${editing?.systemCode}`}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={handleSubmit} className="space-y-3">
              {editing.isNew && (
                <div className="space-y-1">
                  <Label htmlFor="sc-code">System code *</Label>
                  <Input
                    id="sc-code"
                    value={editing.systemCode}
                    onChange={(e) => setEditing({ ...editing, systemCode: e.target.value.toUpperCase() })}
                    pattern={CODE_PATTERN}
                    required
                    placeholder="PORT"
                  />
                  <p className="text-xs text-muted-foreground">Upper-case letters, digits, _ or -. It cannot change later.</p>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="sc-name">Name *</Label>
                <Input id="sc-name" value={editing.systemName} onChange={(e) => setEditing({ ...editing, systemName: e.target.value })} required maxLength={100} />
                {!editing.isNew && <p className="text-xs text-muted-foreground">Renames this system for every client.</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="sc-web">Web URL</Label>
                <Input id="sc-web" type="url" value={editing.webUrl} onChange={(e) => setEditing({ ...editing, webUrl: e.target.value })} placeholder="https://app.devper.app" />
                <p className="text-xs text-muted-foreground">Where users open the app. Set it to show the system on the Apps page.</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="sc-host">Default host</Label>
                <Input id="sc-host" type="url" value={editing.host} onChange={(e) => setEditing({ ...editing, host: e.target.value })} placeholder="https://api.devper.app" />
                <p className="text-xs text-muted-foreground">The API address new clients start with.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
