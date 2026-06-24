"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical } from "lucide-react";
import { useEffect } from "react";
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
import { useRegisterExam } from "@/hooks/use-exams";
import { ApiError } from "@/lib/api/client";
import { registerExamSchema, type RegisterExamInput } from "@/lib/schemas/exam";

interface RegisterExamForMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
}

/**
 * Controlled variant of RegisterExamDialog — for use from a dropdown menu
 * or other UI that already manages the open state.
 */
export function RegisterExamForMemberDialog({
  open,
  onOpenChange,
  memberId,
  memberName,
}: RegisterExamForMemberDialogProps) {
  const register = useRegisterExam(memberId);

  const {
    register: registerField,
    handleSubmit,
    reset,
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

  // Reset form whenever the dialog opens for a fresh entry.
  useEffect(() => {
    if (open) {
      reset({
        examDate: new Date().toISOString().slice(0, 10),
        examType: "",
        laboratory: "",
        results: "",
        requestedBy: "",
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: RegisterExamInput) => {
    try {
      // Strip empty strings so backend receives proper nulls for optional fields.
      const payload = {
        examDate: data.examDate,
        examType: data.examType,
        laboratory: data.laboratory?.trim() || undefined,
        results: data.results?.trim() || undefined,
        requestedBy: data.requestedBy?.trim() || undefined,
      };
      await register.mutateAsync(payload as RegisterExamInput);
      toast.success(`Exam registered for ${memberName}.`);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-h3 flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Register exam for {memberName}
            </DialogTitle>
            <DialogDescription className="text-body">
              Record a lab test, imaging study, or other exam. Results can be added now or later.
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                htmlFor="examDate"
                label="Exam date"
                error={errors.examDate?.message}
                required
              >
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register exam"}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
