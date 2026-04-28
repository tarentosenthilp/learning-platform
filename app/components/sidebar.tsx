import { NavLink, Form } from "react-router";
import { useState, useEffect } from "react";
import { cn } from "~/lib/utils";
import { UserRole } from "~/db/schema";
import { UserAvatar } from "~/components/user-avatar";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  Shield,
  Tag,
  Users,
  UsersRound,
  Moon,
  Sun,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface CurrentUser {
  id: number;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
}

interface RecentCourse {
  courseId: number;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  completedLessons: number;
  totalLessons: number;
  progress: number;
}

interface SidebarProps {
  currentUser: CurrentUser | null;
  recentCourses?: RecentCourse[];
  isTeamAdmin?: boolean;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles: UserRole[] | "all";
}

const navItems: NavItem[] = [
  {
    label: "Browse Courses",
    to: "/courses",
    icon: <BookOpen className="size-4" />,
    roles: "all",
  },
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <LayoutDashboard className="size-4" />,
    roles: [UserRole.Student],
  },
  {
    label: "My Courses",
    to: "/instructor",
    icon: <GraduationCap className="size-4" />,
    roles: [UserRole.Instructor],
  },
  {
    label: "Manage Users",
    to: "/admin/users",
    icon: <Users className="size-4" />,
    roles: [UserRole.Admin],
  },
  {
    label: "Manage Courses",
    to: "/admin/courses",
    icon: <Shield className="size-4" />,
    roles: [UserRole.Admin],
  },
  {
    label: "Categories",
    to: "/admin/categories",
    icon: <Tag className="size-4" />,
    roles: [UserRole.Admin],
  },
];

function isVisible(item: NavItem, role: UserRole | null): boolean {
  if (item.roles === "all") return true;
  if (!role) return false;
  return item.roles.includes(role);
}

export function Sidebar({
  currentUser,
  recentCourses = [],
  isTeamAdmin = false,
}: SidebarProps) {
  const currentUserRole = currentUser?.role ?? null;
  const [isDark, setIsDark] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const savedCollapse = localStorage.getItem("cadence-sidebar-collapsed");
    if (savedCollapse === "true") {
      setIsCollapsed(true);
    }
  }, []);

  function toggleCollapse() {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem("cadence-sidebar-collapsed", next ? "true" : "false");
    } catch {}
  }

  function toggleDarkMode() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("cadence-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <aside className={cn(
      "flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
      isCollapsed ? "w-16" : "w-56"
    )}>
      <div className={cn("flex h-14 items-center border-b border-sidebar-border transition-all duration-300", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        <NavLink
          to="/"
          className={cn(
            "font-bold tracking-tight transition-all duration-300 overflow-hidden whitespace-nowrap",
            isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 text-lg mr-2"
          )}
        >
          TLabs Learning
        </NavLink>
        <button
          onClick={toggleCollapse}
          className="rounded-md p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems
          .filter((item) => isVisible(item, currentUserRole))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md py-2 text-sm font-medium transition-colors overflow-hidden whitespace-nowrap",
                  isCollapsed ? "justify-center px-0" : "gap-3 px-3",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              <div className="shrink-0">{item.icon}</div>
              <span className={cn(
                "transition-all duration-300",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              )}>
                {item.label}
              </span>
            </NavLink>
          ))}
        {isTeamAdmin && (
          <NavLink
            to="/team"
            title={isCollapsed ? "Team" : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-md py-2 text-sm font-medium transition-colors overflow-hidden whitespace-nowrap",
                isCollapsed ? "justify-center px-0" : "gap-3 px-3",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <div className="shrink-0"><UsersRound className="size-4" /></div>
            <span className={cn(
              "transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              Team
            </span>
          </NavLink>
        )}
      </nav>

      {!isCollapsed && recentCourses.length > 0 && (
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Recent Courses
          </div>
          <div className="space-y-1">
            {recentCourses.map((course) => (
              <NavLink
                key={course.courseId}
                to={`/courses/${course.slug}`}
                className={({ isActive }) =>
                  cn(
                    "block rounded-md px-3 py-2 transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <div className="truncate text-sm font-medium">
                  {course.title}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-sidebar-accent">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs text-sidebar-foreground/50">
                    {course.progress}%
                  </span>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      <div className={cn("border-t border-sidebar-border space-y-1 transition-all duration-300", isCollapsed ? "p-2" : "p-3")}>
        <button
          onClick={toggleDarkMode}
          title={isDark ? "Light Mode" : "Dark Mode"}
          className={cn("flex w-full items-center rounded-md py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground overflow-hidden whitespace-nowrap", isCollapsed ? "justify-center px-0" : "gap-3 px-3")}
        >
          <div className="shrink-0">
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </div>
          <span className={cn(
            "transition-all duration-300",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {currentUser && (
          <div className={cn("flex items-center rounded-md py-2", isCollapsed ? "flex-col gap-2 px-0 justify-center" : "gap-3 px-3")}>
            <UserAvatar
              name={currentUser.name}
              avatarUrl={currentUser.avatarUrl}
            />
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium">
                    {currentUser.name}
                  </div>
                  <div className="truncate text-xs capitalize text-sidebar-foreground/50">
                    {currentUser.role}
                  </div>
                </div>
                <NavLink
                  to="/settings"
                  title="Settings"
                  className="rounded-md p-1 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Settings className="size-4" />
                </NavLink>
                <Form method="post" action="/api/logout">
                  <button
                    type="submit"
                    title="Sign out"
                    className="rounded-md p-1 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <LogOut className="size-4" />
                  </button>
                </Form>
              </>
            )}
            {isCollapsed && (
              <Form method="post" action="/api/logout" className="w-full">
                <button
                  type="submit"
                  title="Sign out"
                  className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mt-2"
                >
                  <LogOut className="size-4" />
                </button>
              </Form>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
