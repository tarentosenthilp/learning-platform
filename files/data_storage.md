The data lives in a single file — **`data.db`** in the project root. It's a standard SQLite database.

Here are a few ways to view it:

---

## Option 1: Quick CLI peek (built-in, no install needed)

Ran command: `sqlite3 data.db ".tables"`
Ran command: `sqlite3 data.db "SELECT id, name, email, role FROM users;"`
Ran command: `sqlite3 data.db "SELECT id, title, status, price FROM courses;"`

All confirmed live. Now here's the full picture:

---

## Where is the data stored?

```
/Users/senthilpalanivelu/poc/learning-platform/
├── data.db        ← the actual database (SQLite binary file)
├── data.db-shm    ← shared memory file (WAL mode, ignore)
└── data.db-wal    ← write-ahead log (WAL mode, ignore)
```

`data.db` is a single portable file — the entire database is in it. You can copy it, back it up, or delete it and re-seed.

---

## Ways to view the data

### 1. CLI — `sqlite3` (macOS has it built-in)

```bash
cd /Users/senthilpalanivelu/poc/learning-platform

# Open interactive shell
sqlite3 data.db

# Useful commands inside the shell:
.tables                              -- list all tables
.mode column                         -- pretty output
.headers on                          -- show column names
SELECT * FROM users;
SELECT * FROM courses;
SELECT * FROM enrollments;
SELECT user_id, lesson_id, status FROM lesson_progress;
.quit
```

### 2. GUI — **DB Browser for SQLite** (best option, free)

Install it:
```bash
brew install --cask db-browser-for-sqlite
```
Then open `data.db` in it. You get a full spreadsheet-like view of every table, plus a SQL editor.

### 3. GUI — **TablePlus** (polished, free tier available)

```bash
brew install --cask tableplus
```
Connect with: Driver = SQLite, File = `/Users/senthilpalanivelu/poc/learning-platform/data.db`

### 4. VS Code Extension — **SQLite Viewer**

Search for `"SQLite Viewer"` by Florian Klampfer in the VS Code extension marketplace. It lets you click `data.db` in the sidebar and browse tables directly in the editor — zero setup.

---

> [!TIP]
> **Reset the data anytime** with `npm run db:seed` — it drops all tables and re-inserts all the seed data fresh. So feel free to experiment by running SQL directly; you can always restore with one command.