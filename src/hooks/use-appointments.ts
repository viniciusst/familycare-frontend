"use client";

import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useFamilies } from "@/hooks/use-families";
import { clientFetch } from "@/lib/api/client";
import type {
  CancelAppointmentInput,
  RescheduleAppointmentInput,
  ScheduleAppointmentInput,
  UpdateAppointmentDetailsInput,
} from "@/lib/schemas/appointment";
import type { Appointment, EnrichedAppointment } from "@/types/appointments";

export const appointmentsByMemberKey = (memberId: string) =>
  ["appointments", "member", memberId] as const;

/**
 * Aggregates appointments across all families/members and enriches each
 * one with memberName + familyId + familyName for display. The naming
 * (memberName, not memberDisplayName) matches the convention used by
 * EnrichedExam and EnrichedAllergy so the rest of the app speaks one
 * vocabulary.
 */
export function useAllAppointments() {
  const { data: families = [] } = useFamilies();

  const familyDetails = useQueries({
    queries: families.map((f) => ({
      queryKey: ["families", f.id],
      queryFn: () =>
        clientFetch<{
          id: string;
          name: string;
          members: { id: string; userId: string; displayName: string }[];
        }>(`/api/families/${f.id}`),
    })),
  });

  const { membersMap, allMembers } = useMemo(() => {
    const map = new Map<string, { displayName: string; familyId: string; familyName: string }>();
    const list: {
      memberId: string;
      memberName: string;
      familyId: string;
      familyName: string;
    }[] = [];

    familyDetails.forEach((q) => {
      if (q.data) {
        q.data.members.forEach((m) => {
          map.set(m.id, {
            displayName: m.displayName,
            familyId: q.data!.id,
            familyName: q.data!.name,
          });
          list.push({
            memberId: m.id,
            memberName: m.displayName,
            familyId: q.data!.id,
            familyName: q.data!.name,
          });
        });
      }
    });

    return { membersMap: map, allMembers: list };
  }, [familyDetails]);

  const appointmentQueries = useQueries({
    queries: allMembers.map((m) => ({
      queryKey: appointmentsByMemberKey(m.memberId),
      queryFn: () =>
        clientFetch<{ items: Appointment[] }>(`/api/members/${m.memberId}/appointments`),
    })),
  });

  const isLoading =
    familyDetails.some((q) => q.isLoading) || appointmentQueries.some((q) => q.isLoading);

  // Only family-level failures are treated as fatal here. Per-member 403s
  // are expected behavior (privacy rules, role-based authorization, member
  // removed mid-session) and should silently exclude that member's data
  // from the aggregated list instead of breaking the whole page.
  // Phase 2D will surface a "N members inaccessible" hint when privacy
  // rules UI lands.
  const isError = familyDetails.some((q) => q.isError);

  const appointments = useMemo(() => {
    const all: EnrichedAppointment[] = [];
    appointmentQueries.forEach((q) => {
      if (q.data) {
        q.data.items.forEach((a) => {
          const info = membersMap.get(a.memberId);
          // Skip appointments whose member we can't resolve. This may
          // happen during a brief moment where the families list and the
          // appointment queries are out of sync (e.g. a member was just
          // removed) or if privacy rules hide the member.
          if (!info) {
            return;
          }
          all.push({
            ...a,
            memberName: info.displayName,
            familyId: info.familyId,
            familyName: info.familyName,
          });
        });
      }
    });
    return all.sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  }, [appointmentQueries, membersMap]);

  return {
    data: appointments,
    isLoading,
    isError,
    members: allMembers,
  };
}

/**
 * Schedules a new appointment. The route returns `{ ok: true }` regardless
 * of what the backend's POST body looks like — we refetch the list to
 * get the canonical data instead of trusting the POST response.
 */
export function useScheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, ...rest }: ScheduleAppointmentInput) =>
      clientFetch<{ ok: true }>(`/api/members/${memberId}/appointments`, {
        method: "POST",
        body: rest,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: appointmentsByMemberKey(variables.memberId),
      });
    },
  });
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) =>
      clientFetch(`/api/appointments/${appointmentId}/complete`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      input,
    }: {
      appointmentId: string;
      input: CancelAppointmentInput;
    }) =>
      clientFetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      input,
    }: {
      appointmentId: string;
      input: RescheduleAppointmentInput;
    }) =>
      clientFetch(`/api/appointments/${appointmentId}/reschedule`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointmentDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      input,
    }: {
      appointmentId: string;
      input: UpdateAppointmentDetailsInput;
    }) =>
      clientFetch(`/api/appointments/${appointmentId}/details`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
