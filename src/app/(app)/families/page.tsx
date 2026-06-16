"use client";

import { Plus, Users } from "lucide-react";
import { CreateFamilyDialog } from "@/components/families/create-family-dialog";
import { FamilyCard } from "@/components/families/family-card";
import { PageHeader } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFamilies } from "@/hooks/use-families";

export default function FamiliesPage() {
  const { data: families, isLoading, isError } = useFamilies();

  return (
    <>
      <PageHeader
        title="Families"
        description="Manage the family groups you belong to."
        actions={
          families && families.length > 0 ? (
            <CreateFamilyDialog
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New family
                </Button>
              }
            />
          ) : null
        }
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-destructive">Could not load your families.</p>
      )}

      {families && families.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
          <div className="rounded-full bg-muted p-4">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <p className="text-h4">No families yet</p>
            <p className="text-body text-muted-foreground">
              Create your first family to start tracking health and well-being
              together.
            </p>
          </div>
          <CreateFamilyDialog
            trigger={
              <Button size="lg" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Create your first family
              </Button>
            }
          />
        </div>
      )}

      {families && families.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {families.map((family) => (
            <FamilyCard key={family.id} family={family} />
          ))}
        </div>
      )}
    </>
  );
}
