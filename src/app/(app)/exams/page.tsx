"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/layout/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExamsTable } from "@/components/exams/exams-table";
import { useAllExams } from "@/hooks/use-exams";
import { useFamilies } from "@/hooks/use-families";

function ExamsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const familyFilter = searchParams.get("family") ?? "all";
  const memberFilter = searchParams.get("member") ?? "all";

  const { data: exams = [], isLoading, isError } = useAllExams();
  const { data: families = [] } = useFamilies();

  // Distinct members across the loaded exams.
  const members = useMemo(() => {
    const map = new Map<string, { id: string; name: string; familyId: string }>();
    for (const e of exams) {
      if (!map.has(e.memberId)) {
        map.set(e.memberId, {
          id: e.memberId,
          name: e.memberName,
          familyId: e.familyId,
        });
      }
    }
    return Array.from(map.values());
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (familyFilter !== "all" && e.familyId !== familyFilter) return false;
      if (memberFilter !== "all" && e.memberId !== memberFilter) return false;
      return true;
    });
  }, [exams, familyFilter, memberFilter]);

  const setFilter = (key: "family" | "member", value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      sp.delete(key);
    } else {
      sp.set(key, value);
    }
    // When changing family, reset the member filter.
    if (key === "family") sp.delete("member");
    router.replace(`/exams?${sp.toString()}`);
  };

  const visibleMembers =
    familyFilter === "all" ? members : members.filter((m) => m.familyId === familyFilter);

  return (
    <>
      <PageHeader
        title="Exams"
        description="Lab tests, imaging, and other exams across your families."
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={familyFilter} onValueChange={(v) => setFilter("family", v)}>
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

        <Select value={memberFilter} onValueChange={(v) => setFilter("member", v)}>
          <SelectTrigger className="h-10 w-48">
            <SelectValue placeholder="All members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            {visibleMembers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}

      {isError && <p className="text-destructive">Could not load exams.</p>}

      {!isLoading && !isError && filteredExams.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <FlaskConical className="text-muted-foreground h-8 w-8" />
          <p className="text-h4">No exams to show</p>
          <p className="text-body text-muted-foreground max-w-sm">
            {familyFilter !== "all" || memberFilter !== "all"
              ? "Try clearing the filters to see all exams."
              : "Register an exam from a member's profile to start tracking."}
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredExams.length > 0 && <ExamsTable exams={filteredExams} />}
    </>
  );
}

export default function ExamsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
      <ExamsPageInner />
    </Suspense>
  );
}
