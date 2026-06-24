"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateExamResults } from "@/hooks/use-exams";
import { ApiError } from "@/lib/api/client";
import { updateExamResultsSchema, type UpdateExamResultsInput } from "@/lib/schemas/exam";
import type { EnrichedExam } from "@/types/exams";

interface UpdateExamResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: EnrichedExam;
}

export function UpdateExamResultsDialog({
  open,
  onOpenChange,
  exam,
}: UpdateExamResultsDialogProps) {
  const update = useUpdateExamResults();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<UpdateExamResultsInput>({
    resolver: zodResolver(updateExamResultsSchema),
    defaultValues: { newResults: exam.results ?? "" },
  });

  useEffect(() => {
    if (open) {
      reset({ newResults: exam.results ?? "" });
    }
  }, [open, exam.results, reset]);

  const onSubmit = async (data: UpdateExamResultsInput) => {
    try {
      await update.mutateAsync({ examId: exam.id, input: data });
      toast.success("Results updated.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof UpdateExamResultsInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message: error instanceof ApiError ? error.problem.title : "Could not update results.",
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
              <Pencil className="h-5 w-5" />
              {exam.results ? "Update results" : "Add results"}
            </DialogTitle>
            <DialogDescription className="text-body">
              {exam.examType} for {exam.memberName} · {new Date(exam.examDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField
              htmlFor="newResults"
              label="Results"
              hint="Full text of the lab report or findings."
              error={errors.newResults?.message}
              required
            >
              <Textarea
                id="newResults"
                rows={8}
                placeholder="Hemoglobin: 14.5 g/dL (normal)..."
                {...register("newResults")}
                aria-invalid={!!errors.newResults}
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
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
