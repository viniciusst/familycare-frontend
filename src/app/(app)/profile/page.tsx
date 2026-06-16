"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-me";

const languageNames: Record<number, string> = {
  1: "Português (Brasil)",
  2: "English (Canada)",
  3: "Français (Canada)",
};

export default function ProfilePage() {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </>
    );
  }

  if (!me) {
    return (
      <>
        <PageHeader title="Profile" />
        <p className="text-destructive">Could not load profile.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Profile" description="Your account information." />

      <Card>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
          <Field label="Email" value={me.email} />
          <Field
            label="Preferred language"
            value={languageNames[me.preferredLanguage] ?? "—"}
          />
          <Field
            label="Member since"
            value={new Date(me.createdAt).toLocaleDateString()}
          />
        </CardContent>
      </Card>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="text-body-lg">{value}</p>
    </div>
  );
}
