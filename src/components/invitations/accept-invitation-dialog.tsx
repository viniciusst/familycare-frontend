"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { useAcceptInvitation } from "@/hooks/use-invitations";
import { ApiError } from "@/lib/api/client";
import { acceptInvitationSchema, type AcceptInvitationInput } from "@/lib/schemas/invitation";
import type { InvitationDetails } from "@/types/api";

interface AcceptInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: InvitationDetails;
}

export function AcceptInvitationDialog({
  open,
  onOpenChange,
  invitation,
}: AcceptInvitationDialogProps) {
  const accept = useAcceptInvitation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<AcceptInvitationInput>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      displayName: "",
      birthDate: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ displayName: "", birthDate: "" });
    }
  }, [open, reset]);

  const onSubmit = async (data: AcceptInvitationInput) => {
    try {
      const payload = {
        ...data,
        birthDate: data.birthDate || undefined,
      };
      await accept.mutateAsync({
        invitationId: invitation.id,
        input: payload as AcceptInvitationInput,
      });
      toast.success(`Welcome to ${invitation.familyName}!`);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof AcceptInvitationInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message: error instanceof ApiError ? error.problem.title : "Could not accept invitation.",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-h3">Join {invitation.familyName}</DialogTitle>
            <DialogDescription className="text-body">
              How should you appear in this family? Other members will see this name and basic info.
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField
              htmlFor="displayName"
              label="Display name"
              hint="Usually your first name (e.g. Vinicius)."
              error={errors.displayName?.message}
              required
            >
              <Input
                id="displayName"
                placeholder="Your name in this family"
                className="h-11"
                {...register("displayName")}
                aria-invalid={!!errors.displayName}
              />
            </FormField>

            <FormField
              htmlFor="birthDate"
              label="Birth date"
              badge="Optional"
              hint="Helps with age-appropriate medical context."
              error={errors.birthDate?.message}
            >
              <Input
                id="birthDate"
                type="date"
                className="h-11"
                {...register("birthDate")}
                aria-invalid={!!errors.birthDate}
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
              {isSubmitting ? "Joining..." : "Join family"}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
