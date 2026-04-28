import { eq, and, sql, gt, lt, gte, lte, ne, inArray } from "drizzle-orm";
import { db } from "~/db";
import {
  modules,
  lessons,
  videoWatchEvents,
  lessonProgress,
  quizzes,
  quizAttempts,
  quizAnswers,
  quizQuestions,
  quizOptions,
} from "~/db/schema";

// ─── Module Service ───
// Handles module CRUD and reordering within courses.
// Uses positional parameters (project convention).

export function getModuleById(id: number) {
  return db.select().from(modules).where(eq(modules.id, id)).get();
}

export function getModulesByCourse(courseId: number) {
  return db
    .select()
    .from(modules)
    .where(eq(modules.courseId, courseId))
    .orderBy(modules.position)
    .all();
}

export function getModuleWithLessons(id: number) {
  const mod = getModuleById(id);
  if (!mod) return null;

  const moduleLessons = db
    .select()
    .from(lessons)
    .where(eq(lessons.moduleId, id))
    .orderBy(lessons.position)
    .all();

  return { ...mod, lessons: moduleLessons };
}

export function createModule(
  courseId: number,
  title: string,
  position: number | null
) {
  const pos =
    position ??
    db
      .select({ max: sql<number>`coalesce(max(${modules.position}), 0)` })
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .get()!.max + 1;

  return db
    .insert(modules)
    .values({ courseId, title, position: pos })
    .returning()
    .get();
}

export function updateModuleTitle(id: number, title: string) {
  return db
    .update(modules)
    .set({ title })
    .where(eq(modules.id, id))
    .returning()
    .get();
}

export function deleteModule(id: number) {
  // 1. Get all lesson IDs in this module
  const lessonIds = db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.moduleId, id))
    .all()
    .map((l) => l.id);

  if (lessonIds.length > 0) {
    // 2. Delete direct lesson dependencies
    db.delete(videoWatchEvents).where(inArray(videoWatchEvents.lessonId, lessonIds)).run();
    db.delete(lessonProgress).where(inArray(lessonProgress.lessonId, lessonIds)).run();

    // 3. Handle Quizzes (which have their own nested dependencies)
    const quizIds = db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(inArray(quizzes.lessonId, lessonIds))
      .all()
      .map((q) => q.id);

    if (quizIds.length > 0) {
      // Clean up Quiz Attempts & Answers
      const attemptIds = db
        .select({ id: quizAttempts.id })
        .from(quizAttempts)
        .where(inArray(quizAttempts.quizId, quizIds))
        .all()
        .map((a) => a.id);
      if (attemptIds.length > 0) {
        db.delete(quizAnswers).where(inArray(quizAnswers.attemptId, attemptIds)).run();
      }
      db.delete(quizAttempts).where(inArray(quizAttempts.quizId, quizIds)).run();

      // Clean up Quiz Questions & Options
      const questionIds = db
        .select({ id: quizQuestions.id })
        .from(quizQuestions)
        .where(inArray(quizQuestions.quizId, quizIds))
        .all()
        .map((q) => q.id);
      if (questionIds.length > 0) {
        db.delete(quizOptions).where(inArray(quizOptions.questionId, questionIds)).run();
      }
      db.delete(quizQuestions).where(inArray(quizQuestions.quizId, quizIds)).run();

      // Finally, delete the Quizzes
      db.delete(quizzes).where(inArray(quizzes.lessonId, lessonIds)).run();
    }

    // 4. Delete the lessons
    db.delete(lessons).where(eq(lessons.moduleId, id)).run();
  }

  // 5. Delete the module
  return db.delete(modules).where(eq(modules.id, id)).returning().get();
}

export function getModuleCount(courseId: number) {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(modules)
    .where(eq(modules.courseId, courseId))
    .get();
  return result?.count ?? 0;
}

// ─── Reordering ───

export function moveModuleToPosition(moduleId: number, newPosition: number) {
  const mod = getModuleById(moduleId);
  if (!mod) return null;

  const oldPosition = mod.position;
  if (oldPosition === newPosition) return mod;

  if (newPosition > oldPosition) {
    // Moving down: shift items between old+1 and new up by 1
    db.update(modules)
      .set({ position: sql`${modules.position} - 1` })
      .where(
        and(
          eq(modules.courseId, mod.courseId),
          gt(modules.position, oldPosition),
          lte(modules.position, newPosition)
        )
      )
      .run();
  } else {
    // Moving up: shift items between new and old-1 down by 1
    db.update(modules)
      .set({ position: sql`${modules.position} + 1` })
      .where(
        and(
          eq(modules.courseId, mod.courseId),
          gte(modules.position, newPosition),
          lt(modules.position, oldPosition)
        )
      )
      .run();
  }

  return db
    .update(modules)
    .set({ position: newPosition })
    .where(eq(modules.id, moduleId))
    .returning()
    .get();
}

export function swapModulePositions(moduleIdA: number, moduleIdB: number) {
  const modA = getModuleById(moduleIdA);
  const modB = getModuleById(moduleIdB);
  if (!modA || !modB) return null;

  db.update(modules)
    .set({ position: modB.position })
    .where(eq(modules.id, moduleIdA))
    .run();

  db.update(modules)
    .set({ position: modA.position })
    .where(eq(modules.id, moduleIdB))
    .run();

  return {
    a: { ...modA, position: modB.position },
    b: { ...modB, position: modA.position },
  };
}

export function reorderModules(courseId: number, moduleIds: number[]) {
  for (let i = 0; i < moduleIds.length; i++) {
    db.update(modules)
      .set({ position: i + 1 })
      .where(and(eq(modules.id, moduleIds[i]), eq(modules.courseId, courseId)))
      .run();
  }
  return getModulesByCourse(courseId);
}
