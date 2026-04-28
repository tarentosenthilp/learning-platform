import { eq, inArray } from "drizzle-orm";
import { db } from "~/db";
import {
  users,
  UserRole,
  courses,
  videoWatchEvents,
  lessonProgress,
  quizAttempts,
  quizAnswers,
  enrollments,
  purchases,
  teamMembers,
  coupons,
} from "~/db/schema";

// ─── User Service ───
// Handles user CRUD operations and role management.
// Uses positional parameters (project convention).

export function getAllUsers() {
  return db.select().from(users).all();
}

export function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get();
}

export function getUsersByRole(role: UserRole) {
  return db.select().from(users).where(eq(users.role, role)).all();
}

export function createUser(
  name: string,
  email: string,
  role: UserRole,
  avatarUrl: string | null
) {
  return db
    .insert(users)
    .values({ name, email, role, avatarUrl })
    .returning()
    .get();
}

export function updateUser(
  id: number,
  name: string,
  email: string,
  bio: string | null
) {
  return db
    .update(users)
    .set({ name, email, bio })
    .where(eq(users.id, id))
    .returning()
    .get();
}

export function updateUserRole(id: number, role: UserRole) {
  return db
    .update(users)
    .set({ role })
    .where(eq(users.id, id))
    .returning()
    .get();
}

export function deleteUser(id: number) {
  // 1. Check if the user is an instructor of any course
  const userCourses = db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.instructorId, id))
    .all();

  if (userCourses.length > 0) {
    throw new Error(
      "Cannot delete user: They are an instructor for existing courses. Reassign or delete their courses first."
    );
  }

  // 2. Remove simple dependencies
  db.delete(videoWatchEvents).where(eq(videoWatchEvents.userId, id)).run();
  db.delete(lessonProgress).where(eq(lessonProgress.userId, id)).run();
  db.delete(enrollments).where(eq(enrollments.userId, id)).run();
  db.delete(purchases).where(eq(purchases.userId, id)).run();
  db.delete(teamMembers).where(eq(teamMembers.userId, id)).run();

  // 3. Nullify coupon claims
  db.update(coupons)
    .set({ redeemedByUserId: null })
    .where(eq(coupons.redeemedByUserId, id))
    .run();

  // 4. Handle Quiz Attempts and Answers
  const attemptIds = db
    .select({ id: quizAttempts.id })
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, id))
    .all()
    .map((a) => a.id);

  if (attemptIds.length > 0) {
    db.delete(quizAnswers).where(inArray(quizAnswers.attemptId, attemptIds)).run();
    db.delete(quizAttempts).where(eq(quizAttempts.userId, id)).run();
  }

  // 5. Delete the user
  return db.delete(users).where(eq(users.id, id)).returning().get();
}
