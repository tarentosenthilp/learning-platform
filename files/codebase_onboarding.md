# Cadence Learning Platform — Developer Onboarding Guide

**App name:** Cadence  
**Repo path:** `/Users/senthilpalanivelu/poc/learning-platform`

---

## 1. Overall Architecture

### Frontend Framework
**React 19 + React Router v7** (file-based routing via `@react-router/dev`).

React Router v7 is used in its "framework mode", which means it acts as a full-stack framework (similar to Remix). Every route file can export a server-side `loader`, `action`, and a React component — all in one file.

### Backend Framework
There is **no separate backend server**. React Router v7 runs on the server via **Vite + `@react-router/node`**. Loaders and actions run on Node.js on every request. The server and client code coexist in the same project.

### Styling
**Tailwind CSS v4** (via the `@tailwindcss/vite` plugin). Component primitives come from **shadcn/ui** (which wraps **Radix UI**). The component library lives in `app/components/ui/`.

### How the App Starts and Runs

```
npm run dev
```
→ Vite starts a dev server. React Router v7 handles SSR (server-side rendering). On every page load, the route's `loader()` runs on the server, returns JSON, and the React component hydrates with it on the client.

```
npm run build && npm start
```
→ Builds a production bundle. `react-router-serve` runs the Node.js server.

**Key config files:**
| File | Purpose |
|---|---|
| [`vite.config.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/vite.config.ts) | Wires up Tailwind + React Router + TypeScript path aliases |
| [`react-router.config.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/react-router.config.ts) | React Router v7 framework config |
| [`app/routes.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes.ts) | Declares all routes and their layouts |
| [`app/root.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/root.tsx) | Root HTML shell, global fonts, dark mode script |

---

## 2. Database

### What is `data.db`?
`data.db` is a **SQLite** database file (binary format) in the project root. It is accessed directly from Node.js via the **`better-sqlite3`** driver — a synchronous, embedded SQLite library. No separate database server is needed.

The connection is set up in [`app/db/index.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/db/index.ts):
```ts
const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");   // Write-Ahead Logging for concurrency
sqlite.pragma("foreign_keys = ON");    // Enforce FK constraints
export const db = drizzle(sqlite, { schema });
```

`data.db-shm` and `data.db-wal` are WAL mode support files — ignore them.

### ORM: Drizzle ORM
The schema is defined in TypeScript using **Drizzle ORM** ([`app/db/schema.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/db/schema.ts)). SQL migrations live in the [`drizzle/`](file:///Users/senthilpalanivelu/poc/learning-platform/drizzle) folder. Running `npm run db:migrate` applies migrations; `npm run db:generate` regenerates them from schema changes.

### Tables

| Table | Purpose |
|---|---|
| `users` | All user accounts (students, instructors, admins) |
| `categories` | Course categories (Programming, Design, etc.) |
| `courses` | Course listings with price, status, PPP flag |
| `modules` | Ordered sections within a course |
| `lessons` | Individual lessons within a module (has video URL, content, GitHub repo) |
| `enrollments` | Which user is enrolled in which course |
| `lesson_progress` | Per-user per-lesson status (not_started / in_progress / completed) |
| `quizzes` | Quiz attached to a lesson |
| `quiz_questions` | Questions in a quiz (multiple_choice or true_false) |
| `quiz_options` | Answer options for each question |
| `quiz_attempts` | A user's quiz submission (score + pass/fail) |
| `quiz_answers` | Which option the user selected per question |
| `purchases` | Payment records (price paid, country at purchase time) |
| `teams` | Groups of users (for team/corporate purchases) |
| `team_members` | Users within a team + their role (admin or member) |
| `coupons` | One-time-use codes linked to a team purchase |
| `video_watch_events` | Video play/pause/seek events for resume + watch progress |

### Key Enums (defined in `schema.ts`)
| Enum | Values |
|---|---|
| `UserRole` | `student`, `instructor`, `admin` |
| `CourseStatus` | `draft`, `published`, `archived` |
| `LessonProgressStatus` | `not_started`, `in_progress`, `completed` |
| `QuestionType` | `multiple_choice`, `true_false` |
| `TeamMemberRole` | `admin`, `member` |

### What `npm run db:seed` inserts

[`scripts/seed.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/scripts/seed.ts) drops all tables, re-runs Drizzle migrations, then inserts:

- **1 admin:** Alex Rivera (`alex.rivera@ralph.dev`)
- **2 instructors:** Sarah Chen (`sarah.chen@ralph.dev`), Marcus Johnson (`marcus.johnson@ralph.dev`)
- **6 students:** Emma Wilson, James Park, Olivia Martinez, Liam Thompson, Sophia Davis, Bossy McBossface
- **5 categories:** Programming, Design, Data Science, DevOps, Marketing
- **3 full courses** with modules, lessons, quizzes, sample enrollments, and progress data:
  1. **Introduction to TypeScript** (Sarah Chen, $49.99, 5 modules, 19 lessons)
  2. **Building REST APIs with Node.js** (Marcus Johnson, $59.99, 5 modules, 20 lessons)
  3. **CSS for JavaScript Developers** (a third course, draft/published)
- Sample enrollments, lesson progress, quiz attempts, purchases, teams, and coupons

---

## 3. Authentication / Users

### How Users Log In
Login is **email-only** — no passwords. See [`app/routes/login.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/login.tsx):

1. User submits their email via a `<Form method="post">`.
2. The route's `action()` calls `getUserByEmail(email)` from `userService.ts`.
3. If the user exists, `setCurrentUserId(request, user.id)` writes the user's ID into a cookie session.
4. The user is redirected to `/courses` (or `?redirectTo=` param).

There are no passwords in this codebase — it is a **dev/demo-mode auth** system. Signup (`routes/signup.tsx`) simply creates a new student user by name + email.

### How the App Identifies Users
Session management is in [`app/lib/session.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/lib/session.ts):

```ts
// Cookie name: "cadence_session"
// Stores: { userId: number, devCountry?: string }
const sessionStorage = createCookieSessionStorage({ cookie: { name: "cadence_session", ... } });

export async function getCurrentUserId(request: Request): Promise<number | null>
export async function setCurrentUserId(request: Request, userId: number)
export async function destroySession(request: Request)
```

Every loader/action that needs auth calls `await getCurrentUserId(request)` and checks the result. Unauthenticated users get a `401` or are redirected to login.

### Dev User Switching (Important for Development!)
There is a floating **DevUI panel** (`app/components/dev-ui.tsx`) rendered on every page that lets you instantly switch between any seeded user without needing to log in/out. It posts to `/api/switch-user` which updates the session cookie. This is how you test different roles.

### Role/Access Control
Roles are stored in `users.role` and checked in loaders:
- **`admin`** → can access `/admin/*` routes (manage users, courses, categories)
- **`instructor`** → can access `/instructor/*` routes (manage their own courses, lessons, quizzes, students)
- **`student`** → can enroll in courses, track progress, take quizzes

The course detail page (`courses.$slug.tsx`) checks `currentUserId === course.instructorId` to show the instructor's "Manage Course" UI vs. the student's enrollment UI.

---

## 4. Data Flow

### How the Frontend Requests Data
React Router v7's **`loader()` function** is the primary data-fetching mechanism. It runs on the **server** before the page renders. The component receives data as `loaderData` props — no `useEffect` + `fetch` needed.

```
Browser navigates to /courses/my-course
  → Server calls loader() in courses.$slug.tsx
  → loader() calls service functions (e.g. getCourseBySlug, isUserEnrolled)
  → Services query SQLite via Drizzle ORM synchronously
  → loader() returns a plain object
  → React Router serializes it and sends to client
  → React component renders with loaderData
```

For mutations (forms, button clicks), React Router's **`action()` function** handles `<Form method="post">` submissions — also runs on the server.

For **background fetches** without navigation (e.g., marking a lesson complete, video tracking), React Router's **`useFetcher()`** hook is used. It posts to the same route's `action()` without a page reload.

### Which API Routes Fetch from the DB

| Route file | What data it fetches |
|---|---|
| [`home.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/home.tsx) | Published courses, categories, current user |
| [`courses.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/courses.tsx) | Filtered/sorted course list with PPP pricing |
| [`courses.$slug.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/courses.$slug.tsx) | Course details, enrollment status, progress %, PPP price |
| [`courses.$slug.lessons.$lessonId.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/courses.$slug.lessons.$lessonId.tsx) | Lesson content, quiz, progress map, video resume position |
| [`dashboard.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/dashboard.tsx) | Enrolled courses + per-course progress for the current user |
| [`instructor.$courseId.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/instructor.$courseId.tsx) | Full course editor (modules, lessons, quiz builder, pricing) |
| [`admin.users.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/admin.users.tsx) | All users, role management |
| [`api.video-tracking.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/api.video-tracking.ts) | Video events (play/pause/seek) — action-only route |

### How Data is Transformed Before the UI

1. **Service layer** (`app/services/`) handles all DB queries and business logic.
2. **Loaders** call services, then **shape the data** (e.g., strip `isCorrect` from quiz options so answers aren't leaked to the client).
3. **Markdown rendering** — lesson content and course sales copy are stored as Markdown in the DB. They are rendered to HTML server-side via `renderMarkdown()` in [`app/lib/markdown.server.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/lib/markdown.server.ts) (using the `marked` library) and sent as HTML strings to the component.
4. **PPP pricing** — the raw price is in cents (`courses.price`). The loader calls `calculatePppPrice(price, country)` to apply a discount based on the user's country.

---

## 5. Personalization

### How Different Users See Different Content

All personalization flows from `currentUserId` extracted from the session cookie in each loader.

| Feature | How it works |
|---|---|
| **Enrollment check** | `isUserEnrolled(userId, courseId)` → `enrollments` table |
| **Progress tracking** | `lesson_progress` table — per-user, per-lesson status |
| **Next lesson** | `getNextIncompleteLesson(userId, courseId)` — walks modules in order, finds first non-complete lesson |
| **Dashboard** | Shows only courses the current user is enrolled in |
| **Course detail** | Enrolled users see progress bar + "Continue Learning"; non-enrolled see "Enroll Now" |
| **Lesson viewer sidebar** | Lesson list shows ✅/▶/⚪ icons based on `lessonProgressMap` |
| **Instructor view** | If `currentUserId === course.instructorId`, lessons link to the instructor editor instead of the lesson viewer |
| **Admin view** | `/admin/*` routes — no explicit role guard in code shown, but intended for admin role only |

### PPP (Purchasing Power Parity) Personalization

The `checkPppAccess()` function in [`app/lib/ppp.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/lib/ppp.ts) compares:
- The country stored at purchase time (`purchases.country`)
- The user's **current** country (detected from IP or overridden via DevUI)

If a user bought at a discounted PPP price from Country A but is now accessing from Country B, they are shown a **"Access Restricted" block** on the lesson page.

Country detection lives in [`app/lib/country.server.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/lib/country.server.ts).

**4 PPP Tiers:**
| Tier | Countries | Discount |
|---|---|---|
| 1 | US, UK, DE, AU, JP… | 0% (full price) |
| 2 | MX, BR, TR, PL… | 30% off |
| 3 | IN, ZA, PH, VN… | 50% off |
| 4 | NG, PK, BD, KE… | 70% off |

---

## 6. Key Files to Read First

| Priority | File | Why |
|---|---|---|
| 🥇 | [`app/db/schema.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/db/schema.ts) | The data model — all tables, columns, enums. Everything flows from here. |
| 🥇 | [`app/routes.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes.ts) | The complete URL structure of the app. |
| 🥇 | [`app/lib/session.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/lib/session.ts) | How auth works (cookie session). |
| 🥈 | [`app/routes/layout.app.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/layout.app.tsx) | The shell for all authenticated pages (sidebar, DevUI). |
| 🥈 | [`app/services/courseService.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/services/courseService.ts) | The most-used service. See how Drizzle queries work. |
| 🥈 | [`app/services/progressService.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/services/progressService.ts) | Progress tracking logic — core feature. |
| 🥈 | [`app/routes/courses.$slug.lessons.$lessonId.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/courses.$slug.lessons.$lessonId.tsx) | The most complex route — lesson viewer with quiz, video tracking, progress, PPP guard. |
| 🥉 | [`app/components/dev-ui.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/components/dev-ui.tsx) | Dev tool for switching users and PPP country. Essential during development. |
| 🥉 | [`app/lib/ppp.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/lib/ppp.ts) | PPP pricing + access guard logic. |
| 🥉 | [`scripts/seed.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/scripts/seed.ts) | Shows all seed data — what users/courses/enrollments exist. |

---

## 7. Step-by-Step Runtime Flow

### What happens when you open the app (`/`)

1. Browser hits `GET /`.
2. React Router matches the `index("routes/home.tsx")` route.
3. `home.tsx`'s `loader()` runs on the server:
   - Fetches published courses from DB (`buildCourseQuery`).
   - Fetches all users (for DevUI).
   - Reads `currentUserId` from the session cookie.
   - Detects country (for PPP).
4. Returns `{ featuredCourses, users, currentUser, devCountry, ... }`.
5. React renders the home page component with this data.
6. If `currentUser` is null → shows "Log In / Sign Up" in the nav. If logged in → shows "Dashboard".
7. The **DevUI panel** appears in the bottom-right corner showing all seed users.

### What happens when a user signs in (`/login`)

1. User fills in their email, clicks "Log In".
2. Browser submits `POST /login` (React Router `<Form method="post">`).
3. `login.tsx`'s `action()` runs on the server:
   - Validates the email with Zod (`loginSchema`).
   - Calls `getUserByEmail(email)` → queries `users` table.
   - If found: calls `setCurrentUserId(request, user.id)` → writes `userId` into the `cadence_session` cookie.
4. Server responds with `redirect("/courses")` + a `Set-Cookie` header.
5. Browser stores the cookie and navigates to `/courses`.
6. All future requests include the cookie → server can identify who the user is.

### What happens when a course page loads (`/courses/introduction-to-typescript`)

1. Browser hits `GET /courses/introduction-to-typescript`.
2. React Router matches `route("courses/:slug", "routes/courses.$slug.tsx")`.
3. `courses.$slug.tsx`'s `loader()` runs:
   - `getCourseBySlug("introduction-to-typescript")` → finds the course.
   - `getCourseWithDetails(course.id)` → fetches the course + all its modules + lessons in one structured result.
   - `getCurrentUserId(request)` → checks if user is logged in.
   - If logged in: `isUserEnrolled(userId, course.id)` + `calculateProgress(...)` + `getLessonProgressForCourse(...)`.
   - `resolveCountry(request)` → detects the user's country.
   - `calculatePppPrice(price, country)` → computes the discounted price.
   - `renderMarkdown(salesCopy)` → converts the sales copy Markdown to HTML on the server.
4. Returns all data to the component.
5. React renders:
   - If enrolled → "Continue Learning" button + progress bar.
   - If not enrolled → "Enroll Now" button with PPP-discounted price.
   - If instructor → "Manage Course" button.
6. The curriculum (modules + lessons) is shown with progress icons (✅/▶/⚪).

---

## 8. Developer Learning Path

Read files in this order to understand the codebase fastest:

### Step 1 — Understand the Data Model (30 min)
1. [`app/db/schema.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/db/schema.ts) — Read every table and enum carefully.
2. [`scripts/seed.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/scripts/seed.ts) — Skim the first ~200 lines to see what data is created.

### Step 2 — Understand the URL Structure (15 min)
3. [`app/routes.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes.ts) — All routes, their layouts, and nesting.

### Step 3 — Understand Auth + Session (15 min)
4. [`app/lib/session.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/lib/session.ts) — The cookie session.
5. [`app/routes/login.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/login.tsx) — Login flow start to finish.
6. [`app/components/dev-ui.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/components/dev-ui.tsx) — The dev user-switching panel.

### Step 4 — Understand the Service Layer (30 min)
7. [`app/db/index.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/db/index.ts) — DB connection.
8. [`app/services/userService.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/services/userService.ts) — Simple CRUD, great intro to Drizzle patterns.
9. [`app/services/courseService.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/services/courseService.ts) — More complex queries with joins and filtering.
10. [`app/services/enrollmentService.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/services/enrollmentService.ts) — Enrollment logic.
11. [`app/services/progressService.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/services/progressService.ts) — Progress tracking.

### Step 5 — Trace a Full Page (45 min)
12. [`app/routes/layout.app.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/layout.app.tsx) — The app shell. Note: it has its own `loader()` that runs on every authenticated page.
13. [`app/routes/dashboard.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/dashboard.tsx) — A simple but complete example of loader → component.
14. [`app/routes/courses.$slug.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/courses.$slug.tsx) — Medium complexity with PPP and progress.

### Step 6 — The Most Complex Route (1 hour)
15. [`app/routes/courses.$slug.lessons.$lessonId.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/courses.$slug.lessons.$lessonId.tsx) — The lesson viewer. This file has: the loader, the action (mark-complete + quiz submit), the main component, the sidebar component, and the quiz component — all together. Reading it top-to-bottom will give you a complete picture of how the app works.
16. [`app/lib/ppp.ts`](file:///Users/senthilpalanivelu/poc/learning-platform/app/lib/ppp.ts) — PPP pricing and access control.

### Step 7 — Instructor + Admin Flows (as needed)
17. [`app/routes/instructor.$courseId.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/instructor.$courseId.tsx) — The largest file in the project (60KB). The full course editor: drag-and-drop modules, lesson editing with Monaco editor, quiz builder, pricing, publishing.
18. [`app/routes/admin.users.tsx`](file:///Users/senthilpalanivelu/poc/learning-platform/app/routes/admin.users.tsx) — Admin user management.

---

> [!TIP]
> **Quick start for hands-on exploration:** After `npm install && npm run db:seed && npm run dev`, open the app in the browser. Look for the **DevUI panel** in the bottom-right. Use it to switch between users (e.g., switch to "Emma Wilson" who is a student enrolled in courses, or "Sarah Chen" who is an instructor). This is much faster than using the login form.

> [!NOTE]
> **No passwords required.** Login is email-only. All email addresses end in `@ralph.dev` (instructors/admin) or `@student.dev` (students). You can log in from the login page using just the email, e.g. `sarah.chen@ralph.dev`.

> [!IMPORTANT]
> **`better-sqlite3` is synchronous.** All database calls in the services are synchronous (no `await`). This is by design — SQLite with better-sqlite3 is fast enough for this type of app, and synchronous code is simpler to write and read.
