"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppointmentsTable } from "@/components/appointments/appointments-table";
import { ScheduleAppointmentDialog } from "@/components/appointments/schedule-appointment-dialog";
import { PageHeader } from "@/components/layout/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllAppointments } from "@/hooks/use-appointments";
import { useFamilies } from "@/hooks/use-families";
import { isPastDue } from "@/types/appointments";

type StatusFilter = "all" | "scheduled" | "completed" | "cancelled" | "pastdue";

/**
 * Page wrapper — Next 16 requires `useSearchParams()` consumers to be
 * wrapped in a Suspense boundary so the build can prerender the shell
 * while the search-params-dependent content streams in.
 */
export default function AppointmentsPage() {
  return (
    <Suspense fallback={<AppointmentsPageFallback />}>
      <AppointmentsPageContent />
    </Suspense>
  );
}

function AppointmentsPageFallback() {
  return (
    <>
      <PageHeader title="Appointments" description="Medical appointments across your families." />
      <Skeleton className="h-64 w-full rounded-xl" />
    </>
  );
}

function AppointmentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const familyId = searchParams.get("familyId") ?? "all";
  const memberId = searchParams.get("memberId") ?? "all";
  const statusFilter = (searchParams.get("status") ?? "all") as StatusFilter;

  const { data: families = [] } = useFamilies();
  const { data: allAppointments, isLoading, isError, members } = useAllAppointments();

  const showFamilyFilter = families.length > 1;

  const visibleMembers = useMemo(() => {
    if (familyId === "all") return members;
    return members.filter((m) => m.familyId === familyId);
  }, [familyId, members]);

  const filteredAppointments = useMemo(() => {
    let list = allAppointments;
    if (familyId !== "all") {
      list = list.filter((a) => a.familyId === familyId);
    }
    if (memberId !== "all") {
      list = list.filter((a) => a.memberId === memberId);
    }
    switch (statusFilter) {
      case "scheduled":
        list = list.filter((a) => a.status === 1 && !isPastDue(a));
        break;
      case "completed":
        list = list.filter((a) => a.status === 2);
        break;
      case "cancelled":
        list = list.filter((a) => a.status === 3);
        break;
      case "pastdue":
        list = list.filter((a) => isPastDue(a));
        break;
    }
    return list;
  }, [allAppointments, familyId, memberId, statusFilter]);

  const buildUrl = (updates: Partial<Record<string, string>>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const qs = params.toString();
    return `/appointments${qs ? `?${qs}` : ""}`;
  };

  const baseList = useMemo(() => {
    let list = allAppointments;
    if (familyId !== "all") list = list.filter((a) => a.familyId === familyId);
    if (memberId !== "all") list = list.filter((a) => a.memberId === memberId);
    return list;
  }, [allAppointments, familyId, memberId]);

  const counts = useMemo(
    () => ({
      all: baseList.length,
      scheduled: baseList.filter((a) => a.status === 1 && !isPastDue(a)).length,
      completed: baseList.filter((a) => a.status === 2).length,
      cancelled: baseList.filter((a) => a.status === 3).length,
      pastdue: baseList.filter(isPastDue).length,
    }),
    [baseList]
  );

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Medical appointments across your families."
        actions={
          members.length > 0 ? (
            <ScheduleAppointmentDialog
              members={visibleMembers.length > 0 ? visibleMembers : members}
              defaultMemberId={memberId !== "all" ? memberId : undefined}
            />
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        {showFamilyFilter && (
          <Select
            value={familyId}
            onValueChange={(val) => router.push(buildUrl({ familyId: val, memberId: "all" }))}
          >
            <SelectTrigger className="h-10 w-48">
              <SelectValue placeholder="All families" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All families</SelectItem>
              {families.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={memberId} onValueChange={(val) => router.push(buildUrl({ memberId: val }))}>
          <SelectTrigger className="h-10 w-56">
            <SelectValue placeholder="All members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            {visibleMembers.map((m) => (
              <SelectItem key={m.memberId} value={m.memberId}>
                {m.memberName}
                {showFamilyFilter ? (
                  <span className="text-muted-foreground"> · {m.familyName}</span>
                ) : null}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(val) => router.push(buildUrl({ status: val }))}
        className="block w-full"
      >
        <div className="border-b">
          <TabsList className="flex h-auto w-fit justify-start gap-2 rounded-none bg-transparent p-0">
            <TabsTrigger value="all" className={tabTriggerClass}>
              All <CountBadge count={counts.all} />
            </TabsTrigger>
            <TabsTrigger value="scheduled" className={tabTriggerClass}>
              Scheduled <CountBadge count={counts.scheduled} />
            </TabsTrigger>
            <TabsTrigger value="pastdue" className={tabTriggerClass}>
              Past due <CountBadge count={counts.pastdue} highlight />
            </TabsTrigger>
            <TabsTrigger value="completed" className={tabTriggerClass}>
              Completed <CountBadge count={counts.completed} />
            </TabsTrigger>
            <TabsTrigger value="cancelled" className={tabTriggerClass}>
              Cancelled <CountBadge count={counts.cancelled} />
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}

      {isError && <p className="text-destructive">Could not load appointments.</p>}

      {!isLoading && !isError && (
        <AppointmentsTable
          appointments={filteredAppointments}
          showMemberColumn={memberId === "all"}
        />
      )}
    </>
  );
}

function CountBadge({ count, highlight }: { count: number; highlight?: boolean }) {
  if (count === 0) return null;
  return (
    <span
      className={
        "ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium " +
        (highlight ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground")
      }
    >
      {count}
    </span>
  );
}

const tabTriggerClass = `
  inline-flex items-center gap-1.5
  px-4 py-3 text-sm font-medium
  rounded-none border-0 border-b-2 border-transparent
  bg-transparent shadow-none
  text-muted-foreground
  hover:text-foreground transition-colors
  focus-visible:outline-none focus-visible:ring-0
  data-[state=active]:border-primary
  data-[state=active]:bg-transparent
  data-[state=active]:text-foreground
  data-[state=active]:shadow-none
`;
