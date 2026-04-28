Viewed data_storage.md:43-73

You have **3 ways** to add a course. Here they are from easiest to most permanent:

---

## Option 1: Through the App UI (Recommended)

This is the proper way — no SQL needed.

1. **Run the app** if it's not already running:
```bash
cd /Users/senthilpalanivelu/poc/learning-platform
npm run dev
```
2. Open `http://localhost:5173`
3. In the **DevUI panel** (bottom-right), switch to an instructor — e.g. **Sarah Chen**
4. Go to `http://localhost:5173/instructor` → click **"New Course"**
5. Fill in title, description, category → it creates a `draft` course in the DB immediately
6. From the course editor you can add modules, lessons, videos, quizzes, set price, and publish

---

## Option 2: Direct SQL via CLI (Quick, manual)

Run this in your terminal — it inserts a real course row:

Ran command: `sqlite3 data.db "
INSERT INTO courses (title, slug, description, instructor_id, category_id, status, price, ppp_enabled, created_at, updated_at)
VALUES (
  'Python for Beginners',
  'python-for-beginners',
  'Learn Python from scratch. Covers variables, loops, functions, and building simple scripts.',
  2,
  1,
  'published',
  3999,
  1,
  datetime('now'),
  datetime('now')
);
SELECT id, title, status, price FROM courses;
"`

Course **#3 "Python for Beginners"** is now in the DB. Let's verify it shows up in the app by also adding a module and a lesson to it:

Ran command: `sqlite3 data.db "
-- Add a module
INSERT INTO modules (course_id, title, position, created_at)
VALUES (3, 'Getting Started with Python', 1, datetime('now'));

-- Add a lesson to that module
INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at)
VALUES (
  (SELECT id FROM modules WHERE course_id = 3 LIMIT 1),
  'What is Python?',
  '## What is Python?

Python is a high-level, interpreted programming language known for its simplicity and readability.

### Why Python?
- Easy to learn syntax
- Huge ecosystem of libraries
- Used in web development, data science, AI, and automation',
  1,
  10,
  datetime('now')
);

-- Confirm
SELECT m.title as module, l.title as lesson, l.duration_minutes as mins
FROM lessons l
JOIN modules m ON l.module_id = m.id
WHERE m.course_id = 3;
"`

✅ Module and lesson added. The course is fully live in the DB.

---

## Option 3: Add to `scripts/seed.ts` (Permanent / Repeatable)

If you want this course to survive a re-seed (`npm run db:seed`), add it to the seed script. Find the section after course 2 and add:

```ts
// ─── Course 3: Python for Beginners ───
const [course3] = db
  .insert(schema.courses)
  .values({
    title: "Python for Beginners",
    slug: "python-for-beginners",
    description: "Learn Python from scratch...",
    instructorId: instructor1.id,
    categoryId: catBySlug["programming"].id,
    status: CourseStatus.Published,
    price: 3999,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
  })
  .returning()
  .all();
```

Then add modules and lessons in the same pattern as `c1Modules` / `c2Modules` above it.

---

## The SQL anatomy for future reference

Here's what each field means when inserting a course:

| Column | Value | Notes |
|---|---|---|
| `instructor_id` | `2` | Sarah Chen (use any instructor's ID) |
| `category_id` | `1` | Programming (1=Programming, 2=Design, 3=Data Science, 4=DevOps, 5=Marketing) |
| `status` | `'draft'` or `'published'` | Only `published` courses appear on the home page |
| `price` | `3999` | In **cents** — so 3999 = $39.99 |
| `ppp_enabled` | `1` | `1` = PPP discounts active, `0` = fixed price globally |
| `slug` | `'python-for-beginners'` | Must be **unique** — used in the URL `/courses/python-for-beginners` |

> [!TIP]
> After adding via SQL, **no app restart needed** — since better-sqlite3 reads directly from the file on every request, the new course will appear instantly when you refresh the browser.

> [!WARNING]
> If you run `npm run db:seed` again it will **wipe everything** including the course you just added via SQL. Only Option 3 (adding to seed.ts) makes it permanent across re-seeds.