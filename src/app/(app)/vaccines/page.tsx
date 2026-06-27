"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Syringe } from "lucide-react";
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
import { VaccinesTable } from "@/components/vaccines/vaccines-table";
import { RegisterVaccineForMemberDialog } from "@/components/vaccines/register-vaccine-for-member-dialog";
import { useAllVaccines } from "@/hooks/use-vaccines";
import { useFamilies } from "@/hooks/use-families";

function VaccinesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const familyFilter = searchParams.get("family") ?? "all";
  const memberFilter = searchParams.get("member") ?? "all";

  const [registerOpen, setRegisterOpen] = useState(false);

  const { data: vaccines = [], isLoading, isError } = useAllVaccines();
  const { data: families = [] } = useFamilies();

  const members = useMemo(() => {
    const map = new Map<string, { id: string; name: string; familyId: string }>();
    for (const v of vaccines) {
      if (!map.has(v.memberId)) {
        map.set(v.memberId, {
          id: v.memberId,
          name: v.memberName,
          familyId: v.familyId,
        });
      }
    }
    return Array.from(map.values());
  }, [vaccines]);

  const filtered = useMemo(() => {
    return vaccines.filter((v) => {
      if (familyFilter !== "all" && v.familyId !== familyFilter) return false;
      if (memberFilter !== "all" && v.memberId !== memberFilter) return false;
      return true;
    });
  }, [vaccines, familyFilter, memberFilter]);

  const setFilter = (key: "family" | "member", value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      sp.delete(key);
    } else {
      sp.set(key, value);
    }
    if (key === "family") sp.delete("member");
    router.replace(`/vaccines?${sp.toString()}`);
  };

  const visibleMembers =
    familyFilter === "all" ? members : members.filter((m) => m.familyId === familyFilter);

  const defaultMemberForNew = memberFilter !== "all" ? memberFilter : undefined;

  return (
    <>
      <PageHeader
        title="Vaccines"
        description="Immunization records across your families."
        actions={
          <Button onClick={() => setRegisterOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New vaccine
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
      </div>

      {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}

      {isError && <p className="text-destructive">Could not load vaccines.</p>}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Syringe className="text-muted-foreground h-8 w-8" />
          <p className="text-h4">No vaccines to show</p>
          <p className="text-body text-muted-foreground max-w-sm">
            {familyFilter !== "all" || memberFilter !== "all"
              ? "Try clearing the filters to see all vaccines."
              : 'Click "New vaccine" above to start tracking.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && <VaccinesTable vaccines={filtered} />}

      <RegisterVaccineForMemberDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        defaultMemberId={defaultMemberForNew}
      />
    </>
  );
}

export default function VaccinesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
      <VaccinesPageInner />
    </Suspense>
  );
}
