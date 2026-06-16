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
import { useCreateFamily } from "@/hooks/use-families";
import { ApiError } from "@/lib/api/client";
import { createFamilySchema, type CreateFamilyInput } from "@/lib/schemas/family";

interface CreateFamilyDialogProps {
  trigger?: React.ReactNode;
}

export function CreateFamilyDialog({ trigger }: CreateFamilyDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const createFamily = useCreateFamily();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<CreateFamilyInput>({ resolver: zodResolver(createFamilySchema) });

  const onSubmit = async (data: CreateFamilyInput) => {
    try {
      const family = await createFamily.mutateAsync(data);
      toast.success(family ? `Family "${family.name}" created.` : "Family created.");
      reset();
      setOpen(false);
      if (family) {
        router.push(`/families/${family.id}`);
      }
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof CreateFamilyInput, { message: messages[0] });
        }
      } else {
        setError("root", {
          message: error instanceof ApiError ? error.problem.title : "Something went wrong.",
        });
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
      <DialogTrigger asChild>{trigger ?? <Button>Create family</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-h3">Create a new family</DialogTitle>
            <DialogDescription className="text-body">
              You&apos;ll be the owner. You can invite members later.
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField
              htmlFor="name"
              label="Family name"
              hint="The name visible to all members."
              error={errors.name?.message}
              required
            >
              <Input
                id="name"
                placeholder="e.g. Silva family"
                className="h-11"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
            </FormField>

            <FormField
              htmlFor="ownerDisplayName"
              label="Your display name"
              hint="How you'll appear inside this family."
              error={errors.ownerDisplayName?.message}
              required
            >
              <Input
                id="ownerDisplayName"
                placeholder="e.g. Vinicius"
                className="h-11"
                {...register("ownerDisplayName")}
                aria-invalid={!!errors.ownerDisplayName}
              />
            </FormField>

            <FormField
              htmlFor="ownerBirthDate"
              label="Your birth date"
              badge="Optional"
              error={errors.ownerBirthDate?.message}
            >
              <Input
                id="ownerBirthDate"
                type="date"
                className="h-11"
                {...register("ownerBirthDate")}
                aria-invalid={!!errors.ownerBirthDate}
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
              {isSubmitting ? "Creating..." : "Create family"}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
