"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormField,
  FormFooter,
  FormRootError,
} from "@/components/forms/form-primitives";
import { Input } from "@/components/ui/input";
import { useRenameFamily } from "@/hooks/use-families";
import { ApiError } from "@/lib/api/client";
import {
  renameFamilySchema,
  type RenameFamilyInput,
} from "@/lib/schemas/family";

interface FamilySettingsProps {
  familyId: string;
  currentName: string;
}

export function FamilySettings({ familyId, currentName }: FamilySettingsProps) {
  const router = useRouter();
  const renameFamily = useRenameFamily(familyId);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<RenameFamilyInput>({
    resolver: zodResolver(renameFamilySchema),
    defaultValues: { newName: currentName },
  });

  const onSubmit = async (data: RenameFamilyInput) => {
    try {
      await renameFamily.mutateAsync(data);
      toast.success("Family renamed.");
      router.push("/families");
    } catch (error) {
      setError("root", {
        message:
          error instanceof ApiError
            ? error.problem.title
            : "Could not rename family.",
      });
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Slightly larger gap below the header so the form fields don't
            feel cramped against the description. */}
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-h4">Family name</CardTitle>
          <CardDescription className="text-body">
            The name visible to all members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            htmlFor="newName"
            label="Name"
            error={errors.newName?.message}
            required
          >
            <Input
              id="newName"
              className="h-11"
              {...register("newName")}
              aria-invalid={!!errors.newName}
            />
          </FormField>

          <FormRootError message={errors.root?.message} />

          <FormFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/families")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </FormFooter>
        </CardContent>
      </form>
    </Card>
  );
}
