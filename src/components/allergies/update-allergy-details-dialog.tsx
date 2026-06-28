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
import { useUpdateAllergyDetails } from "@/hooks/use-allergies";
import { ApiError } from "@/lib/api/client";
import { updateAllergyDetailsSchema, type UpdateAllergyDetailsInput } from "@/lib/schemas/allergy";
import type { EnrichedAllergy } from "@/types/allergies";

interface UpdateAllergyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allergy: EnrichedAllergy;
}

export function UpdateAllergyDetailsDialog(props: UpdateAllergyDetailsDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {props.open && <UpdateAllergyDetailsForm key={String(props.open)} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function UpdateAllergyDetailsForm({ onOpenChange, allergy }: UpdateAllergyDetailsDialogProps) {
  const update = useUpdateAllergyDetails();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<UpdateAllergyDetailsInput>({
    resolver: zodResolver(updateAllergyDetailsSchema),
    defaultValues: {
      newSubstance: allergy.substance,
      newReaction: allergy.reaction ?? "",
      newFirstObservedAt: allergy.firstObservedAt ?? "",
    },
  });

  const onSubmit = async (data: UpdateAllergyDetailsInput) => {
    try {
      // Normalize empty strings to null so the backend clears the field.
      const payload = {
        newSubstance: data.newSubstance,
        newReaction: data.newReaction?.trim() ? data.newReaction.trim() : null,
        newFirstObservedAt: data.newFirstObservedAt?.trim() ? data.newFirstObservedAt.trim() : null,
      };
      await update.mutateAsync({
        allergyId: allergy.id,
        input: payload as UpdateAllergyDetailsInput,
      });
      toast.success("Allergy details updated.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof UpdateAllergyDetailsInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message: error instanceof ApiError ? error.problem.title : "Could not update allergy.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <DialogHeader className="space-y-2">
        <DialogTitle className="text-h3 flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Edit allergy details
        </DialogTitle>
        <DialogDescription className="text-body">
          Correct typos or update reactions for {allergy.memberName}. Severity is managed
          separately.
        </DialogDescription>
      </DialogHeader>

      <FormSection>
        <FormField
          htmlFor="newSubstance"
          label="Substance"
          hint="What triggers the allergy."
          error={errors.newSubstance?.message}
          required
        >
          <Input
            id="newSubstance"
            className="h-11"
            {...registerField("newSubstance")}
            aria-invalid={!!errors.newSubstance}
          />
        </FormField>

        <FormField
          htmlFor="newReaction"
          label="Reaction"
          badge="Optional"
          hint="Symptoms observed. Clear the field to remove."
          error={errors.newReaction?.message}
        >
          <Textarea
            id="newReaction"
            rows={3}
            {...registerField("newReaction")}
            aria-invalid={!!errors.newReaction}
          />
        </FormField>

        <FormField
          htmlFor="newFirstObservedAt"
          label="First observed"
          badge="Optional"
          error={errors.newFirstObservedAt?.message}
        >
          <Input
            id="newFirstObservedAt"
            type="date"
            className="h-11"
            {...registerField("newFirstObservedAt")}
            aria-invalid={!!errors.newFirstObservedAt}
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
