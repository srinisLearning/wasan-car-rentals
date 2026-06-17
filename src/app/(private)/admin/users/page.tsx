"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IUser } from "@/interfaces";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "@/server-actions/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
] as const;

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

export default function Users() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    const response: any = await getAllUsers();
    if (response.success) {
      setUsers(response.data || []);
    } else {
      setError(response.message || "Failed to load users");
      toast.error(response.message || "Failed to load users");
    }

    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: IUser["role"]) => {
    setUpdatingId(userId);
    const response = await updateUserRole(userId, newRole);

    if (response.success) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
      toast.success(response.message || "Role updated successfully");
    } else {
      toast.error(response.message || "Failed to update role");
    }

    setUpdatingId(null);
  };

  const handleStatusChange = async (
    userId: string,
    newStatus: IUser["status"],
  ) => {
    setUpdatingId(userId);
    const response = await updateUserStatus(userId, newStatus);

    if (response.success) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user,
        ),
      );
      toast.success(response.message || "Status updated successfully");
    } else {
      toast.error(response.message || "Failed to update status");
    }

    setUpdatingId(null);
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    const response: any = await deleteUser(userToDelete);

    if (response.success) {
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete));
      toast.success(response.message || "User deleted successfully");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } else {
      toast.error(response.message || "Failed to delete user");
    }

    setDeleting(false);
  };

  const getStatusClasses = (status: IUser["status"]) =>
    status === "active"
      ? "!bg-green-100 !text-green-800 !border-green-200"
      : "!bg-red-100 !text-red-800 !border-red-200";

  const getRoleClasses = (role: IUser["role"]) =>
    role === "admin"
      ? "!bg-violet-100 !text-violet-800 !border-violet-200"
      : "";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage account roles and user status for the admin dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={loadUsers}
          className="inline-flex items-center rounded-md border border-input bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <Spinner />
          <p className="mt-3 text-sm text-gray-500">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No users found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value as IUser["role"])
                      }
                      disabled={updatingId === user.id}
                    >
                      <SelectTrigger className={`w-32 ${getRoleClasses(user.role)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                     {/*  <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                          user.status,
                        )}`}
                      >
                        {user.status?.toUpperCase()}
                      </span> */}
                      <Select
                        value={user.status}
                        onValueChange={(value) =>
                          handleStatusChange(user.id, value as IUser["status"])
                        }
                        disabled={updatingId === user.id}
                      >
                        <SelectTrigger className={`w-32 ${getStatusClasses(user.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(user.id)}
                      disabled={updatingId === user.id}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
