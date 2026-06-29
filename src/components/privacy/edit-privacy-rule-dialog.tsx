"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Pencil, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormFooter, FormRootError, FormSection } from "@/components/forms/form-primitives";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useChangePrivacyRule } from "@/hooks/use-privacy-rules";
import { ApiError } from "@/lib/api/client";
import { changePrivacyRuleSchema, type ChangePrivacyRuleInput } from "@/lib/schemas/privacy-rule";
import type { FamilyMember } from "@/types/api";
import {
  DATA_CATEGORY_LABELS,
  VISIBILITY_SCOPE_DESCRIPTIONS,
  VISIBILITY_SCOPE_LABELS,
  type PrivacyRule,
  type VisibilityScope,
} from "@/types/privacy-rules";

interface EditPrivacyRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: string;
  memberId: string;
  memberName: string;
  rule: PrivacyRule;
  familyMembers: FamilyMember[];
}

export function EditPrivacyRuleDialog(props: EditPrivacyRuleDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {props.open && <EditPrivacyRuleForm key={String(props.open)} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function EditPrivacyRuleForm({
  onOpenChange,
  familyId,
  memberId,
  memberName,
  rule,
  familyMembers,
}: EditPrivacyRuleDialogProps) {
  const change = useChangePrivacyRule();

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<ChangePrivacyRuleInput>({
    resolver: zodResolver(changePrivacyRuleSchema),
    defaultValues: {
      newScope: rule.scope,
      allowedMemberIds: rule.allowedMemberIds,
    },
  });

  const currentScope = watch("newScope");
  const currentAllowed = watch("allowedMemberIds") ?? [];

  // Members that can be added to the Custom allowlist: exclude the data
  // owner themselves (they always have access regardless).
  const allowableMembers = familyMembers.filter((m) => m.id !== memberId);

  const toggleAllowedMember = (memberId: string) => {
    const next = currentAllowed.includes(memberId)
      ? currentAllowed.filter((id) => id !== memberId)
      : [...currentAllowed, memberId];
    setValue("allowedMemberIds", next, { shouldDirty: true });
  };

  const onSubmit = async (data: ChangePrivacyRuleInput) => {
    try {
      await change.mutateAsync({
        familyId,
        memberId,
        category: rule.category,
        input: data,
      });
      toast.success("Privacy rule updated.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof ChangePrivacyRuleInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message:
            error instanceof ApiError ? error.problem.title : "Could not update privacy rule.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <DialogHeader className="space-y-2">
        <DialogTitle className="text-h3 flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Edit {DATA_CATEGORY_LABELS[rule.category]} visibility
        </DialogTitle>
        <DialogDescription className="text-body">
          Configure who can see {memberName}&apos;s{" "}
          {DATA_CATEGORY_LABELS[rule.category].toLowerCase()}.
        </DialogDescription>
      </DialogHeader>

      <FormSection>
        <RadioGroup
          value={String(currentScope)}
          onValueChange={(val) =>
            setValue("newScope", Number(val) as VisibilityScope, {
              shouldDirty: true,
            })
          }
          className="gap-3"
        >
          {([1, 2, 3, 4] as VisibilityScope[]).map((scope) => (
            <div
              key={scope}
              className="hover:bg-muted/50 flex items-start gap-3 rounded-md border p-3 transition-colors"
            >
              <RadioGroupItem value={String(scope)} id={`scope-${scope}`} className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <Label htmlFor={`scope-${scope}`} className="cursor-pointer font-medium">
                  {VISIBILITY_SCOPE_LABELS[scope]}
                </Label>
                <div className="text-muted-foreground text-xs">
                  {VISIBILITY_SCOPE_DESCRIPTIONS[scope]}
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>

        {currentScope === 4 && (
          <div className="space-y-2 rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Users className="text-muted-foreground h-4 w-4" />
              <Label className="font-medium">Allowed members</Label>
            </div>
            <p className="text-muted-foreground text-xs">Select which members can see this data.</p>

            {allowableMembers.length === 0 && (
              <p className="text-muted-foreground py-2 text-sm">
                No other members in this family yet.
              </p>
            )}

            <div className="space-y-2">
              {allowableMembers.map((member) => {
                const checked = currentAllowed.includes(member.id);
                return (
                  <div
                    key={member.id}
                    className="hover:bg-muted/50 flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors"
                  >
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={checked}
                      onCheckedChange={() => toggleAllowedMember(member.id)}
                    />
                    <Label
                      htmlFor={`member-${member.id}`}
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      {member.displayName}
                    </Label>
                  </div>
                );
              })}
            </div>
            {errors.allowedMemberIds?.message && (
              <p className="text-destructive text-xs">{errors.allowedMemberIds.message}</p>
            )}
          </div>
        )}

        <div className="bg-muted/50 text-muted-foreground flex items-start gap-2 rounded-md p-3 text-xs">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{memberName} always sees their own data, regardless of this setting.</span>
        </div>

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
  );
}
