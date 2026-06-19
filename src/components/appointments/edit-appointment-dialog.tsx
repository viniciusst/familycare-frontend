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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateAppointmentDetails } from "@/hooks/use-appointments";
import { ApiError } from "@/lib/api/client";
import {
  updateAppointmentDetailsSchema,
  type UpdateAppointmentDetailsInput,
} from "@/lib/schemas/appointment";
import { COMMON_SPECIALTIES, type EnrichedAppointment } from "@/types/appointments";

interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: EnrichedAppointment;
}

export function EditAppointmentDialog({
  open,
  onOpenChange,
  appointment,
}: EditAppointmentDialogProps) {
  const update = useUpdateAppointmentDetails();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<UpdateAppointmentDetailsInput>({
    resolver: zodResolver(updateAppointmentDetailsSchema),
    defaultValues: {
      doctorName: appointment.doctorName,
      specialty: appointment.specialty,
      location: appointment.location ?? "",
      notes: appointment.notes ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        doctorName: appointment.doctorName,
        specialty: appointment.specialty,
        location: appointment.location ?? "",
        notes: appointment.notes ?? "",
      });
    }
  }, [open, appointment, reset]);

  const selectedSpecialty = watch("specialty");

  const onSubmit = async (data: UpdateAppointmentDetailsInput) => {
    try {
      const payload = {
        ...data,
        location: data.location || undefined,
        notes: data.notes || undefined,
      };
      await update.mutateAsync({
        appointmentId: appointment.id,
        input: payload as UpdateAppointmentDetailsInput,
      });
      toast.success("Appointment updated.");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof UpdateAppointmentDetailsInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message:
            error instanceof ApiError ? error.problem.title : "Could not update appointment.",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-h3">Edit appointment</DialogTitle>
            <DialogDescription className="text-body">
              Fix typos or update info. To change the date/time, use Reschedule instead.
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField
              htmlFor="specialty"
              label="Specialty"
              error={errors.specialty?.message}
              required
            >
              <Select
                value={COMMON_SPECIALTIES.includes(selectedSpecialty) ? selectedSpecialty : ""}
                onValueChange={(val) => setValue("specialty", val, { shouldDirty: true })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Common specialties..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="specialty"
                placeholder="...or type a custom specialty"
                className="mt-2 h-11"
                {...register("specialty")}
                aria-invalid={!!errors.specialty}
              />
            </FormField>

            <FormField
              htmlFor="doctorName"
              label="Doctor / clinic name"
              error={errors.doctorName?.message}
              required
            >
              <Input
                id="doctorName"
                className="h-11"
                {...register("doctorName")}
                aria-invalid={!!errors.doctorName}
              />
            </FormField>

            <FormField
              htmlFor="location"
              label="Location"
              badge="Optional"
              error={errors.location?.message}
            >
              <Input
                id="location"
                className="h-11"
                {...register("location")}
                aria-invalid={!!errors.location}
              />
            </FormField>

            <FormField htmlFor="notes" label="Notes" badge="Optional" error={errors.notes?.message}>
              <Textarea id="notes" rows={3} {...register("notes")} aria-invalid={!!errors.notes} />
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
