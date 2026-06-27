"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Syringe } from "lucide-react";
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
import { useRegisterVaccine } from "@/hooks/use-vaccines";
import { useAllMembers } from "@/hooks/use-all-members";
import { ApiError } from "@/lib/api/client";
import { registerVaccineSchema, type RegisterVaccineInput } from "@/lib/schemas/vaccine";

interface RegisterVaccineForMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId?: string;
  memberName?: string;
  defaultMemberId?: string;
}

export function RegisterVaccineForMemberDialog(props: RegisterVaccineForMemberDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {props.open && <RegisterVaccineForm key={String(props.open)} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function RegisterVaccineForm({
  onOpenChange,
  memberId,
  memberName,
  defaultMemberId,
}: RegisterVaccineForMemberDialogProps) {
  const isMemberFixed = Boolean(memberId);
  const { members } = useAllMembers();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    memberId ?? defaultMemberId ?? ""
  );

  const effectiveMemberId = memberId ?? selectedMemberId;
  const effectiveMemberName = isMemberFixed
    ? (memberName ?? "this member")
    : (members.find((m) => m.memberId === effectiveMemberId)?.memberName ?? "—");

  const register = useRegisterVaccine(effectiveMemberId);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterVaccineInput>({
    resolver: zodResolver(registerVaccineSchema),
    defaultValues: {
      name: "",
      appliedAt: new Date().toISOString().slice(0, 10),
      manufacturer: "",
      batchNumber: "",
      doseNumber: undefined,
      nextDoseDue: "",
      notes: "",
    },
  });

  const onSubmit = async (data: RegisterVaccineInput) => {
    if (!effectiveMemberId) {
      setError("root", { message: "Please pick a member first." });
      return;
    }

    try {
      const payload = {
        name: data.name,
        appliedAt: data.appliedAt,
        manufacturer: data.manufacturer?.trim() || undefined,
        batchNumber: data.batchNumber?.trim() || undefined,
        doseNumber: data.doseNumber,
        nextDoseDue: data.nextDoseDue?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
      };
      await register.mutateAsync(payload as RegisterVaccineInput);
      toast.success(`Vaccine registered for ${effectiveMemberName}.`);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof RegisterVaccineInput, { message: messages[0] });
        }
      } else {
        setError("root", {
          message: error instanceof ApiError ? error.problem.title : "Could not register vaccine.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <DialogHeader className="space-y-2">
        <DialogTitle className="text-h3 flex items-center gap-2">
          <Syringe className="h-5 w-5" />
          {isMemberFixed ? `Register vaccine for ${memberName}` : "Register vaccine"}
        </DialogTitle>
        <DialogDescription className="text-body">
          Record an immunization. Add the next dose date if a follow-up shot is scheduled.
        </DialogDescription>
      </DialogHeader>

      <FormSection>
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

        <FormField
          htmlFor="name"
          label="Vaccine name"
          hint="e.g. Influenza, Tdap, COVID-19"
          error={errors.name?.message}
          required
        >
          <Input
            id="name"
            placeholder="Influenza"
            className="h-11"
            {...registerField("name")}
            aria-invalid={!!errors.name}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            htmlFor="appliedAt"
            label="Applied on"
            error={errors.appliedAt?.message}
            required
          >
            <Input
              id="appliedAt"
              type="date"
              className="h-11"
              {...registerField("appliedAt")}
              aria-invalid={!!errors.appliedAt}
            />
          </FormField>

          <FormField
            htmlFor="doseNumber"
            label="Dose number"
            badge="Optional"
            hint="1 for single dose, 2/3/... for follow-ups."
            error={errors.doseNumber?.message}
          >
            <Input
              id="doseNumber"
              type="number"
              min={1}
              className="h-11"
              {...registerField("doseNumber", { valueAsNumber: true })}
              aria-invalid={!!errors.doseNumber}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            htmlFor="manufacturer"
            label="Manufacturer"
            badge="Optional"
            error={errors.manufacturer?.message}
          >
            <Input
              id="manufacturer"
              placeholder="Pfizer, Moderna, etc."
              className="h-11"
              {...registerField("manufacturer")}
              aria-invalid={!!errors.manufacturer}
            />
          </FormField>

          <FormField
            htmlFor="batchNumber"
            label="Batch / lot number"
            badge="Optional"
            error={errors.batchNumber?.message}
          >
            <Input
              id="batchNumber"
              placeholder="ABC123"
              className="h-11"
              {...registerField("batchNumber")}
              aria-invalid={!!errors.batchNumber}
            />
          </FormField>
        </div>

        <FormField
          htmlFor="nextDoseDue"
          label="Next dose due"
          badge="Optional"
          hint="If a follow-up shot is required."
          error={errors.nextDoseDue?.message}
        >
          <Input
            id="nextDoseDue"
            type="date"
            className="h-11"
            {...registerField("nextDoseDue")}
            aria-invalid={!!errors.nextDoseDue}
          />
        </FormField>

        <FormField htmlFor="notes" label="Notes" badge="Optional" error={errors.notes?.message}>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Reactions, location applied, etc."
            {...registerField("notes")}
            aria-invalid={!!errors.notes}
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
          {isSubmitting ? "Registering..." : "Register vaccine"}
        </Button>
      </FormFooter>
    </form>
  );
}
