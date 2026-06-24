"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TrendingUp } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChangeAllergySeverity } from "@/hooks/use-allergies";
import { ApiError } from "@/lib/api/client";
import {
  changeAllergySeveritySchema,
  type ChangeAllergySeverityInput,
} from "@/lib/schemas/allergy";
import { ALLERGY_SEVERITY_LABELS, type EnrichedAllergy } from "@/types/allergies";

interface ChangeSeverityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allergy: EnrichedAllergy;
}

export function ChangeSeverityDialog({ open, onOpenChange, allergy }: ChangeSeverityDialogProps) {
  const change = useChangeAllergySeverity();

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<ChangeAllergySeverityInput>({
    resolver: zodResolver(changeAllergySeveritySchema),
    defaultValues: { newSeverity: allergy.severity },
  });

  useEffect(() => {
    if (open) {
      reset({ newSeverity: allergy.severity });
    }
  }, [open, allergy.severity, reset]);

  const newSeverity = watch("newSeverity");

  const onSubmit = async (data: ChangeAllergySeverityInput) => {
    try {
      await change.mutateAsync({ allergyId: allergy.id, input: data });
      toast.success("Severity updated.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof ChangeAllergySeverityInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message: error instanceof ApiError ? error.problem.title : "Could not update severity.",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-h3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Change severity
            </DialogTitle>
            <DialogDescription className="text-body">
              {allergy.substance} · {allergy.memberName}
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField
              htmlFor="newSeverity"
              label="Severity"
              hint="Update as reactions are observed over time."
              error={errors.newSeverity?.message}
              required
            >
              <Select
                value={String(newSeverity)}
                onValueChange={(val) =>
                  setValue(
                    "newSeverity",
                    Number(val) as ChangeAllergySeverityInput["newSeverity"],
                    { shouldDirty: true }
                  )
                }
              >
                <SelectTrigger id="newSeverity" className="h-11">
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
