"use client";

import {
  CalendarClock,
  CheckCircle2,
  Crown,
  MapPin,
  MoreHorizontal,
  Pencil,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CancelAppointmentDialog } from "./cancel-appointment-dialog";
import { RescheduleAppointmentDialog } from "./reschedule-appointment-dialog";
import { EditAppointmentDialog } from "./edit-appointment-dialog";
import { useCompleteAppointment } from "@/hooks/use-appointments";
import { ApiError } from "@/lib/api/client";
import {
  APPOINTMENT_STATUS_LABELS,
  isPastDue,
  type EnrichedAppointment,
} from "@/types/appointments";

interface AppointmentsTableProps {
  appointments: EnrichedAppointment[];
  showMemberColumn?: boolean;
}

export function AppointmentsTable({
  appointments,
  showMemberColumn = true,
}: AppointmentsTableProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <CalendarClock className="text-muted-foreground h-8 w-8" />
        <p className="text-h4">No appointments</p>
        <p className="text-body text-muted-foreground max-w-sm">
          When you schedule appointments, they&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            {showMemberColumn && <TableHead>Member</TableHead>}
            <TableHead>Specialty</TableHead>
            <TableHead>Date & time</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              showMemberColumn={showMemberColumn}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface AppointmentRowProps {
  appointment: EnrichedAppointment;
  showMemberColumn: boolean;
}

function AppointmentRow({ appointment, showMemberColumn }: AppointmentRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const complete = useCompleteAppointment();

  const isScheduled = appointment.status === 1;
  const overdue = isPastDue(appointment);

  const handleComplete = async () => {
    try {
      await complete.mutateAsync(appointment.id);
      toast.success("Appointment marked as completed.");
      setCompleteOpen(false);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.problem.title : "Could not complete appointment."
      );
    }
  };

  return (
    <TableRow className={overdue ? "bg-destructive/5" : ""}>
      {showMemberColumn && (
        <TableCell>
          <div className="space-y-0.5">
            <div className="font-medium">{appointment.memberDisplayName ?? "—"}</div>
            {appointment.familyName && (
              <div className="text-muted-foreground text-xs">{appointment.familyName}</div>
            )}
          </div>
        </TableCell>
      )}
      <TableCell>
        <div className="flex items-center gap-2">
          <Stethoscope className="text-muted-foreground h-4 w-4" />
          {appointment.specialty}
        </div>
      </TableCell>
      <TableCell>
        <div className="tabular text-sm">
          {new Date(appointment.scheduledAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
        {overdue && <div className="text-destructive mt-0.5 text-xs">Past due</div>}
      </TableCell>
      <TableCell className="text-sm">{appointment.doctorName}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {appointment.location ? (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {appointment.location}
          </span>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell>
        <StatusBadge appointment={appointment} />
      </TableCell>
      <TableCell>
        {isScheduled && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCompleteOpen(true)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRescheduleOpen(true)}>
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Reschedule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setCancelOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={completeOpen} onOpenChange={setCompleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark as completed?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will record the appointment as completed. You can upload exam results or
                    notes later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleComplete}>Mark as completed</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <EditAppointmentDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              appointment={appointment}
            />

            <RescheduleAppointmentDialog
              open={rescheduleOpen}
              onOpenChange={setRescheduleOpen}
              appointmentId={appointment.id}
              currentScheduledAt={appointment.scheduledAt}
            />

            <CancelAppointmentDialog
              open={cancelOpen}
              onOpenChange={setCancelOpen}
              appointmentId={appointment.id}
            />
          </>
        )}
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ appointment }: { appointment: EnrichedAppointment }) {
  if (isPastDue(appointment)) {
    return <Badge variant="destructive">Past due</Badge>;
  }
  switch (appointment.status) {
    case 1:
      return <Badge variant="default">Scheduled</Badge>;
    case 2:
      return (
        <Badge variant="secondary">
          <Crown className="mr-1 h-3 w-3" />
          {APPOINTMENT_STATUS_LABELS[appointment.status]}
        </Badge>
      );
    case 3:
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return null;
  }
}
