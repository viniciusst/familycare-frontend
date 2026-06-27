"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChronicConditionsTable } from "@/components/conditions/conditions-table";
import { RegisterChronicConditionForMemberDialog } from "@/components/conditions/register-condition-for-member-dialog";
import { useAllChronicConditions } from "@/hooks/use-chronic-conditions";
import { useFamilies } from "@/hooks/use-families";

function ConditionsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const familyFilter = searchParams.get("family") ?? "all";
  const memberFilter = searchParams.get("member") ?? "all";
  const statusFilter = searchParams.get("status") ?? "active";

  const [registerOpen, setRegisterOpen] = useState(false);

  const { data: conditions = [], isLoading, isError } = useAllChronicConditions();
  const { data: families = [] } = useFamilies();

  const members = useMemo(() => {
    const map = new Map<string, { id: string; name: string; familyId: string }>();
    for (const c of conditions) {
      if (!map.has(c.memberId)) {
        map.set(c.memberId, {
          id: c.memberId,
          name: c.memberName,
          familyId: c.familyId,
        });
      }
    }
    return Array.from(map.values());
  }, [conditions]);

  const filtered = useMemo(() => {
    return conditions.filter((c) => {
      if (familyFilter !== "all" && c.familyId !== familyFilter) return false;
      if (memberFilter !== "all" && c.memberId !== memberFilter) return false;
      if (statusFilter === "active" && !c.isActive) return false;
      if (statusFilter === "resolved" && c.isActive) return false;
      return true;
    });
  }, [conditions, familyFilter, memberFilter, statusFilter]);

  const setFilter = (key: "family" | "member" | "status", value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if ((key === "status" && value === "active") || (key !== "status" && value === "all")) {
      sp.delete(key);
    } else {
      sp.set(key, value);
    }
    if (key === "family") sp.delete("member");
    router.replace(`/conditions?${sp.toString()}`);
  };

  const visibleMembers =
    familyFilter === "all" ? members : members.filter((m) => m.familyId === familyFilter);

  const defaultMemberForNew = memberFilter !== "all" ? memberFilter : undefined;

  return (
    <>
      <PageHeader
        title="Chronic conditions"
        description="Ongoing health conditions across your families."
        actions={
          <Button onClick={() => setRegisterOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New condition
          </Button>
        }
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

        <Select value={statusFilter} onValueChange={(v) => setFilter("status", v)}>
          <SelectTrigger className="h-10 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="resolved">Resolved only</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}

      {isError && <p className="text-destructive">Could not load conditions.</p>}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Activity className="text-muted-foreground h-8 w-8" />
          <p className="text-h4">No conditions to show</p>
          <p className="text-body text-muted-foreground max-w-sm">
            {familyFilter !== "all" || memberFilter !== "all" || statusFilter !== "active"
              ? "Try clearing the filters."
              : 'Click "New condition" above to start tracking.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <ChronicConditionsTable conditions={filtered} />
      )}

      <RegisterChronicConditionForMemberDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        defaultMemberId={defaultMemberForNew}
      />
    </>
  );
}

export default function ConditionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
      <ConditionsPageInner />
    </Suspense>
  );
}
