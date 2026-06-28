"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
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
import { useUpdateChronicConditionDetails } from "@/hooks/use-chronic-conditions";
import { ApiError } from "@/lib/api/client";
import {
  updateChronicConditionDetailsSchema,
  type UpdateChronicConditionDetailsInput,
} from "@/lib/schemas/chronic-condition";
import type { EnrichedChronicCondition } from "@/types/chronic-conditions";

interface UpdateChronicConditionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  condition: EnrichedChronicCondition;
}

export function UpdateChronicConditionDetailsDialog(
  props: UpdateChronicConditionDetailsDialogProps
) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {props.open && <UpdateConditionForm key={String(props.open)} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function UpdateConditionForm({
  onOpenChange,
  condition,
}: UpdateChronicConditionDetailsDialogProps) {
  const update = useUpdateChronicConditionDetails();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<UpdateChronicConditionDetailsInput>({
    resolver: zodResolver(updateChronicConditionDetailsSchema),
    defaultValues: {
      newName: condition.name,
      newDiagnosedAt: condition.diagnosedAt,
      newNotes: condition.notes ?? "",
    },
  });

  const onSubmit = async (data: UpdateChronicConditionDetailsInput) => {
    try {
      const payload = {
        newName: data.newName,
        newDiagnosedAt: data.newDiagnosedAt,
        newNotes: data.newNotes?.trim() ? data.newNotes.trim() : null,
      };
      await update.mutateAsync({
        conditionId: condition.id,
        input: payload as UpdateChronicConditionDetailsInput,
      });
      toast.success("Condition details updated.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof UpdateChronicConditionDetailsInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message: error instanceof ApiError ? error.problem.title : "Could not update condition.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <DialogHeader className="space-y-2">
        <DialogTitle className="text-h3 flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Edit condition details
        </DialogTitle>
        <DialogDescription className="text-body">
          Correct typos or update notes for {condition.memberName}. Resolving the condition is
          managed separately.
        </DialogDescription>
      </DialogHeader>

      <FormSection>
        <FormField
          htmlFor="newName"
          label="Condition name"
          error={errors.newName?.message}
          required
        >
          <Input
            id="newName"
            className="h-11"
            {...registerField("newName")}
            aria-invalid={!!errors.newName}
          />
        </FormField>

        <FormField
          htmlFor="newDiagnosedAt"
          label="Diagnosed on"
          error={errors.newDiagnosedAt?.message}
          required
        >
          <Input
            id="newDiagnosedAt"
            type="date"
            className="h-11"
            {...registerField("newDiagnosedAt")}
            aria-invalid={!!errors.newDiagnosedAt}
          />
        </FormField>

        <FormField
          htmlFor="newNotes"
          label="Notes"
          badge="Optional"
          error={errors.newNotes?.message}
        >
          <Textarea
            id="newNotes"
            rows={4}
            {...registerField("newNotes")}
            aria-invalid={!!errors.newNotes}
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
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </FormFooter>
    </form>
  );
}
