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
import { Textarea } from "@/components/ui/textarea";
import { useCancelAppointment } from "@/hooks/use-appointments";
import { ApiError } from "@/lib/api/client";
import { cancelAppointmentSchema, type CancelAppointmentInput } from "@/lib/schemas/appointment";

interface CancelAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
}

export function CancelAppointmentDialog({
  open,
  onOpenChange,
  appointmentId,
}: CancelAppointmentDialogProps) {
  const cancel = useCancelAppointment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CancelAppointmentInput>({
    resolver: zodResolver(cancelAppointmentSchema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (open) reset({ reason: "" });
  }, [open, reset]);

  const onSubmit = async (data: CancelAppointmentInput) => {
    try {
      const payload = { reason: data.reason || undefined };
      await cancel.mutateAsync({
        appointmentId,
        input: payload as CancelAppointmentInput,
      });
      toast.success("Appointment cancelled.");
      onOpenChange(false);
    } catch (error) {
      setError("root", {
        message: error instanceof ApiError ? error.problem.title : "Could not cancel appointment.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-h3">Cancel appointment?</DialogTitle>
            <DialogDescription className="text-body">
              This will mark the appointment as cancelled. It will remain in the history but
              won&apos;t appear in upcoming visits.
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField
              htmlFor="reason"
              label="Reason"
              badge="Optional"
              hint="Why is this being cancelled? (kept for the family's reference)"
              error={errors.reason?.message}
            >
              <Textarea
                id="reason"
                placeholder="e.g. Rescheduled to next month, doctor unavailable..."
                rows={3}
                {...register("reason")}
                aria-invalid={!!errors.reason}
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
              Keep appointment
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? "Cancelling..." : "Cancel appointment"}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
