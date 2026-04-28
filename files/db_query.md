sqlite3 -column -header data.db "SELECT id, title, status, price, cover_image_url FROM courses;

sqlite3 -column -header data.db "SELECT id, course_id, title, position FROM modules ORDER BY course_id, position;

sqlite3 -column -header data.db "SELECT l.id, l.module_id, m.course_id, l.title, l.position, l.duration_minutes, l.video_url, l.github_repo_url, CASE WHEN l.content IS NULL THEN 'NULL' ELSE substr(l.content,1,60) || '...' END as content_preview FROM lessons l JOIN modules m ON l.module_id = m.id ORDER BY m.course_id, l.module_id, l.position;

sqlite3 -column -header data.db "SELECT q.id, q.quiz_id, q.question_text, q.question_type, q.position FROM quiz_questions q ORDER BY q.quiz_id, q.position;

sqlite3 -column -header data.db "SELECT o.id, o.question_id, o.option_text, o.is_correct FROM quiz_options o ORDER BY o.question_id, o.id;

sqlite3 data.db "SELECT id, title, content FROM lessons WHERE id = 1;

sqlite3 -column -header data.db "
SELECT 
  e.id, 
  u.name as student, 
  c.title as course, 
  e.enrolled_at,
  e.completed_at
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
ORDER BY e.id;"

sqlite3 -column -header data.db "
SELECT 
  lp.id,
  u.name as student,
  l.title as lesson,
  lp.status,
  lp.completed_at
FROM lesson_progress lp
JOIN users u ON lp.user_id = u.id
JOIN lessons l ON lp.lesson_id = l.id
ORDER BY u.name, lp.id;"

sqlite3 -column -header data.db "
SELECT 
  p.id,
  u.name as buyer,
  c.title as course,
  p.price_paid,
  p.country,
  p.created_at
FROM purchases p
JOIN users u ON p.user_id = u.id
JOIN courses c ON p.course_id = c.id
ORDER BY p.id;"

sqlite3 -column -header data.db "
SELECT 
  qa.id,
  u.name as student,
  qz.title as quiz,
  qa.score,
  qa.passed,
  qa.attempted_at
FROM quiz_attempts qa
JOIN users u ON qa.user_id = u.id
JOIN quizzes qz ON qa.quiz_id = qz.id
ORDER BY qa.id;"

sqlite3 -column -header data.db "
SELECT 
  t.id as team_id,
  u.name as member,
  tm.role,
  tm.created_at
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
JOIN users u ON tm.user_id = u.id
ORDER BY t.id, tm.role;"

sqlite3 -column -header data.db "
SELECT 
  c.id,
  c.code,
  c.team_id,
  cr.title as course,
  rb.name as redeemed_by,
  c.redeemed_at,
  c.created_at
FROM coupons c
JOIN courses cr ON c.course_id = cr.id
LEFT JOIN users rb ON c.redeemed_by_user_id = rb.id
ORDER BY c.id;"

sqlite3 -column -header data.db "
SELECT 
  v.id,
  u.name as student,
  l.title as lesson,
  v.event_type,
  v.position_seconds,
  v.created_at
FROM video_watch_events v
JOIN users u ON v.user_id = u.id
JOIN lessons l ON v.lesson_id = l.id
ORDER BY v.id
LIMIT 20;"





Ran command: `sqlite3 -column -header data.db "
SELECT 
  c.id,
  c.code,
  c.team_id,
  cr.title as course,
  rb.name as redeemed_by,
  c.redeemed_at,
  c.created_at
FROM coupons c
JOIN courses cr ON c.course_id = cr.id
LEFT JOIN users rb ON c.redeemed_by_user_id = rb.id
ORDER BY c.id;"`
Ran command: `sqlite3 -column -header data.db "
SELECT 
  v.id,
  u.name as student,
  l.title as lesson,
  v.event_type,
  v.position_seconds,
  v.created_at
FROM video_watch_events v
JOIN users u ON v.user_id = u.id
JOIN lessons l ON v.lesson_id = l.id
ORDER BY v.id
LIMIT 20;"`

That's every table covered. Here's a complete summary of all the data in one place:

---

## Complete Data Map of `data.db`

```
CONTENT HIERARCHY
─────────────────────────────────────────────────────────

That covers every table! Here's a complete picture of what you've seen:

---

## Full Data Map of `data.db`

### Content Hierarchy
| Level | Table | Count |
|---|---|---|
| Course | `courses` | 2 published |
| ↳ Module | `modules` | 10 (5 per course) |
| ↳↳ Lesson | `lessons` | 39 lessons total |
| ↳↳↳ Quiz | `quizzes` | 3 quizzes |
| ↳↳↳↳ Question | `quiz_questions` | 8 questions |
| ↳↳↳↳↳ Option | `quiz_options` | 26 answer options |

### User Activity
| Table | What it tracks |
|---|---|
| `enrollments` | 7 enrollments across 2 courses |
| `lesson_progress` | 64 rows — per-student, per-lesson status (`completed` / `in_progress`) |
| `quiz_attempts` | 10 attempts — Emma took HTTP quiz twice, Olivia retook TypeScript quiz |
| `quiz_answers` | Each selected answer per attempt |
| `video_watch_events` | 11 events — `play`, `pause`, `seek`, `ended` with timestamps in seconds |

### Commerce
| Table | What it tracks |
|---|---|
| `purchases` | 6 purchases — James Park paid $25 (IN/PPP 50% off), Bossy paid $300 (team bulk) |
| `teams` | 1 team (Bossy McBossface is admin) |
| `team_members` | 1 row (Bossy) |
| `coupons` | 5 codes for the Node.js course — 2 redeemed (Olivia + Liam), 3 still unused |

---

> [!TIP]
> **Interesting things to notice in the data:**
> - James Park bought TypeScript at **$25** (vs $49.99 full price) — he's in India (PPP Tier 3 = 50% off), stored as `country = "IN"` in `purchases`
> - Bossy McBossface paid **$299.95** — that's 5 seats × $59.99 for the Node.js course (team purchase)
> - Emma Wilson failed the HTTP Methods Quiz (score 0.67) then **retook it and passed** (score 1.0) — the `quiz_attempts` table keeps all attempts
> - `video_watch_events` stores Emma resuming a video from second 180 — this is how the "resume where you left off" feature works