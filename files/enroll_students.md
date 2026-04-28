I'll enroll all students in the SAP ABAP course and create their purchase records too (so the app treats them as properly enrolled).

Ran command: `sqlite3 -column -header data.db "SELECT id, name, email FROM users WHERE role = 'student';"`

6 students — IDs 4 through 9. Now inserting enrollments and free purchases (price = 0, internal access) for all of them:

Ran command: `sqlite3 data.db "
-- Enroll all 6 students in course 4 (SAP ABAP)
INSERT INTO enrollments (user_id, course_id, enrolled_at) VALUES
  (4, 4, datetime('now')),
  (5, 4, datetime('now')),
  (6, 4, datetime('now')),
  (7, 4, datetime('now')),
  (8, 4, datetime('now')),
  (9, 4, datetime('now'));

-- Create purchase records (price_paid = 0 = internal/free access)
INSERT INTO purchases (user_id, course_id, price_paid, country, created_at) VALUES
  (4, 4, 0, 'US', datetime('now')),
  (5, 4, 0, 'IN', datetime('now')),
  (6, 4, 0, 'US', datetime('now')),
  (7, 4, 0, 'US', datetime('now')),
  (8, 4, 0, 'US', datetime('now')),
  (9, 4, 0, 'US', datetime('now'));
"`

Let me verify everything is correct and show you the final state:

Ran command: `sqlite3 -column -header data.db "
SELECT 
  u.name        AS student,
  c.title       AS course,
  e.enrolled_at,
  p.price_paid  AS price_paid_cents
FROM enrollments e
JOIN users    u ON e.user_id   = u.id
JOIN courses  c ON e.course_id = c.id
LEFT JOIN purchases p ON p.user_id = e.user_id AND p.course_id = e.course_id
WHERE e.course_id = 4
ORDER BY u.name;"`

✅ All 6 students are enrolled. Here's a summary of what was done:

---

## SAP ABAP Course — Enrollment Complete

| Student | Enrolled | Access |
|---|---|---|
| Emma Wilson | ✅ | Free (internal) |
| James Park | ✅ | Free (internal) |
| Olivia Martinez | ✅ | Free (internal) |
| Liam Thompson | ✅ | Free (internal) |
| Sophia Davis | ✅ | Free (internal) |
| Bossy McBossface | ✅ | Free (internal) |

**What this means in the app:**
- Every student will see the SAP ABAP course on their **Dashboard** with a "Start Course" button
- They can navigate all **19 lessons** across 5 modules
- Their **progress is tracked** as they click through lessons
- `price_paid = 0` means no PPP restriction — they can access from any country

> [!TIP]
> Start the app with `npm run dev`, open `http://localhost:5173`, switch to any student in the **DevUI panel** (bottom-right), then go to **Dashboard** — the SAP ABAP course will appear there immediately.