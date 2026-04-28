# TLabs Learning Hub

A full-stack enterprise learning platform built with React Router, TypeScript, SQLite, and Drizzle ORM. Designed as a robust corporate training environment with advanced administrative controls, performance optimizations, and a clean, responsive UI.

## Key Features

- **Dynamic Real-Time Search**: Instantly filter courses by title, description, category, and instructor name without page reloads.
- **Administrative Control**: Full role-based access control. Admins can manage courses and users with secure, cascading deletion logic that maintains database integrity (cleaning up enrollments, progress, coupons, etc.).
- **Performance Optimized Delivery**: Features a custom YouTube Facade Pattern that eliminates page load lag by lazy-loading heavy video iframe APIs only when interacted with.
- **Responsive & Modern UI**: Includes a smooth collapsible sidebar, sleek Dark/Light mode toggle, and unified "Mark as Complete" progressive navigation for lessons.
- **Role-Based Workflows**: Distinct capabilities for `Admin`, `Instructor`, and `Student` roles, ensuring strict boundaries (e.g., only Instructors can create courses)

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [npm](https://www.npmjs.com/) v10+

## Getting Started

```bash
# Install dependencies
npm install

# Run database migrations and seed data
npm run db:migrate
npm run db:seed

# Start the dev server
npm run dev
```

The app will be running at `http://localhost:5173`.

## Scripts

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `npm run dev`        | Start the development server |
| `npm run build`      | Build for production         |
| `npm test`           | Run tests with Vitest        |
| `npm run typecheck`  | Type-check the project       |
| `npm run db:migrate` | Run database migrations      |
| `npm run db:seed`    | Seed the database            |

## Tech Stack

- **Framework:** [React Router](https://reactrouter.com/) v7 with SSR
- **Language:** TypeScript
- **Database:** SQLite via [Drizzle ORM](https://orm.drizzle.team/)
- **Styling:** Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Build:** [Vite](https://vite.dev/)
