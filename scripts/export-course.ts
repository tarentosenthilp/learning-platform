import Database from "better-sqlite3";
import fs from "fs";

const sqlite = new Database("data.db");

const courseId = 4;

const course = sqlite.prepare("SELECT * FROM courses WHERE id = ?").get(courseId);
const modules = sqlite.prepare("SELECT * FROM modules WHERE course_id = ? ORDER BY position").all(courseId);

const modulesWithLessons = modules.map(m => {
  const lessons = sqlite.prepare("SELECT * FROM lessons WHERE module_id = ? ORDER BY position").all(m.id);
  return {
    title: m.title,
    lessons: lessons.map(l => ({
      title: l.title,
      duration: l.duration_minutes,
      content: l.content
    }))
  };
});

let output = `
  // ─── Course 3 (SAP ABAP) ───

  const [course3] = db
    .insert(schema.courses)
    .values({
      title: ${JSON.stringify(course.title)},
      slug: ${JSON.stringify(course.slug)},
      description: ${JSON.stringify(course.description)},
      salesCopy: ${JSON.stringify(course.salesCopy)},
      instructorId: instructor1.id,
      categoryId: catBySlug["programming"].id,
      status: CourseStatus.Published,
      coverImageUrl: ${JSON.stringify(course.cover_image_url)},
      price: ${course.price},
      createdAt: daysAgo(30),
      updatedAt: daysAgo(5),
    })
    .returning()
    .all();

  const c3Modules = ${JSON.stringify(modulesWithLessons, null, 2)};

  const course3LessonIds: number[] = [];

  for (let mi = 0; mi < c3Modules.length; mi++) {
    const modData = c3Modules[mi];
    const [mod] = db
      .insert(schema.modules)
      .values({
        courseId: course3.id,
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
          position: li + 1,
          durationMinutes: lessonData.duration,
          createdAt: daysAgo(30 - mi),
        })
        .returning()
        .all();
      course3LessonIds.push(lesson.id);
    }
  }

  console.log(
    \`Created course "\${course3.title}" with \${c3Modules.length} modules and \${course3LessonIds.length} lessons.\`
  );
`;

fs.writeFileSync("course-export.ts", output);
console.log("Exported to course-export.ts");
