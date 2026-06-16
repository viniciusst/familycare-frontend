"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface AcceptInvitationDialogProps {
  invitationId: string;
  familyName: string;
  familyId: string;
  trigger?: React.ReactNode;
}

export function AcceptInvitationDialog({
  invitationId,
  familyName,
  familyId,
  trigger,
}: AcceptInvitationDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const accept = useAcceptInvitation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<AcceptInvitationInput>({
    resolver: zodResolver(acceptInvitationSchema),
  });

  const onSubmit = async (data: AcceptInvitationInput) => {
    try {
      await accept.mutateAsync({ invitationId, input: data });
      toast.success(`You're now a member of "${familyName}".`);
      reset();
      setOpen(false);
      router.push(`/families/${familyId}`);
    } catch (error) {
      setError("root", {
        message: error instanceof ApiError ? error.problem.title : "Could not accept invitation.",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>{trigger ?? <Button>Accept</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-h3">Join {familyName}</DialogTitle>
            <DialogDescription className="text-body">
              Tell us how you&apos;d like to appear to other family members.
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField
              htmlFor="displayName"
              label="Your display name"
              hint="The name family members will see."
              error={errors.displayName?.message}
              required
            >
              <Input
                id="displayName"
                placeholder="e.g. Vinicius"
                className="h-11"
                {...register("displayName")}
                aria-invalid={!!errors.displayName}
              />
            </FormField>

            <FormField
              htmlFor="birthDate"
              label="Birth date"
              badge="Optional"
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
              onClick={() => setOpen(false)}
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
