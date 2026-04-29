import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import type { Route } from "./+types/admin.courses";
import {
  getAllCourses,
  getLessonCountForCourse,
  updateCourseStatus,
  deleteCourse,
} from "~/services/courseService";
import { getEnrollmentCountForCourse } from "~/services/enrollmentService";
import { getCurrentUserId } from "~/lib/session";
import { getUserById } from "~/services/userService";
import { parseFormData } from "~/lib/validation";
import { UserRole, CourseStatus } from "~/db/schema";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { AlertTriangle, BookOpen, Users, Trash2, Plus } from "lucide-react";
import { data, isRouteErrorResponse, Link } from "react-router";

const adminCourseActionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("update-status"),
    courseId: z.coerce.number().int(),
    status: z.nativeEnum(CourseStatus),
  }),
  z.object({
    intent: z.literal("delete-course"),
    courseId: z.coerce.number().int(),
  }),
]);

export function meta() {
  return [
    { title: "Manage Courses — TLabs Learning Hub" },
    { name: "description", content: "Manage all platform courses" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const currentUserId = await getCurrentUserId(request);

  if (!currentUserId) {
    throw data("Please log in to manage courses.", {
      status: 401,
    });
  }

  const currentUser = getUserById(currentUserId);

  if (!currentUser || currentUser.role !== UserRole.Admin) {
    throw data("Only admins can access this page.", {
      status: 403,
    });
  }

  const allCourses = getAllCourses();

  const coursesWithDetails = allCourses.map((course) => ({
    ...course,
    lessonCount: getLessonCountForCourse(course.id),
    enrollmentCount: getEnrollmentCountForCourse(course.id),
  }));

  return { courses: coursesWithDetails };
}

export async function action({ request }: Route.ActionArgs) {
  const currentUserId = await getCurrentUserId(request);

  if (!currentUserId) {
    throw data("You must be logged in.", { status: 401 });
  }

  const currentUser = getUserById(currentUserId);
  if (!currentUser || currentUser.role !== UserRole.Admin) {
    throw data("Only admins can manage courses.", { status: 403 });
  }

  const formData = await request.formData();
  const parsed = parseFormData(formData, adminCourseActionSchema);

  if (!parsed.success) {
    return data({ error: Object.values(parsed.errors)[0] ?? "Invalid input." }, { status: 400 });
  }

  const { intent } = parsed.data;

  if (intent === "update-status") {
    updateCourseStatus(parsed.data.courseId, parsed.data.status);
    return { success: true };
  }

  if (intent === "delete-course") {
    try {
      deleteCourse(parsed.data.courseId);
      return { success: true };
    } catch (error: any) {
      return data({ error: error.message || "Failed to delete course." }, { status: 400 });
    }
  }

  throw data("Invalid action.", { status: 400 });
}

function statusBadge(status: string) {
  switch (status) {
    case CourseStatus.Published:
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Published
        </span>
      );
    case CourseStatus.Draft:
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Draft
        </span>
      );
    case CourseStatus.Archived:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
          Archived
        </span>
      );
    default:
      return null;
  }
}

function CourseRow({
  course,
}: {
  course: {
    id: number;
    title: string;
    slug: string;
    status: string;
    instructorId: number;
    createdAt: string;
    lessonCount: number;
    enrollmentCount: number;
  };
}) {
  const statusFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (deleteFetcher.state === "idle" && deleteFetcher.data?.success) {
      toast.success("Course deleted successfully.");
    }
    if (deleteFetcher.state === "idle" && deleteFetcher.data?.error) {
      toast.error(deleteFetcher.data.error);
    }
  }, [deleteFetcher.state, deleteFetcher.data]);

  function confirmDelete() {
    deleteFetcher.submit(
      { intent: "delete-course", courseId: String(course.id) },
      { method: "post" }
    );
    setShowDeleteModal(false);
  }

  useEffect(() => {
    if (statusFetcher.state === "idle" && statusFetcher.data?.success) {
      toast.success("Course status updated.");
    }
    if (statusFetcher.state === "idle" && statusFetcher.data?.error) {
      toast.error(statusFetcher.data.error);
    }
  }, [statusFetcher.state, statusFetcher.data]);

  function handleStatusChange(newStatus: string) {
    statusFetcher.submit(
      { intent: "update-status", courseId: String(course.id), status: newStatus },
      { method: "post" }
    );
  }

  const formattedDate = new Date(course.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <div>
          <Link to={`/instructor/${course.id}`} className="text-sm font-medium hover:underline">
            {course.title}
          </Link>
          <p className="text-xs text-muted-foreground">{course.slug}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <Select value={course.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CourseStatus.Draft}>Draft</SelectItem>
            <SelectItem value={CourseStatus.Published}>Published</SelectItem>
            <SelectItem value={CourseStatus.Archived}>Archived</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <BookOpen className="size-3.5" />
          {course.lessonCount}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-3.5" />
          {course.enrollmentCount}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formattedDate}
      </td>
      <td className="px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
          onClick={() => setShowDeleteModal(true)}
          disabled={deleteFetcher.state !== "idle"}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </td>
    </tr>
    {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Delete Course</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Are you sure you want to delete this course? The action cannot be reverted.
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

function CourseRowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <Skeleton className="mb-1 h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="px-4 py-3"><Skeleton className="h-8 w-32" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
      <td className="px-4 py-3"><Skeleton className="size-7" /></td>
    </tr>
  );
}

export function HydrateFallback() {
  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>
      <Skeleton className="mb-4 h-5 w-28" />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Lessons</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Students</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <CourseRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminCourses({ loaderData }: Route.ComponentProps) {
  const { courses } = loaderData;

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Manage Courses</span>
      </nav>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Courses</h1>
          <p className="mt-1 text-muted-foreground">
            View all courses and manage their status
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="size-4" />
        <span>
          {courses.length} {courses.length === 1 ? "course" : "courses"} total
        </span>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="mx-auto mb-3 size-8 text-muted-foreground/50" />
            <p className="text-muted-foreground">No courses found.</p>
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
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Lessons
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Students
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
                  {courses.map((course) => (
                    <CourseRow key={course.id} course={course} />
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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Something went wrong";
  let message = "An unexpected error occurred while loading course management.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      title = "Sign in required";
      message = typeof error.data === "string" ? error.data : "Please log in to access this page.";
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
