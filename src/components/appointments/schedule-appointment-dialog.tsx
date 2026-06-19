"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useScheduleAppointment } from "@/hooks/use-appointments";
import { ApiError } from "@/lib/api/client";
import {
  scheduleAppointmentSchema,
  type ScheduleAppointmentInput,
} from "@/lib/schemas/appointment";
import { COMMON_SPECIALTIES } from "@/types/appointments";

interface ScheduleAppointmentDialogProps {
  members: {
    memberId: string;
    memberDisplayName: string;
    familyId: string;
    familyName: string;
  }[];
  defaultMemberId?: string;
}

export function ScheduleAppointmentDialog({
  members,
  defaultMemberId,
}: ScheduleAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const schedule = useScheduleAppointment();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<ScheduleAppointmentInput>({
    resolver: zodResolver(scheduleAppointmentSchema),
    defaultValues: {
      memberId: defaultMemberId ?? "",
      scheduledAt: "",
      specialty: "",
      doctorName: "",
      location: "",
      notes: "",
    },
  });

  const selectedMemberId = watch("memberId");
  const selectedSpecialty = watch("specialty");

  const onSubmit = async (data: ScheduleAppointmentInput) => {
    try {
      const payload = {
        ...data,
        // Convert local datetime-local to UTC ISO so the backend
        // (Postgres TIMESTAMPTZ + Npgsql) accepts it. Without this,
        // .NET parses as Kind=Unspecified which Npgsql rejects.
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        location: data.location || undefined,
        notes: data.notes || undefined,
      };
      await schedule.mutateAsync(payload as ScheduleAppointmentInput);
      toast.success("Appointment scheduled.");
      reset();
      setOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.problem.errors) {
        for (const [field, messages] of Object.entries(error.problem.errors)) {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          setError(key as keyof ScheduleAppointmentInput, {
            message: messages[0],
          });
        }
      } else {
        setError("root", {
          message:
            error instanceof ApiError ? error.problem.title : "Could not schedule appointment.",
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
      <DialogTrigger asChild>
        <Button>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Schedule new
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-h3">Schedule appointment</DialogTitle>
            <DialogDescription className="text-body">
              Add a new medical appointment for a family member.
            </DialogDescription>
          </DialogHeader>

          <FormSection>
            <FormField htmlFor="memberId" label="For" error={errors.memberId?.message} required>
              <Select value={selectedMemberId} onValueChange={(val) => setValue("memberId", val)}>
                <SelectTrigger id="memberId" className="h-11">
                  <SelectValue placeholder="Select a family member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.memberId} value={m.memberId}>
                      {m.memberDisplayName}{" "}
                      <span className="text-muted-foreground">· {m.familyName}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              htmlFor="scheduledAt"
              label="Date & time"
              error={errors.scheduledAt?.message}
              required
            >
              <Input
                id="scheduledAt"
                type="datetime-local"
                className="h-11"
                {...register("scheduledAt")}
                aria-invalid={!!errors.scheduledAt}
              />
            </FormField>

            <FormField
              htmlFor="specialty"
              label="Specialty"
              hint="Choose a common one or type a custom specialty."
              error={errors.specialty?.message}
              required
            >
              <Select
                value={COMMON_SPECIALTIES.includes(selectedSpecialty) ? selectedSpecialty : ""}
                onValueChange={(val) => setValue("specialty", val)}
              >
                <SelectTrigger id="specialty-select" className="h-11">
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
                placeholder="e.g. Dr. Silva"
                className="h-11"
                {...register("doctorName")}
                aria-invalid={!!errors.doctorName}
              />
            </FormField>

            <FormField
              htmlFor="location"
              label="Location"
              badge="Optional"
              hint="Address, clinic name, or 'Online'."
              error={errors.location?.message}
            >
              <Input
                id="location"
                placeholder="e.g. Calgary Medical Center"
                className="h-11"
                {...register("location")}
                aria-invalid={!!errors.location}
              />
            </FormField>

            <FormField htmlFor="notes" label="Notes" badge="Optional" error={errors.notes?.message}>
              <Textarea
                id="notes"
                placeholder="Reason for visit, prep instructions, things to bring..."
                rows={3}
                {...register("notes")}
                aria-invalid={!!errors.notes}
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
              {isSubmitting ? "Scheduling..." : "Schedule"}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
