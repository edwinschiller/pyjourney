"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/session"
import {
  assertTeacherOwnsClassroom,
  ClassroomAccessError,
} from "@/lib/classrooms/access"
import {
  generateClassInsightReport,
  generateStudentInsightReport,
  studentIsInClassroom,
} from "@/lib/insights/reports"

export const generateMyInsightReportAction = async () => {
  const user = await requireRole(["student"])
  try {
    const report = await generateStudentInsightReport(user.id)
    revalidatePath("/student/insights")
    return { ok: true as const, reportId: report.id }
  } catch (error) {
    console.error("generateMyInsightReportAction", error)
    return { ok: false as const, error: "Could not generate report." }
  }
}

export const generateStudentInsightReportAction = async (
  studentId: string,
  classroomId?: string
) => {
  const user = await requireRole(["teacher", "admin"])
  try {
    // Teachers must prove class ownership + membership (no bare studentId IDOR).
    if (user.role === "teacher") {
      if (!classroomId) {
        return { ok: false as const, error: "Classroom is required." }
      }
      await assertTeacherOwnsClassroom(user.id, classroomId)
      const inClass = await studentIsInClassroom(studentId, classroomId)
      if (!inClass) {
        return { ok: false as const, error: "Student is not in this class." }
      }
    } else if (classroomId) {
      const inClass = await studentIsInClassroom(studentId, classroomId)
      if (!inClass) {
        return { ok: false as const, error: "Student is not in this class." }
      }
    }

    const report = await generateStudentInsightReport(studentId)
    revalidatePath("/teacher")
    revalidatePath(`/teacher/classes`)
    if (classroomId) {
      revalidatePath(`/teacher/classes/${classroomId}/insights`)
      revalidatePath(
        `/teacher/classes/${classroomId}/students/${studentId}`
      )
    }
    return { ok: true as const, reportId: report.id }
  } catch (error) {
    if (error instanceof ClassroomAccessError) {
      return { ok: false as const, error: "Classroom not found." }
    }
    console.error("generateStudentInsightReportAction", error)
    return { ok: false as const, error: "Could not generate report." }
  }
}

export const generateClassInsightReportAction = async (classroomId: string) => {
  const user = await requireRole(["teacher", "admin"])
  try {
    if (user.role === "teacher") {
      await assertTeacherOwnsClassroom(user.id, classroomId)
    }
    const report = await generateClassInsightReport(classroomId)
    revalidatePath(`/teacher/classes/${classroomId}/insights`)
    return { ok: true as const, reportId: report.id }
  } catch (error) {
    if (error instanceof ClassroomAccessError) {
      return { ok: false as const, error: "Classroom not found." }
    }
    console.error("generateClassInsightReportAction", error)
    return { ok: false as const, error: "Could not generate report." }
  }
}

export const ensureStudentInClassAction = async (
  classroomId: string,
  studentId: string
) => {
  const user = await requireRole(["teacher", "admin"])
  try {
    if (user.role === "teacher") {
      await assertTeacherOwnsClassroom(user.id, classroomId)
    }
    return studentIsInClassroom(studentId, classroomId)
  } catch (error) {
    if (error instanceof ClassroomAccessError) return false
    throw error
  }
}
