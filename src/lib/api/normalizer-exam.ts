import { unwrapId } from "./backend";
import type { Exam } from "@/types/exams";

/**
 * Raw shape from the backend's ExamDto (verified via Scalar response).
 *
 * Backend uses `familyMemberId`; we normalize to `memberId` for consistency
 * with the rest of the app (the frontend says "member" not "family member").
 */
interface RawExam {
  id: unknown;
  familyMemberId: unknown;
  examDate: string;
  examType: string;
  laboratory: string | null;
  results: string | null;
  requestedBy: string | null;
}

export function normalizeExam(raw: RawExam): Exam {
  return {
    id: unwrapId(raw.id),
    memberId: unwrapId(raw.familyMemberId),
    examDate: raw.examDate,
    examType: raw.examType,
    laboratory: raw.laboratory,
    results: raw.results,
    requestedBy: raw.requestedBy,
  };
}
