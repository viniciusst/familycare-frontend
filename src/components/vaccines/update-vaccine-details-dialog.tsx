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
import { useUpdateVaccineDetails } from "@/hooks/use-vaccines";
import { ApiError } from "@/lib/api/client";
import { updateVaccineDetailsSchema, type UpdateVaccineDetailsInput } from "@/lib/schemas/vaccine";
import type { EnrichedVaccine } from "@/types/vaccines";

interface UpdateVaccineDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaccine: EnrichedVaccine;
}

export function UpdateVaccineDetailsDialog(props: UpdateVaccineDetailsDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {props.open && <UpdateVaccineDetailsForm key={String(props.open)} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function UpdateVaccineDetailsForm({ onOpenChange, vaccine }: UpdateVaccineDetailsDialogProps) {
  const update = useUpdateVaccineDetails();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<UpdateVaccineDetailsInput>({
    resolver: zodResolver(updateVaccineDetailsSchema),
    defaultValues: {
      newName: vaccine.name,
      newAppliedAt: vaccine.appliedAt,
      newManufacturer: vaccine.manufacturer ?? "",
      newBatchNumber: vaccine.batchNumber ?? "",
      newDoseNumber: vaccine.doseNumber ?? undefined,
      newNextDoseDue: vaccine.nextDoseDue ?? "",
      newNotes: vaccine.notes ?? "",
    },
  });

  const onSubmit = async (data: UpdateVaccineDetailsInput) => {
    try {
      const payload = {
        newName: data.newName,
        newAppliedAt: data.newAppliedAt,
        newManufacturer: data.newManufacturer?.trim() ? data.newManufacturer.trim() : null,
        newBatchNumber: data.newBatchNumber?.trim() ? data.newBatchNumber.trim() : null,
        newDoseNumber: data.newDoseNumber ?? null,
        newNextDoseDue: data.newNextDoseDue?.trim() ? data.newNextDoseDue.trim() : null,
        newNotes: data.newNotes?.trim() ? data.newNotes.trim() : null,
      };
      await update.mutateAsync({
        vaccineId: vaccine.id,
        input: payload as UpdateVaccineDetailsInput,
      });
      toast.success("Vaccine details updated.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof UpdateVaccineDetailsInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message: error instanceof ApiError ? error.problem.title : "Could not update vaccine.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <DialogHeader className="space-y-2">
        <DialogTitle className="text-h3 flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Edit vaccine details
        </DialogTitle>
        <DialogDescription className="text-body">
          Correct typos or update fields for {vaccine.memberName}&apos;s vaccine record.
        </DialogDescription>
      </DialogHeader>

      <FormSection>
        <FormField htmlFor="newName" label="Vaccine name" error={errors.newName?.message} required>
          <Input
            id="newName"
            className="h-11"
            {...registerField("newName")}
            aria-invalid={!!errors.newName}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            htmlFor="newAppliedAt"
            label="Applied on"
            error={errors.newAppliedAt?.message}
            required
          >
            <Input
              id="newAppliedAt"
              type="date"
              className="h-11"
              {...registerField("newAppliedAt")}
              aria-invalid={!!errors.newAppliedAt}
            />
          </FormField>

          <FormField
            htmlFor="newDoseNumber"
            label="Dose number"
            badge="Optional"
            error={errors.newDoseNumber?.message}
          >
            <Input
              id="newDoseNumber"
              type="number"
              min={1}
              className="h-11"
              {...registerField("newDoseNumber", { valueAsNumber: true })}
              aria-invalid={!!errors.newDoseNumber}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            htmlFor="newManufacturer"
            label="Manufacturer"
            badge="Optional"
            error={errors.newManufacturer?.message}
          >
            <Input
              id="newManufacturer"
              className="h-11"
              {...registerField("newManufacturer")}
              aria-invalid={!!errors.newManufacturer}
            />
          </FormField>

          <FormField
            htmlFor="newBatchNumber"
            label="Batch / lot number"
            badge="Optional"
            error={errors.newBatchNumber?.message}
          >
            <Input
              id="newBatchNumber"
              className="h-11"
              {...registerField("newBatchNumber")}
              aria-invalid={!!errors.newBatchNumber}
            />
          </FormField>
        </div>

        <FormField
          htmlFor="newNextDoseDue"
          label="Next dose due"
          badge="Optional"
          error={errors.newNextDoseDue?.message}
        >
          <Input
            id="newNextDoseDue"
            type="date"
            className="h-11"
            {...registerField("newNextDoseDue")}
            aria-invalid={!!errors.newNextDoseDue}
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
            rows={3}
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
