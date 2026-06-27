"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Activity } from "lucide-react";
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
import { useRegisterChronicCondition } from "@/hooks/use-chronic-conditions";
import { useAllMembers } from "@/hooks/use-all-members";
import { ApiError } from "@/lib/api/client";
import {
  registerChronicConditionSchema,
  type RegisterChronicConditionInput,
} from "@/lib/schemas/chronic-condition";

interface RegisterChronicConditionForMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId?: string;
  memberName?: string;
  defaultMemberId?: string;
}

export function RegisterChronicConditionForMemberDialog(
  props: RegisterChronicConditionForMemberDialogProps
) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {props.open && <RegisterChronicConditionForm key={String(props.open)} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function RegisterChronicConditionForm({
  onOpenChange,
  memberId,
  memberName,
  defaultMemberId,
}: RegisterChronicConditionForMemberDialogProps) {
  const isMemberFixed = Boolean(memberId);
  const { members } = useAllMembers();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    memberId ?? defaultMemberId ?? ""
  );

  const effectiveMemberId = memberId ?? selectedMemberId;
  const effectiveMemberName = isMemberFixed
    ? (memberName ?? "this member")
    : (members.find((m) => m.memberId === effectiveMemberId)?.memberName ?? "—");

  const register = useRegisterChronicCondition(effectiveMemberId);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterChronicConditionInput>({
    resolver: zodResolver(registerChronicConditionSchema),
    defaultValues: {
      name: "",
      diagnosedAt: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const onSubmit = async (data: RegisterChronicConditionInput) => {
    if (!effectiveMemberId) {
      setError("root", { message: "Please pick a member first." });
      return;
    }

    try {
      const payload = {
        name: data.name,
        diagnosedAt: data.diagnosedAt,
        notes: data.notes?.trim() || undefined,
      };
      await register.mutateAsync(payload as RegisterChronicConditionInput);
      toast.success(`Condition registered for ${effectiveMemberName}.`);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof RegisterChronicConditionInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message:
            error instanceof ApiError ? error.problem.title : "Could not register condition.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <DialogHeader className="space-y-2">
        <DialogTitle className="text-h3 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {isMemberFixed ? `Register condition for ${memberName}` : "Register chronic condition"}
        </DialogTitle>
        <DialogDescription className="text-body">
          Record an ongoing health condition. It stays active until you mark it as resolved.
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
          label="Condition name"
          hint="e.g. Type 2 diabetes, Asthma, Hypertension"
          error={errors.name?.message}
          required
        >
          <Input
            id="name"
            placeholder="Asthma"
            className="h-11"
            {...registerField("name")}
            aria-invalid={!!errors.name}
          />
        </FormField>

        <FormField
          htmlFor="diagnosedAt"
          label="Diagnosed on"
          error={errors.diagnosedAt?.message}
          required
        >
          <Input
            id="diagnosedAt"
            type="date"
            className="h-11"
            {...registerField("diagnosedAt")}
            aria-invalid={!!errors.diagnosedAt}
          />
        </FormField>

        <FormField
          htmlFor="notes"
          label="Notes"
          badge="Optional"
          hint="Triggers, medication, severity context, etc."
          error={errors.notes?.message}
        >
          <Textarea
            id="notes"
            rows={4}
            placeholder="Diagnosed by Dr. X. Triggered by..."
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
          {isSubmitting ? "Registering..." : "Register condition"}
        </Button>
      </FormFooter>
    </form>
  );
}
