"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRegisterAllergy } from "@/hooks/use-allergies";
import { ApiError } from "@/lib/api/client";
import { registerAllergySchema, type RegisterAllergyInput } from "@/lib/schemas/allergy";
import { ALLERGY_SEVERITY_LABELS } from "@/types/allergies";

interface RegisterAllergyForMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
}

export function RegisterAllergyForMemberDialog({
  open,
  onOpenChange,
  memberId,
  memberName,
}: RegisterAllergyForMemberDialogProps) {
  const register = useRegisterAllergy(memberId);

  const {
    register: registerField,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterAllergyInput>({
    resolver: zodResolver(registerAllergySchema),
    defaultValues: {
      substance: "",
      severity: 1,
      reaction: "",
      firstObservedAt: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        substance: "",
        severity: 1,
        reaction: "",
        firstObservedAt: "",
      });
    }
  }, [open, reset]);

  const severity = watch("severity");

  const onSubmit = async (data: RegisterAllergyInput) => {
    try {
      // Strip empty strings so backend receives proper nulls for optional fields.
      const payload = {
        substance: data.substance,
        severity: data.severity,
        reaction: data.reaction?.trim() || undefined,
        firstObservedAt: data.firstObservedAt?.trim() || undefined,
      };
      await register.mutateAsync(payload as RegisterAllergyInput);
      toast.success(`Allergy registered for ${memberName}.`);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof RegisterAllergyInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message: error instanceof ApiError ? error.problem.title : "Could not register allergy.",
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
              <ShieldAlert className="h-5 w-5" />
              Register allergy for {memberName}
            </DialogTitle>
            <DialogDescription className="text-body">
              Record a known allergy. Severity can be updated later as reactions are observed.
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField
              htmlFor="substance"
              label="Substance"
              hint="What triggers the allergy (e.g. peanuts, penicillin)."
              error={errors.substance?.message}
              required
            >
              <Input
                id="substance"
                placeholder="Peanuts"
                className="h-11"
                {...registerField("substance")}
                aria-invalid={!!errors.substance}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                htmlFor="severity"
                label="Severity"
                error={errors.severity?.message}
                required
              >
                <Select
                  value={String(severity)}
                  onValueChange={(val) =>
                    setValue("severity", Number(val) as RegisterAllergyInput["severity"], {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="severity" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ALLERGY_SEVERITY_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                htmlFor="firstObservedAt"
                label="First observed"
                badge="Optional"
                error={errors.firstObservedAt?.message}
              >
                <Input
                  id="firstObservedAt"
                  type="date"
                  className="h-11"
                  {...registerField("firstObservedAt")}
                  aria-invalid={!!errors.firstObservedAt}
                />
              </FormField>
            </div>

            <FormField
              htmlFor="reaction"
              label="Reaction"
              badge="Optional"
              hint="Describe symptoms (hives, swelling, anaphylaxis...)."
              error={errors.reaction?.message}
            >
              <Textarea
                id="reaction"
                rows={3}
                placeholder="Hives, difficulty breathing..."
                {...registerField("reaction")}
                aria-invalid={!!errors.reaction}
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
              {isSubmitting ? "Registering..." : "Register allergy"}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
