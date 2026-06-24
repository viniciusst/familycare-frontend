/**
 * Exam wire-format types. Mirrors backend's ExamDto.
 *
 * Note: exams don't have a status lifecycle (unlike appointments).
 * They're either registered or registered-with-results. The PATCH
 * /exams/{id}/results endpoint is the only way to update an exam.
 */

export interface Exam {
  id: string;
  memberId: string;
  examDate: string; // ISO date (YYYY-MM-DD), backend's DateOnly
  examType: string;
  laboratory: string | null;
  results: string | null;
  requestedBy: string | null;
}

/**
 * Exam enriched with member/family information for display in lists.
 * Built client-side by joining the exam with its member data.
 */
export interface EnrichedExam extends Exam {
  memberName: string;
  familyId: string;
  familyName: string;
}
