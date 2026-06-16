"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
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
  DialogTrigger,
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
import { useInviteMember } from "@/hooks/use-invitations";
import { ApiError } from "@/lib/api/client";
import { inviteMemberSchema, type InviteMemberInput } from "@/lib/schemas/invitation";

interface InviteMemberDialogProps {
  familyId: string;
}

export function InviteMemberDialog({ familyId }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const inviteMember = useInviteMember(familyId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: 3,
      relationship: 8,
      expiresInDays: 14,
    },
  });

  const role = watch("role");
  const relationship = watch("relationship");
  const expiresInDays = watch("expiresInDays");

  const onSubmit = async (data: InviteMemberInput) => {
    try {
      await inviteMember.mutateAsync(data);
      toast.success(`Invitation sent to ${data.email}.`);
      reset();
      setOpen(false);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setError("email", {
            message: "An invitation is already pending for this email.",
          });
        } else if (error.problem.errors) {
          for (const [field, messages] of Object.entries(error.problem.errors)) {
            const key = field.charAt(0).toLowerCase() + field.slice(1);
            setError(key as keyof InviteMemberInput, { message: messages[0] });
          }
        } else {
          setError("root", { message: error.problem.title });
        }
      }
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
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-h3">Invite a family member</DialogTitle>
            <DialogDescription className="text-body">
              They&apos;ll receive an invitation. Once accepted, they can manage their own health
              information.
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField htmlFor="email" label="Email" error={errors.email?.message} required>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                className="h-11"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField htmlFor="role" label="Role" hint="Permission level">
                <Select
                  value={String(role)}
                  onValueChange={(val) =>
                    setValue("role", Number(val) as InviteMemberInput["role"])
                  }
                >
                  <SelectTrigger id="role" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Admin</SelectItem>
                    <SelectItem value="3">Adult</SelectItem>
                    <SelectItem value="4">Minor</SelectItem>
                    <SelectItem value="5">Caregiver</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField htmlFor="relationship" label="Relationship" hint="How they relate to you">
                <Select
                  value={String(relationship)}
                  onValueChange={(val) =>
                    setValue("relationship", Number(val) as InviteMemberInput["relationship"])
                  }
                >
                  <SelectTrigger id="relationship" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Spouse</SelectItem>
                    <SelectItem value="3">Parent</SelectItem>
                    <SelectItem value="4">Child</SelectItem>
                    <SelectItem value="5">Sibling</SelectItem>
                    <SelectItem value="6">Grandparent</SelectItem>
                    <SelectItem value="7">Grandchild</SelectItem>
                    <SelectItem value="9">Caregiver</SelectItem>
                    <SelectItem value="8">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField
              htmlFor="expiresInDays"
              label="Invitation expires in"
              hint="The recipient must accept before this period."
            >
              <Select
                value={String(expiresInDays)}
                onValueChange={(val) => setValue("expiresInDays", Number(val))}
              >
                <SelectTrigger id="expiresInDays" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
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
              {isSubmitting ? "Sending..." : "Send invitation"}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
