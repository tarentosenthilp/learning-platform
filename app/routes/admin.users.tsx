import { useState, useRef, useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import type { Route } from "./+types/admin.users";
import { getAllUsers, updateUser, updateUserRole, createUser, deleteUser } from "~/services/userService";
import { getCurrentUserId } from "~/lib/session";
import { getUserById } from "~/services/userService";
import { parseFormData } from "~/lib/validation";
import { UserRole } from "~/db/schema";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { AlertTriangle, Pencil, Shield, Users, Trash2, Plus } from "lucide-react";
import { data, isRouteErrorResponse, Link } from "react-router";

const adminUserActionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("update-user"),
    userId: z.coerce.number().int(),
    name: z.string().trim().min(1, "Name cannot be empty."),
    email: z.string().trim().min(1, "Email cannot be empty."),
  }),
  z.object({
    intent: z.literal("update-role"),
    userId: z.coerce.number().int(),
    role: z.nativeEnum(UserRole),
  }),
  z.object({
    intent: z.literal("create-user"),
    name: z.string().trim().min(1, "Name cannot be empty."),
    email: z.string().trim().min(1, "Email cannot be empty."),
    role: z.nativeEnum(UserRole),
  }),
  z.object({
    intent: z.literal("delete-user"),
    userId: z.coerce.number().int(),
  }),
]);

export function meta() {
  return [
    { title: "Manage Users — TLabs Learning Hub" },
    { name: "description", content: "Manage platform users" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const currentUserId = await getCurrentUserId(request);

  if (!currentUserId) {
    throw data("Select a user from the DevUI panel to manage users.", {
      status: 401,
    });
  }

  const currentUser = getUserById(currentUserId);

  if (!currentUser || currentUser.role !== UserRole.Admin) {
    throw data("Only admins can access this page.", {
      status: 403,
    });
  }

  const users = getAllUsers();

  return { users };
}

export async function action({ request }: Route.ActionArgs) {
  const currentUserId = await getCurrentUserId(request);

  if (!currentUserId) {
    throw data("You must be logged in.", { status: 401 });
  }

  const currentUser = getUserById(currentUserId);
  if (!currentUser || currentUser.role !== UserRole.Admin) {
    throw data("Only admins can manage users.", { status: 403 });
  }

  const formData = await request.formData();
  const parsed = parseFormData(formData, adminUserActionSchema);

  if (!parsed.success) {
    return data({ error: Object.values(parsed.errors)[0] ?? "Invalid input." }, { status: 400 });
  }

  const { intent } = parsed.data;

  if (intent === "update-user") {
    const { userId, name, email } = parsed.data;
    const user = getUserById(userId);
    updateUser(userId, name, email, user?.bio ?? null);
    return { success: true };
  }

  if (intent === "update-role") {
    const { userId, role } = parsed.data;
    updateUserRole(userId, role);
    return { success: true };
  }

  if (intent === "create-user") {
    const { name, email, role } = parsed.data;
    try {
      createUser(name, email, role, null);
      return { success: true };
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed: users.email")) {
        return data({ error: "A user with this email already exists." }, { status: 400 });
      }
      return data({ error: "Failed to create user." }, { status: 500 });
    }
  }

  if (intent === "delete-user") {
    const { userId } = parsed.data;
    if (userId === currentUserId) {
      return data({ error: "You cannot delete yourself." }, { status: 400 });
    }
    try {
      deleteUser(userId);
      return { success: true };
    } catch (error: any) {
      return data({ error: error.message || "Failed to delete user." }, { status: 400 });
    }
  }

  throw data("Invalid action.", { status: 400 });
}

function roleBadge(role: string) {
  switch (role) {
    case UserRole.Admin:
      return (
        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
          Admin
        </span>
      );
    case UserRole.Instructor:
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          Instructor
        </span>
      );
    case UserRole.Student:
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Student
        </span>
      );
    default:
      return null;
  }
}

function EditableUserRow({
  user,
}: {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const updateFetcher = useFetcher();
  const roleFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  useEffect(() => {
    if (deleteFetcher.state === "idle" && deleteFetcher.data?.success) {
      toast.success("User deleted successfully.");
    }
    if (deleteFetcher.state === "idle" && deleteFetcher.data?.error) {
      toast.error(deleteFetcher.data.error);
    }
  }, [deleteFetcher.state, deleteFetcher.data]);

  function handleDelete() {
    setShowDeleteModal(true);
  }

  function confirmDelete() {
    deleteFetcher.submit(
      { intent: "delete-user", userId: String(user.id) },
      { method: "post" }
    );
    setShowDeleteModal(false);
  }

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditName(user.name);
    setEditEmail(user.email);
  }, [user.name, user.email]);

  // Close edit mode on successful save
  useEffect(() => {
    if (updateFetcher.state === "idle" && updateFetcher.data?.success) {
      setIsEditing(false);
      toast.success("User updated successfully.");
    }
    if (updateFetcher.state === "idle" && updateFetcher.data?.error) {
      toast.error(updateFetcher.data.error);
    }
  }, [updateFetcher.state, updateFetcher.data]);

  useEffect(() => {
    if (roleFetcher.state === "idle" && roleFetcher.data?.success) {
      toast.success("Role updated successfully.");
    }
    if (roleFetcher.state === "idle" && roleFetcher.data?.error) {
      toast.error(roleFetcher.data.error);
    }
  }, [roleFetcher.state, roleFetcher.data]);

  function handleSave() {
    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim();
    if (!trimmedName || !trimmedEmail) return;
    if (trimmedName === user.name && trimmedEmail === user.email) {
      setIsEditing(false);
      return;
    }
    updateFetcher.submit(
      {
        intent: "update-user",
        userId: String(user.id),
        name: trimmedName,
        email: trimmedEmail,
      },
      { method: "post" }
    );
  }

  function handleCancel() {
    setEditName(user.name);
    setEditEmail(user.email);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }

  function handleRoleChange(newRole: string) {
    roleFetcher.submit(
      { intent: "update-role", userId: String(user.id), role: newRole },
      { method: "post" }
    );
  }

  const formattedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            ref={nameInputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <span className="text-sm font-medium">{user.name}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <span className="text-sm text-muted-foreground">{user.email}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Select value={user.role} onValueChange={handleRoleChange}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.Student}>Student</SelectItem>
            <SelectItem value={UserRole.Instructor}>Instructor</SelectItem>
            <SelectItem value={UserRole.Admin}>Admin</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formattedDate}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleSave}
              disabled={!editName.trim() || !editEmail.trim()}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
              onClick={handleDelete}
              disabled={deleteFetcher.state !== "idle"}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </td>
    </tr>
    {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Delete User</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            are you sure you want to delete the user, the action cannot be reverted
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={confirmDelete}
              disabled={deleteFetcher.state !== "idle"}
            >
              {deleteFetcher.state !== "idle" ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
      <td className="px-4 py-3"><Skeleton className="h-8 w-32" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
      <td className="px-4 py-3"><Skeleton className="size-7" /></td>
    </tr>
  );
}

export function HydrateFallback() {
  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-80" />
      </div>
      <Skeleton className="mb-4 h-5 w-28" />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminUsers({ loaderData }: Route.ComponentProps) {
  const { users } = loaderData;

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Manage Users</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <p className="mt-1 text-muted-foreground">
          View and manage platform users, edit details, and change roles
        </p>
      </div>

      <CreateUserForm />

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="size-4" />
        <span>
          {users.length} {users.length === 1 ? "user" : "users"} total
        </span>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="mx-auto mb-3 size-8 text-muted-foreground/50" />
            <p className="text-muted-foreground">No users found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <EditableUserRow key={user.id} user={user} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CreateUserForm() {
  const fetcher = useFetcher();
  const [isOpen, setIsOpen] = useState(false);
  const isCreating = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      toast.success("User created successfully.");
      setIsOpen(false);
    }
    if (fetcher.state === "idle" && fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data]);

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="mb-6">
        <Plus className="mr-2 size-4" />
        Add User
      </Button>
    );
  }

  return (
    <Card className="mb-6 border-dashed bg-muted/30">
      <CardHeader className="pb-3 text-lg font-semibold">Create New User</CardHeader>
      <CardContent>
        <fetcher.Form method="post" className="flex items-end gap-4">
          <input type="hidden" name="intent" value="create-user" />
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Full name"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Email address"
            />
          </div>
          <div className="w-32 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Role</label>
            <Select name="role" defaultValue={UserRole.Student}>
              <SelectTrigger className="h-9 w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.Student}>Student</SelectItem>
                <SelectItem value={UserRole.Instructor}>Instructor</SelectItem>
                <SelectItem value={UserRole.Admin}>Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Saving..." : "Save"}
            </Button>
          </div>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Something went wrong";
  let message = "An unexpected error occurred while loading user management.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      title = "Sign in required";
      message = typeof error.data === "string" ? error.data : "Please select a user from the DevUI panel.";
    } else if (error.status === 403) {
      title = "Access denied";
      message = typeof error.data === "string" ? error.data : "Only admins can access this page.";
    } else {
      title = `Error ${error.status}`;
      message = typeof error.data === "string" ? error.data : error.statusText;
    }
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="text-center">
        <AlertTriangle className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">{title}</h1>
        <p className="mb-6 text-muted-foreground">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
