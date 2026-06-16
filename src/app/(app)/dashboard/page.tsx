"use client";

import { Plus, Users } from "lucide-react";
import { CreateFamilyDialog } from "@/components/families/create-family-dialog";
import { FamilyCard } from "@/components/families/family-card";
import { PageHeader, PageSection } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFamilies } from "@/hooks/use-families";
import { useMe } from "@/hooks/use-me";

export default function DashboardPage() {
  const { data: me, isLoading: meLoading } = useMe();
  const { data: families, isLoading: familiesLoading } = useFamilies();

  const greeting = meLoading
    ? "Loading..."
    : `Welcome back${me ? `, ${me.email.split("@")[0]}` : ""}`;

  return (
    <>
      <PageHeader title={greeting} description="Here's an overview of your families." />

      <PageSection
        title="Your families"
        actions={
          families && families.length > 0 ? (
            <CreateFamilyDialog
              trigger={
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  New family
                </Button>
              }
            />
          ) : null
        }
      >
        {familiesLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        )}

        {families && families.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
            <div className="bg-muted rounded-full p-4">
              <Users className="text-muted-foreground h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <p className="text-h4">No families yet</p>
              <p className="text-body text-muted-foreground max-w-sm">
                Create your first family to start tracking health and well-being together.
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
      </PageSection>
    </>
  );
}
