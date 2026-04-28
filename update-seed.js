const fs = require('fs');

const seedContent = fs.readFileSync('scripts/seed.ts', 'utf8');
const exportContent = fs.readFileSync('course-export.ts', 'utf8');

const startIndex = seedContent.indexOf('// ─── Course 3');
const endIndex = seedContent.indexOf('// ─── Quizzes ───');

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find markers in seed.ts");
  process.exit(1);
}

const newSeedContent = seedContent.substring(0, startIndex) + exportContent + "\n  " + seedContent.substring(endIndex);
fs.writeFileSync('scripts/seed.ts', newSeedContent);
console.log("Successfully updated scripts/seed.ts");
