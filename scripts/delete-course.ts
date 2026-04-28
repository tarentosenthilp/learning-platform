import { deleteCourse } from "../app/services/courseService";

try {
  // Course ID 3 is "Python for Beginners"
  deleteCourse(3);
  console.log("Successfully deleted course ID 3");
} catch (error) {
  console.error("Failed to delete course:", error);
}
