"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormField,
  FormFooter,
  FormRootError,
  FormSection,
} from "@/components/forms/form-primitives";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MemberSelector } from "@/components/shared/member-selector";
import { useRegisterExam } from "@/hooks/use-exams";
import { useAllMembers } from "@/hooks/use-all-members";
import { ApiError } from "@/lib/api/client";
import { registerExamSchema, type RegisterExamInput } from "@/lib/schemas/exam";

interface RegisterExamForMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId?: string;
  memberName?: string;
  defaultMemberId?: string;
}

/**
 * Outer wrapper: owns the Dialog open/close state. Uses `open` as a `key`
 * on the inner form so React remounts (and re-initializes) the form every
 * time the dialog opens. This is more idiomatic than syncing form state
 * with props through useEffect — it lets useState initialize fresh on
 * each open without the React Compiler warning.
 */
export function RegisterExamForMemberDialog(props: RegisterExamForMemberDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {props.open && <RegisterExamForm key={String(props.open)} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function RegisterExamForm({
  onOpenChange,
  memberId,
  memberName,
  defaultMemberId,
}: RegisterExamForMemberDialogProps) {
  const isMemberFixed = Boolean(memberId);
  const { members } = useAllMembers();

  // Initialized fresh on mount. The outer Dialog uses `open` as a key so
  // this whole subtree remounts on each open, eliminating the need for a
  // useEffect to reset state.
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    memberId ?? defaultMemberId ?? ""
  );

  const effectiveMemberId = memberId ?? selectedMemberId;
  const effectiveMemberName = isMemberFixed
    ? (memberName ?? "this member")
    : (members.find((m) => m.memberId === effectiveMemberId)?.memberName ?? "—");

  const register = useRegisterExam(effectiveMemberId);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterExamInput>({
    resolver: zodResolver(registerExamSchema),
    defaultValues: {
      examDate: new Date().toISOString().slice(0, 10),
      examType: "",
      laboratory: "",
      results: "",
      requestedBy: "",
    },
  });

  const onSubmit = async (data: RegisterExamInput) => {
    if (!effectiveMemberId) {
      setError("root", { message: "Please pick a member first." });
      return;
    }

    try {
      const payload = {
        examDate: data.examDate,
        examType: data.examType,
        laboratory: data.laboratory?.trim() || undefined,
        results: data.results?.trim() || undefined,
        requestedBy: data.requestedBy?.trim() || undefined,
      };
      await register.mutateAsync(payload as RegisterExamInput);
      toast.success(`Exam registered for ${effectiveMemberName}.`);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof RegisterExamInput, { message: messages[0] });
        }
      } else {
        setError("root", {
          message: error instanceof ApiError ? error.problem.title : "Could not register exam.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <DialogHeader className="space-y-2">
        <DialogTitle className="text-h3 flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          {isMemberFixed ? `Register exam for ${memberName}` : "Register exam"}
        </DialogTitle>
        <DialogDescription className="text-body">
          Record a lab test, imaging study, or other exam. Results can be added now or later.
        </DialogDescription>
      </DialogHeader>

      <FormSection>
        {/* Member selector — only when no fixed memberId was provided. */}
        {!isMemberFixed && (
          <FormField htmlFor="memberId" label="For" required>
            <MemberSelector
              id="memberId"
              value={selectedMemberId}
              onChange={setSelectedMemberId}
              placeholder="Select a member"
            />
          </FormField>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField htmlFor="examDate" label="Exam date" error={errors.examDate?.message} required>
            <Input
              id="examDate"
              type="date"
              className="h-11"
              {...registerField("examDate")}
              aria-invalid={!!errors.examDate}
            />
          </FormField>

          <FormField
            htmlFor="examType"
            label="Exam type"
            hint="e.g. CBC, MRI, X-ray"
            error={errors.examType?.message}
            required
          >
            <Input
              id="examType"
              placeholder="Complete blood count"
              className="h-11"
              {...registerField("examType")}
              aria-invalid={!!errors.examType}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            htmlFor="laboratory"
            label="Laboratory"
            badge="Optional"
            error={errors.laboratory?.message}
          >
            <Input
              id="laboratory"
              placeholder="LabCorp, Quest, etc."
              className="h-11"
              {...registerField("laboratory")}
              aria-invalid={!!errors.laboratory}
            />
          </FormField>

          <FormField
            htmlFor="requestedBy"
            label="Requested by"
            badge="Optional"
            hint="Doctor who ordered the exam"
            error={errors.requestedBy?.message}
          >
            <Input
              id="requestedBy"
              placeholder="Dr. Smith"
              className="h-11"
              {...registerField("requestedBy")}
              aria-invalid={!!errors.requestedBy}
            />
          </FormField>
        </div>

        <FormField
          htmlFor="results"
          label="Results"
          badge="Optional"
          hint="Can be added later if not available yet."
          error={errors.results?.message}
        >
          <Textarea
            id="results"
            placeholder="Initial findings or full results..."
            rows={4}
            {...registerField("results")}
            aria-invalid={!!errors.results}
          />
        </FormField>

        <FormRootError message={errors.root?.message} />
      </FormSection>

      <FormFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || (!isMemberFixed && !effectiveMemberId)}>
          {isSubmitting ? "Registering..." : "Register exam"}
        </Button>
      </FormFooter>
    </form>
  );
}
