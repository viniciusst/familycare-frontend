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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateMemberDetails } from "@/hooks/use-families";
import { ApiError } from "@/lib/api/client";
import { updateMemberDetailsSchema, type UpdateMemberDetailsInput } from "@/lib/schemas/member";
import { RELATIONSHIP_LABELS, type FamilyMember, type RelationshipType } from "@/types/api";

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: string;
  member: FamilyMember;
}

export function EditMemberDialog({ open, onOpenChange, familyId, member }: EditMemberDialogProps) {
  const update = useUpdateMemberDetails(familyId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<UpdateMemberDetailsInput>({
    resolver: zodResolver(updateMemberDetailsSchema),
    defaultValues: {
      displayName: member.displayName,
      // Backend may return birthDate as null for legacy members; coerce
      // to empty string so the input renders without crashing.
      birthDate: member.birthDate ?? "",
      relationship: member.relationship,
    },
  });

  // When dialog reopens (possibly with different member), reset defaults.
  useEffect(() => {
    if (open) {
      reset({
        displayName: member.displayName,
        birthDate: member.birthDate ?? "",
        relationship: member.relationship,
      });
    }
  }, [open, member, reset]);

  const selectedRelationship = watch("relationship");

  const onSubmit = async (data: UpdateMemberDetailsInput) => {
    try {
      await update.mutateAsync({ memberId: member.id, input: data });
      toast.success("Member updated.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        // Map ProblemDetails errors back to form fields. Backend uses
        // PascalCase ("DisplayName"); we lowercase the first char.
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof UpdateMemberDetailsInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message: error instanceof ApiError ? error.problem.title : "Could not update member.",
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
              <Pencil className="h-5 w-5" />
              Edit member
            </DialogTitle>
            <DialogDescription className="text-body">
              Update display name, birth date, or relationship. To change role or remove this
              member, use the other menu options.
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField
              htmlFor="displayName"
              label="Display name"
              error={errors.displayName?.message}
              required
            >
              <Input
                id="displayName"
                className="h-11"
                {...register("displayName")}
                aria-invalid={!!errors.displayName}
              />
            </FormField>

            <FormField
              htmlFor="birthDate"
              label="Birth date"
              error={errors.birthDate?.message}
              required
            >
              <Input
                id="birthDate"
                type="date"
                className="h-11"
                {...register("birthDate")}
                aria-invalid={!!errors.birthDate}
              />
            </FormField>

            <FormField
              htmlFor="relationship"
              label="Relationship"
              error={errors.relationship?.message}
              required
            >
              <Select
                value={String(selectedRelationship)}
                onValueChange={(val) =>
                  setValue(
                    "relationship",
                    Number(val) as UpdateMemberDetailsInput["relationship"],
                    { shouldDirty: true }
                  )
                }
              >
                <SelectTrigger id="relationship" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RELATIONSHIP_LABELS).map(([val, label]) => (
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
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
