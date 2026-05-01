import fs from 'fs';

const seedContent = fs.readFileSync('scripts/seed.ts', 'utf8');
const exportContent = fs.readFileSync('course-export.ts', 'utf8');

// Check if course 4 already exists in seed.ts to avoid duplicates
if (seedContent.includes('// ─── Course 4')) {
  console.log("Course 4 already exists in seed.ts. Updating existing block...");
  const startIndex = seedContent.indexOf('// ─── Course 4');
  const endIndex = seedContent.indexOf('// ─── Quizzes ───');
  const newSeedContent = seedContent.substring(0, startIndex) + exportContent + "\n  " + seedContent.substring(endIndex);
  fs.writeFileSync('scripts/seed.ts', newSeedContent);
} else {
  console.log("Appending Course 4 to seed.ts...");
  const insertIndex = seedContent.indexOf('// ─── Quizzes ───');
  if (insertIndex === -1) {
    console.error("Could not find '// ─── Quizzes ───' marker in seed.ts");
    process.exit(1);
  }
  const newSeedContent = seedContent.substring(0, insertIndex) + exportContent + "\n  " + seedContent.substring(insertIndex);
  fs.writeFileSync('scripts/seed.ts', newSeedContent);
}

console.log("Successfully updated scripts/seed.ts");
