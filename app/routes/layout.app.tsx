import { Outlet } from "react-router";
import type { Route } from "./+types/layout.app";
import { Sidebar } from "~/components/sidebar";
import { Toaster } from "sonner";
import { requireAuth } from "~/lib/auth.server";
import {
  getRecentlyProgressedCourses,
  calculateProgress,
  getCompletedLessonCount,
  getTotalLessonCount,
} from "~/services/progressService";
import { isTeamAdmin } from "~/services/teamService";

export async function loader({ request }: Route.LoaderArgs) {
  const currentUser = await requireAuth(request);

  const recentCourses = getRecentlyProgressedCourses(currentUser.id).map(
    (course) => {
      const completedLessons = getCompletedLessonCount(
        currentUser.id,
        course.courseId
      );
      const totalLessons = getTotalLessonCount(course.courseId);
      const progress = calculateProgress(currentUser.id, course.courseId, false, false);
      return {
        courseId: course.courseId,
        title: course.courseTitle,
        slug: course.courseSlug,
        coverImageUrl: course.coverImageUrl,
        completedLessons,
        totalLessons,
        progress,
      };
    }
  );

  return {
    currentUser: {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      avatarUrl: currentUser.avatarUrl ?? null,
    },
    recentCourses,
    isTeamAdmin: isTeamAdmin(currentUser.id),
  };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { currentUser, recentCourses, isTeamAdmin: userIsTeamAdmin } = loaderData;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentUser={currentUser}
        recentCourses={recentCourses}
        isTeamAdmin={userIsTeamAdmin}
      />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
