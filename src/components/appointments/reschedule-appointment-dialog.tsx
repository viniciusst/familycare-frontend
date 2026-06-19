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
import { useRescheduleAppointment } from "@/hooks/use-appointments";
import { ApiError } from "@/lib/api/client";
import {
  rescheduleAppointmentSchema,
  type RescheduleAppointmentInput,
} from "@/lib/schemas/appointment";

interface RescheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  currentScheduledAt: string;
}

/**
 * Converts an ISO datetime to the value format expected by <input type="datetime-local">,
 * which is YYYY-MM-DDTHH:mm (no timezone, no seconds).
 */
function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function RescheduleAppointmentDialog({
  open,
  onOpenChange,
  appointmentId,
  currentScheduledAt,
}: RescheduleAppointmentDialogProps) {
  const reschedule = useRescheduleAppointment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RescheduleAppointmentInput>({
    resolver: zodResolver(rescheduleAppointmentSchema),
    defaultValues: { newScheduledAt: toDatetimeLocalValue(currentScheduledAt) },
  });

  // When the dialog reopens with a different appointment, reset the form
  useEffect(() => {
    if (open) {
      reset({ newScheduledAt: toDatetimeLocalValue(currentScheduledAt) });
    }
  }, [open, currentScheduledAt, reset]);

  const onSubmit = async (data: RescheduleAppointmentInput) => {
    try {
      await reschedule.mutateAsync({
        appointmentId,
        input: {
          newScheduledAt: new Date(data.newScheduledAt).toISOString(),
        },
      });
      toast.success("Appointment rescheduled.");
      onOpenChange(false);
    } catch (error) {
      setError("root", {
        message: error instanceof ApiError ? error.problem.title : "Could not reschedule.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-h3">Reschedule appointment</DialogTitle>
            <DialogDescription className="text-body">Choose a new date and time.</DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField
              htmlFor="newScheduledAt"
              label="New date & time"
              error={errors.newScheduledAt?.message}
              required
            >
              <Input
                id="newScheduledAt"
                type="datetime-local"
                className="h-11"
                {...register("newScheduledAt")}
                aria-invalid={!!errors.newScheduledAt}
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
              {isSubmitting ? "Rescheduling..." : "Reschedule"}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
