"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ShieldAlert } from "lucide-react";
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
import { AllergiesTable } from "@/components/allergies/allergies-table";
import { RegisterAllergyForMemberDialog } from "@/components/allergies/register-allergy-for-member-dialog";
import { useAllAllergies } from "@/hooks/use-allergies";
import { useFamilies } from "@/hooks/use-families";

function AllergiesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const familyFilter = searchParams.get("family") ?? "all";
  const memberFilter = searchParams.get("member") ?? "all";
  const severityFilter = searchParams.get("severity") ?? "all";

  const [registerOpen, setRegisterOpen] = useState(false);

  const { data: allergies = [], isLoading, isError } = useAllAllergies();
  const { data: families = [] } = useFamilies();

  const members = useMemo(() => {
    const map = new Map<string, { id: string; name: string; familyId: string }>();
    for (const a of allergies) {
      if (!map.has(a.memberId)) {
        map.set(a.memberId, {
          id: a.memberId,
          name: a.memberName,
          familyId: a.familyId,
        });
      }
    }
    return Array.from(map.values());
  }, [allergies]);

  const filteredAllergies = useMemo(() => {
    return allergies.filter((a) => {
      if (familyFilter !== "all" && a.familyId !== familyFilter) return false;
      if (memberFilter !== "all" && a.memberId !== memberFilter) return false;
      if (severityFilter !== "all" && String(a.severity) !== severityFilter) return false;
      return true;
    });
  }, [allergies, familyFilter, memberFilter, severityFilter]);

  const setFilter = (key: "family" | "member" | "severity", value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      sp.delete(key);
    } else {
      sp.set(key, value);
    }
    if (key === "family") sp.delete("member");
    router.replace(`/allergies?${sp.toString()}`);
  };

  const visibleMembers =
    familyFilter === "all" ? members : members.filter((m) => m.familyId === familyFilter);

  const defaultMemberForNew = memberFilter !== "all" ? memberFilter : undefined;

  return (
    <>
      <PageHeader
        title="Allergies"
        description="Known allergies across your families, ranked by severity."
        actions={
          <Button onClick={() => setRegisterOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New allergy
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

        <Select value={severityFilter} onValueChange={(v) => setFilter("severity", v)}>
          <SelectTrigger className="h-10 w-48">
            <SelectValue placeholder="All severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="4">Life-threatening</SelectItem>
            <SelectItem value="3">Severe</SelectItem>
            <SelectItem value="2">Moderate</SelectItem>
            <SelectItem value="1">Mild</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}

      {isError && <p className="text-destructive">Could not load allergies.</p>}

      {!isLoading && !isError && filteredAllergies.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <ShieldAlert className="text-muted-foreground h-8 w-8" />
          <p className="text-h4">No allergies to show</p>
          <p className="text-body text-muted-foreground max-w-sm">
            {familyFilter !== "all" || memberFilter !== "all" || severityFilter !== "all"
              ? "Try clearing the filters to see all allergies."
              : 'Click "New allergy" above to start tracking.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredAllergies.length > 0 && (
        <AllergiesTable allergies={filteredAllergies} />
      )}

      <RegisterAllergyForMemberDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        defaultMemberId={defaultMemberForNew}
      />
    </>
  );
}

export default function AllergiesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
      <AllergiesPageInner />
    </Suspense>
  );
}
