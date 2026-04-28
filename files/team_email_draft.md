**To:** Team  
**From:** Senthil  
**Subject:** Evaluating an Open-Source Learning Platform for Our Internal Use — Worth Exploring?

---

Hi Team,

I spent some time exploring a GitHub codebase called **Cadence** — an open-source course learning platform. I wanted to share my findings and get your thoughts on whether this could be a strong foundation for our internal learning platform idea.

---

### What Is It?

Cadence is a fully functional course platform — think a lightweight internal Udemy. It supports:
- Multiple instructors creating and publishing courses
- Students enrolling, tracking progress lesson-by-lesson
- Video lessons (YouTube-embedded), written content (Markdown), and quizzes
- Team/corporate purchases with coupon-based seat allocation
- Purchasing Power Parity (PPP) pricing by country
- Admin controls for users, courses, and categories

---

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + React Router v7 (SSR framework mode) |
| **Styling** | Tailwind CSS v4 + shadcn/ui (Radix UI primitives) |
| **Database** | SQLite via `better-sqlite3` |
| **ORM** | Drizzle ORM (TypeScript-first, schema-as-code) |
| **Build Tool** | Vite |
| **Language** | TypeScript throughout |
| **Testing** | Vitest (unit tests for all services) |
| **Rich Editor** | Monaco Editor (VS Code's editor, for lesson content) |

---

### Architecture in a Nutshell

The app uses **React Router v7 in "framework mode"** — similar to Remix. There is no separate backend. Every route file exports a server-side `loader()` (data fetching) and `action()` (mutations), plus a React component — all in one file. The server runs on Node.js.

```
Browser Request
  → React Router (Node.js server)
    → route loader() runs
      → service function (e.g. courseService.ts)
        → Drizzle ORM query
          → SQLite (data.db file)
    → returns data to React component
      → SSR HTML sent to browser
        → React hydrates on client
```

The codebase is organized cleanly:
- `app/db/schema.ts` — single source of truth for the data model (16 tables)
- `app/services/` — one file per domain (courseService, enrollmentService, progressService, etc.), all with unit tests
- `app/routes/` — one file per page, co-locating server + client logic
- `app/lib/` — utilities (session, PPP pricing, Markdown rendering, validation)
- `scripts/seed.ts` — fully reproducible seed data (run `npm run db:seed` to reset)

---

### What's Good About It ✅

1. **Zero infrastructure overhead.** SQLite means no database server to provision or maintain. The entire database is a single file (`data.db`). Perfect for an internal tool with a small-to-medium user base.

2. **Genuinely full-featured out of the box.** Quizzes, video tracking (resume where you left off), progress bars, team purchases, PPP pricing, instructor dashboards, admin panels — this is not a toy. It's production-shaped.

3. **Clean, layered architecture.** Services are thin, focused, and independently testable. Every service has a corresponding `.test.ts` file. Drizzle ORM keeps queries type-safe and readable.

4. **Developer experience is excellent.** TypeScript end-to-end, Vite HMR, a built-in DevUI panel for switching between users/roles without logging in — onboarding a new developer is fast.

5. **SSR by default.** Pages render on the server — good for performance and SEO if we ever expose this externally.

6. **Maintainable schema.** Drizzle migrations are version-controlled SQL files. Schema changes are tracked and reproducible.

---

### What's Lacking / Risks ⚠️

1. **No real authentication.** Login is email-only — no passwords, no OAuth, no SSO. For an internal platform we'd need to integrate with our identity provider (Google Workspace / Azure AD / SAML). This would be a meaningful addition.

2. **SQLite limits scale.** SQLite is single-writer and file-based. It works well for hundreds of concurrent users but would need to be replaced with Postgres if we expect thousands. Drizzle supports Postgres with minimal code changes — it's not a rewrite, but it's not trivial either.

3. **No payment integration.** The purchase flow UI exists but the actual payment processing (Stripe, etc.) is stubbed out. Fine for internal use where courses are free, but worth noting.

4. **No email notifications.** The `enrollUser()` function has a `sendEmail` parameter that is accepted but does nothing — explicitly marked as out of scope in the code. We'd need to wire up something like Resend or SendGrid.

5. **Single-file SQLite = no horizontal scaling.** You can't run multiple Node.js instances pointing at the same `data.db` file. For an internal tool on a single server, this is fine. For high availability, it's a constraint.

6. **YouTube-only video hosting.** Videos are embedded YouTube URLs. If we want to host our own proprietary content, we'd need to integrate a video platform (Mux, Cloudflare Stream, etc.).

---

### Maintainability Assessment

**Short term:** Very high. The codebase is ~3,000 lines of application code (excluding node_modules and generated files), well-structured, and fully typed. A developer familiar with React and TypeScript can be productive in a day.

**Long term:** Moderate. The SSR-everything pattern of React Router v7 is powerful but has a learning curve for developers used to traditional SPAs. The SQLite constraint is the main long-term risk if usage grows significantly.

---

### My Take

This is a **surprisingly solid starting point**. For an internal learning platform where the audience is our own team (tens to low hundreds of users), this codebase does 80% of the work already. The missing 20% — SSO auth, possibly Postgres migration, email — are well-understood engineering problems.

The alternative would be building from scratch or buying a third-party tool (Docebo, TalentLMS, etc.). Given this codebase exists and is open-source, I think it's worth a deeper look before committing to either of those paths.

**Questions I'd love your input on:**

1. What's our expected user base — just the engineering team, or the whole company?
2. Do we need SSO (Google/Azure login) from day one, or is email login acceptable initially?
3. Do we want to host our own video content, or is YouTube embedding sufficient for internal content?
4. Are we comfortable owning the maintenance of a custom platform, or would we prefer a SaaS tool?

Happy to do a quick demo or set it up locally for anyone who wants to poke around.

— Senthil
