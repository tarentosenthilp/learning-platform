Let me design a full, realistic course structure for SAP ABAP and insert it directly into the database.

Ran command: `sqlite3 data.db "SELECT id, name, role FROM users WHERE role = 'instructor';"`
Ran command: `sqlite3 data.db "SELECT id, name, slug FROM categories;"`

Good. I'll use Marcus Johnson as instructor (enterprise/backend focus fits well) and Programming as category. Now inserting the full course with 5 modules and 20 lessons:

Ran command: `sqlite3 data.db "
-- ─── Course: SAP ABAP Fundamentals ───
INSERT INTO courses (title, slug, description, sales_copy, instructor_id, category_id, status, price, ppp_enabled, created_at, updated_at)
VALUES (
  'SAP ABAP Fundamentals and Core Programming Concepts',
  'sap-abap-fundamentals',
  'Master SAP ABAP from the ground up. Learn the core programming language of the SAP ecosystem — data types, internal tables, Open SQL, modularization, and object-oriented ABAP. Ideal for developers entering the SAP world or consultants who want to write and understand custom ABAP code.',
  '## Why Learn ABAP?

ABAP (Advanced Business Application Programming) is the proprietary language that powers the SAP ecosystem — the backbone of ERP systems used by over 400,000 companies worldwide. If you work in or around SAP, understanding ABAP means you can read custom code, build enhancements, debug issues, and collaborate with technical teams.

## What You Will Learn

This course builds your ABAP skills from zero to functional developer. We start with the SAP Workbench tools and ABAP syntax, then move through data types, control structures, database access with Open SQL, the powerful internal table concept, and modular programming with function modules, subroutines, and classes.

### Course Highlights

- **20 lessons** across 5 modules — from environment setup to OO ABAP
- **Real SAP scenarios** — every concept tied to practical ERP use cases
- **Open SQL deep dive** — SELECT, INSERT, UPDATE, DELETE against SAP tables
- **Internal tables** — the single most important ABAP concept, covered thoroughly
- **Object-Oriented ABAP** — classes, interfaces, and inheritance in the SAP context

## Who Is This For?

- SAP functional consultants who want to understand what the technical team is doing
- Junior ABAP developers starting their first SAP project
- Developers from other languages (Java, Python, JS) moving into the SAP space

No prior ABAP experience required. Basic programming knowledge (any language) is helpful but not mandatory.',
  3,
  1,
  'published',
  8999,
  1,
  datetime('now', '-20 days'),
  datetime('now', '-2 days')
);
SELECT last_insert_rowid();
"`

Course ID is **4**. Now inserting all 5 modules:

Ran command: `sqlite3 data.db "
INSERT INTO modules (course_id, title, position, created_at) VALUES
  (4, 'Introduction to SAP and the ABAP Environment', 1, datetime('now', '-20 days')),
  (4, 'ABAP Language Fundamentals',                   2, datetime('now', '-18 days')),
  (4, 'Database Programming with Open SQL',           3, datetime('now', '-15 days')),
  (4, 'Internal Tables and Data Processing',          4, datetime('now', '-12 days')),
  (4, 'Modularization and Object-Oriented ABAP',      5, datetime('now', '-8 days'));
SELECT id, title, position FROM modules WHERE course_id = 4;
"`

Modules are IDs 12–16. Now inserting all 20 lessons across all 5 modules:

Ran command: `sqlite3 data.db "
-- Module 12: Introduction to SAP and the ABAP Environment (4 lessons)
INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(12, 'What is SAP and Where Does ABAP Fit?', '## What is SAP?

SAP (Systems, Applications and Products) is the world''s leading ERP platform, used by companies across manufacturing, retail, finance, logistics, and more.

### The SAP Technology Stack

- **SAP BASIS** — the infrastructure layer (OS, DB, application server)
- **ABAP** — the programming language for customization and development
- **SAP Fiori / UI5** — the modern UI layer
- **SAP HANA** — the in-memory database platform

### What is ABAP?

ABAP (Advanced Business Application Programming) is a high-level, interpreted language created by SAP in the 1980s. It is still the primary language for:
- Custom reports and data extracts
- User exits, BADIs, and enhancement spots
- Custom transactions and programs
- Background jobs and batch processing', 1, 12, datetime('now', '-20 days')),

(12, 'Navigating the SAP GUI and ABAP Workbench', '## The SAP GUI

The SAP GUI (Graphical User Interface) is the desktop client used to interact with an SAP system. Key concepts:

- **Transaction codes (T-codes)** — shortcuts to navigate directly to any SAP screen
- **SAP Easy Access Menu** — the hierarchical menu for navigation

### Key T-codes for ABAP Developers

| T-code | Purpose |
|---|---|
| `SE38` | ABAP Editor — create and edit programs |
| `SE80` | Object Navigator — browse all development objects |
| `SE11` | ABAP Dictionary — view and edit table definitions |
| `SE37` | Function Builder — create and test function modules |
| `SE24` | Class Builder — create and manage ABAP classes |
| `SM37` | Background Job Monitor |
| `ST05` | SQL Trace — debug database queries |', 2, 15, datetime('now', '-20 days')),

(12, 'Creating Your First ABAP Program', '## Writing Hello World in ABAP

Every ABAP program starts with a REPORT statement followed by the program logic.

```abap
REPORT z_hello_world.

WRITE ''Hello, SAP World!''.
```

### Program Structure

```abap
REPORT z_my_first_program.

* This is a comment (asterisk in column 1)
" This is also an inline comment

DATA lv_message TYPE string.        " Declare a variable
lv_message = ''Welcome to ABAP''.   " Assign a value
WRITE lv_message.                   " Output to screen
```

### ABAP Naming Conventions

- Programs start with **Z** or **Y** (customer namespace)
- Local variables: `lv_` prefix (local variable)
- Global variables: `gv_` prefix
- Structures: `ls_` / `gs_` prefix
- Internal tables: `lt_` / `gt_` prefix', 3, 18, datetime('now', '-20 days')),

(12, 'The ABAP Dictionary (SE11) — Tables and Data Elements', '## ABAP Dictionary Overview

The ABAP Dictionary (SE11) is the central metadata repository for all data objects in SAP — tables, views, data elements, domains, and structures.

### Transparent Tables

SAP stores business data in transparent tables — each SAP table maps directly to a database table.

Key tables every ABAP developer must know:

| Table | Content |
|---|---|
| `MARA` | General material data |
| `KNA1` | Customer master |
| `LFA1` | Vendor master |
| `VBAK` | Sales order header |
| `BKPF` | Accounting document header |
| `USR02` | User login data |

### Viewing Table Structure

Open SE11 → enter table name → Display. You will see:
- Field names and their data elements
- Key fields (marked with key icon)
- Technical settings (buffering, delivery class)', 4, 14, datetime('now', '-19 days'));
"`

The backtick characters in the markdown content are being interpreted as shell commands. Let me write this to a SQL file and execute it safely:

Edited insert_abap_course.sql
Ran command: `sqlite3 data.db < insert_abap_course.sql`

Hmm — Module 1 got 8 lessons instead of 4 (the first SQL attempt partially ran before failing). Let me clean that up:

Ran command: `sqlite3 -column -header data.db "SELECT id, title, position FROM lessons WHERE module_id = 12 ORDER BY position, id;"`

IDs 41-44 are the first (partial/corrupt) set. IDs 45-48 are the clean ones. Let me delete the bad ones:

Ran command: `sqlite3 data.db "DELETE FROM lessons WHERE id IN (41, 42, 43, 44);"`
Ran command: `sqlite3 -column -header data.db "
SELECT 
  c.title as course,
  c.slug,
  c.status,
  c.price,
  COUNT(DISTINCT m.id) as modules,
  COUNT(DISTINCT l.id) as lessons
FROM courses c
JOIN modules m ON m.course_id = c.id
JOIN lessons l ON l.module_id = m.id
WHERE c.id = 4
GROUP BY c.id;

SELECT '' '' as '';

SELECT m.title as module, COUNT(l.id) as lessons
FROM modules m
LEFT JOIN lessons l ON l.module_id = m.id
WHERE m.course_id = 4
GROUP BY m.id, m.title
ORDER BY m.position;"`
Ran command: `sqlite3 -column -header data.db "
SELECT m.title as module, COUNT(l.id) as lessons
FROM modules m
LEFT JOIN lessons l ON l.module_id = m.id
WHERE m.course_id = 4
GROUP BY m.id, m.title
ORDER BY m.position;"`

Everything is clean.