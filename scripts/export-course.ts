import Database from "better-sqlite3";
import fs from "fs";

const sqlite = new Database("data.db");

const courseId = parseInt(process.argv[2]) || 4;

const course = sqlite.prepare("SELECT * FROM courses WHERE id = ?").get(courseId);
if (!course) {
  console.error(`Course with ID ${courseId} not found.`);
  process.exit(1);
}

const category = sqlite.prepare("SELECT slug FROM categories WHERE id = ?").get(course.category_id);
if (!category) {
  console.error(`Category with ID ${course.category_id} not found.`);
  process.exit(1);
}

const instructor = sqlite.prepare("SELECT name FROM users WHERE id = ?").get(course.instructor_id);
const instructorVar = instructor?.name.includes("Sanjeev") ? "instructor1" : "instructor2";

const modules = sqlite.prepare("SELECT * FROM modules WHERE course_id = ? ORDER BY position").all(courseId);

const modulesWithLessons = modules.map(m => {
  const lessons = sqlite.prepare("SELECT * FROM lessons WHERE module_id = ? ORDER BY position").all(m.id);
  return {
    title: m.title,
    lessons: lessons.map(l => ({
      title: l.title,
      duration: l.duration_minutes,
      content: l.content,
      videoUrl: l.video_url,
      githubRepoUrl: l.github_repo_url
    }))
  };
});

let output = `
  // ─── Course ${courseId} (${course.title}) ───

  const [course${courseId}] = db
    .insert(schema.courses)
    .values({
      title: ${JSON.stringify(course.title)},
      slug: ${JSON.stringify(course.slug)},
      description: ${JSON.stringify(course.description)},
      salesCopy: ${JSON.stringify(course.salesCopy)},
      instructorId: ${instructorVar}.id,
      categoryId: catBySlug[${JSON.stringify(category.slug)}].id,
      status: CourseStatus.Published,
      coverImageUrl: ${JSON.stringify(course.cover_image_url)},
      price: ${course.price},
      pppEnabled: ${course.ppp_enabled === 1},
      createdAt: daysAgo(30),
      updatedAt: daysAgo(5),
    })
    .returning()
    .all();

  const c${courseId}Modules = ${JSON.stringify(modulesWithLessons, null, 2)};

  const course${courseId}LessonIds: number[] = [];

  for (let mi = 0; mi < c${courseId}Modules.length; mi++) {
    const modData = c${courseId}Modules[mi];
    const [mod] = db
      .insert(schema.modules)
      .values({
        courseId: course${courseId}.id,
        title: modData.title,
        position: mi + 1,
        createdAt: daysAgo(30 - mi),
      })
      .returning()
      .all();

    for (let li = 0; li < modData.lessons.length; li++) {
      const lessonData = modData.lessons[li];
      const [lesson] = db
        .insert(schema.lessons)
        .values({
          moduleId: mod.id,
          title: lessonData.title,
          content: lessonData.content,
          videoUrl: lessonData.videoUrl || null,
          githubRepoUrl: lessonData.githubRepoUrl || null,
          position: li + 1,
          durationMinutes: lessonData.duration,
          createdAt: daysAgo(30 - mi),
        })
        .returning()
        .all();
      course${courseId}LessonIds.push(lesson.id);
    }
  }

  console.log(
    \`Created course "\${course${courseId}.title}" with \${c${courseId}Modules.length} modules and \${course${courseId}LessonIds.length} lessons.\`
  );
`;

fs.writeFileSync("course-export.ts", output);
console.log(`Exported course ${courseId} to course-export.ts`);
